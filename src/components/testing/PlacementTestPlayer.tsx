"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ArrowRight, CheckCircle2, Clock, Sparkles,
  HelpCircle, Volume2, ShieldCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  AdaptivePlacementState,
  TestQuestionItem,
  createInitialPlacementState,
  getNextAdaptiveQuestion,
  processAdaptiveAnswer,
  calculatePlacementResult,
  saveTestAttempt,
  TestAttemptRecord,
  SkillSection,
} from "@/lib/testingService";
import { playClickSound, playSuccessSound, playErrorSound } from "@/lib/soundEffects";

export function PlacementTestPlayer() {
  const router = useRouter();
  const { addToast } = useToast();

  const [state, setState] = useState<AdaptivePlacementState>(() => createInitialPlacementState(25));
  const [currentQuestion, setCurrentQuestion] = useState<TestQuestionItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accumulatedReview, setAccumulatedReview] = useState<TestAttemptRecord["questionReview"]>([]);
  const [answersMeta, setAnswersMeta] = useState<TestAttemptRecord["answers"]>({});

  useEffect(() => {
    const firstQ = getNextAdaptiveQuestion(state);
    setCurrentQuestion(firstQ);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  }, []);

  const handleSelectOption = (idx: number) => {
    playClickSound();
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null || !currentQuestion || isSubmitting) return;

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) playSuccessSound();
    else playErrorSound();

    // Record review entry
    const reviewEntry = {
      id: currentQuestion.id,
      level: currentQuestion.level,
      section: currentQuestion.section,
      topic: currentQuestion.topic,
      prompt: currentQuestion.prompt,
      contextText: currentQuestion.contextText,
      options: currentQuestion.options,
      userAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      explanation: currentQuestion.explanation,
    };
    const nextReview = [...accumulatedReview, reviewEntry];
    setAccumulatedReview(nextReview);

    const nextMeta = {
      ...answersMeta,
      [currentQuestion.id]: {
        userAnswer: selectedOption,
        isCorrect,
        timeSpentSeconds: timeSpent,
      },
    };
    setAnswersMeta(nextMeta);

    // Adapt state
    const { nextState } = processAdaptiveAnswer(state, currentQuestion, selectedOption);
    setState(nextState);

    // Check if test reached target length
    if (nextState.currentQuestionIndex >= nextState.totalQuestionsTarget) {
      finalizePlacement(nextState, nextReview, nextMeta);
      return;
    }

    // Get next adaptive question
    const nextQ = getNextAdaptiveQuestion(nextState);
    if (!nextQ) {
      finalizePlacement(nextState, nextReview, nextMeta);
      return;
    }

    setCurrentQuestion(nextQ);
    setSelectedOption(null);
    setQuestionStartTime(Date.now());
  };

  const finalizePlacement = (
    finalState: AdaptivePlacementState,
    review: TestAttemptRecord["questionReview"],
    meta: TestAttemptRecord["answers"]
  ) => {
    setIsSubmitting(true);
    const result = calculatePlacementResult(finalState);
    const totalDuration = Math.max(10, Math.round((Date.now() - startTime) / 1000));

    // Calculate section breakdown
    const sections: SkillSection[] = ["grammar", "vocabulary", "reading"];
    const sectionScores = sections.map((sec) => {
      const items = review.filter((r) => r.section === sec);
      const correct = items.filter((r) => r.isCorrect).length;
      const total = items.length;
      return {
        section: sec,
        label: sec.charAt(0).toUpperCase() + sec.slice(1),
        score: correct,
        maxScore: total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 100,
        timeSeconds: Math.round(totalDuration / sections.length),
      };
    });

    // Detect weak topics
    const missed = review.filter((r) => !r.isCorrect);
    const weakTopicMap = new Map<string, { count: number; total: number; sec: SkillSection }>();
    review.forEach((r) => {
      const existing = weakTopicMap.get(r.topic) || { count: 0, total: 0, sec: r.section };
      existing.total++;
      if (!r.isCorrect) existing.count++;
      weakTopicMap.set(r.topic, existing);
    });

    const weakTopics: TestAttemptRecord["weakTopics"] = [];
    weakTopicMap.forEach((val, key) => {
      if (val.count > 0) {
        weakTopics.push({
          topic: key,
          section: val.sec,
          missedCount: val.count,
          totalCount: val.total,
          advice: `Review ${key} fundamentals in your lesson drills to cement correct German sentence structure.`,
        });
      }
    });

    const attemptId = `attempt-pl-${Date.now()}`;
    const attemptRecord: TestAttemptRecord = {
      id: attemptId,
      testType: "placement",
      title: "Adaptive CEFR Placement Test",
      level: result.recommendedLevel,
      recommendedLevel: result.recommendedLevel,
      totalQuestions: review.length,
      score: result.totalScore,
      maxScore: result.maxScore,
      percentage: result.percentage,
      passed: true,
      durationSeconds: totalDuration,
      completedAt: new Date().toISOString(),
      sectionScores,
      answers: meta,
      weakTopics,
      questionReview: review,
    };

    saveTestAttempt(attemptRecord);

    addToast({
      type: "success",
      title: "Placement Evaluated!",
      message: `Recommended Start Level: ${result.recommendedLevel} (${result.percentage}% score).`,
    });

    router.push(`/tests/results/${attemptId}`);
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[var(--color-text-muted)]">Calibrating adaptive assessment pool...</p>
      </div>
    );
  }

  const progressPct = Math.round((state.currentQuestionIndex / state.totalQuestionsTarget) * 100);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Top Header & Adaptive Indicator */}
      <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] flex items-center justify-center">
              <Compass size={18} />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Adaptive CEFR Placement
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Dynamic difficulty · Calibrating start level
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-[var(--color-surface-2)] text-[var(--color-brand-400)] border border-[var(--color-border)]">
              Level Bracket: {currentQuestion.level}
            </span>
            <span className="text-xs font-bold text-[var(--color-text-muted)]">
              {state.currentQuestionIndex + 1} / {state.totalQuestionsTarget}
            </span>
          </div>
        </div>

        <ProgressBar value={progressPct} color="brand" size="sm" />
      </div>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6"
        >
          {/* Section & Topic tags */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-400)] border border-[var(--color-border)]">
                {currentQuestion.section}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                {currentQuestion.topic}
              </span>
            </div>

            <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
              Target Level: {currentQuestion.level}
            </span>
          </div>

          {/* Context passage if applicable */}
          {currentQuestion.contextText && (
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] leading-relaxed italic">
              {currentQuestion.contextText}
            </div>
          )}

          {/* Prompt */}
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)] leading-snug">
            {currentQuestion.prompt}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-[var(--radius-xl)] border text-left text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-brand-600)]/15 border-[var(--color-brand-500)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-brand-500)]/40"
                      : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-brand-400)]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                      isSelected
                        ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-white"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                    }`}>
                      {String.fromCharCode(65 + idx)}
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

          {/* Next / Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]/60">
            <span className="text-xs text-[var(--color-text-muted)]">
              {state.totalQuestionsTarget - state.currentQuestionIndex - 1} questions remaining
            </span>

            <Button
              variant="primary"
              size="md"
              disabled={selectedOption === null || isSubmitting}
              onClick={handleNextQuestion}
              rightIcon={<ArrowRight size={14} />}
            >
              {state.currentQuestionIndex + 1 === state.totalQuestionsTarget ? "Finish Assessment" : "Confirm Answer"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
