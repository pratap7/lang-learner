"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Flame, Sparkles, CheckCircle2, XCircle, ArrowRight,
  RotateCcw, Award, ShieldAlert, ArrowLeft, Lightbulb, Check, Volume2,
  Maximize2, Minimize2, Bookmark, Clock, CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { TapToTranslateText } from "@/components/ui/TapToTranslateText";
import { Exercise, SessionStats } from "@/types/exercise.types";
import {
  playSuccessChime,
  playErrorBuzzer,
  playHeartLostSound,
  playCompletionFanfare,
  playClickSound,
  triggerHaptic,
} from "@/lib/soundEffects";
import { recordMistake } from "@/lib/mistakesService";
import { saveWordToMyWords, isWordSavedInMyWords } from "@/lib/flashcardService";
import { appCopy } from "@/lib/appCopy";
import { useAccessibility } from "@/lib/accessibility/AccessibilityContext";
import { useI18n } from "@/lib/i18n/I18nContext";
import { AccessibilitySettingsModal } from "@/components/ui/AccessibilitySettingsModal";
import { Sliders } from "lucide-react";

// Renderers
import { MultipleChoiceRenderer } from "./renderers/MultipleChoiceRenderer";
import { FillInTheBlankRenderer } from "./renderers/FillInTheBlankRenderer";
import { MatchingPairsRenderer } from "./renderers/MatchingPairsRenderer";
import { SentenceReorderingRenderer } from "./renderers/SentenceReorderingRenderer";
import { TranslationRenderer } from "./renderers/TranslationRenderer";
import { ListeningRenderer } from "./renderers/ListeningRenderer";
import { SpeakingRenderer } from "./renderers/SpeakingRenderer";
import { ArticleSelectionRenderer } from "./renderers/ArticleSelectionRenderer";
import { WritingTaskRenderer } from "./renderers/WritingTaskRenderer";

interface ExerciseEngineProps {
  exercises: Exercise[];
  title?: string;
  onComplete?: (stats: SessionStats) => void;
  onExit?: () => void;
  maxHearts?: number;
  allowInfiniteHearts?: boolean;
}

