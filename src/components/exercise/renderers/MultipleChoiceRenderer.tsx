"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { MultipleChoiceExercise } from "@/types/exercise.types";

interface MultipleChoiceRendererProps {
  exercise: MultipleChoiceExercise;
  userAnswer: string | null; // option id
  onAnswerChange: (optionId: string) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

export function MultipleChoiceRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  disabled = false,
}: MultipleChoiceRendererProps) {
  // Keyboard shortcut listener (1-4)
  useEffect(() => {
    if (disabled || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= exercise.options.length) {
        onAnswerChange(exercise.options[num - 1].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, isSubmitted, exercise.options, onAnswerChange]);

  return (
    <div className="space-y-3 w-full max-w-2xl mx-auto">
      {exercise.promptDe && (
        <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-4">
          <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">
            Context / Situation
          </p>
          <p className="text-base text-[var(--color-text-primary)] font-medium">
            {exercise.promptDe}
          </p>
        </div>
      )}

      <div role="radiogroup" aria-label="Multiple choice options" className="grid grid-cols-1 gap-3">
        {exercise.options.map((option, idx) => {
          const isSelected = userAnswer === option.id;
          const showSuccess = isSubmitted && option.isCorrect;
          const showError = isSubmitted && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${idx + 1}: ${option.text}${option.translation ? ` (${option.translation})` : ""}`}
              disabled={disabled || isSubmitted}
              onClick={() => onAnswerChange(option.id)}
              whileHover={!isSubmitted ? { scale: 1.01 } : {}}
              whileTap={!isSubmitted ? { scale: 0.99 } : {}}
              className={`w-full p-4 rounded-[var(--radius-xl)] border text-left flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                showSuccess
                  ? "bg-[var(--color-success)]/15 border-[var(--color-success)] text-[var(--color-text-primary)] shadow-sm"
                  : showError
                  ? "bg-[var(--color-error)]/15 border-[var(--color-error)] text-[var(--color-text-primary)] shadow-sm animate-shake"
                  : isSelected
                  ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)] text-[var(--color-text-primary)] shadow-[var(--shadow-glow)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                    showSuccess
                      ? "bg-[var(--color-success)] text-white"
                      : showError
                      ? "bg-[var(--color-error)] text-white"
                      : isSelected
                      ? "bg-[var(--color-brand-500)] text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                  }`}
                >
                  {idx + 1}
                </span>

                <div>
                  <p className="text-base font-medium text-[var(--color-text-primary)]">
                    {option.text}
                  </p>
                  {option.translation && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {option.translation}
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {showSuccess && (
                  <CheckCircle2 size={20} className="text-[var(--color-success)]" />
                )}
                {showError && (
                  <XCircle size={20} className="text-[var(--color-error)]" />
                )}
                {!isSubmitted && (
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
