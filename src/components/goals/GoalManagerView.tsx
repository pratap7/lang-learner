"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Target, Calendar, Clock, Award, TrendingUp, CheckCircle2,
  AlertTriangle, ArrowRight, Sparkles, BookOpen, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  getGoalSettings,
  saveGoalSettings,
  calculateGoalPacing,
  CEFR_HOURS_MAP,
  CEFR_EXAM_NAMES,
  GoalSettings,
  GoalPacingCalculation,
} from "@/lib/goalService";
import { CefrLevel, DailyStudyMinutes } from "@/types/database.types";

const LEVELS: { code: CefrLevel; label: string; nameDe: string; hours: number; color: string }[] = [
  { code: "a1", label: "A1 · Beginner", nameDe: "Anfänger", hours: 80, color: "from-emerald-500 to-teal-600" },
  { code: "a2", label: "A2 · Elementary", nameDe: "Grundkenntnisse", hours: 150, color: "from-cyan-500 to-blue-600" },
  { code: "b1", label: "B1 · Intermediate", nameDe: "Mittelstufe (DTZ)", hours: 300, color: "from-blue-500 to-indigo-600" },
  { code: "b2", label: "B2 · Upper-Intermediate", nameDe: "Gute Mittelstufe", hours: 450, color: "from-indigo-500 to-purple-600" },
  { code: "c1", label: "C1 · Advanced", nameDe: "Oberstufe", hours: 650, color: "from-purple-500 to-pink-600" },
  { code: "c2", label: "C2 · Mastery", nameDe: "Muttersprachliches Niveau", hours: 850, color: "from-rose-500 to-amber-600" },
];

const MINUTE_PRESETS: DailyStudyMinutes[] = [10, 20, 30, 60];

