"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Check, Edit3, Sparkles, BookOpen } from "lucide-react";
import { WritingTaskExercise } from "@/types/exercise.types";
import { playClickSound } from "@/lib/soundEffects";

interface WritingTaskRendererProps {
  exercise: WritingTaskExercise;
  userAnswer: string;
  onAnswerChange: (text: string) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

const GERMAN_SPECIAL_CHARS = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];

export function WritingTaskRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  isCorrect,
  disabled = false,
}: WritingTaskRendererProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const words = userAnswer.trim() ? userAnswer.trim().split(/\s+/) : [];
  const wordCount = words.length;
  const minWords = exercise.targetWordCount?.min || 8;
  const hasMetWordCount = wordCount >= minWords;

  const insertChar = (char: string) => {
    if (disabled || isSubmitted) return;
    playClickSound();

    const textarea = textareaRef.current;
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
      {/* Scenario & Task Prompt */}
      <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold flex items-center gap-1.5">
            <Edit3 size={13} className="text-[var(--color-brand-400)]" /> Writing Scenario
          </span>
          <span className="text-xs text-[var(--color-brand-400)] font-semibold">
            Target: min. {minWords} words
          </span>
        </div>

        <p className="text-base font-medium text-[var(--color-text-primary)]">
          {exercise.writingPrompt}
        </p>

        {exercise.promptDe && (
          <p className="text-xs text-[var(--color-text-secondary)] italic border-t border-[var(--color-border)]/50 pt-2">
            {exercise.promptDe}
          </p>
        )}
      </div>

      {/* Required Keywords Checklist */}
      {exercise.requiredKeywords && exercise.requiredKeywords.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            Include these key words:
          </p>
          <div className="flex flex-wrap gap-2">
            {exercise.requiredKeywords.map((kw) => {
              const isIncluded = userAnswer.toLowerCase().includes(kw.toLowerCase());

              return (
                <span
                  key={kw}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                    isIncluded
                      ? "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30 font-semibold"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                  }`}
                >
                  {isIncluded && <Check size={12} />}
                  <span>&ldquo;{kw}&rdquo;</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Writing Textarea */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            disabled={disabled || isSubmitted}
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            rows={5}
            placeholder="Schreibe deinen Text hier auf Deutsch..."
            className={`w-full p-4 rounded-[var(--radius-xl)] border text-base font-medium resize-none transition-all shadow-sm focus:outline-none ${
              isSubmitted && isCorrect
                ? "border-[var(--color-success)] bg-[var(--color-success)]/10 text-[var(--color-text-primary)]"
                : isSubmitted && !isCorrect
                ? "border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-text-primary)] animate-shake"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
            }`}
          />

          {/* Word Counter Pill */}
          <div className="absolute bottom-3 right-3 text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
            <span className={hasMetWordCount ? "text-[var(--color-success)] font-bold" : ""}>
              {wordCount}
            </span>{" "}
            / {minWords} words
          </div>
        </div>

        {/* German Special Characters Toolbar */}
        {!isSubmitted && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)] font-medium pl-1">
              German Letters:
            </span>
            <div className="flex items-center gap-1.5">
              {GERMAN_SPECIAL_CHARS.map((char) => (
                <button
                  key={char}
                  type="button"
                  disabled={disabled}
                  onClick={() => insertChar(char)}
                  className="w-7 h-7 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-500)] text-xs font-bold font-mono text-[var(--color-text-primary)] transition-all cursor-pointer active:scale-95"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rubrics Checklist */}
      {exercise.rubrics && exercise.rubrics.length > 0 && (
        <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs space-y-2">
          <p className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Sparkles size={13} className="text-[var(--color-accent-400)]" /> Writing Checklist:
          </p>
          <ul className="space-y-1 text-[var(--color-text-secondary)] pl-1">
            {exercise.rubrics.map((rubric, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-[var(--color-brand-400)]">•</span>
                <span>{rubric}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Model Answer (Shown upon completion) */}
      {isSubmitted && exercise.sampleModelAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-brand-500)]/40 space-y-1.5"
        >
          <p className="text-xs font-semibold text-[var(--color-brand-400)] flex items-center gap-1">
            <BookOpen size={13} /> Sample Model Answer (Musterbeispiel):
          </p>
          <p className="text-sm font-medium text-[var(--color-text-primary)] italic">
            &ldquo;{exercise.sampleModelAnswer}&rdquo;
          </p>
        </motion.div>
      )}
    </div>
  );
}
