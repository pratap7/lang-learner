"use client";

import { useState } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getWeeklyMondayMetrics } from "@/lib/monitoring/weeklyMetricsService";
import type { WeeklyMetricsDashboardData, MondayMetricItem } from "@/types/analytics";

export function AdminWeeklyMetricsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<WeeklyMetricsDashboardData>(() =>
    getWeeklyMondayMetrics()
  );
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const lines = [
      `# DeutschPfad Monday Morning Metrics — ${data.weekLabel}`,
      `Executive Summary: ${data.executiveSummary}`,
      "",
      ...data.metrics.map(
        (m) =>
          `${m.number}. ${m.name}: ${m.valueDisplay} (${m.changeWoW > 0 ? "+" : ""}${m.changeWoW}% WoW) | Target: ${m.targetBenchmark} | Status: ${m.status.toUpperCase()}`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to Clipboard",
      message: "Weekly sync summary copied in Markdown format.",
      type: "success",
    });
  };

  const handleDownloadReport = () => {
    const lines = [
      `# DeutschPfad Weekly Executive Report — ${data.weekLabel}`,
      `Generated At: ${new Date(data.generatedAt).toLocaleString()}`,
      `Summary: ${data.executiveSummary}`,
      "",
      "---",
      "## The 10 Weekly Monday Numbers",
      "",
      ...data.metrics.map(
        (m) =>
          `### ${m.number}. ${m.name}\n- **Current Value**: ${m.valueDisplay}\n- **WoW Change**: ${m.changeWoW > 0 ? "+" : ""}${m.changeWoW}%\n- **Target Benchmark**: ${m.targetBenchmark}\n- **Status**: ${m.status.toUpperCase()}\n- **Context**: ${m.statusComment}\n`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `deutschpfad-weekly-metrics-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Report Downloaded",
      message: "Saved Markdown summary for team review.",
      type: "success",
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl border border-[var(--color-brand-400)]/40 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-brand-50)]/40 dark:to-[var(--color-brand-950)]/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[var(--color-brand-500)] text-white">
                <Calendar className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-brand-600)]">
                Internal Executive Briefing
              </span>
              <Badge variant="success">All 10 Metrics Green</Badge>
            </div>
            <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight mt-1">
              The 10 Numbers to Check Every Monday
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              {data.weekLabel} · Curated for the weekly executive standup.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopySummary}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied" : "Copy Markdown"}
            </Button>
            <Button size="sm" onClick={handleDownloadReport}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Report
            </Button>
          </div>
        </div>

        {/* Executive Narrative */}
        <div className="mt-5 p-4 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] leading-relaxed flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-[var(--color-text-primary)]">Monday Morning Digest: </strong>
            {data.executiveSummary}
          </div>
        </div>
      </div>

      {/* The 10 Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.metrics.map((metric) => {
          const isFavorableChange =
            (metric.isPositiveDirection && metric.changeWoW >= 0) ||
            (!metric.isPositiveDirection && metric.changeWoW <= 0);

          return (
            <div
              key={metric.id}
              className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs hover:border-[var(--color-brand-400)] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Number & Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center font-black text-xs text-[var(--color-brand-600)] group-hover:bg-[var(--color-brand-500)] group-hover:text-white transition-colors">
                      {metric.number}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                        {metric.name}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                        {metric.description}
                      </p>
                    </div>
                  </div>

                  <Badge variant="success" className="text-[10px] py-0.5 px-2">
                    On Track
                  </Badge>
                </div>

                {/* Primary Metric Number & WoW Delta */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                    {metric.valueDisplay}
                  </div>

                  <div
                    className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                      isFavorableChange
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {isFavorableChange ? (
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {metric.changeWoW > 0 ? `+${metric.changeWoW}` : metric.changeWoW}% WoW
                  </div>
                </div>
              </div>

              {/* Benchmark Target & Operational Context */}
              <div className="mt-4 pt-3.5 border-t border-[var(--color-border)] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1 font-semibold text-[var(--color-text-muted)]">
                    <Target className="w-3.5 h-3.5" /> Target:
                  </span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {metric.targetBenchmark}
                  </span>
                </div>

                <div className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed bg-[var(--color-bg-subtle)]/70 p-2.5 rounded-lg">
                  {metric.statusComment}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
