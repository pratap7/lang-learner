"use client";

import { useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  UserCheck,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getAdminAnalytics } from "@/lib/adminService";
import type { AdminAnalyticsKPIs } from "@/types/admin";

export function AdminDashboardTab() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const data: AdminAnalyticsKPIs = getAdminAnalytics(period);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Executive Business & Unit Economics Dashboard
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Real-time telemetry on subscriber growth, revenue run-rate, customer churn, and AI inference margins.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg">
          {(["7d", "30d", "90d", "1y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                period === p
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Key Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Monthly Recurring Revenue (MRR) */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden group hover:border-[var(--color-brand-400)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Monthly Recurring Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              ${data.mrr.totalMrr.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{data.mrr.mrrGrowthMoM}% MoM
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>ARR: <strong>${data.mrr.arr.toLocaleString()}</strong></span>
            <span>ARPU: <strong>${data.mrr.arpu.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* 2. Total Signups & Learner Velocity */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden group hover:border-[var(--color-brand-400)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Total Learner Signups
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              {data.signups.total.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />+{data.signups.growthRateMonth}% MoM
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Today: <strong>+{data.signups.today}</strong></span>
            <span>This Month: <strong>+{data.signups.thisMonth.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* 3. Active Users (DAU / MAU) */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden group hover:border-[var(--color-brand-400)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Daily & Monthly Active (DAU / MAU)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              {data.activeUsers.dau.toLocaleString()} <span className="text-lg font-normal text-[var(--color-text-muted)]">DAU</span>
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
              {data.activeUsers.stickinessRatio}% Stickiness
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>MAU: <strong>{data.activeUsers.mau.toLocaleString()}</strong></span>
            <span>Avg Session: <strong>{data.activeUsers.avgDailyMinutes} min</strong></span>
          </div>
        </div>

        {/* 4. Conversion Rate */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden group hover:border-[var(--color-brand-400)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Free ➔ Paid Conversion
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              {data.conversion.freeToPaidRate}%
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              (Industry avg: 4-5%)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Trial ➔ Paid: <strong>{data.conversion.trialToPaidRate}%</strong></span>
            <span>Paid Subs: <strong>{data.conversion.totalPaidSubscribers.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* 5. Churn Rate */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden group hover:border-[var(--color-brand-400)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Monthly Churn Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {data.churn.monthlyChurnRate}%
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              (Healthy consumer benchmark &lt; 4%)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Win-back Save Rate: <strong>{data.churn.winbackSuccessRate}%</strong></span>
            <span>Paused: <strong>{data.churn.pauseRate}%</strong></span>
          </div>
        </div>

        {/* 6. AI Inference Cost Per User */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden group hover:border-[var(--color-brand-400)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              AI Compute Cost / Active User
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
              ${data.aiCostPerUser.costPerActiveUser.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              {data.aiCostPerUser.grossMarginPercent}% Gross Margin
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span>Total AI: <strong>${data.aiCostPerUser.monthlyAiTotalCost.toLocaleString()}</strong></span>
            <span>Volume: <strong>{data.aiCostPerUser.tokenVolumeMillions}M tok</strong></span>
          </div>
        </div>
      </div>

      {/* Revenue & AI Compute Economics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: MRR Growth Trajectory */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                6-Month Revenue & Subscriber Velocity
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Monthly recurring revenue scaling from $21.4k to $42.6k.
              </p>
            </div>
            <Badge variant="success">Growing +14.2% MoM</Badge>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4">
            {data.revenueHistory.map((item) => {
              const maxMrr = 45000;
              const widthPct = Math.min(100, Math.round((item.mrr / maxMrr) * 100));
              const aiCostPct = Math.round((item.aiCost / item.mrr) * 100);

              return (
                <div key={item.date} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-text-primary)] w-20">
                      {item.date}
                    </span>
                    <div className="flex items-center gap-4 text-[var(--color-text-secondary)]">
                      <span>{item.paidUsers.toLocaleString()} subscribers</span>
                      <span className="font-bold text-[var(--color-text-primary)]">
                        ${item.mrr.toLocaleString()} MRR
                      </span>
                    </div>
                  </div>
                  <div className="h-5 w-full bg-[var(--color-bg-subtle)] rounded-lg overflow-hidden flex items-center p-0.5">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-400)] transition-all duration-500 relative group flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                      style={{ width: `${widthPct}%` }}
                    >
                      <span>${(item.mrr / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-brand-500)]" />
              Pro &amp; Pro Plus Plan Revenue
            </span>
            <span>AI Cost as % of Revenue: <strong>5.01%</strong> (Exceptional unit economics)</span>
          </div>
        </div>

        {/* Right 1 Col: AI Cost Decomposition */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                AI Provider Cost Share
              </h3>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-6">
              Total monthly spend: <strong>${data.aiCostPerUser.monthlyAiTotalCost.toLocaleString()}</strong> across conversation, transcription, and speech synthesis.
            </p>

            <div className="space-y-4">
              {/* OpenAI GPT-4o-mini */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    OpenAI GPT-4o-mini (Dialogue &amp; Grading)
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    ${data.aiCostPerUser.costByProvider.openaiGpt4oMini} (45.8%)
                  </span>
                </div>
                <div className="h-2.5 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "45.8%" }} />
                </div>
              </div>

              {/* ElevenLabs German TTS */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    ElevenLabs (Native German Audio)
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    ${data.aiCostPerUser.costByProvider.elevenLabsTts} (32.7%)
                  </span>
                </div>
                <div className="h-2.5 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "32.7%" }} />
                </div>
              </div>

              {/* Whisper Speech-to-Text */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    Whisper v3 (Phoneme &amp; Speech Scoring)
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    ${data.aiCostPerUser.costByProvider.whisperSpeechToText} (21.5%)
                  </span>
                </div>
                <div className="h-2.5 bg-[var(--color-bg-subtle)] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "21.5%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-xs text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-text-primary)]">Caching &amp; Optimization: </span>
                Prompt caching and client-side sentence memoization reduced model inference costs by 34% this cycle.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
