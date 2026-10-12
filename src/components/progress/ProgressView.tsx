"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass, Award, BookOpen, Layers, Clock, CheckCircle2,
  XCircle, ArrowRight, BarChart3, RotateCcw, Sparkles, Filter,
  Calendar, ShieldCheck, Zap, AlertTriangle, TrendingUp, Lightbulb,
  Target, Bookmark, Check
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  ComprehensiveProgress,
  getComprehensiveProgress,
} from "@/lib/progressService";
import { MistakeNotebookView } from "./MistakeNotebookView";

export function ProgressView() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  const topicParam = searchParams.get("topic") || undefined;

  const [activeTab, setActiveTab] = useState<"analytics" | "mistakes">(
    urlTab === "mistakes" ? "mistakes" : "analytics"
  );
  const [data, setData] = useState<ComprehensiveProgress | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setData(getComprehensiveProgress());
  }, []);

  if (!mounted || !data) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[var(--color-text-muted)]">Loading learning analytics & mistake records...</p>
      </div>
    );
  }

  // Format Recharts data
  const radarData = data.skills.map((s) => ({
    skill: s.skill.split("(")[0].trim(),
    score: s.score,
    fullMark: 100,
  }));

  const weeklyBarData = data.weeklyActivity.map((d) => ({
    day: d.dayLabel,
    minutes: d.minutesStudied,
    xp: d.xpEarned,
  }));

  const nba = data.nextBestAction;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30">
              Personal Learning Analytics
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Curriculum Mastery & Diagnostic Tracker
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            Progress & Mistake Notebook
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
            Track your CEFR journey from A1 to C2, monitor skill accuracy, review your weekly study habits, and eliminate errors in your personal grammar notebook.
          </p>
        </div>

        {/* TABS SWITCHER */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-[var(--color-surface)] text-[var(--color-brand-400)] shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Learning Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mistakes")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "mistakes"
                ? "bg-[var(--color-surface)] text-[var(--color-brand-400)] shadow-xs"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Mistake Notebook (Fehlerheft)
          </button>
        </div>
      </div>

      {/* NEXT BEST ACTION CARD (Visible across both views) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-brand-500)]/40 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-brand-600)]/10 to-[var(--color-surface)] shadow-md relative overflow-hidden space-y-4"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--color-brand-500)] via-[var(--color-accent-400)] to-blue-500 absolute top-0 left-0 right-0" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-brand-500)]/20 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30">
                {nba.badgeText}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                AI Diagnostic Recommendation
              </span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Lightbulb size={20} className="text-[var(--color-accent-400)] shrink-0" />
              <span>Next Best Action: {nba.title}</span>
            </h2>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {nba.reason}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)] pt-1">
              <span className="flex items-center gap-1">
                <Clock size={13} /> ~{nba.estimatedMinutes} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[var(--color-accent-400)] font-semibold">
                <Sparkles size={13} /> +{nba.xpReward} XP Reward
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {nba.category === "mistakes" ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setActiveTab("mistakes")}
                rightIcon={<ArrowRight size={15} />}
              >
                {nba.actionLabel}
              </Button>
            ) : (
              <Link href={nba.actionUrl}>
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />}>
                  {nba.actionLabel}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* TAB 1: LEARNING ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          {/* STATS SUMMARY ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Current Level
              </span>
              <p className="font-heading text-3xl font-extrabold text-[var(--color-brand-400)]">
                {data.overallLevel}
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Breakthrough Beginner</p>
            </div>

            <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Words Learned
              </span>
              <p className="font-heading text-3xl font-extrabold text-[var(--color-accent-400)]">
                {data.words.totalLearned}
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">{data.words.masteredCount} Mastered ({data.words.myWordsCount} saved)</p>
            </div>

            <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Weekly Study Time
              </span>
              <p className="font-heading text-3xl font-extrabold text-[var(--color-text-primary)]">
                {data.weeklyMinutesTotal}m
              </p>
              <p className="text-[11px] text-[var(--color-success)] font-medium">Last 7 days active</p>
            </div>

            <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Overall Accuracy
              </span>
              <p className="font-heading text-3xl font-extrabold text-[var(--color-success)]">
                {data.overallAccuracy}%
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Across exercises & tests</p>
            </div>
          </div>

          {/* LEVEL COMPLETION SECTION */}
          <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  CEFR Level Completion (A1–C2)
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Official CEFR guided study requirements and roadmap progression.
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--color-brand-400)]">
                6 Levels
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.levels.map((lvl) => (
                <div
                  key={lvl.levelCode}
                  className={`p-4 rounded-[var(--radius-xl)] border transition-all space-y-3 ${
                    lvl.status === "active"
                      ? "bg-[var(--color-surface-2)]/80 border-[var(--color-brand-500)]/40 shadow-xs"
                      : "bg-[var(--color-surface-2)]/30 border-[var(--color-border)] opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                      {lvl.levelCode}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      lvl.status === "active"
                        ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30"
                        : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
                    }`}>
                      {lvl.status === "active" ? "In Progress" : "Locked"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">
                    {lvl.name}
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                      <span>{lvl.completedLessons} / {lvl.totalLessons} Lessons</span>
                      <span className="font-bold text-[var(--color-text-primary)]">{lvl.progressPct}%</span>
                    </div>
                    <ProgressBar value={lvl.progressPct} color="brand" size="sm" />
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)]/50 flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                    <span>{lvl.totalUnits} Units</span>
                    <span>Guided: ~{lvl.cefrHours}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TWO-COLUMN CHARTS: SKILL RADAR & WEEKLY STUDY TIME */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Skill Radar Chart */}
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    Skill Radar Assessment
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Diagnostic breakdown across German CEFR competencies.
                  </p>
                </div>
                <Award size={18} className="text-[var(--color-brand-400)]" />
              </div>

              <div className="h-64 w-full flex items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: "var(--color-text-secondary)", fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      stroke="var(--color-border)"
                      tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
                    />
                    <Radar
                      name="Proficiency"
                      dataKey="score"
                      stroke="var(--color-brand-500)"
                      fill="var(--color-brand-500)"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Study-Time per Week Bar Chart */}
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    Study Time per Week
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Daily study minutes over the last 7 calendar days.
                  </p>
                </div>
                <Clock size={18} className="text-[var(--color-accent-400)]" />
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={11} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={11} unit="m" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface-3)",
                        borderColor: "var(--color-border)",
                        borderRadius: "var(--radius-lg)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="minutes"
                      fill="var(--color-accent-500)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN CHARTS: ACCURACY TREND & WORDS LEARNED (SRS BREAKDOWN) */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Accuracy Trend Chart */}
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    Accuracy Trend Over Time
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Exercise and drill accuracy trajectory over recent practice sessions.
                  </p>
                </div>
                <TrendingUp size={18} className="text-[var(--color-success)]" />
              </div>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.accuracyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} />
                    <YAxis domain={[50, 100]} stroke="var(--color-text-muted)" fontSize={11} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface-3)",
                        borderColor: "var(--color-border)",
                        borderRadius: "var(--radius-lg)",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="var(--color-success)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--color-success)", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Words Learned SRS Breakdown Card */}
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    Words Learned & SRS Distribution
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Spaced Repetition (SM-2) memory maturity distribution.
                  </p>
                </div>
                <Layers size={18} className="text-[var(--color-brand-400)]" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-success)]">
                    Mastered (≥21d)
                  </span>
                  <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)] my-0.5">
                    {data.words.masteredCount}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Long-term memory</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-brand-400)]">
                    Reviewing (Learning)
                  </span>
                  <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)] my-0.5">
                    {data.words.reviewingCount}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Active interval cycles</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <span className="text-[10px] font-bold uppercase text-amber-400">
                    Due Today
                  </span>
                  <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)] my-0.5">
                    {data.words.dueTodayCount}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Scheduled for review</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--color-accent-400)]">
                    My Words Saved
                  </span>
                  <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)] my-0.5">
                    {data.words.myWordsCount}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Saved from lessons</p>
                </div>
              </div>

              <Link href="/flashcards" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full text-xs" rightIcon={<ArrowRight size={13} />}>
                  Open Spaced Repetition Decks
                </Button>
              </Link>
            </div>
          </div>

          {/* TEST SCORE HISTORY */}
          <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Test & Exam Score History
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Evaluation records from placement tests, unit quizzes, and mock simulations.
                </p>
              </div>

              <Link href="/tests">
                <Button variant="outline" size="sm" className="text-xs">
                  Go to Testing Center
                </Button>
              </Link>
            </div>

            {data.testHistory.length > 0 ? (
              <div className="space-y-2.5">
                {data.testHistory.map((att) => (
                  <div
                    key={att.id}
                    className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--color-text-primary)] text-sm">
                          {att.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.passed
                            ? "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}>
                          {att.passed ? "Bestanden (Passed)" : "Needs Review"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                        <span>{new Date(att.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span>•</span>
                        <span>{att.score} / {att.maxScore} points ({att.percentage}%)</span>
                      </div>
                    </div>

                    <Link href={`/tests/results/${att.id}`}>
                      <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowRight size={13} />}>
                        View Analysis
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/40 rounded-xl">
                No test attempts recorded yet. Take the Adaptive Placement Test or a Unit Quiz in the Testing Center to start tracking your score history.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MISTAKE NOTEBOOK (FEHLERHEFT) */}
      {activeTab === "mistakes" && (
        <MistakeNotebookView initialTopicFilter={topicParam} />
      )}
    </div>
  );
}
