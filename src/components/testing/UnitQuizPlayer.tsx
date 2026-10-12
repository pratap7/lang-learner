"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, CheckCircle2, XCircle, ArrowRight, ArrowLeft,
  Clock, RotateCcw, AlertTriangle, BookOpen, Sparkles, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  UNIT_QUIZZES,
  UnitQuizDefinition,
  TestQuestionItem,
  saveTestAttempt,
  TestAttemptRecord,
  SkillSection,
} from "@/lib/testingService";
import { playClickSound, playSuccessSound, playErrorSound } from "@/lib/soundEffects";

interface UnitQuizPlayerProps {
  quizId: string;
}

export function UnitQuizPlayer({ quizId }: UnitQuizPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDrill = searchParams.get("isDrill") === "true";
  const { addToast } = useToast();

  const [quiz, setQuiz] = useState<UnitQuizDefinition | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isDrill && typeof window !== "undefined") {
      const drillRaw = localStorage.getItem("deutschpfad_active_drill");
      if (drillRaw) {
        setQuiz(JSON.parse(drillRaw));
        setStartTime(Date.now());
        return;
      }
    }

    const found = UNIT_QUIZZES.find((q) => q.id === quizId) || UNIT_QUIZZES[0];
    setQuiz(found);
    setStartTime(Date.now());
  }, [quizId, isDrill]);

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[var(--color-text-muted)]">Loading unit quiz content...</p>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progressPct = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const selectedForCurrent = currentQ ? selectedAnswers[currentQ.id] : undefined;

  const handleSelect = (optionIdx: number) => {
    playClickSound();
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setIsSubmitting(true);
    const totalDuration = Math.max(10, Math.round((Date.now() - startTime) / 1000));

    let correctCount = 0;
    const review: TestAttemptRecord["questionReview"] = [];
    const answersMeta: TestAttemptRecord["answers"] = {};
    const sectionMap = new Map<SkillSection, { correct: number; total: number }>();
    const weakTopicMap = new Map<string, { count: number; total: number; sec: SkillSection }>();

    quiz.questions.forEach((q) => {
      const userPick = selectedAnswers[q.id];
      const isCorrect = userPick === q.correctAnswer;
      if (isCorrect) correctCount++;

      // Section count
      const secData = sectionMap.get(q.section) || { correct: 0, total: 0 };
      secData.total++;
      if (isCorrect) secData.correct++;
      sectionMap.set(q.section, secData);

      // Weak topics count
      const wtData = weakTopicMap.get(q.topic) || { count: 0, total: 0, sec: q.section };
      wtData.total++;
      if (!isCorrect) wtData.count++;
      weakTopicMap.set(q.topic, wtData);

      review.push({
        id: q.id,
        level: q.level,
        section: q.section,
        topic: q.topic,
        prompt: q.prompt,
        contextText: q.contextText,
        options: q.options,
        userAnswer: userPick !== undefined ? userPick : -1,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });

      answersMeta[q.id] = {
        userAnswer: userPick !== undefined ? userPick : -1,
        isCorrect,
        timeSpentSeconds: Math.round(totalDuration / totalQuestions),
      };
    });

    const scorePct = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePct >= 70; // 70% Pass Mark Requirement

    // Section scores
    const sectionScores = Array.from(sectionMap.entries()).map(([sec, stats]) => ({
      section: sec,
      label: sec.charAt(0).toUpperCase() + sec.slice(1),
      score: stats.correct,
      maxScore: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
      timeSeconds: Math.round(totalDuration / (sectionMap.size || 1)),
    }));

    // Weak topics
    const weakTopics: TestAttemptRecord["weakTopics"] = [];
    weakTopicMap.forEach((val, key) => {
      if (val.count > 0) {
        weakTopics.push({
          topic: key,
          section: val.sec,
          missedCount: val.count,
          totalCount: val.total,
          advice: `Review ${key} in unit grammar tables to reinforce rules.`,
        });
      }
    });

    const attemptId = `attempt-quiz-${Date.now()}`;
    const attemptRecord: TestAttemptRecord = {
      id: attemptId,
      testType: "unit_quiz",
      unitId: quiz.unitId,
      title: quiz.title,
      level: quiz.levelCode,
      totalQuestions,
      score: correctCount,
      maxScore: totalQuestions,
      percentage: scorePct,
      passed,
      durationSeconds: totalDuration,
      completedAt: new Date().toISOString(),
      sectionScores,
      answers: answersMeta,
      weakTopics,
      questionReview: review,
    };

    saveTestAttempt(attemptRecord);

    if (passed) {
      playSuccessSound();
      addToast({
        type: "success",
        title: "Quiz Bestanden! (Passed)",
        message: `You scored ${scorePct}% (pass mark: 70%). +50 XP awarded!`,
      });
    } else {
      playErrorSound();
      addToast({
        type: "error",
        title: "70% Pass Mark Not Reached",
        message: `You scored ${scorePct}%. Review the explanations below and try again.`,
      });
    }

    router.push(`/tests/results/${attemptId}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-400)] border border-[var(--color-border)]">
                {quiz.levelCode} · Pass Mark: 70%
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
            </div>
            <h1 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
              {quiz.title}
            </h1>
          </div>

          <div className="w-full sm:w-36">
            <ProgressBar value={progressPct} color="brand" size="md" />
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between text-xs pb-3 border-b border-[var(--color-border)]">
              <span className="font-semibold px-2.5 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]">
                {currentQ.topic}
              </span>
              <span className="font-mono text-[var(--color-text-muted)]">
                {currentQ.points} pt
              </span>
            </div>

            {currentQ.contextText && (
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 text-xs italic text-[var(--color-text-primary)] leading-relaxed border border-[var(--color-border)]">
                {currentQ.contextText}
              </div>
            )}

            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)] leading-snug">
              {currentQ.prompt}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedForCurrent === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelect(optIdx)}
                    className={`w-full p-4 rounded-[var(--radius-xl)] border text-left text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-brand-600)]/15 border-[var(--color-brand-500)] text-[var(--color-text-primary)] ring-1 ring-[var(--color-brand-500)]/40"
                        : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-brand-400)]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                        isSelected
                          ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-white"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 size={16} className="text-[var(--color-brand-400)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]/60">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                leftIcon={<ArrowLeft size={13} />}
                className="text-xs"
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  disabled={selectedForCurrent === undefined || isSubmitting}
                  onClick={handleNext}
                  rightIcon={<ArrowRight size={14} />}
                >
                  {currentIndex === totalQuestions - 1 ? "Submit Quiz (Pass: 70%)" : "Next Question"}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
