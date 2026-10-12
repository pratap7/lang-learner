import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CONVERSATION_SCENARIOS,
  getScenarioById,
  getScenariosByLevel,
  type CefrLevel,
} from "../conversationScenarios.ts";
import {
  PLAN_LIMITS,
  getUserConversationUsage,
  recordConversationUsage,
  calculateAndLogSessionCost,
} from "../conversationUsageService.ts";

describe("Conversation Scenarios & Filtering", () => {
  it("should contain all 6 required core scenarios", () => {
    const requiredSlugs = ["cafe", "doctor", "job-interview", "visa-appointment", "shopping", "small-talk"];
    for (const slug of requiredSlugs) {
      const scenario = CONVERSATION_SCENARIOS.find((s) => s.slug === slug);
      assert.ok(scenario, `Scenario with slug '${slug}' must exist`);
      assert.ok(scenario?.title, `Scenario '${slug}' must have a title`);
      assert.ok(scenario?.starterMessageDe, `Scenario '${slug}' must have starter German message`);
      assert.ok(scenario?.starterHintEn, `Scenario '${slug}' must have starter English hint`);
      assert.ok(scenario?.systemInstructions, `Scenario '${slug}' must have system instructions`);
    }
  });

  it("should filter scenarios correctly by CEFR level", () => {
    const a1Scenarios = getScenariosByLevel("A1");
    assert.ok(a1Scenarios.length >= 2, "Should have at least 2 A1 scenarios (e.g. café, shopping, small talk)");
    for (const sc of a1Scenarios) {
      assert.ok(sc.cefrLevels.includes("A1"), `Scenario ${sc.id} must support A1`);
    }

    const b2Scenarios = getScenariosByLevel("B2");
    assert.ok(b2Scenarios.length >= 1, "Should have at least 1 B2 scenario (e.g. job interview, visa)");
    for (const sc of b2Scenarios) {
      assert.ok(sc.cefrLevels.includes("B2"), `Scenario ${sc.id} must support B2`);
    }

    const allScenarios = getScenariosByLevel("ALL");
    assert.equal(allScenarios.length, CONVERSATION_SCENARIOS.length);
  });

  it("should find scenario by id or slug", () => {
    const byId = getScenarioById("sc-cafe");
    assert.equal(byId?.slug, "cafe");

    const bySlug = getScenarioById("doctor");
    assert.equal(bySlug?.id, "sc-doctor");

    const notFound = getScenarioById("non-existent");
    assert.equal(notFound, undefined);
  });
});

describe("Usage Metering & Monthly Minute Caps", () => {
  it("should define correct caps per subscription tier", () => {
    assert.equal(PLAN_LIMITS.free.minutesCap, 15);
    assert.equal(PLAN_LIMITS.pro.minutesCap, 120);
    assert.equal(PLAN_LIMITS.unlimited.minutesCap, 600);
  });

  it("should compute remaining minutes and cap status accurately", () => {
    const freeUsage = getUserConversationUsage("test-user-free", "free");
    assert.equal(freeUsage.monthlyMinutesCap, 15);
    assert.equal(typeof freeUsage.minutesRemaining, "number");
    assert.ok(freeUsage.minutesRemaining <= 15);

    const proUsage = getUserConversationUsage("test-user-pro", "pro");
    assert.equal(proUsage.monthlyMinutesCap, 120);
    assert.ok(proUsage.minutesRemaining <= 120);
  });

  it("should record usage and update limits properly", () => {
    const updated = recordConversationUsage("test-user-1", 5, "free");
    assert.ok(updated.minutesUsedThisMonth >= 5);
    assert.equal(updated.minutesRemaining, Math.max(0, updated.monthlyMinutesCap - updated.minutesUsedThisMonth));
  });
});

describe("Session Cost & Telemetry Logging", () => {
  it("should calculate token counts and estimated cost in USD", () => {
    const userMessages = [
      "Ich möchte bitte einen Kaffee und einen Apfelkuchen bestellen.",
      "Kann ich mit Karte bezahlen?",
    ];
    const aiMessages = [
      "Guten Tag! Gerne, möchten Sie normale Milch oder Hafermilch?",
      "Ja, Kartenzahlung ist ab fünf Euro möglich. Das macht zusammen vier Euro fünfzig.",
    ];

    const log = calculateAndLogSessionCost({
      userId: "test-user-123",
      scenarioId: "sc-cafe",
      durationSeconds: 180,
      userMessagesText: userMessages,
      aiMessagesText: aiMessages,
    });

    assert.equal(log.userId, "test-user-123");
    assert.equal(log.scenarioId, "sc-cafe");
    assert.equal(log.turnsCount, 2);
    assert.equal(log.durationSeconds, 180);
    assert.ok(log.totalTokens > 0, "Total tokens must be > 0");
    assert.ok(log.estimatedCostUsd >= 0, "Estimated cost must be >= 0");
    assert.ok(log.estimatedCostUsd < 0.05, "Small session cost must be fractions of a cent");
    assert.ok(log.id.startsWith("log-"));
  });
});
