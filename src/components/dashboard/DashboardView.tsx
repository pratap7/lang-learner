"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Sparkles, Clock, CheckCircle2, Circle, ArrowRight,
  Shield, ShieldCheck, Volume2, Calendar, Target, BookOpen,
  Headphones, Mic, Edit3, AlertCircle, RotateCcw, Zap, Info,
  ChevronRight, Award, Bell, Layers, BarChart3, Compass
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";

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
} from "@/lib/gamificationService";
import { playClickSound } from "@/lib/soundEffects";

export function DashboardView() {
  const { addToast } = useToast();

  const [taskState, setTaskState] = useState<DailyTaskState | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [goalSettings, setGoalSettings] = useState<GoalSettings | null>(null);
  const [pacing, setPacing] = useState<GoalPacingCalculation | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>([]);
  const [heatGrid, setHeatGrid] = useState<{ date: string; intensity: 0 | 1 | 2 | 3 | 4; minutes: number }[]>([]);
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [isPlayingQuote, setIsPlayingQuote] = useState(false);
  const [hoursLeft, setHoursLeft] = useState<number>(12);
  const [showReminder, setShowReminder] = useState(true);
  const [dueCardsCount, setDueCardsCount] = useState<number>(0);
  const [decksSummary, setDecksSummary] = useState<FlashcardDeck[]>([]);
  const [levelInfo, setLevelInfo] = useState<UserLevelInfo | null>(null);

  useEffect(() => {
    const goals = getGoalSettings();
    setGoalSettings(goals);
    setPacing(calculateGoalPacing(goals));

    const tasks = getDailyTasks(goals.dailyMinutes);
    setTaskState(tasks);

    setStreak(getStreakData());
    setWeeklyActivity(getWeeklyActivity());
    setHeatGrid(getTwelveWeeksActivity());
    setQuote(getTodayQuote());
    setHoursLeft(getHoursUntilMidnight());

    setDueCardsCount(getTotalDueCardsCount());
    setDecksSummary(getDecks());

    const totalXp = getUserTotalXp();
    setLevelInfo(getLevelInfoFromXp(totalXp));
  }, []);

  const handleToggleTask = (taskId: string) => {
    const nextState = toggleTaskCompletion(taskId);
    setTaskState(nextState);

    // If all tasks are completed or at least 1 completed, update streak
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
      title: updated.isFreezeEquipped ? "Freeze Equipped" : "Freeze Unequipped",
      message: updated.isFreezeEquipped
        ? "Your active streak is now protected from missed days."
        : "Streak freeze has been returned to your inventory.",
    });
  };

  const handleBuyFreeze = () => {
    playClickSound();
    const result = purchaseFreezeWithXp(100);
    setStreak(result.data);
    addToast({
      type: result.success ? "success" : "error",
      title: result.success ? "Shield Acquired!" : "Purchase Failed",
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

  const getTaskIcon = (icon: GeneratedDailyTask["iconName"]) => {
    switch (icon) {
      case "book": return <BookOpen size={16} className="text-[var(--color-brand-400)]" />;
      case "cards": return <Sparkles size={16} className="text-[var(--color-accent-400)]" />;
      case "target": return <Target size={16} className="text-blue-400" />;
      case "headphones": return <Headphones size={16} className="text-cyan-400" />;
      case "alert": return <AlertCircle size={16} className="text-rose-400" />;
      case "mic": return <Mic size={16} className="text-emerald-400" />;
      case "edit": return <Edit3 size={16} className="text-purple-400" />;
      default: return <BookOpen size={16} className="text-[var(--color-brand-400)]" />;
    }
  };

  if (!taskState || !streak || !goalSettings || !pacing) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[var(--color-text-muted)]">Loading your German learning hub...</p>
      </div>
    );
  }

  const tasksTotal = taskState.tasks.length;
  const tasksDone = taskState.completedCount;
  const taskProgressPct = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const targetXpToday = 100;
  const xpEarnedToday = taskState.totalXpEarnedToday || (tasksDone * 20);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Gentle Streak Reminder Banner (If not yet completed today) */}
      {showReminder && !streak.todayCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-[var(--radius-xl)] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Bell size={18} className="animate-pulse" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                Keep your {streak.currentStreak}-day streak alive!
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                You have ~{hoursLeft} hours left before midnight. Complete any task below to maintain your streak.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={taskState.tasks[0]?.actionUrl || "/lesson/a1-u1-l1"}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight size={13} />}>
                Practice Now
              </Button>
            </Link>
            <button
              onClick={() => setShowReminder(false)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* TOP HEADER: USER STATS & GAUGES */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Streak Status
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${streak.todayCompleted ? "bg-[var(--color-success)]" : "bg-amber-400 animate-ping"}`} />
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-400">
              <Flame size={24} className="fill-current animate-bounce" />
            </div>
            <div>
              <span className="font-heading text-3xl font-extrabold text-[var(--color-text-primary)]">
                {streak.currentStreak}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium ml-1">Days</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]/60">
            <span>Best: {streak.longestStreak} days</span>
            <span>{streak.todayCompleted ? "Saved today ✓" : "Due today"}</span>
          </div>
        </div>

        {/* Level & XP Goal */}
        <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Lvl {levelInfo?.levelNumber || 3} · {levelInfo?.titleDe || "Sprachschüler"}
            </span>
            <Link href="/badges" className="text-[var(--color-accent-400)] hover:underline text-[11px] font-semibold flex items-center gap-1">
              <Award size={13} />
              <span>Badges</span>
            </Link>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5 mb-1.5">
              <span className="font-heading text-3xl font-extrabold text-[var(--color-text-primary)]">
                {levelInfo?.currentXp || xpEarnedToday}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium">Total XP</span>
            </div>
            <ProgressBar value={levelInfo?.levelProgressPct || Math.min(100, Math.round((xpEarnedToday / targetXpToday) * 100))} color="accent" size="sm" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]/60">
            <span>+{levelInfo?.xpNeededForNext || 40} XP to Lvl {(levelInfo?.levelNumber || 3) + 1}</span>
            <Link href="/leaderboard" className="text-[var(--color-brand-400)] hover:underline font-medium">
              Leaderboard →
            </Link>
          </div>
        </div>

        {/* Streak Freeze Inventory */}
        <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Streak Freezes
            </span>
            <Shield size={16} className={streak.isFreezeEquipped ? "text-cyan-400" : "text-[var(--color-text-muted)]"} />
          </div>

          <div className="my-2 flex items-center justify-between">
            <div>
              <span className="font-heading text-3xl font-extrabold text-[var(--color-text-primary)]">
                {streak.freezeCredits}
              </span>
              <span className="text-xs text-[var(--color-text-muted)] font-medium ml-1">Shields</span>
            </div>

            <button
              onClick={handleToggleFreeze}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                streak.isFreezeEquipped
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {streak.isFreezeEquipped ? "Active Shield" : "Equip"}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[var(--color-border)]/60">
            <span className="text-[var(--color-text-muted)]">Protects 24h</span>
            <button
              onClick={handleBuyFreeze}
              className="text-[var(--color-brand-400)] hover:underline font-semibold cursor-pointer"
            >
              + Buy (100 XP)
            </button>
          </div>
        </div>

        {/* Exam Pacing Indicator */}
        <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Goal Trajectory
            </span>
            <Link href="/goals" className="text-[var(--color-brand-400)] hover:underline text-[11px] font-semibold">
              Edit
            </Link>
          </div>

          <div className="my-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                {goalSettings.targetLevel.toUpperCase()}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">({goalSettings.dailyMinutes}m/day)</span>
            </div>
            <div className="text-xs font-medium text-[var(--color-success)] flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>{pacing.status === "behind" ? "Behind Target" : "On Track"}</span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]/60 truncate">
            Finish: {pacing.projectedCompletionDate}
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* LEFT 2 COLUMNS: TODAY'S DAILY TASKS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <span>Today&apos;s Learning Tasks</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-400)] font-mono font-normal border border-[var(--color-border)]">
                    {tasksDone} / {tasksTotal}
                  </span>
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Tailored to your {goalSettings.dailyMinutes}-minute daily study commitment.
                </p>
              </div>

              <div className="w-full sm:w-40">
                <ProgressBar value={taskProgressPct} color="brand" size="md" />
              </div>
            </div>

            {/* Task Items List */}
            <div className="space-y-3">
              {taskState.tasks.map((task) => {
                const isDone = task.isCompleted;

                return (
                  <motion.div
                    key={task.id}
                    layout
                    className={`p-4 rounded-[var(--radius-xl)] border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDone
                        ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 opacity-80"
                        : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] hover:border-[var(--color-brand-500)]/40 hover:bg-[var(--color-surface-2)]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isDone
                            ? "bg-[var(--color-success)] text-white shadow-sm"
                            : "border-2 border-[var(--color-border)] text-transparent hover:border-[var(--color-brand-500)]"
                        }`}
                        title={isDone ? "Mark incomplete" : "Mark completed"}
                      >
                        <CheckCircle2 size={16} />
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-heading text-sm font-bold transition-all ${
                            isDone ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"
                          }`}>
                            {task.title}
                          </span>
                          {task.badgeText && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                              {task.badgeText}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)] pt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {task.estimatedMinutes} mins
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-[var(--color-accent-400)]">
                            <Sparkles size={12} /> +{task.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="sm:self-center shrink-0">
                      <Link href={task.actionUrl}>
                        <Button
                          variant={isDone ? "outline" : "primary"}
                          size="sm"
                          className="w-full sm:w-auto text-xs"
                          rightIcon={<ArrowRight size={13} />}
                        >
                          {task.actionLabel}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* WEEKLY ACTIVITY HEATMAP CARD */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Weekly Activity Heatmap
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Consistent daily exposure cements long-term memory.
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--color-brand-400)]">
                Last 7 Days
              </span>
            </div>

            {/* 7-Day Visual Bars */}
            <div className="grid grid-cols-7 gap-2 pt-2">
              {weeklyActivity.map((day) => {
                const heightPct = day.minutesStudied > 0 ? Math.min(100, Math.max(25, (day.minutesStudied / 40) * 100)) : 10;
                const isToday = day.dayLabel === new Date().toLocaleDateString("en-US", { weekday: "short" });

                return (
                  <div key={day.date} className="flex flex-col items-center gap-2">
                    <div className="h-24 w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] flex items-end p-1 relative group cursor-pointer">
                      <div
                        className={`w-full rounded-[var(--radius-md)] transition-all ${
                          day.minutesStudied > 0
                            ? "bg-gradient-to-t from-[var(--color-brand-600)] to-[var(--color-brand-400)] shadow-xs"
                            : "bg-[var(--color-surface-3)]"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />

                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[var(--color-surface-3)] border border-[var(--color-border)] text-[10px] font-mono px-2 py-1 rounded shadow-md whitespace-nowrap z-20">
                        {day.minutesStudied}m · +{day.xpEarned} XP
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold ${isToday ? "text-[var(--color-brand-400)] font-bold" : "text-[var(--color-text-muted)]"}`}>
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 12-Week Compact Matrix Grid */}
            <div className="pt-4 border-t border-[var(--color-border)]/60">
              <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mb-2">
                <span>12-Week Consistency Matrix</span>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-surface-2)]" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-brand-500/30" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-brand-500/60" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-brand-500" />
                  <span>More</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {heatGrid.map((item, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-xs transition-colors ${
                      item.intensity === 0
                        ? "bg-[var(--color-surface-2)]"
                        : item.intensity === 1
                        ? "bg-[var(--color-brand-500)]/30"
                        : item.intensity === 2
                        ? "bg-[var(--color-brand-500)]/60"
                        : item.intensity === 3
                        ? "bg-[var(--color-brand-500)]/80"
                        : "bg-[var(--color-brand-500)] shadow-xs"
                    }`}
                    title={`${item.date}: ${item.minutes} mins studied`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVIEW QUEUE, MOTIVATIONAL QUOTE & QUICK PATHWAYS */}
        <div className="space-y-6">
          {/* SRS FLASHCARD REVIEW QUEUE CARD */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4 relative overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-[var(--color-brand-500)] to-blue-500 absolute top-0 left-0 right-0" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] flex items-center justify-center">
                  <Layers size={17} />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    Review Queue
                  </h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-mono">
                    SM-2 Spaced Repetition
                  </p>
                </div>
              </div>

              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                dueCardsCount > 0
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400 animate-pulse"
                  : "bg-[var(--color-success)]/15 border-[var(--color-success)]/30 text-[var(--color-success)]"
              }`}>
                {dueCardsCount > 0 ? `${dueCardsCount} Due` : "Queue Cleared"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/70 border border-[var(--color-border)]/70 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">
                    My Words (Custom Deck)
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Saved from lesson vocabulary
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--color-brand-400)]">
                  {decksSummary.find((d) => d.id === "my-words")?.dueCards || 0} due
                </span>
              </div>

              <div className="p-2.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/70 border border-[var(--color-border)]/70 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">
                    Curriculum Unit Decks
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Units 1–4 graded flashcards
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--color-text-secondary)]">
                  {decksSummary
                    .filter((d) => d.id !== "my-words")
                    .reduce((sum, d) => sum + d.dueCards, 0)} due
                </span>
              </div>
            </div>

            <Link href="/flashcards" className="block w-full">
              <Button
                variant={dueCardsCount > 0 ? "primary" : "outline"}
                size="sm"
                className="w-full text-xs"
                rightIcon={<ArrowRight size={13} />}
              >
                {dueCardsCount > 0 ? `Review Now (${dueCardsCount} Cards)` : "Open Flashcard Decks"}
              </Button>
            </Link>
          </div>

          {/* DAILY MOTIVATIONAL QUOTE CARD */}
          {quote && (
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-3 relative overflow-hidden">
              <div className="h-1 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-80" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-400)]">
                  Tägliche Motivation · Quote of the Day
                </span>
                <button
                  type="button"
                  onClick={playQuoteAudio}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isPlayingQuote
                      ? "bg-[var(--color-brand-500)] text-white scale-110 shadow-md animate-pulse"
                      : "bg-[var(--color-surface-2)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/20"
                  }`}
                  title="Listen to German proverb"
                >
                  <Volume2 size={15} />
                </button>
              </div>

              <blockquote className="font-heading text-lg font-bold text-[var(--color-text-primary)] leading-snug">
                &ldquo;{quote.german}&rdquo;
              </blockquote>

              <p className="text-xs text-[var(--color-text-secondary)] italic">
                {quote.english}
              </p>

              <div className="pt-2 border-t border-[var(--color-border)]/50 text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
                <span>— {quote.authorOrSource}</span>
                <span className="text-[var(--color-brand-400)]">Coach Tip</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                {quote.context}
              </p>
            </div>
          )}

          {/* QUICK PATHWAYS CARD */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-3">
            <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
              Quick Pathways
            </h3>

            <div className="space-y-2">
              <Link
                href="/conversation"
                className="p-3 rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-brand-500)]/10 via-[var(--color-surface-2)] to-purple-500/10 hover:from-[var(--color-brand-500)]/20 border border-[var(--color-brand-500)]/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Mic size={16} className="text-[var(--color-brand-400)] animate-pulse" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        AI German Conversation
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--color-brand-500)]/20 text-[var(--color-brand-400)]">
                        Voice + TTS
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      6 immersion scenarios (Café, Doctor, Visa, etc.)
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[var(--color-brand-400)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/stories"
                className="p-3 rounded-[var(--radius-xl)] bg-gradient-to-r from-blue-500/10 via-[var(--color-surface-2)] to-teal-500/10 hover:from-blue-500/20 border border-blue-500/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-blue-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        Graded Stories & Audio
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                        Synced Audio
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Tap-to-translate & flashcard saving (A1–B2)
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/writing"
                className="p-3 rounded-[var(--radius-xl)] bg-gradient-to-r from-amber-500/10 via-[var(--color-surface-2)] to-orange-500/10 hover:from-amber-500/20 border border-amber-500/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Edit3 size={16} className="text-amber-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        Writing Feedback Studio
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        Rubric Evaluator
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Formal emails, informal letters & opinion essays
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/flashcards"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Flashcard Decks & Review
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {dueCardsCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {dueCardsCount} due
                    </span>
                  )}
                  <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/courses/a1"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-[var(--color-brand-400)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    A1 Unit 1 Roadmap
                  </span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/practice"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-[var(--color-accent-400)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Exercise Lab (10 Modalities)
                  </span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/goals"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Target size={16} className="text-blue-400" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Exam & Pacing Settings
                  </span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/insights"
                className="p-3 rounded-[var(--radius-xl)] bg-gradient-to-r from-indigo-500/10 via-[var(--color-surface-2)] to-purple-500/10 hover:from-indigo-500/20 border border-indigo-500/30 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Compass size={16} className="text-indigo-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        Learning Insights & Mastery
                      </span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                        CEFR Forecast
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Strengths, friction points & projected readiness date
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/progress"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 size={16} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Progress & Analytics
                  </span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/progress?tab=mistakes"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-rose-400" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Mistake Notebook (Fehlerheft)
                  </span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/badges"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Award size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Badges & Certificates (24 Goals)
                  </span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/leaderboard"
                className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Flame size={16} className="text-orange-400" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Weekly League Leaderboard
                  </span>
                </div>
                <ChevronRight size={14} className="text-[var(--color-text-muted)] group-hover:translate-x-1 transition-transform" />
              </Link>

            </div>
          </div>

          {/* STREAK RULES REFERENCE */}
          <div className="p-5 rounded-[var(--radius-2xl)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-2.5 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
              <ShieldCheck size={16} className="text-[var(--color-success)]" />
              <span>Streak Rules</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-[11px] text-[var(--color-text-muted)]">
              <li>Complete at least 1 task or earn 20 XP before 23:59 local time to keep your streak.</li>
              <li>Equipped Streak Freezes automatically shield you for 24h if you miss a day.</li>
              <li>You can store up to 3 Freezes in reserve; acquire more with 100 XP.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
