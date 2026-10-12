"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Sparkles, Award, ShieldCheck, Check, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EnrichedMistakeRecord, resolveMistake } from "@/lib/mistakesService";
import { playClickSound, playSuccessSound, playErrorSound } from "@/lib/soundEffects";

interface MistakePracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: EnrichedMistakeRecord[];
  topicTitle: string;
  onRefresh: () => void;
}

export function MistakePracticeModal({
  isOpen,
  onClose,
  mistakes,
  topicTitle,
  onRefresh,
}: MistakePracticeModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  if (!isOpen || mistakes.length === 0) return null;

  const currentItem = mistakes[currentIndex];
  const total = mistakes.length;
  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  // Generate options if not explicitly present on the record
  const options = currentItem.options && currentItem.options.length > 0
    ? currentItem.options
    : Array.from(new Set([currentItem.correctAnswer, currentItem.userAnswer, "keine", "etwas"]));

  const handleSelect = (opt: string) => {
    if (checked) return;
    playClickSound();
    setSelectedOption(opt);
  };

  const handleCheck = () => {
    if (!selectedOption || checked) return;
    const correct = selectedOption.trim().toLowerCase() === currentItem.correctAnswer.trim().toLowerCase();
    setChecked(true);
    setIsCorrect(correct);

    if (correct) {
      playSuccessSound();
      setCorrectCount((c) => c + 1);
      // Auto-resolve this mistake
      resolveMistake(currentItem.id);
      setResolvedIds((prev) => [...prev, currentItem.id]);
    } else {
      playErrorSound();
    }
  };

  const handleNext = () => {
    playClickSound();
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setChecked(false);
      setIsCorrect(false);
    } else {
      setIsCompleted(true);
      onRefresh();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setChecked(false);
    setIsCorrect(false);
    setCorrectCount(0);
    setIsCompleted(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="max-w-xl w-full p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Top Tricolor Accent */}
          <div className="h-1.5 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-80" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-brand-400)] border border-[var(--color-border)]">
                Mistake Drill · Fehleranalyse
              </span>
              <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mt-1">
                {topicTitle}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {!isCompleted ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <span>Question {currentIndex + 1} of {total}</span>
                  <span className="font-mono">{progressPct}%</span>
                </div>
                <ProgressBar value={progressPct} color="brand" size="sm" />
              </div>

              {/* Question Context & Prompt */}
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] space-y-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb size={13} /> Past Error Context:
                </span>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed">
                  {currentItem.prompt}
                </p>
                {currentItem.promptDe && (
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    Hint: {currentItem.promptDe}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  let btnStyle = "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]";

                  if (checked) {
                    if (opt.trim().toLowerCase() === currentItem.correctAnswer.trim().toLowerCase()) {
                      btnStyle = "bg-[var(--color-success)]/15 border-[var(--color-success)] text-[var(--color-success)] font-bold";
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "bg-rose-500/15 border-rose-500 text-rose-400 font-bold";
                    }
                  } else if (isSelected) {
                    btnStyle = "bg-[var(--color-brand-600)]/15 border-[var(--color-brand-500)] text-[var(--color-text-primary)] shadow-xs ring-1 ring-[var(--color-brand-500)]/40";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={checked}
                      onClick={() => handleSelect(opt)}
                      className={`w-full p-3.5 rounded-[var(--radius-xl)] border text-left text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {checked && opt.trim().toLowerCase() === currentItem.correctAnswer.trim().toLowerCase() && (
                        <CheckCircle2 size={16} className="text-[var(--color-success)] shrink-0" />
                      )}
                      {checked && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert upon Checking */}
              {checked && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3.5 rounded-[var(--radius-xl)] border text-xs space-y-1.5 ${
                    isCorrect
                      ? "bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Richtig! Markiert als gelöst (Resolved) ✓</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={15} />
                        <span>Noch nicht ganz richtig. Richtige Antwort: &ldquo;{currentItem.correctAnswer}&rdquo;</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                    {currentItem.explanation}
                  </p>
                </motion.div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                  Cancel
                </Button>

                {!checked ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!selectedOption}
                    onClick={handleCheck}
                    className="text-xs"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNext}
                    rightIcon={<ArrowRight size={13} />}
                    className="text-xs"
                  >
                    {currentIndex < total - 1 ? "Next Error" : "View Results"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* COMPLETION VIEW */
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <Award size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                  Practice Complete!
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                  You drilled {total} past error{total > 1 ? "s" : ""} in <strong>{topicTitle}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <p className="font-heading text-2xl font-bold text-[var(--color-brand-400)]">
                    {correctCount} / {total}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Correct on Retry</p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                  <p className="font-heading text-2xl font-bold text-[var(--color-success)]">
                    +{correctCount * 10} XP
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">XP Earned</p>
                </div>
              </div>

              {resolvedIds.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-xs text-[var(--color-success)] flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck size={16} />
                  <span>{resolvedIds.length} mistake{resolvedIds.length > 1 ? "s" : ""} marked as resolved in your Notebook!</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={handleRestart} leftIcon={<RotateCcw size={13} />} className="text-xs">
                  Drill Again
                </Button>
                <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
                  Done & Back to Notebook
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
