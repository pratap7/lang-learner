"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowRight } from "lucide-react";
import { SentenceReorderingExercise } from "@/types/exercise.types";
import { playClickSound } from "@/lib/soundEffects";

interface SentenceReorderingRendererProps {
  exercise: SentenceReorderingExercise;
  userAnswer: string[]; // ordered list of tokens
  onAnswerChange: (tokens: string[]) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

export function SentenceReorderingRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  isCorrect,
  disabled = false,
}: SentenceReorderingRendererProps) {
  // Available tokens: initial scrambled minus currently placed instances
  const availableTokens: { token: string; originalIndex: number }[] = [];
  const placedIndices = new Set<number>();

  // Track which tokens by index are placed
  const placedCounts: Record<string, number> = {};
  userAnswer.forEach((t) => {
    placedCounts[t] = (placedCounts[t] || 0) + 1;
  });

  const remainingCounts = { ...placedCounts };
  exercise.scrambledTokens.forEach((token, idx) => {
    if (remainingCounts[token] && remainingCounts[token] > 0) {
      placedIndices.add(idx);
      remainingCounts[token]--;
    } else {
      availableTokens.push({ token, originalIndex: idx });
    }
  });

  const handleAddToken = (token: string) => {
    if (disabled || isSubmitted) return;
    playClickSound();
    onAnswerChange([...userAnswer, token]);
  };

  const handleRemoveToken = (indexToRemove: number) => {
    if (disabled || isSubmitted) return;
    playClickSound();
    const updated = userAnswer.filter((_, idx) => idx !== indexToRemove);
    onAnswerChange(updated);
  };

  const handleReset = () => {
    if (disabled || isSubmitted) return;
    playClickSound();
    onAnswerChange([]);
  };

  // Drag and Drop handlers
  const handleDragStartFromPool = (e: React.DragEvent, token: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ source: "pool", token }));
  };

  const handleDragStartPlaced = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ source: "placed", index }));
  };

  const handleDropOnConstructionArea = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isSubmitted) return;
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.source === "pool") {
        handleAddToken(data.token);
      }
    } catch {}
  };

  const handleDropOnPlacedToken = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || isSubmitted) return;
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (data.source === "placed") {
        const fromIndex = data.index;
        if (fromIndex !== targetIndex) {
          playClickSound();
          const next = [...userAnswer];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(targetIndex, 0, moved);
          onAnswerChange(next);
        }
      } else if (data.source === "pool") {
        playClickSound();
        const next = [...userAnswer];
        next.splice(targetIndex, 0, data.token);
        onAnswerChange(next);
      }
    } catch {}
  };

  // Keyboard: Backspace pops last token
  useEffect(() => {
    if (disabled || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && userAnswer.length > 0) {
        // Only if target is not an input
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          handleRemoveToken(userAnswer.length - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userAnswer, disabled, isSubmitted]);

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* English Reference Translation */}
      <div className="p-4 sm:p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center shadow-xs">
        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">
          Target English Meaning
        </p>
        <p className="text-lg sm:text-xl font-heading font-medium text-[var(--color-text-primary)]">
          &ldquo;{exercise.translationEn}&rdquo;
        </p>
      </div>

      {/* Target Sentence Construction Area (Drop Zone) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnConstructionArea}
        className={`p-6 rounded-[var(--radius-2xl)] border-2 min-h-[120px] flex flex-wrap items-center justify-center gap-2.5 transition-all relative ${
          isSubmitted && isCorrect
            ? "border-[var(--color-success)] bg-[var(--color-success)]/10"
            : isSubmitted && !isCorrect
            ? "border-[var(--color-error)] bg-[var(--color-error)]/10 animate-shake"
            : userAnswer.length > 0
            ? "border-[var(--color-brand-500)]/60 bg-[var(--color-surface)] shadow-sm"
            : "border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)]"
        }`}
      >
        {userAnswer.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)] italic text-center select-none">
            Drag or tap words from the bank below to assemble the German sentence...
          </p>
        ) : (
          <AnimatePresence mode="popLayout">
            {userAnswer.map((token, idx) => (
              <motion.button
                key={`${token}-${idx}`}
                layout
                draggable={!disabled && !isSubmitted}
                onDragStart={(e) => handleDragStartPlaced(e as any, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnPlacedToken(e as any, idx)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                disabled={disabled || isSubmitted}
                onClick={() => handleRemoveToken(idx)}
                className={`px-4 py-2 rounded-[var(--radius-xl)] font-medium text-base border shadow-sm transition-all cursor-grab active:cursor-grabbing ${
                  isSubmitted && isCorrect
                    ? "bg-[var(--color-success)] text-white border-[var(--color-success)]"
                    : isSubmitted && !isCorrect
                    ? "bg-[var(--color-error)] text-white border-[var(--color-error)]"
                    : "bg-[var(--color-brand-600)] text-white border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]"
                }`}
                title="Drag to reorder, or click to remove"
              >
                {token}
              </motion.button>
            ))}
          </AnimatePresence>
        )}

        {userAnswer.length > 0 && !isSubmitted && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute top-2 right-2 p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Reset sentence"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Available Word Bank Pool */}
      <div className="space-y-2">
        <p className="text-xs text-center text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
          Available Words (Drag or click to place):
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[50px]">
          {exercise.scrambledTokens.map((token, idx) => {
            const isUsed = placedIndices.has(idx);

            return (
              <motion.button
                key={`pool-${token}-${idx}`}
                draggable={!disabled && !isSubmitted && !isUsed}
                onDragStart={(e) => handleDragStartFromPool(e as any, token)}
                type="button"
                disabled={disabled || isSubmitted || isUsed}
                onClick={() => handleAddToken(token)}
                whileHover={!isUsed && !isSubmitted ? { scale: 1.05 } : {}}
                whileTap={!isUsed && !isSubmitted ? { scale: 0.95 } : {}}
                className={`px-4 py-2 rounded-[var(--radius-xl)] font-medium text-base border transition-all ${
                  isUsed
                    ? "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]/40 border-transparent cursor-not-allowed line-through opacity-40"
                    : "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-surface-2)] shadow-xs cursor-grab active:cursor-grabbing"
                }`}
              >
                {token}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
