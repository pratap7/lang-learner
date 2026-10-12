"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Check, X } from "lucide-react";
import { FillInTheBlankExercise } from "@/types/exercise.types";

interface FillInTheBlankRendererProps {
  exercise: FillInTheBlankExercise;
  userAnswer: string;
  onAnswerChange: (val: string) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

export function FillInTheBlankRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  isCorrect,
  disabled = false,
}: FillInTheBlankRendererProps) {
  const [showHint, setShowHint] = useState(false);

  // Split sentence around blank
  const parts = exercise.sentenceWithBlank.split(/___|\[blank\]/);
  const partBefore = parts[0] || "";
  const partAfter = parts[1] || "";

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Target Sentence Display with Active Slot */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-center">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xl sm:text-2xl font-heading font-medium text-[var(--color-text-primary)]">
          <span>{partBefore}</span>

          {/* The Blank Slot */}
          <span
            className={`inline-flex items-center justify-center min-w-[120px] px-4 py-1.5 rounded-[var(--radius-lg)] border-2 font-mono text-lg transition-all ${
              isSubmitted && isCorrect
                ? "border-[var(--color-success)] bg-[var(--color-success)]/15 text-[var(--color-success)]"
                : isSubmitted && !isCorrect
                ? "border-[var(--color-error)] bg-[var(--color-error)]/15 text-[var(--color-error)] animate-shake"
                : userAnswer
                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] shadow-[var(--shadow-glow)]"
                : "border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
            }`}
          >
            {userAnswer ? (
              <span className="flex items-center gap-1.5">
                {userAnswer}
                {isSubmitted && isCorrect && <Check size={16} />}
                {isSubmitted && !isCorrect && <X size={16} />}
              </span>
            ) : (
              <span className="text-sm italic opacity-60">select word</span>
            )}
          </span>

          <span>{partAfter}</span>
        </div>

        {exercise.hint && (
          <div className="mt-4 pt-4 border-t border-[var(--color-border)]/60">
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-brand-400)] hover:underline cursor-pointer"
              >
                <HelpCircle size={13} /> Need a hint?
              </button>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[var(--color-accent-400)] bg-[var(--color-accent-500)]/10 px-3 py-1.5 rounded-full inline-block"
              >
                💡 {exercise.hint}
              </motion.p>
            )}
          </div>
        )}
      </div>

      {/* Word Bank Chips */}
      {exercise.wordBank && exercise.wordBank.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-center text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
            Choose the matching word:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {exercise.wordBank.map((word, idx) => {
              const isSelected = userAnswer.toLowerCase() === word.toLowerCase();

              return (
                <motion.button
                  key={idx}
                  type="button"
                  disabled={disabled || isSubmitted}
                  onClick={() => onAnswerChange(word)}
                  whileHover={!isSubmitted ? { scale: 1.05 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.95 } : {}}
                  className={`px-5 py-2.5 rounded-[var(--radius-xl)] font-medium text-sm border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-brand-600)] text-white border-[var(--color-brand-500)] shadow-md"
                      : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] shadow-xs"
                  }`}
                >
                  {word}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual text input fallback if no word bank or user prefers typing */}
      {(!exercise.wordBank || exercise.wordBank.length === 0) && (
        <div className="max-w-xs mx-auto">
          <input
            type="text"
            disabled={disabled || isSubmitted}
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type missing word..."
            className="w-full px-4 py-2.5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-lg font-medium text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)] shadow-sm"
          />
        </div>
      )}
    </div>
  );
}