export function GoalManagerView() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<GoalSettings | null>(null);
  const [pacing, setPacing] = useState<GoalPacingCalculation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initial = getGoalSettings();
    setSettings(initial);
    setPacing(calculateGoalPacing(initial));
  }, []);

  // Recalculate pacing whenever settings change
  useEffect(() => {
    if (settings) {
      setPacing(calculateGoalPacing(settings));
    }
  }, [settings]);

  const handleUpdate = <K extends keyof GoalSettings>(key: K, value: GoalSettings[K]) => {
    setSettings((prev) => {
      if (!prev) return null;
      const updated: GoalSettings = { ...prev, [key]: value };
      if (key === "targetLevel") {
        const levelCode = value as string;
        updated.targetExamName = CEFR_EXAM_NAMES[levelCode] || "Official CEFR Certification";
      }
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await saveGoalSettings(settings);
      addToast({
        type: "success",
        title: "Goals Saved!",
        message: `Target ${settings.targetLevel.toUpperCase()} & ${settings.dailyMinutes} min/day pace updated.`,
      });
    } catch {
      addToast({
        type: "error",
        title: "Save Failed",
        message: "Could not save your goals. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not scheduled";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  if (!settings || !pacing) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-pulse">
        <div className="space-y-3 pb-6 border-b border-[var(--color-border)]">
          <div className="h-6 w-48 bg-[var(--color-surface-2)] rounded-full" />
          <div className="h-10 w-72 bg-[var(--color-surface-2)] rounded-[var(--radius-lg)]" />
          <div className="h-4 w-96 bg-[var(--color-surface-2)] rounded-[var(--radius-md)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-[var(--color-surface-2)] rounded-[var(--radius-xl)]" />
          <div className="h-48 bg-[var(--color-surface-2)] rounded-[var(--radius-xl)]" />
          <div className="h-48 bg-[var(--color-surface-2)] rounded-[var(--radius-xl)]" />
        </div>
        <div className="h-64 bg-[var(--color-surface-2)] rounded-[var(--radius-2xl)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-2">
            <Target size={13} /> Curriculum Target & Schedule Engine
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Goal & Exam <span className="text-gradient">Trajectory</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
            Configure your target CEFR milestone, official exam date, and daily pace to simulate your exact completion timeline.
          </p>
        </div>

        <Link href="/dashboard">
          <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={14} />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Real-time Trajectory Status Hero Card */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] relative overflow-hidden">
        <div className="h-1.5 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-90" />
        
        <div className="grid md:grid-cols-3 gap-6 items-center relative z-10">
          {/* Status Badge & Headline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              {pacing.status === "ahead" ? (
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-success)]/15 border border-[var(--color-success)]/30 text-[var(--color-success)] flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> Ahead of Schedule (+{pacing.daysAheadOrBehind} days buffer)
                </div>
              ) : pacing.status === "on_track" ? (
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center gap-1.5">
                  <TrendingUp size={13} /> On Track for Exam Target
                </div>
              ) : pacing.status === "behind" ? (
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Behind Target ({Math.abs(pacing.daysAheadOrBehind)} days behind)
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <Clock size={13} /> Open Pacing (No Exam Date Set)
                </div>
              )}

              <Badge variant="primary" size="sm">
                Target {settings.targetLevel.toUpperCase()}
              </Badge>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              Projected Graduation:{" "}
              <span className="text-[var(--color-brand-400)]">
                {formatDate(pacing.projectedCompletionDate)}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {pacing.status === "behind"
                ? `At your current pace of ${settings.dailyMinutes} min/day, you will complete the material after your target exam date. Increase your daily study to ${pacing.recommendedDailyMinutes} min/day to catch up.`
                : pacing.status === "ahead"
                ? `Excellent rhythm! You will finish the ${settings.targetLevel.toUpperCase()} curriculum with ${pacing.daysAheadOrBehind} days to spare for Goethe/telc practice exams.`
                : `You are moving at a solid, sustainable pace. Completing your daily task sets keeps you on schedule for the ${settings.targetExamName}.`}
            </p>

            {/* Progress Bar for Hours */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium">
                <span>Completed: {pacing.completedHours}h</span>
                <span>Remaining: {pacing.remainingHours}h / {pacing.totalHoursRequired}h total</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-accent-500)] transition-all duration-500"
                  style={{ width: `${pacing.progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Metrics Quick Box */}
          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">Official Exam:</span>
              <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[150px]">
                {formatDate(settings.targetExamDate)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">Daily Study:</span>
              <span className="font-semibold text-[var(--color-brand-400)]">
                {settings.dailyMinutes} mins/day
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">Days to Finish:</span>
              <span className="font-semibold text-[var(--color-accent-400)]">
                ~{pacing.daysRemainingNeeded} days
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)]/60 text-center">
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Target Credential:
              </span>
              <p className="text-xs font-bold text-[var(--color-text-primary)] mt-0.5 line-clamp-1">
                {settings.targetExamName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Configuration Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: TARGET LEVEL SELECTION */}
        <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                1. Select Your Target CEFR Level
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Structured to Goethe-Institut, telc, and TestDaF official standards.
              </p>
            </div>
            <span className="text-xs font-bold text-[var(--color-brand-400)] uppercase">
              Current: {settings.currentLevel.toUpperCase()}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LEVELS.map((lvl) => {
              const isSelected = settings.targetLevel.toLowerCase() === lvl.code;

              return (
                <button
                  key={lvl.code}
                  type="button"
                  onClick={() => handleUpdate("targetLevel", lvl.code)}
                  className={`p-4 rounded-[var(--radius-xl)] border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)] shadow-[var(--shadow-glow)]"
                      : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                      {lvl.code.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                      ~{lvl.hours}h guided
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                    {lvl.label}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] italic mt-0.5">
                    {lvl.nameDe}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: DAILY STUDY MINUTES & PACE SIMULATOR */}
        <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-5">
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              2. Daily Study Commitment & Pace
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Choose how many minutes you can commit every single day.
            </p>
          </div>

          {/* Minute Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MINUTE_PRESETS.map((mins) => {
              const isSelected = settings.dailyMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleUpdate("dailyMinutes", mins)}
                  className={`p-4 rounded-[var(--radius-xl)] border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-brand-600)] text-white border-[var(--color-brand-500)] shadow-md"
                      : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"
                  }`}
                >
                  <div className="font-heading text-2xl font-bold">{mins} min</div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {mins === 10
                      ? "Casual Pace"
                      : mins === 20
                      ? "Recommended"
                      : mins === 30
                      ? "Intensive"
                      : "Full Immersion"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pacing Advice Callout */}
          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-start gap-3 text-xs text-[var(--color-text-secondary)]">
            <Zap size={16} className="text-[var(--color-accent-400)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Consistency Principle:</strong> A steady 20 minutes daily yields far higher retention and active vocabulary recall than studying 2.5 hours only on Sundays, due to overnight memory consolidation.
            </p>
          </div>
        </div>

        {/* SECTION 3: EXAM DATE & CREDENTIAL */}
        <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              3. Target Exam Date & Official Certification
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Set a hard deadline to align your review cards and practice tests.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Target Exam Date
              </label>
              <input
                type="date"
                value={settings.targetExamDate || ""}
                onChange={(e) => handleUpdate("targetExamDate", e.target.value || null)}
                className="w-full px-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Official Examination Name
              </label>
              <input
                type="text"
                value={settings.targetExamName}
                onChange={(e) => handleUpdate("targetExamName", e.target.value)}
                placeholder="e.g. Goethe-Zertifikat B1"
                className="w-full px-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)]"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSaving}
            className="shadow-[var(--shadow-glow)] min-w-[200px]"
          >
            {isSaving ? "Saving Plan..." : "Save Learning Trajectory"}
          </Button>
        </div>
      </form>
    </div>
  );
}
