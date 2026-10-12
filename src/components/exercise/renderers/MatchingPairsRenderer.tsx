"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { MatchingPairsExercise } from "@/types/exercise.types";
import { playSuccessChime, playErrorBuzzer, playClickSound } from "@/lib/soundEffects";

interface MatchingPairsRendererProps {
  exercise: MatchingPairsExercise;
  userAnswer: Record<string, string>; // germanId -> englishId matched
  onAnswerChange: (matches: Record<string, string>) => void;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  disabled?: boolean;
}

export function MatchingPairsRenderer({
  exercise,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  disabled = false,
}: MatchingPairsRendererProps) {
  const [selectedGermanId, setSelectedGermanId] = useState<string | null>(null);
  const [selectedEnglishId, setSelectedEnglishId] = useState<string | null>(null);
  const [shuffledEnglish, setShuffledEnglish] = useState<
    { id: string; english: string; pairId: string }[]
  >([]);
  const [mismatchPair, setMismatchPair] = useState<{
    germanId: string;
    englishId: string;
  } | null>(null);

  // Shuffle English column once on mount so it's not identical order
  useEffect(() => {
    const list = exercise.pairs.map((p) => ({
      id: "en_" + p.id,
      pairId: p.id,
      english: p.english,
    }));
    // deterministic seeded or random shuffle
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setShuffledEnglish(shuffled);
  }, [exercise.pairs]);

  // Handle German card selection
  const handleSelectGerman = (germanPairId: string) => {
    if (disabled || isSubmitted || userAnswer[germanPairId]) return;
    playClickSound();

    if (selectedEnglishId) {
      attemptMatch(germanPairId, selectedEnglishId);
    } else {
      setSelectedGermanId((prev) => (prev === germanPairId ? null : germanPairId));
    }
  };

  // Handle English card selection
  const handleSelectEnglish = (englishPairId: string) => {
    if (
      disabled ||
      isSubmitted ||
      Object.values(userAnswer).includes(englishPairId)
    )
      return;
    playClickSound();

    if (selectedGermanId) {
      attemptMatch(selectedGermanId, englishPairId);
    } else {
      setSelectedEnglishId((prev) => (prev === englishPairId ? null : englishPairId));
    }
  };

  const attemptMatch = (germanId: string, englishPairId: string) => {
    if (germanId === englishPairId) {
      // Correct Match!
      playSuccessChime();
      const next = { ...userAnswer, [germanId]: englishPairId };
      onAnswerChange(next);
      setSelectedGermanId(null);
      setSelectedEnglishId(null);
      setMismatchPair(null);
    } else {
      // Mismatch
      playErrorBuzzer();
      setMismatchPair({ germanId, englishId: englishPairId });
      setTimeout(() => {
        setMismatchPair(null);
        setSelectedGermanId(null);
        setSelectedEnglishId(null);
      }, 700);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] font-medium px-2">
        <span>German Expressions</span>
        <span>English Translations</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Left Column: German Terms */}
        <div className="space-y-2.5">
          {exercise.pairs.map((pair) => {
            const isMatched = Boolean(userAnswer[pair.id]);
            const isSelected = selectedGermanId === pair.id;
            const isMismatch = mismatchPair?.germanId === pair.id;

            return (
              <motion.button
                key={pair.id}
                type="button"
                disabled={disabled || isSubmitted || isMatched}
                onClick={() => handleSelectGerman(pair.id)}
                whileHover={!isMatched && !isSubmitted ? { scale: 1.02 } : {}}
                whileTap={!isMatched && !isSubmitted ? { scale: 0.98 } : {}}
                className={`w-full p-3.5 sm:p-4 rounded-[var(--radius-xl)] border text-left font-medium text-sm sm:text-base transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isMatched
                    ? "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)] opacity-90 cursor-default"
                    : isMismatch
                    ? "bg-[var(--color-error)]/20 border-[var(--color-error)] text-[var(--color-error)] animate-shake"
                    : isSelected
                    ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)] text-[var(--color-brand-400)] shadow-[var(--shadow-glow)] scale-[1.02]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] shadow-xs"
                }`}
              >
                <span>{pair.german}</span>
                {isMatched && <Check size={16} className="text-[var(--color-success)] shrink-0" />}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column: English Translations */}
        <div className="space-y-2.5">
          {shuffledEnglish.map((item) => {
            const isMatched = Object.values(userAnswer).includes(item.pairId);
            const isSelected = selectedEnglishId === item.pairId;
            const isMismatch = mismatchPair?.englishId === item.pairId;

            return (
              <motion.button
                key={item.id}
                type="button"
                disabled={disabled || isSubmitted || isMatched}
                onClick={() => handleSelectEnglish(item.pairId)}
                whileHover={!isMatched && !isSubmitted ? { scale: 1.02 } : {}}
                whileTap={!isMatched && !isSubmitted ? { scale: 0.98 } : {}}
                className={`w-full p-3.5 sm:p-4 rounded-[var(--radius-xl)] border text-left font-medium text-sm sm:text-base transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isMatched
                    ? "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)] opacity-90 cursor-default"
                    : isMismatch
                    ? "bg-[var(--color-error)]/20 border-[var(--color-error)] text-[var(--color-error)] animate-shake"
                    : isSelected
                    ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)] text-[var(--color-brand-400)] shadow-[var(--shadow-glow)] scale-[1.02]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] shadow-xs"
                }`}
              >
                <span>{item.english}</span>
                {isMatched && <Check size={16} className="text-[var(--color-success)] shrink-0" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {Object.keys(userAnswer).length === exercise.pairs.length && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2 text-xs font-semibold text-[var(--color-success)] flex items-center justify-center gap-1.5"
        >
          <Sparkles size={14} /> All pairs successfully matched! Click Check Answer below.
        </motion.div>
      )}
    </div>
  );
}
