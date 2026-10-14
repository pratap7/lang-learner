"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Sparkles, Clock, CheckCircle2, ArrowRight,
  Shield, Volume2, BookOpen, Layers, Award,
  ChevronDown, ChevronUp, ChevronRight, Mic, Edit3, Target,
  Check, Play, Compass, Sliders
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/courses/ProgressRing";
import { DashboardOverviewSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { AccessibilitySettingsModal } from "@/components/ui/AccessibilitySettingsModal";
import { useI18n } from "@/lib/i18n/I18nContext";
import { appCopy } from "@/lib/appCopy";

import {
  getDailyTasks,
  toggleTaskCompletion,
  DailyTaskState,
  GeneratedDailyTask,
} from "@/lib/dailyTaskService";
import {
  getStreakData,
  toggleFreezeEquipped,
  purchaseFreezeWithXp,
  getHoursUntilMidnight,
  StreakData,
} from "@/lib/streakService";
import {
  getGoalSettings,
  calculateGoalPacing,
  GoalSettings,
  GoalPacingCalculation,
} from "@/lib/goalService";
import {
  getWeeklyActivity,
  getTwelveWeeksActivity,
  getTodayQuote,
  DayActivity,
  MotivationalQuote,
} from "@/lib/activityService";
import {
  getTotalDueCardsCount,
  getDecks,
  FlashcardDeck,
} from "@/lib/flashcardService";
import {
  getUserTotalXp,
  getLevelInfoFromXp,
  UserLevelInfo,
  ALL_BADGES,
  BadgeItem,
} from "@/lib/gamificationService";
import {
  getUserMasteryProfile,
  calculateProjectedCefrReadiness,
  getAdaptiveNextLessonRecommendation,
  UserMasteryProfile,
  CefrReadinessProjection,
} from "@/lib/adaptiveMasteryService";
import { playClickSound, playSuccessChime } from "@/lib/soundEffects";

/* ─────────────────────────────────────────────────────────────────────────────
   SKILLS RADAR CHART (READING, WRITING, LISTENING, SPEAKING)
   Clean 4-axis SVG Radar Visualization
───────────────────────────────────────────────────────────────────────────── */
interface SkillsRadarProps {
  reading: number;
  writing: number;
  listening: number;
  speaking: number;
}

function SkillsRadarChart({ reading, writing, listening, speaking }: SkillsRadarProps) {
  const size = 200;
  const center = 100;
  const maxRadius = 68;

  // 4 vertices calculation
  const topY = center - (reading / 100) * maxRadius;
  const rightX = center + (writing / 100) * maxRadius;
  const bottomY = center + (listening / 100) * maxRadius;
  const leftX = center - (speaking / 100) * maxRadius;

  const points = `${center},${topY} ${rightX},${center} ${center},${bottomY} ${leftX},${center}`;

  // Grid concentric rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Grid Diamonds */}
        {rings.map((factor) => {
          const r = maxRadius * factor;
          const gridPoints = `${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`;
          return (
            <polygon
              key={factor}
              points={gridPoints}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={factor === 1.0 ? "1.5" : "1"}
              strokeDasharray={factor === 1.0 ? "none" : "3,3"}
              className="opacity-70"
            />
          );
        })}

        {/* Crosshair Axes */}
        <line
          x1={center}
          y1={center - maxRadius}
          x2={center}
          y2={center + maxRadius}
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        <line
          x1={center - maxRadius}
          y1={center}
          x2={center + maxRadius}
          y2={center}
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />

        {/* User Skills Filled Polygon */}
        <motion.polygon
          points={points}
          fill="var(--color-brand-500)"
          fillOpacity="0.25"
          stroke="var(--color-brand-400)"
          strokeWidth="2.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Vertices Markers */}
        <circle cx={center} cy={topY} r="4" fill="var(--color-brand-400)" className="shadow-xs" />
        <circle cx={rightX} cy={center} r="4" fill="var(--color-brand-400)" className="shadow-xs" />
        <circle cx={center} cy={bottomY} r="4" fill="var(--color-brand-400)" className="shadow-xs" />
        <circle cx={leftX} cy={center} r="4" fill="var(--color-brand-400)" className="shadow-xs" />
      </svg>

      {/* Axis Numerical Indicators */}
      <div className="w-full grid grid-cols-2 gap-2 text-xs pt-3 mt-1 border-t border-[var(--color-border)]/60">
        <div className="flex items-center justify-between px-2 py-1 rounded bg-[var(--color-surface-2)]">
          <span className="text-[var(--color-text-secondary)] font-medium">Lesen (Reading)</span>
          <span className="font-mono font-bold text-[var(--color-brand-400)]">{reading}%</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-[var(--color-surface-2)]">
          <span className="text-[var(--color-text-secondary)] font-medium">Schreiben (Writing)</span>
          <span className="font-mono font-bold text-[var(--color-brand-400)]">{writing}%</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-[var(--color-surface-2)]">
          <span className="text-[var(--color-text-secondary)] font-medium">Hören (Listening)</span>
          <span className="font-mono font-bold text-[var(--color-brand-400)]">{listening}%</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded bg-[var(--color-surface-2)]">
          <span className="text-[var(--color-text-secondary)] font-medium">Sprechen (Speaking)</span>
          <span className="font-mono font-bold text-[var(--color-brand-400)]">{speaking}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export function DashboardView() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [taskState, setTaskState] = useState<DailyTaskState | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [goalSettings, setGoalSettings] = useState<GoalSettings | null>(null);
  const [pacing, setPacing] = useState<GoalPacingCalculation | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>([]);
  const [heatGrid, setHeatGrid] = useState<{ date: string; intensity: 0 | 1 | 2 | 3 | 4; minutes: number }[]>([]);
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [isPlayingQuote, setIsPlayingQuote] = useState(false);
  const [hoursLeft, setHoursLeft] = useState<number>(12);
  const [dueCardsCount, setDueCardsCount] = useState<number>(0);
  const [decksSummary, setDecksSummary] = useState<FlashcardDeck[]>([]);
  const [levelInfo, setLevelInfo] = useState<UserLevelInfo | null>(null);
  const [masteryProfile, setMasteryProfile] = useState<UserMasteryProfile | null>(null);
  const [readiness, setReadiness] = useState<CefrReadinessProjection | null>(null);
  const [userName, setUserName] = useState("Lernende/r");
  const [showDetailedInsights, setShowDetailedInsights] = useState(false);
  const [showA11yModal, setShowA11yModal] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    // Load cached profile name
    if (typeof window !== "undefined") {
      try {
        const rawProfile = localStorage.getItem("deutschpfad_user_profile");
        if (rawProfile) {
          const parsed = JSON.parse(rawProfile);
          if (parsed.full_name) {
            setUserName(parsed.full_name.split(" ")[0]);
          }
        }
      } catch {}
    }

    const goals = getGoalSettings();
    setGoalSettings(goals);
    setPacing(calculateGoalPacing(goals));

    const tasks = getDailyTasks(goals.dailyMinutes);
    setTaskState(tasks);

    const streakData = getStreakData();
    setStreak(streakData);
    setWeeklyActivity(getWeeklyActivity());
    setHeatGrid(getTwelveWeeksActivity());
    setQuote(getTodayQuote());
    setHoursLeft(getHoursUntilMidnight());

    setDueCardsCount(getTotalDueCardsCount());
    setDecksSummary(getDecks());

    const totalXp = getUserTotalXp();
    setLevelInfo(getLevelInfoFromXp(totalXp));

    // Mastery & Readiness Projection
    const profile = getUserMasteryProfile("demo-user", "A1");
    setMasteryProfile(profile);
    const readinessCalc = calculateProjectedCefrReadiness(profile, goals.dailyMinutes);
    setReadiness(readinessCalc);

    setLoading(false);
  }, []);

  const handleToggleTask = (taskId: string) => {
    playSuccessChime();
    const nextState = toggleTaskCompletion(taskId);
    setTaskState(nextState);

    if (nextState.completedCount > 0 && streak && !streak.todayCompleted) {
      setStreak((prev) => (prev ? { ...prev, todayCompleted: true } : null));
    }
  };

  const handleToggleFreeze = () => {
    playClickSound();
    const updated = toggleFreezeEquipped();
    setStreak(updated);
    addToast({
      type: "info",
      title: updated.isFreezeEquipped ? "Freeze Shield Active" : "Shield Stored",
      message: updated.isFreezeEquipped
        ? "Your daily study momentum is safely protected."
        : "Streak Shield returned to inventory.",
    });
  };

  const handleBuyFreeze = () => {
    playClickSound();
    const result = purchaseFreezeWithXp(100);
    setStreak(result.data);
    addToast({
      type: result.success ? "success" : "error",
      title: result.success ? "Streak Shield Acquired!" : "More XP Needed",
      message: result.message,
    });
  };

  const playQuoteAudio = () => {
    if (!quote || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    playClickSound();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(quote.german);
    utterance.lang = "de-DE";
    utterance.rate = 0.9;

    setIsPlayingQuote(true);
    utterance.onend = () => setIsPlayingQuote(false);
    utterance.onerror = () => setIsPlayingQuote(false);

    window.speechSynthesis.speak(utterance);
  };

  // Keyboard shortcut: Enter activates primary continue action
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
          return;
        }
        const continueBtn = document.getElementById("primary-continue-action");
        if (continueBtn) {
          continueBtn.click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading || !taskState || !streak || !goalSettings || !pacing || !readiness || !masteryProfile) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
        <DashboardOverviewSkeleton />
      </div>
    );
  }

  // Time-based German greeting
  const hour = new Date().getHours();
  const greetingDe = hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

  // Daily Tasks stats
  const tasksTotal = taskState.tasks.length;
  const tasksDone = taskState.completedCount;
  const totalMinutesBudgeted = taskState.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const minutesDone = taskState.tasks.filter((t) => t.isCompleted).reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const taskProgressPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  // Next Best Recommended Lesson
  const nextLessonRec = getAdaptiveNextLessonRecommendation(masteryProfile);

  // Weekly Goal Ring calculation
  const weeklyDaysCompleted = weeklyActivity.filter((d) => d.minutesStudied > 0).length;
  const weeklyTargetDays = 5;
  const weeklyCompletionPct = Math.min(100, Math.round((weeklyDaysCompleted / weeklyTargetDays) * 100));

  // Recent Unlocked Badges (first 3)
  const recentBadges = ALL_BADGES.filter((b) => b.unlocked).slice(0, 3);

  // New user friendly empty check
  const isBrandNewLearner = streak.currentStreak <= 1 && (levelInfo?.currentXp || 0) <= 50 && tasksDone === 0;

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* ─────────────────────────────────────────────────────────────────────────
          1. GREETING & STREAK MOMENTUM BANNER
         ───────────────────────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              {greetingDe}, {userName}!
            </h1>
            <span className="text-xl">🇩🇪</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
            {streak.todayCompleted
              ? "You have already completed your study goal today. Great momentum!"
              : `Ready for your ${goalSettings.dailyMinutes}-minute German session? ~${hoursLeft}h left today.`}
          </p>
        </div>

        {/* Header Controls: Language, Accessibility, Streak & Shield */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <LanguageSwitcher variant="pill" />

          <button
            type="button"
            onClick={() => setShowA11yModal(true)}
            aria-label="Accessibility & Display settings"
            className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <Sliders size={14} />
          </button>

          {/* Streak Counter Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 font-bold text-xs shadow-xs">
            <Flame size={16} className="fill-current animate-bounce" />
            <span>{streak.currentStreak}-Day Streak</span>
          </div>

          {/* Streak Shield Status */}
          <button
            type="button"
            onClick={handleToggleFreeze}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              streak.isFreezeEquipped
                ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400 shadow-xs"
                : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
            title="Toggle Streak Shield Protection"
          >
            <Shield size={14} className={streak.isFreezeEquipped ? "fill-current" : ""} />
            <span>{streak.isFreezeEquipped ? "Shield Active" : "Store Shield"}</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────────────
          2. SINGLE PROMINENT "CONTINUE" CARD (CLEAR PRIMARY ACTION)
         ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative rounded-[var(--radius-3xl)] p-6 sm:p-8 border border-[var(--color-brand-500)]/40 bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-surface-2)] shadow-[var(--shadow-xl)] overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-48 bg-gradient-to-b from-[var(--color-brand-500)]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="h-1 w-full tricolor-stripe opacity-90 absolute top-0 left-0 right-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="xs">
                {nextLessonRec.badgeText || "Next Best Step"}
              </Badge>
              <Badge variant="a1" size="xs">
                {masteryProfile.currentCefrLevel} · High German
              </Badge>
              <span className="text-xs text-[var(--color-text-muted)] font-medium flex items-center gap-1">
                <Clock size={12} /> ~8 min
              </span>
            </div>

            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)] leading-tight">
                {nextLessonRec.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                {nextLessonRec.reason || "Master essential German grammar structures with audio pronunciation drills."}
              </p>
            </div>

            {/* Quick Curriculum Unit Progress Strip */}
            <div className="space-y-1 pt-1 max-w-sm">
              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-medium">
                <span>Unit 1 Progress</span>
                <span className="font-mono text-[var(--color-brand-400)]">45% Completed</span>
              </div>
              <ProgressBar value={45} color="brand" size="xs" />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex flex-col sm:items-end gap-2">
            <Link href={nextLessonRec.actionUrl} className="w-full sm:w-auto">
              <Button
                id="primary-continue-action"
                variant="primary"
                size="xl"
                rightIcon={<ArrowRight size={18} />}
                className="w-full sm:w-auto min-w-[200px] shadow-[var(--shadow-glow)] font-bold text-sm min-h-[52px]"
              >
                {appCopy.buttons.continueLesson}
              </Button>
            </Link>
            <span className="hidden sm:inline-block text-[10px] text-[var(--color-text-muted)] font-mono text-center sm:text-right">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border text-[9px]">Enter ↵</kbd> to launch
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          3. MAIN TWO-COLUMN WORKSPACE: TODAY'S PLAN & PROGRESS INDICATORS
         ───────────────────────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* ─── LEFT COLUMN (7 COLS): TODAY'S CHECKLIST & NEXT LEVEL READINESS ─── */}
        <div className="lg:col-span-7 space-y-6">
          {/* TODAY'S PLAN AS A CHECKLIST */}
          <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Today&apos;s Study Plan
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {minutesDone} of {totalMinutesBudgeted} min completed today
                </p>
              </div>

              <div className="w-28 sm:w-36">
                <ProgressBar value={taskProgressPct} color="brand" size="sm" />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {taskState.tasks.map((task) => {
                const isDone = task.isCompleted;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    className={`p-3.5 sm:p-4 rounded-[var(--radius-xl)] border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 opacity-80"
                        : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] hover:border-[var(--color-brand-500)]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isDone
                            ? "bg-[var(--color-success)] text-white shadow-xs"
                            : "border-2 border-[var(--color-border)] text-transparent hover:border-[var(--color-brand-500)]"
                        }`}
                        title={isDone ? "Mark incomplete" : "Mark completed"}
                      >
                        <Check size={14} />
                      </button>

                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-heading text-xs sm:text-sm font-bold truncate ${
                              isDone ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"
                            }`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                          {task.titleDe}
                        </p>
                      </div>
                    </div>

                    {/* Time Pill & Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        {task.estimatedMinutes}m
                      </span>

                      <Link href={task.actionUrl}>
                        <Button
                          variant={isDone ? "outline" : "secondary"}
                          size="xs"
                          className="text-xs"
                        >
                          {isDone ? "Review" : "Start"}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* "READINESS FOR NEXT LEVEL" INDICATOR */}
          <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="xs">Milestone Forecast</Badge>
                  <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                    {readiness.currentLevel} → {readiness.nextLevel} Pathway
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mt-1">
                  CEFR Readiness: {readiness.readinessPercentage}%
                </h3>
              </div>

              <span className="font-mono text-xs font-bold text-[var(--color-accent-400)]">
                {readiness.masteredTopicsCount} / {readiness.totalRequiredTopics} Topics
              </span>
            </div>

            {/* Large Progress Bar */}
            <ProgressBar value={readiness.readinessPercentage} color="accent" size="md" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--color-text-secondary)] pt-1">
              <span>
                Estimated {readiness.nextLevel} readiness:{" "}
                <strong className="text-[var(--color-text-primary)]">{readiness.projectedDate}</strong>
              </span>
              <span className="text-[var(--color-text-muted)] font-mono">
                (~{readiness.estimatedDaysRemaining} days remaining)
              </span>
            </div>

            {/* Core Topics Checklist Chips */}
            <div className="pt-2 border-t border-[var(--color-border)]/60">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Core Topic Mastery Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-success)]/15 border border-[var(--color-success)]/30 text-[var(--color-success)] font-medium">
                  ✓ Articles &amp; Gender (Mastered)
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-success)]/15 border border-[var(--color-success)]/30 text-[var(--color-success)] font-medium">
                  ✓ Present Tense Verbs (Mastered)
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-accent-500)]/15 border border-[var(--color-accent-500)]/30 text-[var(--color-accent-400)] font-medium">
                  ⚡ Dativ vs. Akkusativ (In Progress)
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium">
                  ⏳ Modal Verbs (Upcoming)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN (5 COLS): FLASHCARDS, WEEKLY RING, SKILLS RADAR ─── */}
        <div className="lg:col-span-5 space-y-6">
          {/* DUE FLASHCARDS COUNT CARD */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    Memory Review Queue
                  </h4>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Spaced Repetition
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  dueCardsCount > 0
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse"
                    : "bg-[var(--color-success)]/15 border-[var(--color-success)]/30 text-[var(--color-success)]"
                }`}
              >
                {dueCardsCount > 0 ? `${dueCardsCount} Cards Due` : "Caught Up"}
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {dueCardsCount > 0
                ? "Reinforce words right as they approach the forgetting threshold to build permanent retention."
                : "All review cards are currently up to date! Your next spaced repetition batch is scheduled for tomorrow."}
            </p>

            <Link href="/flashcards" className="block w-full">
              <Button
                variant={dueCardsCount > 0 ? "primary" : "secondary"}
                size="md"
                fullWidth
                rightIcon={<ArrowRight size={14} />}
                className="text-xs"
              >
                {dueCardsCount > 0 ? `Review ${dueCardsCount} Cards (5 min)` : "Browse Vocabulary Decks"}
              </Button>
            </Link>
          </div>

          {/* WEEKLY GOAL RING & DAYS TRACKER */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                  Weekly Goal
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {weeklyDaysCompleted} of {weeklyTargetDays} study days completed
                </p>
              </div>
              <ProgressRing
                progress={weeklyCompletionPct}
                size={54}
                strokeWidth={5}
                color="var(--color-brand-400)"
              />
            </div>

            {/* 7-Day Day Dot Indicators */}
            <div className="flex items-center justify-between pt-1">
              {weeklyActivity.map((day) => {
                const isStudied = day.minutesStudied > 0;
                return (
                  <div key={day.date} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isStudied
                          ? "bg-[var(--color-brand-500)] text-white shadow-xs"
                          : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                      }`}
                    >
                      {isStudied ? "✓" : day.dayLabel[0]}
                    </div>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SKILLS RADAR CARD (READING, WRITING, LISTENING, SPEAKING) */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                  CEFR Skills Radar
                </h4>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Balanced 4-Modality Mastery
                </p>
              </div>
              <Badge variant="brand" size="xs">
                A1 Balanced
              </Badge>
            </div>

            {/* SVG Radar Chart */}
            <SkillsRadarChart
              reading={masteryProfile.skillsBreakdown.reading}
              writing={masteryProfile.skillsBreakdown.writing}
              listening={masteryProfile.skillsBreakdown.listening}
              speaking={masteryProfile.skillsBreakdown.speaking}
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. RECENT ACHIEVEMENTS STRIP
         ───────────────────────────────────────────────────────────────────────── */}
      <section className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[var(--color-accent-400)]" />
            <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
              Recent Achievements &amp; Badges
            </h3>
          </div>

          <Link href="/badges" className="text-xs font-semibold text-[var(--color-brand-400)] hover:underline flex items-center gap-1">
            <span>View All 24 Badges</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentBadges.map((badge) => (
            <div
              key={badge.id}
              className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-500)]/15 border border-[var(--color-accent-500)]/30 flex items-center justify-center text-[var(--color-accent-400)] shrink-0">
                <Award size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold text-[var(--color-text-primary)] truncate">
                  {badge.title}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                  {badge.titleDe}
                </p>
                <span className="text-[10px] font-bold text-[var(--color-brand-400)]">
                  +{badge.xpBonus} XP Earned
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. PROGRESSIVE DISCLOSURE: DEEP INSIGHTS & HISTORY TOGGLE
         ───────────────────────────────────────────────────────────────────────── */}
      <section className="space-y-4 pt-2">
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowDetailedInsights(!showDetailedInsights)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] transition-colors cursor-pointer"
          >
            <span>{showDetailedInsights ? "Hide Detailed History" : "Explore 12-Week Consistency & Daily Quote"}</span>
            {showDetailedInsights ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <AnimatePresence>
          {showDetailedInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid md:grid-cols-2 gap-6 overflow-hidden pt-2"
            >
              {/* 12-Week Heatmap Matrix */}
              <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
                <h4 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                  12-Week Consistency Matrix
                </h4>
                <div className="flex flex-wrap gap-1">
                  {heatGrid.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-xs transition-colors ${
                        item.intensity === 0
                          ? "bg-[var(--color-surface-2)]"
                          : item.intensity === 1
                          ? "bg-brand-500/30"
                          : item.intensity === 2
                          ? "bg-brand-500/60"
                          : item.intensity === 3
                          ? "bg-brand-500/80"
                          : "bg-brand-500"
                      }`}
                      title={`${item.date}: ${item.minutes} mins studied`}
                    />
                  ))}
                </div>
              </div>

              {/* Motivational Quote with Audio */}
              {quote && (
                <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-400)]">
                      Tägliche Motivation · Quote
                    </span>
                    <button
                      type="button"
                      onClick={playQuoteAudio}
                      className="p-1.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/20 transition-colors"
                      title="Listen to German audio"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <blockquote className="font-heading text-sm font-bold text-[var(--color-text-primary)] italic">
                    &ldquo;{quote.german}&rdquo;
                  </blockquote>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {quote.english}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/50">
                    — {quote.authorOrSource}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Accessibility & Language Preferences Modal */}
      <AccessibilitySettingsModal
        isOpen={showA11yModal}
        onClose={() => setShowA11yModal(false)}
      />
    </div>
  );
}
