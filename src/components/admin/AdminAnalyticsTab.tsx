"use client";

import { useState } from "react";
import {
  TrendingUp,
  Filter,
  Users,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  Cpu,
  BarChart2,
  Eye,
  Award,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  getFunnelMetrics,
  getCohortRetentionData,
  getRecentEvents,
} from "@/lib/analytics/analyticsService";
import {
  getExperiments,
  recordExperimentConversion,
} from "@/lib/analytics/experimentsService";
import {
  getRecentErrors,
  getErrorFreeSessionRate,
  CURRENT_RELEASE,
} from "@/lib/monitoring/sentryService";
import {
  getAISpendAlerts,
  getAIThresholdConfig,
  updateAIThresholdConfig,
  acknowledgeAlert,
} from "@/lib/monitoring/aiSpendAlertService";
import type {
  FunnelStepMetric,
  CohortWeekData,
  ExperimentDefinition,
  SentryErrorEvent,
  AISpendAlert,
} from "@/types/analytics";

export function AdminAnalyticsTab() {
  const { toast } = useToast();

  const [funnel] = useState<FunnelStepMetric[]>(() => getFunnelMetrics());
  const [cohorts] = useState<CohortWeekData[]>(() => getCohortRetentionData());
  const [experiments] = useState<ExperimentDefinition[]>(() => getExperiments());
  const [errors, setErrors] = useState<SentryErrorEvent[]>(() => getRecentErrors());
  const [aiAlerts, setAiAlerts] = useState<AISpendAlert[]>(() => getAISpendAlerts());
  const [aiConfig, setAiConfig] = useState(() => getAIThresholdConfig());

  // Modals
  const [selectedError, setSelectedError] = useState<SentryErrorEvent | null>(null);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(aiConfig.maxSpendPerUserMonthly);

  const errorFreeRate = getErrorFreeSessionRate();

  const handleAcknowledgeAlert = (alertId: string) => {
    const updated = acknowledgeAlert(alertId);
    if (updated) {
      toast({
        title: "Alert Acknowledged",
        message: "Status updated to acknowledged.",
        type: "info",
      });
      setAiAlerts([...getAISpendAlerts()]);
    }
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateAIThresholdConfig({ maxSpendPerUserMonthly: tempThreshold });
    setAiConfig(updated);
    setThresholdModalOpen(false);
    toast({
      title: "Threshold Updated",
      message: `AI spend alert threshold set to $${tempThreshold.toFixed(2)}/mo per user.`,
      type: "success",
    });
  };

  const getCohortColor = (pct: number) => {
    if (pct >= 70) return "bg-emerald-500 text-white font-bold";
    if (pct >= 50) return "bg-emerald-400 dark:bg-emerald-600 text-white font-semibold";
    if (pct >= 40) return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-semibold";
    if (pct >= 30) return "bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200";
    return "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]";
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ─── SECTION 1: System Health, Telemetry & Sentry Status ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Release & Stability */}
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold uppercase tracking-wider">Release Stability</span>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--color-text-primary)]">
              {errorFreeRate}%
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">Error-Free Sessions</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-[var(--color-brand-600)]">
            Tag: {CURRENT_RELEASE}
          </div>
        </div>

        {/* 30-Day Uptime */}
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold uppercase tracking-wider">System Uptime</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              99.98%
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">Past 30 Days</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--color-text-muted)]">
            Zero critical outages recorded
          </div>
        </div>

        {/* API Latency */}
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold uppercase tracking-wider">Service Latency</span>
            <Server className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[var(--color-text-primary)]">
              14ms
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">DB · 182ms AI</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--color-text-muted)]">
            Postgres + OpenAI edge proxy
          </div>
        </div>

        {/* AI Spend Alert Pulse */}
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold uppercase tracking-wider">AI Spend Ceiling</span>
            <Button variant="ghost" size="sm" className="h-5 px-1 text-[10px]" onClick={() => setThresholdModalOpen(true)}>
              Edit
            </Button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              ${aiConfig.maxSpendPerUserMonthly.toFixed(2)}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">/ User / Month</span>
          </div>
          <div className="mt-2 text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{aiAlerts.filter((a) => a.status === "active").length} Active Anomaly Alerts</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: Full 9-Step Conversion Funnel ───────────────────── */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[var(--color-brand-500)] text-white">
                <BarChart2 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                Full Lifecycle Conversion Funnel (9 Milestones)
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Tracking journey from top-of-funnel landing to 7-day retention and paid conversion.
            </p>
          </div>
          <Badge variant="brand">Overall Visit ➔ Paid: 3.46%</Badge>
        </div>

        <div className="space-y-3.5">
          {funnel.map((step) => (
            <div key={step.stepId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {step.stepName}
                </span>
                <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                  <span>
                    <strong>{step.count.toLocaleString()}</strong> learners
                  </span>
                  <span className="font-bold text-[var(--color-brand-600)]">
                    {step.stepIndex === 1 ? "100%" : `${step.conversionRateStep}% step`}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    ({step.conversionRateOverall}% overall)
                  </span>
                </div>
              </div>

              {/* Progress bar with dropoff indicator */}
              <div className="h-4 w-full bg-[var(--color-bg-subtle)] rounded-md overflow-hidden flex items-center p-0.5">
                <div
                  className="h-full rounded bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] transition-all duration-500"
                  style={{ width: `${Math.max(4, Math.round((step.count / funnel[0].count) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 3: Cohort Retention Matrix (Heatmap) ─────────────────── */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Weekly Cohort Retention Matrix (Day 0 – Day 30)
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Learner activity retention across Day 1, Day 3, Day 7, Day 14, Day 21, and Day 30.
            </p>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Color scaled by retention %</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)] text-[11px]">
                <th className="py-2.5 px-3 text-left font-semibold">Cohort</th>
                <th className="py-2.5 px-3 font-semibold">Size</th>
                <th className="py-2.5 px-3 font-semibold">Day 0</th>
                <th className="py-2.5 px-3 font-semibold">Day 1</th>
                <th className="py-2.5 px-3 font-semibold">Day 3</th>
                <th className="py-2.5 px-3 font-semibold">Day 7</th>
                <th className="py-2.5 px-3 font-semibold">Day 14</th>
                <th className="py-2.5 px-3 font-semibold">Day 21</th>
                <th className="py-2.5 px-3 font-semibold">Day 30</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {cohorts.map((row) => (
                <tr key={row.cohortWeek} className="hover:bg-[var(--color-bg-subtle)]/40 transition-colors">
                  <td className="py-2.5 px-3 text-left font-semibold text-[var(--color-text-primary)]">
                    {row.cohortLabel}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--color-text-secondary)] font-medium">
                    {row.size.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="px-2 py-1 rounded-md text-[11px] bg-emerald-500 text-white font-bold">
                      100%
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-1 rounded-md text-[11px] ${getCohortColor(row.day1)}`}>
                      {row.day1}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-1 rounded-md text-[11px] ${getCohortColor(row.day3)}`}>
                      {row.day3}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-1 rounded-md text-[11px] ${getCohortColor(row.day7)}`}>
                      {row.day7}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-1 rounded-md text-[11px] ${getCohortColor(row.day14)}`}>
                      {row.day14}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-1 rounded-md text-[11px] ${getCohortColor(row.day21)}`}>
                      {row.day21}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`px-2 py-1 rounded-md text-[11px] ${getCohortColor(row.day30)}`}>
                      {row.day30}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SECTION 4: A/B Testing & Feature Experiments ───────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Pricing Page &amp; Paywall A/B Experiments
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Traffic allocation, conversion uplift, and 95%+ statistical significance validation.
            </p>
          </div>
          <Badge variant="brand">2 Active Experiments</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {experiments.map((exp) => (
            <div
              key={exp.key}
              className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[var(--color-text-primary)]">
                    {exp.name}
                  </h4>
                  <Badge variant="success">Running</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {exp.description}
                </p>

                {/* Variants List */}
                <div className="space-y-3 mt-4">
                  {exp.variants.map((variant) => {
                    const isWinner = exp.winningVariantId === variant.id;
                    return (
                      <div
                        key={variant.id}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                          isWinner
                            ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)]/40 dark:bg-[var(--color-brand-950)]/30"
                            : "border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[var(--color-text-primary)]">
                            {variant.name}
                          </span>
                          {isWinner && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-brand-600)] bg-white dark:bg-black px-1.5 py-0.5 rounded-full border border-[var(--color-brand-400)]">
                              <Award className="w-3 h-3 text-amber-500" /> Statistical Winner
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)] pt-1">
                          <span>
                            {variant.impressions.toLocaleString()} views · {variant.conversions} conv.
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-[var(--color-text-primary)]">
                              {variant.conversionRate}%
                            </span>
                            {variant.upliftPercent > 0 && (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                +{variant.upliftPercent}% lift
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span>Target: <strong>{exp.targetMetric}</strong></span>
                <span>Split: <strong>{exp.variants.map((v) => `${v.trafficAllocation}%`).join(" / ")}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 5: AI Spend Anomaly Alerts ──────────────────────────── */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                AI Inference Spend Threshold &amp; Anomaly Alerts
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Current alert ceiling: <strong>${aiConfig.maxSpendPerUserMonthly.toFixed(2)} / user / mo</strong>.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setThresholdModalOpen(true)}>
            Adjust Ceiling
          </Button>
        </div>

        <div className="space-y-3">
          {aiAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                alert.status === "active"
                  ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                  : "bg-[var(--color-bg-subtle)] border-[var(--color-border)] opacity-75"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={alert.status === "active" ? "warning" : "default"}>
                    {alert.status.toUpperCase()}
                  </Badge>
                  <span className="font-bold text-xs text-[var(--color-text-primary)]">
                    {alert.userName} ({alert.userEmail})
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {alert.message}
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-3 pt-0.5">
                  <span>GPT-4o: <strong>${alert.aiBreakdown.openaiGpt4oMini.toFixed(2)}</strong></span>
                  <span>ElevenLabs: <strong>${alert.aiBreakdown.elevenLabsTts.toFixed(2)}</strong></span>
                  <span>Whisper STT: <strong>${alert.aiBreakdown.whisperStt.toFixed(2)}</strong></span>
                </div>
              </div>

              {alert.status === "active" && (
                <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                  Acknowledge
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 6: Sentry Error Logs & Release Health ───────────────── */}
      <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Sentry Crash &amp; Error Monitoring
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Release: <strong>{CURRENT_RELEASE}</strong> · Zero PII logged · Error-Free Sessions: {errorFreeRate}%.
            </p>
          </div>
          <Badge variant="success">99.84% Crash-Free</Badge>
        </div>

        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] font-semibold border-b border-[var(--color-border)] text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Error Exception</th>
                <th className="py-2.5 px-3">Component / Tag</th>
                <th className="py-2.5 px-3">Learner Context</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {errors.map((err) => (
                <tr key={err.id} className="hover:bg-[var(--color-bg-subtle)]/50 transition-colors">
                  <td className="py-3 px-3">
                    <Badge variant={err.level === "error" ? "error" : "warning"}>
                      {err.level}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-medium text-[var(--color-text-primary)] max-w-sm truncate">
                    {err.message}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-secondary)] font-mono text-[11px]">
                    {err.tags.component || "Global"} · {err.tags.browser}
                  </td>
                  <td className="py-3 px-3 text-[var(--color-text-secondary)]">
                    {err.user?.id} ({err.user?.cefrLevel})
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedError(err)}
                      className="text-[11px] font-semibold text-[var(--color-brand-600)] hover:underline"
                    >
                      Inspect Breadcrumbs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sentry Breadcrumb Inspector Modal */}
      {selectedError && (
        <Modal
          open={Boolean(selectedError)}
          onClose={() => setSelectedError(null)}
          title={`Sentry Exception: ${selectedError.level.toUpperCase()}`}
          description={`Release ${selectedError.release} · Handled: ${selectedError.handled ? "Yes" : "No"}`}
          size="lg"
        >
          <div className="space-y-4 py-2">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 font-mono">
              {selectedError.message}
            </div>

            {selectedError.stack && (
              <pre className="p-3 bg-gray-950 text-gray-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                {selectedError.stack}
              </pre>
            )}

            <div className="space-y-2">
              <div className="text-xs font-bold text-[var(--color-text-primary)]">
                Pre-Crash Breadcrumb Trail (Zero PII):
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedError.breadcrumbs.map((b, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[var(--color-bg-subtle)] text-[11px] flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      [{b.category}] {b.message}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      {new Date(b.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* AI Threshold Configuration Modal */}
      {thresholdModalOpen && (
        <Modal
          open={thresholdModalOpen}
          onClose={() => setThresholdModalOpen(false)}
          title="Configure AI Spend Per User Alert Threshold"
          description="Trigger automated Slack and email notifications when a learner crosses this monthly threshold."
          size="md"
        >
          <form onSubmit={handleSaveThreshold} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                Max Monthly Spend Per User (USD)
              </label>
              <input
                type="number"
                step="0.10"
                min="0.50"
                max="10.00"
                required
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]"
              />
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                Default benchmark is $1.50 (normal learner average is $0.42/mo).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setThresholdModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Threshold
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
