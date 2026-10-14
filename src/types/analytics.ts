/**
 * DeutschPfad Product Analytics & Monitoring Type Definitions
 * PostHog Funnel Tracking, Sentry Error Telemetry, A/B Testing Experiments,
 * Cohort Retention Matrices, and Monday Morning Executive Metrics.
 */

export type FunnelEventType =
  | 'visit'
  | 'signup'
  | 'onboarding_completion'
  | 'first_lesson_completed'
  | 'day7_return'
  | 'paywall_viewed'
  | 'trial_started'
  | 'paid_conversion'
  | 'subscription_cancelled';

export interface FunnelStepMetric {
  stepIndex: number;
  stepId: FunnelEventType;
  stepName: string;
  count: number;
  dropoffCount: number;
  conversionRateStep: number; // percentage from previous step
  conversionRateOverall: number; // percentage from top of funnel (visit)
  avgTimeFromPreviousMinutes?: number;
}

export interface CohortWeekData {
  cohortWeek: string; // e.g. "2026-W36"
  cohortLabel: string; // e.g. "Sep 01 - Sep 07"
  size: number;
  day0: number; // 100%
  day1: number;
  day3: number;
  day7: number;
  day14: number;
  day21: number;
  day30: number;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  experimentKey: string;
  trafficAllocation: number; // 0 - 100
  impressions: number;
  conversions: number;
  conversionRate: number; // %
  upliftPercent: number; // relative to control
  isStatisticallySignificant: boolean;
  confidenceLevel: number; // e.g. 96.8%
}

export interface ExperimentDefinition {
  key: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'concluded';
  targetMetric: string;
  variants: ExperimentVariant[];
  winningVariantId?: string;
  startDate: string;
  updatedAt: string;
}

export interface SentryBreadcrumb {
  category: 'navigation' | 'ui.click' | 'api' | 'audio' | 'auth' | 'billing';
  message: string;
  level?: 'info' | 'warning' | 'error';
  timestamp: string;
  data?: Record<string, any>;
}

export interface SentryErrorEvent {
  id: string;
  message: string;
  stack?: string;
  level: 'fatal' | 'error' | 'warning' | 'info';
  release: string; // e.g. "deutschpfad@1.2.0"
  environment: 'production' | 'staging' | 'preview' | 'development';
  timestamp: string;
  handled: boolean;
  user?: {
    id: string;
    cefrLevel?: string;
    subscriptionPlan?: string;
  };
  breadcrumbs: SentryBreadcrumb[];
  tags: Record<string, string>;
}

export interface AISpendAlert {
  id: string;
  type: 'user_threshold_exceeded' | 'burn_rate_spike' | 'token_anomaly';
  userId?: string;
  userEmail?: string;
  userName?: string;
  thresholdAmount: number; // e.g. $1.50
  actualAmount: number; // e.g. $2.84
  severity: 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  message: string;
  aiBreakdown: {
    openaiGpt4oMini: number;
    elevenLabsTts: number;
    whisperStt: number;
  };
  timestamp: string;
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptimeSeconds: number;
  uptimePercentage30Days: number; // e.g. 99.98%
  timestamp: string;
  release: string;
  checks: {
    database: {
      status: 'healthy' | 'degraded';
      latencyMs: number;
    };
    aiProviders: {
      openai: { status: 'healthy' | 'degraded'; latencyMs: number };
      elevenlabs: { status: 'healthy' | 'degraded'; latencyMs: number };
    };
    cacheAndStorage: {
      status: 'healthy' | 'degraded';
      latencyMs: number;
    };
    memory: {
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
}

export type MetricStatus = 'on_track' | 'needs_attention' | 'alert';

export interface MondayMetricItem {
  id: string;
  number: number;
  name: string;
  description: string;
  valueDisplay: string;
  rawNumericValue: number;
  unit: string;
  changeWoW: number; // % change vs previous week
  targetBenchmark: string;
  isPositiveDirection: boolean; // true if higher is better, false if lower is better (e.g. churn/cost)
  status: MetricStatus;
  statusComment: string;
}

export interface WeeklyMetricsDashboardData {
  weekLabel: string; // e.g. "Week 42, 2026 (Oct 12 - Oct 18)"
  generatedAt: string;
  executiveSummary: string;
  metrics: MondayMetricItem[];
}
