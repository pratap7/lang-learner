"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Zap,
  Target,
  BarChart3,
  Flame,
  RotateCcw,
  Headphones,
  Mic,
  PenTool,
  ShieldAlert,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  getUserMasteryProfile,
  calculateProjectedCefrReadiness,
  getAdaptiveNextLessonRecommendation,
  recordTopicInteraction,
  UserMasteryProfile,
  TopicMasteryState,
  CefrReadinessProjection,
  AdaptiveLessonRecommendation,
} from "@/lib/adaptiveMasteryService";
import { playSuccessChime, playClickSound } from "@/lib/soundEffects";

export function LearningInsightsView() {
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserMasteryProfile | null>(null);
  const [readiness, setReadiness] = useState<CefrReadinessProjection | null>(null);
  const [recommendation, setRecommendation] = useState<AdaptiveLessonRecommendation | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "weak" | "developing" | "mastered">("all");
  const [dailyBudget, setDailyBudget] = useState<number>(20);

  const refreshProfile = () => {
    const prof = getUserMasteryProfile("demo-user", "A1");
    setProfile(prof);
    const ready = calculateProjectedCefrReadiness(prof, dailyBudget);
    setReadiness(ready);
    const rec = getAdaptiveNextLessonRecommendation(prof);
    setRecommendation(rec);
  };

  useEffect(() => {
    refreshProfile();
  }, [dailyBudget]);

  const handleSimulatePractice = (topicId: string, isCorrect: boolean) => {
    playClickSound();
    recordTopicInteraction("demo-user", topicId, isCorrect, isCorrect ? 1.0 : 0.0);
    refreshProfile();
    if (isCorrect) playSuccessChime();
    toast({
      type: isCorrect ? "success" : "info",
      title: isCorrect ? "Mastery increased!" : "Mistake recorded",
      message: isCorrect
        ? "Adaptive weights updated: recent success reinforced topic retention."
        : "Recency-weighted decay applied. Topic flagged for targeted drill.",
    });
  };

  if (!profile || !readiness || !recommendation) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
        Loading adaptive mastery insights...
      </div>
    );
  }

  const allTopicsList = Object.values(profile.topics).filter((t) => t.totalAttempts > 0);
  const filteredTopics = allTopicsList.filter((t) => {
    if (activeFilter === "mastered") return t.status === "mastered";
    if (activeFilter === "developing") return t.status === "developing";
    if (activeFilter === "weak") return t.status === "weak";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* ─── 1. TOP HERO HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Compass size={22} />
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                Learning Insights & Adaptive Mastery
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Recency-weighted knowledge graph · CEFR {profile.currentCefrLevel} $\to$ {profile.targetCefrLevel} progression
              </p>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] min-w-[120px] text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Mastery Index
            </p>
            <p className="font-heading text-2xl font-extrabold text-[var(--color-brand-400)] mt-0.5">
              {profile.overallMasteryScore}%
            </p>
          </div>

          <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] min-w-[120px] text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Strengths
            </p>
            <p className="font-heading text-2xl font-extrabold text-emerald-400 mt-0.5">
              {profile.strengths.length}
            </p>
          </div>

          <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] min-w-[120px] text-center shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Friction Areas
            </p>
            <p className="font-heading text-2xl font-extrabold text-rose-400 mt-0.5">
              {profile.weaknesses.length}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. PROJECTED CEFR READINESS DATE MILESTONE ───────────────────────── */}
      <div className="p-6 rounded-[var(--radius-2xl)] border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-[var(--color-surface)] to-[var(--color-surface-2)] shadow-md space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Next Level Milestone
              </span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                Target: CEFR {readiness.nextLevel}
              </span>
            </div>
            <h2 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
              Projected Readiness Date:{" "}
              <span className="text-indigo-400 underline decoration-indigo-400/40 decoration-wavy">
                {readiness.projectedDate}
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
              {readiness.milestoneMessage}
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-indigo-500/30 min-w-[170px] text-center shadow-sm space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Estimated Countdown
            </span>
            <div className="font-heading text-3xl font-extrabold text-indigo-400">
              {readiness.estimatedDaysRemaining}{" "}
              <span className="text-sm font-normal text-[var(--color-text-muted)]">days</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
              at {dailyBudget} mins / day
            </p>
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--color-text-primary)]">
                {readiness.readinessPercentage}% Readiness for {readiness.nextLevel}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                ({readiness.masteredTopicsCount} / {readiness.totalRequiredTopics} core competencies consolidated)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
              <span>Adjust pacing:</span>
              {[10, 20, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDailyBudget(mins)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    dailyBudget === mins
                      ? "bg-indigo-500 text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-white"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <ProgressBar
            value={readiness.readinessPercentage}
            size="md"
            color="brand"
          />
        </div>
      </div>

      {/* ─── 3. ADAPTIVE NEXT ACTION RECOMMENDATION ──────────────────────────── */}
      <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 flex-shrink-0 mt-0.5">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="xs">
                {recommendation.badgeText}
              </Badge>
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                Adaptive Next Best Action
              </span>
            </div>
            <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)] mt-0.5">
              {recommendation.title}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 max-w-2xl leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        </div>

        <Link href={recommendation.actionUrl}>
          <Button variant="primary" size="sm" className="whitespace-nowrap gap-1.5">
            <span>{recommendation.actionLabel}</span>
            <ArrowRight size={14} />
          </Button>
        </Link>
      </div>

      {/* ─── 4. SKILLS BREAKDOWN RADAR BARS ──────────────────────────────────── */}
      <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <BarChart3 size={18} className="text-[var(--color-brand-400)]" />
            Skill Competency Breakdown
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            Balanced CEFR Language Domains
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              { key: "grammar", label: "Grammar", icon: BookOpen, color: "brand" },
              { key: "vocabulary", label: "Vocabulary", icon: Award, color: "accent" },
              { key: "reading", label: "Reading", icon: BookOpen, color: "success" },
              { key: "listening", label: "Listening", icon: Headphones, color: "warning" },
              { key: "speaking", label: "Speaking", icon: Mic, color: "brand" },
              { key: "writing", label: "Writing", icon: PenTool, color: "accent" },
            ] as const
          ).map((item) => {
            const score = profile.skillsBreakdown[item.key];
            const IconComponent = item.icon;

            return (
              <div
                key={item.key}
                className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {item.label}
                  </span>
                  <IconComponent size={14} className="text-[var(--color-text-muted)]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Mastery</span>
                    <span className="font-extrabold font-mono text-[var(--color-text-primary)]">{score}%</span>
                  </div>
                  <ProgressBar value={score} size="xs" color={item.color as any} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. TOPIC MASTERY MATRIX: STRENGTHS & WEAKNESSES ─────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Target size={18} className="text-amber-400" />
              Per-Topic Knowledge Matrix
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Scored via recency-weighted exponential decay (14-day half-life) and confidence dampening.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            {[
              { id: "all", label: `All (${allTopicsList.length})` },
              { id: "weak", label: `Weak (${profile.weaknesses.length})` },
              { id: "developing", label: `Developing (${profile.developing.length})` },
              { id: "mastered", label: `Mastered (${profile.strengths.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold transition-colors ${
                  activeFilter === tab.id
                    ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)] shadow-sm font-bold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => {
            const isMastered = topic.status === "mastered";
            const isWeak = topic.status === "weak";
            const isDev = topic.status === "developing";

            return (
              <div
                key={topic.topicId}
                className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between space-y-4 shadow-sm hover:border-[var(--color-border-hover)] transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={topic.cefrLevel.toLowerCase() as any} size="xs">
                      {topic.cefrLevel}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      {topic.trend === "improving" && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                          <TrendingUp size={12} /> Improving
                        </span>
                      )}
                      {topic.trend === "declining" && (
                        <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                          <TrendingDown size={12} /> Declining
                        </span>
                      )}
                      {topic.trend === "stable" && (
                        <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-0.5">
                          <Minus size={12} /> Stable
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isMastered
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isDev
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {topic.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-heading text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors">
                      {topic.topicName}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {topic.totalAttempts} interaction events recorded
                    </p>
                  </div>

                  {/* Mastery Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                        Mastery Score
                      </span>
                      <span className="font-mono font-extrabold text-[var(--color-text-primary)]">
                        {topic.masteryScore}%
                      </span>
                    </div>
                    <ProgressBar
                      value={topic.masteryScore}
                      size="sm"
                      color={isMastered ? "success" : isDev ? "warning" : "error"}
                    />
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] pt-0.5">
                      <span>Accuracy: {topic.unweightedAccuracyPct}%</span>
                      <span>Decayed: {topic.decayedAccuracyPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action / Simulation Buttons */}
                <div className="pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between gap-2">
                  <Link
                    href={`/practice?topic=${encodeURIComponent(topic.topicName)}`}
                    className="text-xs font-semibold text-[var(--color-brand-400)] hover:underline flex items-center gap-1"
                  >
                    <span>Practice Drills</span>
                    <ChevronRight size={12} />
                  </Link>

                  {/* Interactive Simulation Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Simulate Correct Answer (+Recency Score)"
                      onClick={() => handleSimulatePractice(topic.topicId, true)}
                      className="w-6 h-6 rounded bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center justify-center transition-colors border border-emerald-500/30"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      title="Simulate Error (Apply Decay)"
                      onClick={() => handleSimulatePractice(topic.topicId, false)}
                      className="w-6 h-6 rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-xs font-bold flex items-center justify-center transition-colors border border-rose-500/30"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