export function ExerciseEngine({
  exercises,
  title = "German Practice Session",
  onComplete,
  onExit,
  maxHearts = 5,
  allowInfiniteHearts = false,
}: ExerciseEngineProps) {
  const { addToast } = useToast();

  // Session queue & index
  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User Answer state for current exercise
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Gamification & Lives
  const [hearts, setHearts] = useState(maxHearts);
  const [xpEarned, setXpEarned] = useState(0);
  const [streakCount, setStreakCount] = useState(5);
  const [missedExercises, setMissedExercises] = useState<Exercise[]>([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isRetryRound, setIsRetryRound] = useState(false);

  // Audio Controls: Normal (1.0x) vs Slow (0.75x)
  const [isSlowAudio, setIsSlowAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Fullscreen distraction-free state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Accessibility & Internationalisation
  const { announce, captionsEnabled } = useAccessibility();
  const { t, isRtl } = useI18n();
  const [showA11yModal, setShowA11yModal] = useState(false);

  // Timer & Stats
  const [startTime] = useState<number>(Date.now());
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const currentExercise = queue[currentIndex];

  /* ─────────────────────────────────────────────────────────────────────────────
     AUTO-SAVE & RESUME SESSION (Within 24h)
  ───────────────────────────────────────────────────────────────────────────── */
  const storageKey = useMemo(
    () => `deutschpfad_exercise_resume_${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    [title]
  );

  // Restore on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        const isFresh = Date.now() - saved.savedAt < 86400000;
        if (isFresh && saved.currentIndex > 0 && saved.currentIndex < queue.length) {
          setCurrentIndex(saved.currentIndex);
          setXpEarned(saved.xpEarned || 0);
          setHearts(saved.hearts || maxHearts);
          addToast({
            type: "info",
            title: "Session Resumed",
            message: `Continuing from exercise ${saved.currentIndex + 1} of ${queue.length}.`,
          });
        }
      }
    } catch {}
  }, []);

  // Save on state change
  useEffect(() => {
    if (typeof window === "undefined" || isSessionComplete) return;
    try {
      if (currentIndex > 0) {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            currentIndex,
            xpEarned,
            hearts,
            savedAt: Date.now(),
          })
        );
      }
    } catch {}
  }, [currentIndex, xpEarned, hearts, isSessionComplete, storageKey]);

  // Clear when completed
  useEffect(() => {
    if (isSessionComplete && typeof window !== "undefined") {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  }, [isSessionComplete, storageKey]);

  // Reset answer when current exercise changes
  useEffect(() => {
    if (!currentExercise) return;
    setIsSubmitted(false);
    setIsCorrect(null);

    switch (currentExercise.type) {
      case "matching_pairs":
        setCurrentAnswer({});
        break;
      case "sentence_reordering":
        setCurrentAnswer([]);
        break;
      default:
        setCurrentAnswer(null);
    }
  }, [currentExercise]);

  /* ─────────────────────────────────────────────────────────────────────────────
     AUDIO REPLAY CONTROLLER WITH NORMAL / SLOW SPEED TOGGLE
  ───────────────────────────────────────────────────────────────────────────── */
  const playCurrentAudio = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const exAny = currentExercise as any;
    const textToSpeak =
      exAny?.targetPhrase ||
      (currentExercise?.type === "sentence_reordering" ? currentExercise.correctSentence : null) ||
      (currentExercise?.type === "article_selection" ? `${currentExercise.correctArticle} ${currentExercise.noun}` : null) ||
      currentExercise?.prompt ||
      "";

    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "de-DE";
    utterance.rate = isSlowAudio ? 0.72 : 0.95;

    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  }, [currentExercise, isSlowAudio]);

  const toggleSlowAudio = () => {
    triggerHaptic("selection");
    playClickSound();
    setIsSlowAudio((prev) => !prev);
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     FULLSCREEN DISTRACTION-FREE TOGGLE
  ───────────────────────────────────────────────────────────────────────────── */
  const toggleFullscreen = () => {
    triggerHaptic("selection");
    playClickSound();

    if (typeof document !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Answer validation evaluator
  const evaluateAnswer = useCallback((): { isCorrect: boolean; correctRepresentation: any } => {
    if (!currentExercise) return { isCorrect: false, correctRepresentation: "" };

    switch (currentExercise.type) {
      case "multiple_choice": {
        const correctOpt = currentExercise.options.find((o) => o.isCorrect);
        const passed = currentAnswer === correctOpt?.id;
        return { isCorrect: passed, correctRepresentation: correctOpt?.text };
      }

      case "fill_in_the_blank": {
        const target = currentExercise.correctAnswer;
        const userClean = (currentAnswer || "").toString().trim().toLowerCase();
        let passed = false;
        if (Array.isArray(target)) {
          passed = target.some((t) => t.trim().toLowerCase() === userClean);
        } else {
          passed = target.trim().toLowerCase() === userClean;
        }
        return { isCorrect: passed, correctRepresentation: Array.isArray(target) ? target[0] : target };
      }

      case "matching_pairs": {
        const targetCount = currentExercise.pairs.length;
        const matches = currentAnswer || {};
        const isAllMatched = Object.keys(matches).length === targetCount;
        return { isCorrect: isAllMatched, correctRepresentation: "All matched pairs" };
      }

      case "sentence_reordering": {
        const userSentence = (currentAnswer as string[] || []).join(" ").trim().toLowerCase();
        const targetSentence = currentExercise.correctSentence.trim().toLowerCase();
        const passed = userSentence === targetSentence;
        return { isCorrect: passed, correctRepresentation: currentExercise.correctSentence };
      }

      case "translation": {
        const userClean = (currentAnswer || "")
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[.,!?;:]/g, "");
        const passed = currentExercise.acceptedTranslations.some((acc) =>
          acc.trim().toLowerCase().replace(/[.,!?;:]/g, "") === userClean
        );
        return { isCorrect: passed, correctRepresentation: currentExercise.acceptedTranslations[0] };
      }

      case "listening": {
        const correctOpt = currentExercise.options.find((o) => o.isCorrect);
        const passed = currentAnswer === correctOpt?.id;
        return { isCorrect: passed, correctRepresentation: correctOpt?.text };
      }

      case "speaking": {
        const minAcc = currentExercise.minimumAccuracyPct || 70;
        const score = currentAnswer?.score ?? 0;
        const passed = score >= minAcc;
        return { isCorrect: passed, correctRepresentation: currentExercise.targetPhrase };
      }

      case "article_selection": {
        const passed = currentAnswer === currentExercise.correctArticle;
        return { isCorrect: passed, correctRepresentation: `${currentExercise.correctArticle} ${currentExercise.noun}` };
      }

      case "writing_task": {
        const text = (currentAnswer || "").toString().trim();
        const words = text ? text.split(/\s+/) : [];
        const minWords = currentExercise.targetWordCount?.min || 8;
        const meetsWordCount = words.length >= minWords;
        const meetsKeywords = currentExercise.requiredKeywords
          ? currentExercise.requiredKeywords.every((kw) => text.toLowerCase().includes(kw.toLowerCase()))
          : true;
        const passed = meetsWordCount && meetsKeywords;
        return { isCorrect: passed, correctRepresentation: currentExercise.sampleModelAnswer };
      }

      default:
        return { isCorrect: false, correctRepresentation: "" };
    }
  }, [currentExercise, currentAnswer]);

  // Check Answer Handler (Responds in <100ms)
  const handleCheck = () => {
    if (!currentExercise || isSubmitted) return;

    if (
      currentAnswer === null ||
      currentAnswer === undefined ||
      currentAnswer === "" ||
      (Array.isArray(currentAnswer) && currentAnswer.length === 0) ||
      (typeof currentAnswer === "object" && Object.keys(currentAnswer).length === 0)
    ) {
      return;
    }

    const { isCorrect: passed, correctRepresentation } = evaluateAnswer();
    setIsSubmitted(true);
    setIsCorrect(passed);
    setTotalAnswered((c) => c + 1);

    if (passed) {
      triggerHaptic("success");
      playSuccessChime();
      setTotalCorrect((c) => c + 1);
      setXpEarned((prev) => prev + currentExercise.xpReward);
      announce(`Correct! ${currentExercise.explanation || ""}`, "assertive");
    } else {
      triggerHaptic("error");
      playErrorBuzzer();
      announce(
        `Not quite. Correct answer: ${correctRepresentation}. ${currentExercise.explanation || ""}`,
        "assertive"
      );
      if (!allowInfiniteHearts) {
        setHearts((h) => {
          const next = Math.max(0, h - 1);
          playHeartLostSound();
          return next;
        });
      }

      setMissedExercises((prev) => {
        if (!prev.some((e) => e.id === currentExercise.id)) {
          return [...prev, currentExercise];
        }
        return prev;
      });

      recordMistake(currentExercise, currentAnswer, correctRepresentation);
    }
  };

  // Continue to Next Exercise
  const handleContinue = () => {
    playClickSound();

    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      playCompletionFanfare();
      setIsSessionComplete(true);

      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      const acc = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;

      onComplete?.({
        totalQuestions: totalAnswered,
        correctCount: totalCorrect,
        incorrectCount: totalAnswered - totalCorrect,
        xpEarned,
        heartsRemaining: hearts,
        accuracyPct: acc,
        timeSpentSeconds: elapsedSec,
        streakIncremented: true,
      });
    }
  };

  const handleStartRetryRound = () => {
    if (missedExercises.length === 0) return;
    setQueue(missedExercises);
    setCurrentIndex(0);
    setMissedExercises([]);
    setIsSessionComplete(false);
    setIsRetryRound(true);
    setHearts(maxHearts);
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     GLOBAL KEYBOARD SHORTCUTS: 1, 2, 3, 4, Enter, R, S, F
  ───────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when focusing in text input
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Enter key: Check or Continue
      if (e.key === "Enter") {
        e.preventDefault();
        if (isSubmitted) {
          handleContinue();
        } else {
          handleCheck();
        }
        return;
      }

      // Replay Audio: R
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        playCurrentAudio();
        return;
      }

      // Toggle Slow Audio: S
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        toggleSlowAudio();
        return;
      }

      // Fullscreen: F
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Number keys 1-4 for Multiple Choice, Listening & Article Selection
      if (["1", "2", "3", "4"].includes(e.key) && !isSubmitted && currentExercise) {
        const optionIndex = parseInt(e.key) - 1;

        if (currentExercise.type === "multiple_choice" || currentExercise.type === "listening") {
          const opt = currentExercise.options?.[optionIndex];
          if (opt) {
            e.preventDefault();
            playClickSound();
            setCurrentAnswer(opt.id);
          }
        } else if (currentExercise.type === "article_selection") {
          const articles = ["der", "die", "das"];
          const art = articles[optionIndex];
          if (art) {
            e.preventDefault();
            playClickSound();
            setCurrentAnswer(art);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitted, currentAnswer, currentExercise, isSlowAudio]);

  const progressPct = queue.length > 0 ? Math.round((currentIndex / queue.length) * 100) : 0;
  const isAnswerProvided =
    currentAnswer !== null &&
    currentAnswer !== undefined &&
    currentAnswer !== "" &&
    (!Array.isArray(currentAnswer) || currentAnswer.length > 0) &&
    (typeof currentAnswer !== "object" || Object.keys(currentAnswer).length > 0);

  /* ─────────────────────────────────────────────────────────────────────────────
     END-OF-LESSON SUMMARY SCREEN (XP, ACCURACY, WORDS LEARNED, REVIEW SHORTCUT)
  ───────────────────────────────────────────────────────────────────────────── */
  if (isSessionComplete) {
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 100;
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    const elapsedMinutes = Math.floor(elapsedSec / 60);
    const elapsedRemainderSec = elapsedSec % 60;
    const formattedDuration = `${elapsedMinutes}m ${elapsedRemainderSec < 10 ? "0" : ""}${elapsedRemainderSec}s`;

    // Extract target vocabulary encountered in this session
    const wordsEncountered = queue
      .map((ex) => {
        if (ex.type === "article_selection") {
          return { german: `${ex.correctArticle} ${ex.noun}`, english: ex.translationEn || ex.noun };
        }
        const exAny = ex as any;
        if (exAny.targetPhrase) {
          return { german: exAny.targetPhrase, english: ex.prompt };
        }
        return null;
      })
      .filter(Boolean) as { german: string; english: string }[];

    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full p-6 sm:p-8 rounded-[var(--radius-3xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-2xl)] text-center relative overflow-hidden space-y-6"
        >
          <div className="h-1.5 w-full tricolor-stripe absolute top-0 left-0 right-0" />

          {/* Trophy Header */}
          <div className="space-y-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] text-white flex items-center justify-center mx-auto shadow-xl animate-bounce">
              <Award size={42} />
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              Session Complete!
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
              Grossartig! You completed this interactive High German workout with flying colors.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <div className="flex items-center justify-center gap-1 text-[var(--color-accent-500)] font-heading text-xl font-bold">
                <Sparkles size={16} />
                <span>+{xpEarned}</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5">XP Earned</p>
            </div>

            <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <div className="flex items-center justify-center gap-1 text-[var(--color-success)] font-heading text-xl font-bold">
                <CheckCircle2 size={16} />
                <span>{accuracy}%</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5">Accuracy</p>
            </div>

            <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <div className="flex items-center justify-center gap-1 text-[var(--color-brand-400)] font-heading text-xl font-bold">
                <Clock size={16} />
                <span>{formattedDuration}</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5">Time Spent</p>
            </div>
          </div>

          {/* New Words / Key Vocabulary Encountered Strip */}
          {wordsEncountered.length > 0 && (
            <div className="text-left space-y-2 p-4 rounded-[var(--radius-2xl)] bg-[var(--color-surface-2)]/70 border border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-primary)]">
                  Key Words Encountered ({wordsEncountered.length})
                </span>
                <span className="text-[10px] text-[var(--color-text-muted)]">Tap to hear audio</span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {wordsEncountered.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-1">
                      <p className="font-bold text-[var(--color-text-primary)] truncate">{w.german}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{w.english}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined" && "speechSynthesis" in window) {
                          const utt = new SpeechSynthesisUtterance(w.german);
                          utt.lang = "de-DE";
                          window.speechSynthesis.speak(utt);
                        }
                      }}
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] shrink-0 cursor-pointer"
                      title="Listen pronunciation"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Targeted Mistake Review Option */}
          {missedExercises.length > 0 && (
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-error)]">
                <ShieldAlert size={15} />
                <span>{missedExercises.length} Weak Spots Recorded</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                Reviewing mistakes immediately after practice boosts long-term neurological retention.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartRetryRound}
                leftIcon={<RotateCcw size={13} />}
                className="w-full text-xs font-semibold mt-1"
              >
                {appCopy.buttons.retryMissed(missedExercises.length)}
              </Button>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <Link href="/courses/a1">
              <Button
                variant="primary"
                size="xl"
                fullWidth
                rightIcon={<ArrowRight size={18} />}
                className="shadow-[var(--shadow-glow)] min-h-[50px]"
              >
                {appCopy.buttons.continueRoadmap}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => {
                setQueue(exercises);
                setCurrentIndex(0);
                setMissedExercises([]);
                setIsSessionComplete(false);
                setHearts(maxHearts);
              }}
              className="text-xs text-[var(--color-text-muted)]"
            >
              {appCopy.buttons.practiceAgain}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     ACTIVE EXERCISE ENGINE SHELL (DISTRACTION-FREE FULL-SCREEN PLAYER)
  ───────────────────────────────────────────────────────────────────────────── */
  return (
    <div className={`min-h-screen bg-[var(--color-bg)] flex flex-col justify-between pb-36 ${isFullscreen ? "fixed inset-0 z-50 overflow-y-auto" : ""}`}>
      {/* ─── STICKY HEADER WITH PROGRESS BAR & CONTROLS ─── */}
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Exit + Title */}
          <div className="flex items-center gap-3">
            {onExit ? (
              <button
                type="button"
                onClick={onExit}
                className="w-9 h-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                title="Exit Practice (Progress is Auto-Saved)"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <Link
                href="/courses"
                className="w-9 h-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                title="Back to Courses"
              >
                <ArrowLeft size={16} />
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Badge variant={currentExercise?.level || "a1"} size="xs">
                {currentExercise?.level.toUpperCase()}
              </Badge>
              <span className="text-xs font-bold text-[var(--color-text-primary)] truncate max-w-[150px] sm:max-w-xs">
                {title} {isRetryRound && "· (Review Round)"}
              </span>
            </div>
          </div>

          {/* Center: Sticky Progress Bar */}
          <div
            className="hidden sm:block flex-1 max-w-xs mx-4"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Session progress: ${progressPct}%`}
          >
            <ProgressBar value={progressPct} color="brand" size="sm" />
          </div>

          {/* Right: Audio Controls, Fullscreen, A11y, Hearts, XP */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Speed Toggle (Normal vs Slow 0.75x) */}
            <button
              type="button"
              onClick={toggleSlowAudio}
              className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isSlowAudio
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
              title="Toggle Slow Audio (Hotkey: S)"
              aria-label="Toggle Slow Audio (Hotkey: S)"
            >
              <span>🐢</span>
              <span className="hidden sm:inline font-mono">{isSlowAudio ? "0.75x" : "1.0x"}</span>
            </button>

            {/* Replay Audio Prompt Button */}
            <button
              type="button"
              onClick={playCurrentAudio}
              className={`w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-400)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer ${
                isPlayingAudio ? "scale-110 border-[var(--color-brand-500)] animate-pulse" : ""
              }`}
              title="Replay Audio (Hotkey: R)"
              aria-label="Replay Audio (Hotkey: R)"
            >
              <Volume2 size={15} />
            </button>

            {/* Fullscreen Player Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:flex w-8 h-8 rounded-full border border-[var(--color-border)] items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
              title="Toggle Fullscreen Distraction-Free (Hotkey: F)"
              aria-label="Toggle Fullscreen Distraction-Free (Hotkey: F)"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            {/* Accessibility & Language Preferences Toggle */}
            <button
              type="button"
              onClick={() => setShowA11yModal(true)}
              className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
              title="Accessibility & Language Preferences"
              aria-label="Accessibility & Language Preferences"
            >
              <Sliders size={14} />
            </button>

            {/* Hearts */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${
                hearts > 1
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                  : "bg-rose-500/20 border-rose-500 text-rose-600 animate-pulse"
              }`}
              aria-label={`Hearts remaining: ${allowInfiniteHearts ? "Unlimited" : hearts}`}
            >
              <Heart size={13} className="fill-current" />
              <span>{allowInfiniteHearts ? "∞" : hearts}</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-accent-500)]/10 border border-[var(--color-accent-500)]/30 text-xs font-bold text-[var(--color-accent-500)]">
              <Sparkles size={12} />
              <span>{xpEarned}</span>
            </div>
          </div>
        </div>

        {/* Mobile sticky progress bar strip */}
        <div className="sm:hidden h-1 w-full bg-[var(--color-surface-2)]">
          <div
            className="h-full bg-[var(--color-brand-500)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* ─── MAIN EXERCISE CONTENT AREA WITH SMOOTH STEP TRANSITIONS ─── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentExercise && (
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Prompt Header with Tap-to-Translate */}
              <div className="text-center space-y-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <span>{currentExercise.type.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>+{currentExercise.xpReward} XP</span>
                </div>

                <div className="pt-1">
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-[var(--color-text-primary)] max-w-xl mx-auto leading-snug">
                    <TapToTranslateText
                      text={currentExercise.prompt}
                      audioPlaybackRate={isSlowAudio ? 0.72 : 0.95}
                    />
                  </h2>
                </div>

                {currentExercise.grammarTip && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-400)] bg-[var(--color-accent-500)]/10 border border-[var(--color-accent-500)]/20 px-3 py-1 rounded-full">
                    <Lightbulb size={13} />
                    <span>Tip: {currentExercise.grammarTip}</span>
                  </div>
                )}
              </div>

              {/* WCAG Audio Transcript & Live Captions */}
              {captionsEnabled && (
                <div
                  role="region"
                  aria-label="Audio transcript and captions"
                  className="mb-4 p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/90 border border-[var(--color-border)] max-w-xl mx-auto text-start space-y-1 shadow-xs"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-brand-400)] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Volume2 size={13} />
                      Audio Caption / Transcript
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] lowercase font-mono">
                      {isSlowAudio ? "0.75x slow" : "1.0x normal"}
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-[var(--color-text-primary)]">
                    &ldquo;{currentExercise.type === "listening" ? (currentExercise as any).targetSentence || (currentExercise as any).audioPromptText || currentExercise.prompt : currentExercise.prompt}&rdquo;
                  </p>
                </div>
              )}

              {/* Dynamic Exercise Renderers */}
              <div className="py-2">
                {currentExercise.type === "multiple_choice" && (
                  <MultipleChoiceRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "fill_in_the_blank" && (
                  <FillInTheBlankRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer || ""}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "matching_pairs" && (
                  <MatchingPairsRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer || {}}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "sentence_reordering" && (
                  <SentenceReorderingRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer || []}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "translation" && (
                  <TranslationRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer || ""}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "listening" && (
                  <ListeningRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "speaking" && (
                  <SpeakingRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "article_selection" && (
                  <ArticleSelectionRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}

                {currentExercise.type === "writing_task" && (
                  <WritingTaskRenderer
                    exercise={currentExercise}
                    userAnswer={currentAnswer || ""}
                    onAnswerChange={setCurrentAnswer}
                    isSubmitted={isSubmitted}
                    isCorrect={isCorrect}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── SATISFYING BOTTOM FEEDBACK PANEL (SLIDING FROM BOTTOM WITH EXPLANATION) ─── */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-all duration-200 ${
          isSubmitted
            ? isCorrect
              ? "bg-[var(--color-surface)] border-[var(--color-success)]/50 shadow-[0_-12px_40px_rgba(16,185,129,0.2)]"
              : "bg-[var(--color-surface)] border-[var(--color-error)]/50 shadow-[0_-12px_40px_rgba(244,63,94,0.2)]"
            : "bg-[var(--color-surface)]/95 border-[var(--color-border)] backdrop-blur-xl shadow-lg"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="feedback-panel"
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="flex items-start gap-3.5 w-full sm:w-auto"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                    isCorrect
                      ? "bg-[var(--color-success)] text-white animate-bounce"
                      : "bg-[var(--color-error)] text-white animate-shake"
                  }`}
                  aria-hidden="true"
                >
                  {isCorrect ? <Check size={24} /> : <XCircle size={24} />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                        isCorrect
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/40"
                          : "bg-rose-500/15 text-rose-600 border-rose-500/40"
                      }`}
                    >
                      {isCorrect ? "✓ Richtig (Correct)" : "✕ Nicht ganz (Incorrect)"}
                    </span>
                  </div>
                  <p
                    className={`font-heading text-base font-bold ${
                      isCorrect ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
                    }`}
                  >
                    {isCorrect ? appCopy.exerciseFeedback.correctHeader : appCopy.exerciseFeedback.incorrectHeader}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
                    {currentExercise?.explanation}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="hidden sm:flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                <span>Shortcuts:</span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border text-[11px]">1–4 Options</span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border text-[11px]">R Audio</span>
                <span className="font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border text-[11px]">Enter ↵ Check</span>
              </div>
            )}
          </AnimatePresence>

          {/* Action Button: Check Answer or Continue */}
          <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
            {isSubmitted ? (
              <Button
                variant={isCorrect ? "primary" : "secondary"}
                size="xl"
                onClick={handleContinue}
                rightIcon={<ArrowRight size={18} />}
                className="w-full sm:w-auto min-w-[180px] shadow-md font-bold min-h-[52px]"
              >
                {appCopy.buttons.continueEnter}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="xl"
                disabled={!isAnswerProvided}
                onClick={handleCheck}
                className="w-full sm:w-auto min-w-[180px] shadow-md font-bold min-h-[52px]"
              >
                {appCopy.buttons.checkAnswer}
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Accessibility & Language Preferences Modal */}
      <AccessibilitySettingsModal
        isOpen={showA11yModal}
        onClose={() => setShowA11yModal(false)}
      />
    </div>
  );
}
