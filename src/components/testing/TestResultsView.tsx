"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, CheckCircle2, XCircle, AlertTriangle, Clock, ArrowRight,
  RotateCcw, Sparkles, Filter, ChevronDown, ChevronUp, Flag,
  Volume2, BookOpen, Layers, BarChart3, ShieldCheck, Zap
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  TestAttemptRecord,
  getTestAttemptById,
  saveTestAttempt,
  SkillSection,
} from "@/lib/testingService";
import { playSuccessSound, playErrorSound, playClickSound } from "@/lib/soundEffects";

interface TestResultsViewProps {
  attemptId: string;
}

export function TestResultsView({ attemptId }: TestResultsViewProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [attempt, setAttempt] = useState<TestAttemptRecord | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "incorrect" | "flagged">("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const data = getTestAttemptById(attemptId);
    if (data) {
      setAttempt(data);
      if (data.passed) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    }
  }, [attemptId]);

  if (!mounted || !attempt) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[var(--color-text-muted)]">Loading test results & performance analysis...</p>
      </div>
    );
  }

  // Format radar chart data
  const radarData = attempt.sectionScores.map((sec) => ({
    skill: sec.label.replace("Section ", "").replace("Teil ", "").split(":")[1]?.trim() || sec.label,
    score: sec.percentage,
    fullMark: 100,
  }));

  // Filter reviewed questions
  const filteredReview = attempt.questionReview.filter((q) => {
    const ansMeta = attempt.answers[q.id];
    if (reviewFilter === "incorrect") return !q.isCorrect;
    if (reviewFilter === "flagged") return ansMeta?.flagged;
    return true;
  });

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}m ${remainder < 10 ? "0" : ""}${remainder}s`;
  };

  const handleRetakeWeakAreas = () => {
    playClickSound();
    const missedQuestions = attempt.questionReview.filter((q) => !q.isCorrect);
    if (missedQuestions.length === 0) {
      addToast({
        type: "success",
        title: "Perfection!",
        message: "You scored 100% on this test. No weak areas to drill!",
      });
      return;
    }

    // Save temporary drill quiz to localStorage
    const drillId = `drill-${Date.now()}`;
    const drillQuiz = {
      id: drillId,
      unitId: attempt.unitId || "weak-areas",
      levelCode: attempt.level,
      title: `Weak Areas Drill · ${attempt.title}`,
      titleDe: `Fehleranalyse & Gezieltes Training`,
      description: `Targeted review of the ${missedQuestions.length} questions you missed on ${attempt.title}.`,
      questions: missedQuestions,
    };
    localStorage.setItem("deutschpfad_active_drill", JSON.stringify(drillQuiz));

    router.push(`/tests/quiz/${drillId}?isDrill=true`);
  };

  const isPlacement = attempt.testType === "placement";
  const isMock = attempt.testType === "mock_exam";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* HERO SCORE & CEFR PLACEMENT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] relative overflow-hidden space-y-6"
      >
        <div className={`h-1.5 w-full absolute top-0 left-0 right-0 ${
          attempt.passed
            ? "bg-gradient-to-r from-[var(--color-brand-500)] via-[var(--color-accent-500)] to-[var(--color-success)]"
            : "bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500"
        }`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-400)] border border-[var(--color-border)]">
                {isPlacement ? "Adaptive Placement Test" : isMock ? `Full Mock Exam (${attempt.level})` : "Unit Assessment"}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {new Date(attempt.completedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              {attempt.title}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              {isPlacement
                ? `Placement evaluation complete. Based on your adaptive performance across A1–C1 items, here is your recommended level.`
                : `Test completed in ${formatSeconds(attempt.durationSeconds)} with standard CEFR scoring rules.`}
            </p>
          </div>

          {/* Big Score / Placement Badge */}
          <div className="flex items-center gap-4 shrink-0">
            {isPlacement && attempt.recommendedLevel ? (
              <div className="p-4 sm:p-5 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-brand-600)]/20 to-[var(--color-accent-600)]/10 border border-[var(--color-brand-500)]/40 text-center min-w-[140px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-400)]">
                  Recommended Level
                </span>
                <p className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--color-text-primary)] my-1">
                  {attempt.recommendedLevel}
                </p>
                <span className="text-[11px] text-[var(--color-success)] font-medium">
                  {attempt.percentage}% Overall Score
                </span>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[140px]">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {attempt.passed ? (
                    <CheckCircle2 size={18} className="text-[var(--color-success)]" />
                  ) : (
                    <XCircle size={18} className="text-rose-400" />
                  )}
                  <span className={`font-bold text-xs uppercase tracking-wider ${
                    attempt.passed ? "text-[var(--color-success)]" : "text-rose-400"
                  }`}>
                    {attempt.passed ? "PASSED · BESTANDEN" : "NEEDS PRACTICE"}
                  </span>
                </div>
                <p className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--color-text-primary)] my-1">
                  {attempt.percentage}%
                </p>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {attempt.score} / {attempt.maxScore} Points
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--color-border)]/60">
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {formatSeconds(attempt.durationSeconds)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[var(--color-accent-400)] font-semibold">
              <Zap size={13} /> +{attempt.passed ? 80 : 25} XP Awarded
            </span>
            <span>•</span>
            <span>
              {attempt.questionReview.filter((q) => q.isCorrect).length} / {attempt.totalQuestions} Questions Correct
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {attempt.questionReview.some((q) => !q.isCorrect) && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRetakeWeakAreas}
                leftIcon={<RotateCcw size={13} />}
                className="text-xs"
              >
                Retake Weak Areas ({attempt.questionReview.filter((q) => !q.isCorrect).length})
              </Button>
            )}

            {isPlacement && attempt.recommendedLevel && (
              <Link href={`/courses/${attempt.recommendedLevel.toLowerCase()}`}>
                <Button variant="accent" size="sm" rightIcon={<ArrowRight size={13} />} className="text-xs">
                  Start {attempt.recommendedLevel} Path
                </Button>
              </Link>
            )}

            <Link href="/tests">
              <Button variant="outline" size="sm" className="text-xs">
                Back to Tests
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* RADAR CHART BREAKDOWN & TIME PER SECTION */}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Radar Chart: Per-Skill Mastery */}
        <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Skill Mastery Radar
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Performance breakdown across German CEFR competencies.
              </p>
            </div>
            <BarChart3 size={18} className="text-[var(--color-brand-400)]" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: "var(--color-text-secondary)", fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke="var(--color-border)"
                    tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
                  />
                  <Radar
                    name="Mastery"
                    dataKey="score"
                    stroke="var(--color-brand-500)"
                    fill="var(--color-brand-500)"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full space-y-3 pt-4">
                {attempt.sectionScores.map((sec) => (
                  <div key={sec.section} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--color-text-primary)]">{sec.label}</span>
                      <span className="text-[var(--color-brand-400)]">{sec.percentage}%</span>
                    </div>
                    <ProgressBar value={sec.percentage} color="brand" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Times & Weak Topics */}
        <div className="space-y-6">
          {/* Time Per Section Card */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-3">
            <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
              Time Spent per Section
            </h3>

            <div className="space-y-2.5">
              {attempt.sectionScores.map((sec) => (
                <div
                  key={sec.section}
                  className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/70 border border-[var(--color-border)]/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[var(--color-brand-400)]" />
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {sec.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--color-text-muted)] font-mono">
                      {formatSeconds(sec.timeSeconds || Math.round(attempt.durationSeconds / attempt.sectionScores.length))}
                    </span>
                    <span className="font-bold text-[var(--color-accent-400)]">
                      {sec.score}/{sec.maxScore} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak-Topic Suggestions */}
          {attempt.weakTopics && attempt.weakTopics.length > 0 && (
            <div className="p-6 rounded-[var(--radius-2xl)] border border-amber-500/30 bg-amber-500/5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle size={16} />
                <span>Targeted Recovery Topics</span>
              </div>

              <div className="space-y-2 text-xs">
                {attempt.weakTopics.map((wt, i) => (
                  <div key={i} className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-text-primary)]">
                        {wt.topic}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-400">
                        Missed {wt.missedCount} of {wt.totalCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                      {wt.advice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUESTION-BY-QUESTION REVIEW */}
      <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
              Question-by-Question Review
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Review every answer with complete German grammatical and contextual explanations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs">
            <button
              onClick={() => setReviewFilter("all")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                reviewFilter === "all"
                  ? "bg-[var(--color-surface)] text-[var(--color-brand-400)] shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              All ({attempt.questionReview.length})
            </button>
            <button
              onClick={() => setReviewFilter("incorrect")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                reviewFilter === "incorrect"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "text-[var(--color-text-muted)] hover:text-rose-400"
              }`}
            >
              Missed ({attempt.questionReview.filter((q) => !q.isCorrect).length})
            </button>
            <button
              onClick={() => setReviewFilter("flagged")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                reviewFilter === "flagged"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "text-[var(--color-text-muted)] hover:text-amber-400"
              }`}
            >
              Flagged ({attempt.questionReview.filter((q) => attempt.answers[q.id]?.flagged).length})
            </button>
          </div>
        </div>

        {/* Review Items */}
        <div className="space-y-4">
          {filteredReview.map((item, idx) => {
            const isExpanded = expandedQuestionId === item.id;
            const isFlagged = attempt.answers[item.id]?.flagged;

            return (
              <div
                key={item.id}
                className={`rounded-[var(--radius-xl)] border transition-all ${
                  item.isCorrect
                    ? "bg-[var(--color-surface-2)]/40 border-[var(--color-border)] hover:border-[var(--color-success)]/40"
                    : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40"
                }`}
              >
                <div
                  onClick={() => setExpandedQuestionId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">
                      {item.isCorrect ? (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] flex items-center justify-center">
                          <CheckCircle2 size={16} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <XCircle size={16} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[var(--color-text-muted)]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                          {item.topic}
                        </span>
                        <span className="text-[10px] font-bold text-[var(--color-brand-400)] uppercase">
                          {item.section} · {item.level}
                        </span>
                        {isFlagged && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                            <Flag size={10} /> Flagged
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-semibold text-[var(--color-text-primary)] pt-1">
                        {item.prompt}
                      </p>
                    </div>
                  </div>

                  <button className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 pt-1 border-t border-[var(--color-border)]/60 space-y-4"
                    >
                      {item.contextText && (
                        <div className="p-3.5 rounded-lg bg-[var(--color-surface-3)]/60 text-xs text-[var(--color-text-secondary)] leading-relaxed italic border border-[var(--color-border)]/60">
                          {item.contextText}
                        </div>
                      )}

                      {/* Options breakdown */}
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        {item.options.map((opt, optIdx) => {
                          const isUserChoice = item.userAnswer === optIdx;
                          const isCorrectChoice = item.correctAnswer === optIdx;

                          let badgeStyle = "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)]";
                          if (isCorrectChoice) {
                            badgeStyle = "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)] font-bold";
                          } else if (isUserChoice && !isCorrectChoice) {
                            badgeStyle = "bg-rose-500/15 border-rose-500/40 text-rose-400 font-bold";
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${badgeStyle}`}
                            >
                              <span>{opt}</span>
                              {isCorrectChoice && <span className="text-[10px] font-bold">✓ Correct</span>}
                              {isUserChoice && !isCorrectChoice && <span className="text-[10px] font-bold">✗ Your Pick</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* In-depth Grammar/Context Explanation */}
                      <div className="p-3.5 rounded-xl bg-[var(--color-brand-600)]/10 border border-[var(--color-brand-500)]/30 text-xs space-y-1">
                        <span className="font-bold text-[var(--color-brand-400)] flex items-center gap-1.5">
                          💡 Explanation & Grammatikregel:
                        </span>
                        <p className="text-[var(--color-text-secondary)] leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
