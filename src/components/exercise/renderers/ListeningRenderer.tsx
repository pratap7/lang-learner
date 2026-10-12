"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Snail, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { ListeningExercise } from "@/types/exercise.types";
import { playClickSound } from "@/lib/soundEffects";

interface ListeningRendererProps {
  exercise: ListeningExercise;
  userAnswer: string | null; // option id
  onAnswerChange: (optionId: string) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

export function ListeningRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  disabled = false,
}: ListeningRendererProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(exercise.playbackRate || 0.9);

  const speakAudio = (speed: number = 0.9) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    playClickSound();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(exercise.audioText);
    utterance.lang = "de-DE";
    utterance.rate = speed;

    setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Auto-play audio on initial mount for natural listening test feel
  useEffect(() => {
    const timer = setTimeout(() => {
      speakAudio(exercise.playbackRate || 0.9);
    }, 400);
    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [exercise.id]);

  // Spacebar to replay audio, 1-4 for options
  useEffect(() => {
    if (disabled || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        speakAudio(playSpeed);
      }
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= exercise.options.length) {
        onAnswerChange(exercise.options[num - 1].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, isSubmitted, playSpeed, exercise.options, onAnswerChange]);

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Audio Player Control Panel */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm text-center relative overflow-hidden">
        {/* German flag mini accent top */}
        <div className="h-1 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-80" />

        <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-4">
          Audio Listening Clip · German (de-DE)
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-2">
          {/* Main Play Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speakAudio(1.0)}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all cursor-pointer ${
              isPlaying
                ? "bg-[var(--color-brand-500)] ring-8 ring-[var(--color-brand-500)]/30 animate-pulse"
                : "bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-500)] hover:shadow-[var(--shadow-glow)]"
            }`}
            title="Play Audio (Press Space)"
          >
            <Volume2 size={36} />
          </motion.button>

          {/* Slow / Turtle Speed Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => speakAudio(0.65)}
            className="px-4 py-2.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Play at slow speed (0.65x)"
          >
            <Snail size={16} className="text-[var(--color-accent-400)]" />
            <span>Slow Speech (0.65x)</span>
          </motion.button>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] mt-4">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border text-[10px] font-mono">Space</kbd> anytime to replay audio.
        </p>
      </div>

      {/* Comprehension Question */}
      <div className="space-y-3">
        <h3 className="text-lg font-heading font-bold text-[var(--color-text-primary)] text-center">
          {exercise.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {exercise.options.map((option, idx) => {
            const isSelected = userAnswer === option.id;
            const showSuccess = isSubmitted && option.isCorrect;
            const showError = isSubmitted && isSelected && !option.isCorrect;

            return (
              <motion.button
                key={option.id}
                type="button"
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
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
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
                  <p className="text-base font-medium text-[var(--color-text-primary)]">
                    {option.text}
                  </p>
                </div>

                <div className="shrink-0">
                  {showSuccess && (
                    <CheckCircle2 size={18} className="text-[var(--color-success)]" />
                  )}
                  {showError && (
                    <XCircle size={18} className="text-[var(--color-error)]" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
