"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass, Award, BookOpen, Layers, Clock, CheckCircle2,
  XCircle, ArrowRight, BarChart3, RotateCcw, Sparkles, Filter,
  Calendar, ShieldCheck, Zap, AlertTriangle
} from "lucide-react";
import {
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
  UNIT_QUIZZES,
  MOCK_EXAMS,
  TestAttemptRecord,
  getAllTestAttempts,
} from "@/lib/testingService";

export function TestingHubView() {
  const [activeTab, setActiveTab] = useState<"all" | "placement" | "quizzes" | "mock" | "history">("all");
  const [attempts, setAttempts] = useState<TestAttemptRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAttempts(getAllTestAttempts());
  }, []);

  // Format historical progress chart data
  const chartData = [...attempts]
    .reverse()
    .map((att, idx) => ({
      index: idx + 1,
      date: new Date(att.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: att.percentage,
      title: att.title,
    }));

  const placementAttempts = attempts.filter((a) => a.testType === "placement");
  const latestPlacement = placementAttempts[0];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}m ${remainder < 10 ? "0" : ""}${remainder}s`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30">
              Exam & Evaluation Suite
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              CEFR A1–C1 Standardized Testing
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            Testing Center · Prüfungszentrum
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1 max-w-2xl">
            Calibrate your proficiency with our adaptive placement test, validate mastery with unit quizzes (70% pass mark), and simulate full timed Goethe/telc exams.
          </p>
        </div>

        {/* Quick Launch Placement CTA */}
        <div className="shrink-0">
          <Link href="/tests/placement">
            <Button variant="primary" size="md" rightIcon={<Compass size={16} />}>
              Take Adaptive Placement Test
            </Button>
          </Link>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "Overview & Tests" },
          { id: "placement", label: "Placement Test" },
          { id: "quizzes", label: "Unit Quizzes" },
          { id: "mock", label: "Full Mock Exams" },
          { id: "history", label: `History (${attempts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              activeTab === tab.id
                ? "bg-[var(--color-surface)] text-[var(--color-brand-400)] border-[var(--color-brand-500)]/50 shadow-xs"
                : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ADAPTIVE PLACEMENT HERO CARD (If all or placement tab) */}
      {(activeTab === "all" || activeTab === "placement") && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-brand-500)]/30 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-brand-600)]/10 to-[var(--color-surface)] shadow-md relative overflow-hidden"
        >
          <div className="h-1.5 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-80" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)]/20 text-[var(--color-brand-400)] flex items-center justify-center">
                  <Compass size={18} />
                </div>
                <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                  Adaptive CEFR Placement Test
                </h2>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                25 adaptive questions spanning A1 to C1. The engine dynamically calibrates question difficulty based on your answers and recommends your ideal CEFR starting level.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)]">
                <span>• 25 Questions</span>
                <span>• ~15–20 Mins</span>
                <span>• Real-time Difficulty Scaling</span>
                <span>• Start Level Recommendation</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              {latestPlacement && (
                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[130px]">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                    Current Level
                  </span>
                  <p className="font-heading text-2xl font-extrabold text-[var(--color-accent-400)]">
                    {latestPlacement.recommendedLevel || latestPlacement.level}
                  </p>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {latestPlacement.percentage}% score
                  </span>
                </div>
              )}

              <Link href="/tests/placement">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={15} />}>
                  {latestPlacement ? "Recalibrate Level" : "Start Placement Test"}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* UNIT QUIZZES SECTION (If all or quizzes tab) */}
      {(activeTab === "all" || activeTab === "quizzes") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Unit Quizzes (Pass Mark: 70%)
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                10-question checks validating grammar, vocabulary, and reading skills per unit.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--color-brand-400)]">
              {UNIT_QUIZZES.length} Available
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {UNIT_QUIZZES.map((quiz) => {
              const quizAttempts = attempts.filter((a) => a.unitId === quiz.unitId);
              const bestAttempt = quizAttempts.sort((a, b) => b.percentage - a.percentage)[0];

              return (
                <div
                  key={quiz.id}
                  className="p-5 sm:p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:border-[var(--color-brand-500)]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-brand-400)] border border-[var(--color-border)]">
                        {quiz.levelCode} Unit Quiz
                      </span>
                      {bestAttempt && (
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          bestAttempt.passed ? "text-[var(--color-success)]" : "text-amber-400"
                        }`}>
                          {bestAttempt.passed ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                          Best: {bestAttempt.percentage}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/60">
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">
                      10 Questions · 70% to Pass
                    </span>

                    <Link href={`/tests/quiz/${quiz.id}`}>
                      <Button variant="outline" size="sm" rightIcon={<ArrowRight size={13} />}>
                        {bestAttempt ? "Retake Quiz" : "Start Quiz"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL MOCK EXAMS SECTION (If all or mock tab) */}
      {(activeTab === "all" || activeTab === "mock") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Full Mock Exams (Goethe / telc Format)
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Simulate real exam conditions: Reading, Listening, Grammar, Writing, Speaking with timer and auto-submit.
              </p>
            </div>
            <span className="text-xs font-semibold text-[var(--color-brand-400)]">
              Standard Timed Format
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {MOCK_EXAMS.map((exam) => {
              const examAttempts = attempts.filter((a) => a.title.includes(exam.level));
              const bestAttempt = examAttempts.sort((a, b) => b.percentage - a.percentage)[0];

              return (
                <div
                  key={exam.id}
                  className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:border-[var(--color-accent-500)]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent-500)]/15 text-[var(--color-accent-400)] border border-[var(--color-accent-500)]/30">
                        {exam.level} Mock Exam · {exam.durationMinutes} Mins
                      </span>
                      {bestAttempt && (
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          bestAttempt.passed ? "text-[var(--color-success)]" : "text-amber-400"
                        }`}>
                          {bestAttempt.passed ? "Bestanden" : "Not Passed"}: {bestAttempt.percentage}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                      {exam.title}
                    </h3>

                    {/* 5 Section Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exam.sections.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                        >
                          {s.titleDe.split(":")[1]?.trim() || s.titleDe}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]/60">
                    <span className="text-xs text-[var(--color-text-muted)] font-mono">
                      Pass Mark: {exam.passMarkPct}% ({exam.totalPoints} pts)
                    </span>

                    <Link href={`/tests/mock/${exam.level.toLowerCase()}`}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight size={13} />}>
                        Begin Mock Exam
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PROGRESS OVER TIME & ATTEMPT HISTORY (If all or history tab) */}
      {(activeTab === "all" || activeTab === "history") && (
        <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                Score Trajectory & Progress-Over-Time
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Historical scores across placement, quizzes, and mock simulations.
              </p>
            </div>

            <Badge variant="secondary" size="sm">
              {attempts.length} Total Test Attempts
            </Badge>
          </div>

          {/* Line Chart */}
          {mounted && chartData.length > 1 && (
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={11} />
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
                    dataKey="score"
                    stroke="var(--color-brand-500)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--color-accent-400)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Historical Attempts Table */}
          {attempts.length > 0 ? (
            <div className="space-y-2.5">
              {attempts.map((att) => (
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
                        {att.passed ? "Bestanden" : "Needs Review"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                      <span>{new Date(att.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>•</span>
                      <span>{formatSeconds(att.durationSeconds)}</span>
                      <span>•</span>
                      <span>{att.score} / {att.maxScore} points ({att.percentage}%)</span>
                    </div>
                  </div>

                  <Link href={`/tests/results/${att.id}`}>
                    <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowRight size={13} />}>
                      View Results & Radar
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)]/40 rounded-xl">
              No test attempts recorded yet. Take the Adaptive Placement Test or a Unit Quiz to see your score trajectory.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
