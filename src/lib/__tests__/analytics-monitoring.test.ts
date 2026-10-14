import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type {
  FunnelEventType,
  FunnelStepMetric,
  CohortWeekData,
  ExperimentDefinition,
  SentryErrorEvent,
  AISpendAlert,
  WeeklyMetricsDashboardData,
} from "../../types/analytics.ts";

import {
  getFunnelMetrics,
  getCohortRetentionData,
  trackEvent,
  getGlobalEventProperties,
} from "../analytics/analyticsService.ts";

import {
  getExperiments,
  getAssignedVariant,
  recordExperimentConversion,
} from "../analytics/experimentsService.ts";

import {
  captureException,
  captureMessage,
  addBreadcrumb,
  sanitizeContext,
  getErrorFreeSessionRate,
  CURRENT_RELEASE,
} from "../monitoring/sentryService.ts";

import {
  getAIThresholdConfig,
  updateAIThresholdConfig,
  getAISpendAlerts,
  checkUserAISpend,
  acknowledgeAlert,
} from "../monitoring/aiSpendAlertService.ts";

import { getWeeklyMondayMetrics } from "../monitoring/weeklyMetricsService.ts";

describe("DeutschPfad Product Analytics & Monitoring Engine", () => {
  it("tracks the full 9-step lifecycle conversion funnel accurately", () => {
    const funnel = getFunnelMetrics();

    assert.equal(funnel.length, 9, "Funnel must contain exactly 9 milestone steps");

    const expectedSteps: FunnelEventType[] = [
      "visit",
      "signup",
      "onboarding_completion",
      "first_lesson_completed",
      "day7_return",
      "paywall_viewed",
      "trial_started",
      "paid_conversion",
      "subscription_cancelled",
    ];

    expectedSteps.forEach((stepId, idx) => {
      assert.equal(funnel[idx].stepId, stepId);
      assert.equal(funnel[idx].stepIndex, idx + 1);
      assert.ok(funnel[idx].count > 0, `Step ${stepId} count should be positive`);
    });

    // Step 1 conversion from previous should be 100%
    assert.equal(funnel[0].conversionRateStep, 100);

    // Verify overall conversion from visit to paid
    const paidStep = funnel.find((s) => s.stepId === "paid_conversion");
    assert.ok(paidStep);
    assert.ok(paidStep.conversionRateOverall > 0 && paidStep.conversionRateOverall < 10);
  });

  it("calculates weekly cohort retention matrix with Day 0 to Day 30 milestones", () => {
    const cohorts = getCohortRetentionData();

    assert.ok(cohorts.length >= 6, "Should provide at least 6 weekly cohorts");

    cohorts.forEach((cohort) => {
      assert.ok(cohort.cohortWeek.startsWith("2026-W"));
      assert.ok(cohort.size > 0);
      assert.equal(cohort.day0, 100, "Day 0 retention must always be 100%");
      assert.ok(cohort.day1 > cohort.day3, "Day 1 retention should be greater than Day 3");
      assert.ok(cohort.day3 > cohort.day7, "Day 3 retention should be greater than Day 7");
      assert.ok(cohort.day7 > cohort.day14, "Day 7 retention should be greater than Day 14");
      assert.ok(cohort.day30 > 25, "Day 30 retention should be healthy (> 25%)");
    });
  });

  it("assigns A/B testing variants deterministically and tracks conversion uplift", () => {
    const experiments = getExperiments();
    assert.ok(experiments.length >= 2, "Should have pricing page and paywall experiments");

    const pricingExp = experiments.find((e) => e.key === "pricing_page_experiment");
    assert.ok(pricingExp);
    assert.equal(pricingExp.variants.length, 3);

    // Test deterministic bucketing
    const userA = "usr-deterministic-123";
    const variant1 = getAssignedVariant("pricing_page_experiment", userA);
    const variant2 = getAssignedVariant("pricing_page_experiment", userA);
    assert.ok(variant1);
    assert.equal(variant1.id, variant2?.id, "Same user ID must always receive identical variant");

    // Record conversion and test uplift
    const fluencyVariant = pricingExp.variants.find((v) => v.id === "variant_fluency_outcome");
    assert.ok(fluencyVariant);
    const beforeConversions = fluencyVariant.conversions;

    recordExperimentConversion("pricing_page_experiment", fluencyVariant.id);
    assert.equal(fluencyVariant.conversions, beforeConversions + 1);
    assert.ok(fluencyVariant.upliftPercent > 0, "Winning variant should show positive relative uplift");
  });

  it("scrubs PII and attaches breadcrumbs to Sentry error events with release tags", () => {
    // 1. PII scrubber test
    const rawContext = {
      user_id: "usr-99",
      credit_card_number: "4111-2222-3333-4444",
      user_password: "SuperSecretPassword123!",
      auth_token: "Bearer eyJhbGciOi...",
      safe_data: "Goethe A1 Lesson 2",
    };

    const sanitized = sanitizeContext(rawContext);
    assert.equal(sanitized.credit_card_number, "[REDACTED_PII]");
    assert.equal(sanitized.user_password, "[REDACTED_PII]");
    assert.equal(sanitized.auth_token, "[REDACTED_PII]");
    assert.equal(sanitized.safe_data, "Goethe A1 Lesson 2");

    // 2. Breadcrumbs and captureException
    addBreadcrumb("navigation", "Navigated to /courses/a1");
    addBreadcrumb("audio", "Audio buffer loaded");

    const err = captureException(new Error("Test pronunciation network timeout"), {
      tags: { testRun: "true" },
      user: { id: "usr-test" },
    });

    assert.equal(err.release, CURRENT_RELEASE);
    assert.equal(err.level, "error");
    assert.ok(err.breadcrumbs.length >= 2);
    assert.equal(getErrorFreeSessionRate(), 99.84);
  });

  it("triggers automated alerts when AI spend per user exceeds the configured ceiling", () => {
    const config = getAIThresholdConfig();
    assert.equal(config.maxSpendPerUserMonthly, 1.50);

    // Normal learner spend below threshold
    const normalAlert = checkUserAISpend("usr-normal", "normal@example.com", "Normal User", {
      gpt4o: 0.20,
      elevenLabs: 0.15,
      whisper: 0.05,
    });
    assert.equal(normalAlert, null, "Normal spend of $0.40 must not trigger alert");

    // Power user spend exceeding $1.50
    const powerAlert = checkUserAISpend("usr-power-01", "power@example.com", "Power User", {
      gpt4o: 1.10,
      elevenLabs: 0.90,
      whisper: 0.40,
    });
    assert.ok(powerAlert, "Spend of $2.40 must trigger an alert");
    assert.equal(powerAlert.userId, "usr-power-01");
    assert.equal(powerAlert.status, "active");
    assert.equal(powerAlert.actualAmount, 2.40);

    // Acknowledge alert
    const ack = acknowledgeAlert(powerAlert.id);
    assert.ok(ack);
    assert.equal(ack.status, "acknowledged");
  });

  it("compiles the exact 10 Weekly Monday Numbers with targets, WoW trends, and status indicators", () => {
    const mondayReport = getWeeklyMondayMetrics();

    assert.ok(mondayReport.weekLabel.includes("Week 42"));
    assert.ok(mondayReport.executiveSummary.length > 20);
    assert.equal(mondayReport.metrics.length, 10, "Must provide exactly the 10 critical Monday numbers");

    const expectedMetricNames = [
      "New Learner Signups",
      "Weekly Active Users (WAU)",
      "Day-7 Cohort Retention",
      "Free ➔ 7-Day Trial Conversion",
      "Trial ➔ Paid Conversion",
      "Net New MRR Added",
      "Net Monthly Churn Rate",
      "AI Spend / Active User",
      "Error-Free Session Rate",
      "Support Resolution Time",
    ];

    mondayReport.metrics.forEach((m, idx) => {
      assert.equal(m.number, idx + 1);
      assert.equal(m.name, expectedMetricNames[idx]);
      assert.ok(m.valueDisplay.length > 0);
      assert.ok(m.targetBenchmark.length > 0);
      assert.equal(m.status, "on_track");
    });
  });
});
