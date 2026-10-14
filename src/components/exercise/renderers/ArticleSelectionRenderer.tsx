"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { ArticleSelectionExercise } from "@/types/exercise.types";
import { playClickSound } from "@/lib/soundEffects";

interface ArticleSelectionRendererProps {
  exercise: ArticleSelectionExercise;
  userAnswer: "der" | "die" | "das" | null;
  onAnswerChange: (article: "der" | "die" | "das") => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

const ARTICLES: { code: "der" | "die" | "das"; label: string; gender: string; color: string; bg: string; key: string }[] = [
  { code: "der", label: "der", gender: "Maskulin (m)", color: "text-blue-400", bg: "bg-blue-500", key: "1" },
  { code: "die", label: "die", gender: "Feminin (f)", color: "text-pink-400", bg: "bg-pink-500", key: "2" },
  { code: "das", label: "das", gender: "Neutrum (n)", color: "text-emerald-400", bg: "bg-emerald-500", key: "3" },
];

export function ArticleSelectionRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  isCorrect,
  disabled = false,
}: ArticleSelectionRendererProps) {
  // Keyboard shortcut listener: 1 for der, 2 for die, 3 for das
  useEffect(() => {
    if (disabled || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") onAnswerChange("der");
      if (e.key === "2") onAnswerChange("die");
      if (e.key === "3") onAnswerChange("das");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, isSubmitted, onAnswerChange]);

  const selectArticle = (article: "der" | "die" | "das") => {
    if (disabled || isSubmitted) return;
    playClickSound();
    onAnswerChange(article);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Target Noun Card */}
      <div className="p-8 sm:p-10 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-center relative overflow-hidden">
        <div className="h-1 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-80" />

        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-3">
          Noun Gender Challenge · Select the Article
        </p>

        {/* Noun Display */}
        <div className="flex items-center justify-center gap-3 my-2">
          <span
            className={`font-heading text-4xl sm:text-5xl font-extrabold tracking-tight transition-colors ${
              userAnswer === "der"
                ? "text-blue-400"
                : userAnswer === "die"
                ? "text-pink-400"
                : userAnswer === "das"
                ? "text-emerald-400"
                : "text-[var(--color-text-primary)]"
            }`}
          >
            <span className="opacity-60 font-medium mr-2">
              {userAnswer || "___"}
            </span>
            {exercise.noun}
          </span>
        </div>

        {exercise.plural && (
          <p className="text-xs font-mono text-[var(--color-text-muted)] mt-1">
            Plural: {exercise.plural}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-[var(--color-border)]/50 inline-block">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            Meaning: <strong>&ldquo;{exercise.translationEn}&rdquo;</strong>
          </span>
        </div>
      </div>

      {/* 3 Color-Coded & Shape-Coded Article Buttons */}
      <div role="radiogroup" aria-label={`Select article for ${exercise.noun}`} className="grid grid-cols-3 gap-3 sm:gap-4">
        {ARTICLES.map((art) => {
          const isSelected = userAnswer === art.code;
          const isTargetCorrect = exercise.correctArticle === art.code;
          const showSuccess = isSubmitted && isTargetCorrect;
          const showError = isSubmitted && isSelected && !isTargetCorrect;

          const shapeIndicator = art.code === "der" ? "■" : art.code === "die" ? "●" : "◆";

          return (
            <motion.button
              key={art.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${art.code} - ${art.gender}`}
              disabled={disabled || isSubmitted}
              onClick={() => selectArticle(art.code)}
              whileHover={!isSubmitted ? { scale: 1.03 } : {}}
              whileTap={!isSubmitted ? { scale: 0.97 } : {}}
              className={`p-5 sm:p-6 rounded-[var(--radius-2xl)] border-2 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-sm relative overflow-hidden ${
                showSuccess
                  ? "bg-[var(--color-success)]/20 border-[var(--color-success)] text-[var(--color-success)] shadow-md"
                  : showError
                  ? "bg-[var(--color-error)]/20 border-[var(--color-error)] text-[var(--color-error)] animate-shake"
                  : isSelected
                  ? art.code === "der"
                    ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : art.code === "die"
                    ? "bg-pink-500/20 border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                    : "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              {/* Keyboard shortcut hint */}
              <span className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                {art.key}
              </span>

              {/* Color-blind safe shape badge */}
              <span className="text-xs font-mono opacity-70" aria-hidden="true">
                {shapeIndicator}
              </span>

              <span className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-wide">
                {art.label}
              </span>

              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] mt-0.5">
                {art.gender}
              </span>

              {showSuccess && (
                <CheckCircle2 size={20} className="text-[var(--color-success)] mt-1" />
              )}
              {showError && (
                <XCircle size={20} className="text-[var(--color-error)] mt-1" />
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Tip: Press keyboard <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border font-mono">1</kbd> for der, <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border font-mono">2</kbd> for die, or <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border font-mono">3</kbd> for das.
      </p>
    </div>
  );
}
