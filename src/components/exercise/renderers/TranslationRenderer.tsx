"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, CornerDownLeft } from "lucide-react";
import { TranslationExercise } from "@/types/exercise.types";
import { playClickSound } from "@/lib/soundEffects";
import { UmlautKeyboardBar } from "@/components/ui/UmlautKeyboardBar";

interface TranslationRendererProps {
  exercise: TranslationExercise;
  userAnswer: string;
  onAnswerChange: (text: string) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

export function TranslationRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  isCorrect,
  disabled = false,
}: TranslationRendererProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus input on mount
  useEffect(() => {
    if (!isSubmitted && !disabled) {
      inputRef.current?.focus();
    }
  }, [isSubmitted, disabled]);

  const insertChar = (char: string) => {
    if (disabled || isSubmitted) return;
    playClickSound();

    const textarea = inputRef.current;
    if (!textarea) {
      onAnswerChange(userAnswer + char);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextVal = userAnswer.substring(0, start) + char + userAnswer.substring(end);
    onAnswerChange(nextVal);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + char.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Source Sentence Prompt */}
      <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-center">
        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">
          {exercise.direction === "en_to_de" ? "English Source Sentence" : "German Source Sentence"}
        </p>
        <p className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text-primary)]">
          {exercise.sourceSentence}
        </p>
      </div>

      <div className="flex justify-center -my-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] shadow-xs">
          <ArrowDown size={16} />
        </div>
      </div>

      {/* User Input Area */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            ref={inputRef}
            disabled={disabled || isSubmitted}
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            aria-label={exercise.direction === "en_to_de" ? "German translation response" : "English translation response"}
            placeholder={
              exercise.direction === "en_to_de"
                ? "Schreibe die deutsche Übersetzung..."
                : "Type the English translation..."
            }
            rows={3}
            className={`w-full p-4 rounded-[var(--radius-xl)] border text-base font-medium resize-none transition-all shadow-sm focus:outline-none ${
              isSubmitted && isCorrect
                ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-text-primary)]"
                : isSubmitted && !isCorrect
                ? "border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-text-primary)] animate-shake"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
            }`}
          />
        </div>

        {/* German Special Characters Bar (Umlauts & Eszett) */}
        {exercise.direction === "en_to_de" && !isSubmitted && (
          <UmlautKeyboardBar
            onInsert={insertChar}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
