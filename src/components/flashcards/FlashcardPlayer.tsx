"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, RotateCcw, ArrowRight, ArrowLeft, Check, Sparkles,
  BookOpen, Bookmark, Award, Clock, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  FlashcardItem,
  rateFlashcard,
  isWordSavedInMyWords,
  saveWordToMyWords,
  removeWordFromMyWords,
} from "@/lib/flashcardService";
import { getPreviewIntervals, ReviewRating } from "@/lib/sm2";
import { playClickSound, playSuccessChime, playCompletionFanfare } from "@/lib/soundEffects";

interface FlashcardPlayerProps {
  deckTitle: string;
  deckId: string;
  cards: FlashcardItem[];
  onExit?: () => void;
  onFinish?: (reviewedCount: number, xpEarned: number) => void;
}

export function FlashcardPlayer({
  deckTitle,
  deckId,
  cards,
  onExit,
  onFinish,
}: FlashcardPlayerProps) {
  const [queue, setQueue] = useState<FlashcardItem[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCard = queue[currentIndex];

  // Reset flip when advancing card
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  // Pronounce German text via native Web Speech API
  const speakGerman = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    playClickSound();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.88;

    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  // Handle rating button click
  const handleRate = useCallback(
    (rating: ReviewRating) => {
      if (!currentCard) return;

      playClickSound();
      rateFlashcard(currentCard.id, rating);

      const nextReviewed = reviewedCount + 1;
      const nextXp = xpEarned + (rating === "again" ? 2 : rating === "hard" ? 4 : 6);
      setReviewedCount(nextReviewed);
      setXpEarned(nextXp);

      if (rating === "again") {
        // Re-queue card to end of current review session for immediate repetition
        setQueue((prev) => [...prev, currentCard]);
      }

      if (currentIndex < queue.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // Finished queue!
        playCompletionFanfare();
        setIsCompleted(true);
        onFinish?.(nextReviewed, nextXp);
      }
    },
    [currentCard, currentIndex, queue, reviewedCount, xpEarned, onFinish]
  );

  // Global Keyboard listener: Space to flip, 1-4 to rate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or Enter flips card
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((f) => !f);
        return;
      }

      // Audio shortcut: 'a' or 's'
      if (e.key === "a" || e.key === "A" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        if (currentCard) {
          const phrase = currentCard.article
            ? `${currentCard.article} ${currentCard.german}`
            : currentCard.german;
          speakGerman(phrase);
        }
        return;
      }

      // Only allow 1-4 rating after flipping
      if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRate("again");
        } else if (e.key === "2") {
          e.preventDefault();
          handleRate("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          handleRate("good");
        } else if (e.key === "4") {
          e.preventDefault();
          handleRate("easy");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, currentCard, handleRate, speakGerman]);

  // Handle toggle "My Words" bookmark
  const isSavedInMyWords = currentCard ? isWordSavedInMyWords(currentCard.german) : false;
  const toggleSaveWord = () => {
    if (!currentCard) return;
    playClickSound();

    if (isSavedInMyWords) {
      removeWordFromMyWords(currentCard.german);
    } else {
      saveWordToMyWords({
        id: currentCard.id,
        german: currentCard.german,
        english: currentCard.english,
        article: currentCard.article,
        plural: currentCard.plural,
        ipa: currentCard.ipa,
        partOfSpeech: currentCard.partOfSpeech as any,
        exampleDe: currentCard.exampleDe,
        exampleEn: currentCard.exampleEn,
        grammarNote: currentCard.grammarNote,
      });
    }
  };

  // Preview intervals for current card
  const previewIntervals = currentCard
    ? getPreviewIntervals(currentCard.srsState)
    : { again: "1d", hard: "2d", good: "6d", easy: "10d" };

  // Completion summary screen
  if (isCompleted || queue.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] text-center relative overflow-hidden space-y-6"
        >
          <div className="h-1.5 w-full tricolor-stripe absolute top-0 left-0 right-0" />

          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent-500)] text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <Award size={40} />
          </div>

          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              Deck Review Complete!
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Hervorragend! You reinforced your memory using SM-2 spaced repetition.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <span className="font-heading text-2xl font-bold text-[var(--color-accent-400)]">
                +{xpEarned}
              </span>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                XP Earned
              </p>
            </div>

            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <span className="font-heading text-2xl font-bold text-[var(--color-success)]">
                {reviewedCount}
              </span>
              <p className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                Cards Reviewed
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight size={16} />}>
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/flashcards">
              <Button variant="secondary" size="md" className="w-full">
                Choose Another Deck
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const progressPct = queue.length > 0 ? Math.round(((currentIndex) / queue.length) * 100) : 0;

  // Article styling
  const articleBadge =
    currentCard.article === "der" ? (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30">
        der · Maskulin
      </span>
    ) : currentCard.article === "die" ? (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30">
        die · Feminin
      </span>
    ) : currentCard.article === "das" ? (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
        das · Neutrum
      </span>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header Controls & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onExit ? (
              <button
                type="button"
                onClick={onExit}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                title="Exit Deck"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <Link
                href="/flashcards"
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                title="Back to Decks"
              >
                <ArrowLeft size={16} />
              </Link>
            )}

            <div>
              <h1 className="font-heading text-sm font-bold text-[var(--color-text-primary)] truncate max-w-[200px] sm:max-w-sm">
                {deckTitle}
              </h1>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Card {currentIndex + 1} of {queue.length}
              </p>
            </div>
          </div>

          {/* Bookmark "My Words" toggle */}
          <button
            type="button"
            onClick={toggleSaveWord}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              isSavedInMyWords
                ? "bg-[var(--color-accent-500)]/15 border-[var(--color-accent-500)] text-[var(--color-accent-400)]"
                : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
            title={isSavedInMyWords ? "Remove from My Words" : "Save to My Words"}
          >
            <Bookmark size={13} className={isSavedInMyWords ? "fill-current" : ""} />
            <span>{isSavedInMyWords ? "Saved" : "Save Word"}</span>
          </button>
        </div>

        {/* Progress Bar */}
        <ProgressBar value={progressPct} color="brand" size="sm" />
      </div>

      {/* 3D FLIP FLASHCARD CONTAINER */}
      <div
        className="relative w-full h-[380px] sm:h-[400px] cursor-pointer select-none [perspective:1000px]"
        onClick={() => setIsFlipped((f) => !f)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full h-full relative [transform-style:preserve-3d]"
        >
          {/* FRONT SIDE (German Stimulus) */}
          <div className="absolute inset-0 w-full h-full rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] p-8 flex flex-col justify-between [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                German Word · Vorderseite
              </span>

              {/* Audio button (Front) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const phrase = currentCard.article
                    ? `${currentCard.article} ${currentCard.german}`
                    : currentCard.german;
                  speakGerman(phrase);
                }}
                className={`w-11 h-11 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isPlayingAudio
                    ? "bg-[var(--color-brand-500)] text-white scale-110 shadow-lg animate-pulse"
                    : "bg-[var(--color-surface-2)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/20 hover:scale-105 border border-[var(--color-border)] shadow-sm"
                }`}
                title="Play Audio (Press A)"
              >
                <Volume2 size={18} />
              </button>
            </div>

            {/* Main Word Display */}
            <div className="text-center my-auto space-y-3">
              <div className="flex justify-center">{articleBadge}</div>

              <h2 className="font-heading text-4xl sm:text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                {currentCard.german}
              </h2>

              {currentCard.ipa && (
                <div className="inline-block px-2.5 py-1 rounded-md bg-[var(--color-surface-2)] text-xs text-[var(--color-text-secondary)] font-mono border border-[var(--color-border)]/60">
                  {currentCard.ipa}
                </div>
              )}
            </div>

            {/* Bottom Flip Hint */}
            <div className="text-center pt-4 border-t border-[var(--color-border)]/50 text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1.5">
              <RotateCcw size={13} />
              <span>Click card or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border text-[10px] font-mono">Space</kbd> to flip</span>
            </div>
          </div>

          {/* BACK SIDE (English Meaning & Sentence Breakdown) */}
          <div className="absolute inset-0 w-full h-full rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-400)]">
                Bedeutung & Kontext · Meaning
              </span>

              {/* Audio button (Back) */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakGerman(currentCard.exampleDe);
                }}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/20 flex items-center justify-center border border-[var(--color-border)] transition-colors cursor-pointer"
                title="Listen to example sentence"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div className="my-auto space-y-4">
              {/* Meaning */}
              <div className="text-center space-y-1">
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                  {currentCard.english}
                </h3>
                {currentCard.plural && (
                  <p className="text-xs text-[var(--color-text-muted)] font-mono">
                    Plural: {currentCard.plural}
                  </p>
                )}
              </div>

              {/* Example Sentence Box */}
              <div className="p-3.5 sm:p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                  &ldquo;{currentCard.exampleDe}&rdquo;
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] italic">
                  {currentCard.exampleEn}
                </p>
              </div>

              {/* Grammar Note */}
              {currentCard.grammarNote && (
                <div className="text-[11px] text-amber-400/90 flex items-start gap-1.5 px-1">
                  <span className="shrink-0">💡</span>
                  <p className="leading-relaxed">
                    <strong className="text-amber-300">Note:</strong> {currentCard.grammarNote}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-[11px] text-[var(--color-text-muted)]">
              Rate your recall below to set the SM-2 interval
            </div>
          </div>
        </motion.div>
      </div>

      {/* SM-2 RATING CONTROLS (AGAIN / HARD / GOOD / EASY) */}
      <AnimatePresence mode="wait">
        {isFlipped ? (
          <motion.div
            key="ratings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-4 gap-1.5 sm:gap-3"
          >
            {/* Again */}
            <button
              type="button"
              onClick={() => handleRate("again")}
              className="p-2 sm:p-3.5 min-h-[52px] rounded-[var(--radius-xl)] border-2 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-center transition-all cursor-pointer shadow-xs active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="text-[10px] font-mono opacity-80 mb-0.5">1</span>
              <span className="font-heading text-xs sm:text-sm font-bold">Again</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">
                {previewIntervals.again}
              </span>
            </button>

            {/* Hard */}
            <button
              type="button"
              onClick={() => handleRate("hard")}
              className="p-3 sm:p-3.5 rounded-[var(--radius-xl)] border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-center transition-all cursor-pointer shadow-xs active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="text-[10px] font-mono opacity-80 mb-0.5">2</span>
              <span className="font-heading text-xs sm:text-sm font-bold">Hard</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">
                {previewIntervals.hard}
              </span>
            </button>

            {/* Good */}
            <button
              type="button"
              onClick={() => handleRate("good")}
              className="p-3 sm:p-3.5 rounded-[var(--radius-xl)] border-2 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-center transition-all cursor-pointer shadow-xs active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="text-[10px] font-mono opacity-80 mb-0.5">3</span>
              <span className="font-heading text-xs sm:text-sm font-bold">Good</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">
                {previewIntervals.good}
              </span>
            </button>

            {/* Easy */}
            <button
              type="button"
              onClick={() => handleRate("easy")}
              className="p-3 sm:p-3.5 rounded-[var(--radius-xl)] border-2 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-center transition-all cursor-pointer shadow-xs active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="text-[10px] font-mono opacity-80 mb-0.5">4</span>
              <span className="font-heading text-xs sm:text-sm font-bold">Easy</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5">
                {previewIntervals.easy}
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="flip-action"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsFlipped(true)}
              rightIcon={<RotateCcw size={16} />}
              className="w-full max-w-sm shadow-[var(--shadow-glow)]"
            >
              Flip to Show Meaning (Space ␣)
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
