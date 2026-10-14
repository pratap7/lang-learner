"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Volume2, Bookmark, CheckCircle2,
  Sparkles, BookOpen, MessageSquare, Globe, Heart, Check,
  Share2, RotateCcw, Award, Flame, Play, Maximize2, Minimize2,
  Clock, Layers, ExternalLink, Eye, EyeOff, Sliders
} from "lucide-react";
import { useAccessibility } from "@/lib/accessibility/AccessibilityContext";
import { useI18n } from "@/lib/i18n/I18nContext";
import { AccessibilitySettingsModal } from "@/components/ui/AccessibilitySettingsModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { TapToTranslateText } from "@/components/ui/TapToTranslateText";
import {
  getLesson,
  getNextLesson,
  getPreviousLesson,
  isLessonCompleted,
  markLessonAsCompleted,
  isLessonBookmarked,
  toggleLessonBookmark,
  type LessonContent,
  VocabularyItem,
} from "@/lib/courseData";
import {
  saveWordToMyWords,
  removeWordFromMyWords,
  isWordSavedInMyWords,
} from "@/lib/flashcardService";
import {
  triggerHaptic,
  playSuccessChime,
  playCompletionFanfare,
  playClickSound,
} from "@/lib/soundEffects";

interface LessonPlayerProps {
  lessonId: string;
}

const STEPS = [
  { id: "vocab", label: "Vocabulary", icon: BookOpen, titleDe: "Wortschatz" },
  { id: "grammar", label: "Grammar Rules", icon: Sparkles, titleDe: "Grammatik" },
  { id: "dialogue", label: "Dialogue", icon: MessageSquare, titleDe: "Gespräch" },
  { id: "culture", label: "Culture & Summary", icon: Globe, titleDe: "Kultur & Fazit" },
];

export function LessonPlayer({ lessonId }: LessonPlayerProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const lesson = getLesson(lessonId);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showEnglishDialogue, setShowEnglishDialogue] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

  // Audio Controls: Normal (1.0x) vs Slow (0.75x)
  const [isSlowAudio, setIsSlowAudio] = useState(false);

  // Distraction-Free Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Accessibility & Internationalisation
  const { captionsEnabled, announce } = useAccessibility();
  const { t } = useI18n();
  const [showA11yModal, setShowA11yModal] = useState(false);

  // Time tracking
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
  }, [elapsedSeconds]);

  /* ─────────────────────────────────────────────────────────────────────────────
     AUTO-SAVE & RESUME SESSION (Within 24h)
  ───────────────────────────────────────────────────────────────────────────── */
  const resumeStorageKey = useMemo(
    () => `deutschpfad_lesson_resume_${lessonId}`,
    [lessonId]
  );

  useEffect(() => {
    setCompleted(isLessonCompleted(lessonId));
    setBookmarked(isLessonBookmarked(lessonId));

    if (lesson) {
      const initialMap: Record<string, boolean> = {};
      lesson.vocabulary.forEach((v) => {
        initialMap[v.german] = isWordSavedInMyWords(v.german);
      });
      setSavedWords(initialMap);
    }

    // Restore step if auto-saved within 24h
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(resumeStorageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          const isFresh = Date.now() - saved.savedAt < 86400000;
          if (isFresh && saved.stepIndex > 0 && saved.stepIndex < STEPS.length) {
            setCurrentStepIndex(saved.stepIndex);
            addToast({
              type: "info",
              title: "Lesson Resumed",
              message: `Continuing at step ${saved.stepIndex + 1}: ${STEPS[saved.stepIndex].label}.`,
            });
          }
        }
      } catch {}
    }
  }, [lessonId, lesson, resumeStorageKey]);

  // Persist current step
  useEffect(() => {
    if (typeof window === "undefined" || completed) return;
    try {
      if (currentStepIndex > 0) {
        localStorage.setItem(
          resumeStorageKey,
          JSON.stringify({
            stepIndex: currentStepIndex,
            savedAt: Date.now(),
          })
        );
      }
    } catch {}
  }, [currentStepIndex, completed, resumeStorageKey]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (typeof document !== "undefined") {
        setIsFullscreen(!!document.fullscreenElement);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  const toggleSlowAudio = () => {
    triggerHaptic("selection");
    playClickSound();
    setIsSlowAudio((prev) => !prev);
    addToast({
      type: "info",
      title: !isSlowAudio ? "Slow Audio Active (0.75x)" : "Normal Audio Active (1.0x)",
      message: !isSlowAudio
        ? "German phrases will play at a relaxed conversational tempo."
        : "German phrases will play at natural conversational tempo.",
    });
  };

  const handleToggleSaveWord = (v: VocabularyItem) => {
    triggerHaptic("selection");
    const isSaved = !!savedWords[v.german];
    if (isSaved) {
      removeWordFromMyWords(v.german);
      setSavedWords((prev) => ({ ...prev, [v.german]: false }));
      addToast({
        type: "info",
        title: "Removed from My Words",
        message: `"${v.german}" was removed from your personal deck.`,
      });
    } else {
      saveWordToMyWords(v);
      setSavedWords((prev) => ({ ...prev, [v.german]: true }));
      addToast({
        type: "success",
        title: "Saved to My Words!",
        message: `"${v.german}" is now scheduled for spaced repetition review.`,
      });
    }
  };

  const handleSaveAllWords = () => {
    if (!lesson) return;
    triggerHaptic("success");
    playSuccessChime();
    const updated = { ...savedWords };
    lesson.vocabulary.forEach((v) => {
      saveWordToMyWords(v);
      updated[v.german] = true;
    });
    setSavedWords(updated);
    addToast({
      type: "success",
      title: "All Words Saved!",
      message: `${lesson.vocabulary.length} vocabulary cards added to your spaced repetition queue.`,
    });
  };

  if (!lesson) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-4">
          Lesson Not Found
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          The requested lesson does not exist in our curriculum.
        </p>
        <Link href="/courses">
          <Button variant="primary">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const nextLessonInfo = getNextLesson(lessonId);
  const prevLessonInfo = getPreviousLesson(lessonId);

  // Native Web Speech API audio player with sub-100ms response & speed control
  const playSpeech = (text: string, id: string) => {
    triggerHaptic("light");
    setPlayingId(id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = isSlowAudio ? 0.72 : 0.95;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingId(null), 1200);
    }
  };

  // Replay current step audio
  const playCurrentStepAudio = useCallback(() => {
    if (!lesson) return;
    switch (currentStepIndex) {
      case 0: {
        const firstVocab = lesson.vocabulary[0];
        if (firstVocab) {
          playSpeech(
            firstVocab.article ? `${firstVocab.article} ${firstVocab.german}` : firstVocab.german,
            firstVocab.id
          );
        }
        break;
      }
      case 1: {
        const firstEx = lesson.grammar.examples[0];
        if (firstEx) {
          playSpeech(firstEx.de, "gr-0");
        }
        break;
      }
      case 2: {
        const firstLine = lesson.dialogue.lines[0];
        if (firstLine) {
          playSpeech(firstLine.german, "dlg-0");
        }
        break;
      }
      case 3: {
        playSpeech(lesson.culture.title, "cult-title");
        break;
      }
    }
  }, [lesson, currentStepIndex, isSlowAudio]);

  const handleToggleBookmark = () => {
    triggerHaptic("selection");
    playClickSound();
    const isNowBookmarked = toggleLessonBookmark(lessonId);
    setBookmarked(isNowBookmarked);
    addToast({
      type: isNowBookmarked ? "success" : "info",
      title: isNowBookmarked ? "Lesson Saved" : "Bookmark Removed",
      message: isNowBookmarked
        ? "Lesson added to your study bookmarks."
        : "Lesson removed from bookmarks.",
    });
  };

  const handleMarkComplete = () => {
    triggerHaptic("success");
    playCompletionFanfare();
    markLessonAsCompleted(lessonId);
    setCompleted(true);
    setShowSummary(true);

    // Clear auto-save resume key
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(resumeStorageKey);
      } catch {}
    }

    addToast({
      type: "success",
      title: "Lesson Completed! 🎉",
      message: `You earned +${lesson.xpReward} XP! Fantastic progress on your German path.`,
    });
  };

  const handleNextStep = () => {
    triggerHaptic("selection");
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleMarkComplete();
    }
  };

  const handlePrevStep = () => {
    triggerHaptic("selection");
    if (currentStepIndex > 0) {
      setCurrentStepIndex((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────────
     GLOBAL KEYBOARD SHORTCUTS: Enter, Arrows, R, S, F, B
  ───────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      // Enter or ArrowRight: Advance or complete
      if (e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        if (showSummary) {
          if (nextLessonInfo) {
            router.push(`/lesson/${nextLessonInfo.id}`);
          } else {
            router.push(`/courses/${lesson.levelCode}`);
          }
        } else {
          handleNextStep();
        }
        return;
      }

      // ArrowLeft: Back
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (!showSummary && currentStepIndex > 0) {
          handlePrevStep();
        }
        return;
      }

      // R: Replay Audio
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        playCurrentStepAudio();
        return;
      }

      // S: Toggle Slow Audio
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        toggleSlowAudio();
        return;
      }

      // F: Fullscreen
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // B: Bookmark
      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        handleToggleBookmark();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showSummary,
    currentStepIndex,
    nextLessonInfo,
    lesson,
    handleNextStep,
    handlePrevStep,
    playCurrentStepAudio,
    toggleSlowAudio,
    toggleFullscreen,
    handleToggleBookmark,
    router,
  ]);

  const stepProgress = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  return (
    <div
      className={`min-h-screen bg-[var(--color-bg)] pb-36 transition-colors duration-200 ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────────────────
          END-OF-LESSON COMPREHENSIVE SUMMARY MODAL
      ───────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="max-w-xl w-full p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-accent-500)]/40 bg-[var(--color-surface)] shadow-[var(--shadow-xl)] relative overflow-hidden my-8"
            >
              <div className="h-1.5 w-full tricolor-stripe absolute top-0 left-0 right-0" />

              {/* Header Badge */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-accent-500)]/20 animate-bounce">
                <Award size={32} />
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] text-center mb-1">
                Wunderbar! Lesson Mastered
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] text-center mb-6 max-w-md mx-auto">
                You completed <strong>{lesson.title}</strong> and absorbed all core vocabulary and grammar rules.
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center">
                  <div className="flex items-center justify-center gap-1 font-heading text-xl font-bold text-[var(--color-accent-500)]">
                    <Sparkles size={16} />
                    <span>+{lesson.xpReward}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">XP Earned</p>
                </div>

                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center">
                  <div className="flex items-center justify-center gap-1 font-heading text-xl font-bold text-[var(--color-success)]">
                    <CheckCircle2 size={16} />
                    <span>100%</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">Mastery</p>
                </div>

                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center">
                  <div className="flex items-center justify-center gap-1 font-heading text-xl font-bold text-[var(--color-brand-400)]">
                    <Clock size={16} />
                    <span>{formattedTime}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">Time Spent</p>
                </div>
              </div>

              {/* Words Learned Section */}
              <div className="mb-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[var(--color-brand-400)]" />
                    <h3 className="font-heading text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
                      New Words Learned ({lesson.vocabulary.length})
                    </h3>
                  </div>
                  <button
                    onClick={handleSaveAllWords}
                    className="text-[11px] font-semibold text-[var(--color-accent-400)] hover:underline cursor-pointer"
                  >
                    Save All to My Words
                  </button>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                  {lesson.vocabulary.map((v) => {
                    const isSaved = !!savedWords[v.german];
                    const isPlaying = playingId === `summary-${v.id}`;

                    return (
                      <div
                        key={v.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]/70 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {v.article && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                v.article === "der"
                                  ? "bg-[#3b82f6]/15 text-[#60a5fa]"
                                  : v.article === "die"
                                  ? "bg-[#ec4899]/15 text-[#f472b6]"
                                  : "bg-[#10b981]/15 text-[#34d399]"
                              }`}
                            >
                              {v.article}
                            </span>
                          )}
                          <span className="font-bold text-[var(--color-text-primary)] truncate">
                            {v.german}
                          </span>
                          <span className="text-[var(--color-text-secondary)] truncate">
                            · {v.english}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() =>
                              playSpeech(
                                v.article ? `${v.article} ${v.german}` : v.german,
                                `summary-${v.id}`
                              )
                            }
                            className={`p-1.5 rounded-full hover:bg-[var(--color-surface-2)] transition-colors ${
                              isPlaying ? "text-[var(--color-brand-400)] animate-pulse" : "text-[var(--color-text-muted)]"
                            }`}
                            title="Play audio"
                          >
                            <Volume2 size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleSaveWord(v)}
                            className={`p-1.5 rounded-full transition-colors ${
                              isSaved
                                ? "text-[var(--color-accent-400)]"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-accent-400)]"
                            }`}
                            title={isSaved ? "Saved" : "Save to My Words"}
                          >
                            <Bookmark size={13} className={isSaved ? "fill-current" : ""} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                {nextLessonInfo ? (
                  <Link href={`/lesson/${nextLessonInfo.id}`} className="w-full">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full min-h-[50px] shadow-[var(--shadow-glow)]"
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Next: {nextLessonInfo.title}
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/courses/${lesson.levelCode}`} className="w-full">
                    <Button variant="primary" size="lg" className="w-full min-h-[50px]">
                      Back to Roadmap
                    </Button>
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/practice/flashcards" className="w-full">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full text-xs"
                      leftIcon={<Layers size={14} className="text-[var(--color-accent-400)]" />}
                    >
                      Review in Flashcards
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full text-xs text-[var(--color-text-secondary)]"
                    onClick={() => setShowSummary(false)}
                  >
                    Review Lesson Steps
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────────────
          STICKY TOP HEADER: Progress Bar, Audio Controls, Fullscreen
      ───────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl transition-all">
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Back Link & Lesson Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/courses/${lesson.levelCode}`}
              className="w-9 h-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors shrink-0"
              title="Back to Roadmap"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant={lesson.levelCode} size="xs">
                  {lesson.levelCode.toUpperCase()}
                </Badge>
                <h1 className="font-heading text-sm font-bold text-[var(--color-text-primary)] truncate max-w-[160px] sm:max-w-xs">
                  {lesson.title}
                </h1>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] font-medium truncate">
                Step {currentStepIndex + 1} of {STEPS.length} · {STEPS[currentStepIndex].label}
              </p>
            </div>
          </div>

          {/* Right: Audio Speed, Replay, Fullscreen, Bookmark */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Speed Toggle (1.0x / 0.75x) */}
            <button
              onClick={toggleSlowAudio}
              className={`h-9 px-2.5 rounded-[var(--radius-lg)] text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                isSlowAudio
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
              }`}
              title="Toggle Audio Speed [S]"
            >
              <span>{isSlowAudio ? "0.75x 🐢" : "1.0x"}</span>
            </button>

            {/* Replay Current Step Audio */}
            <button
              onClick={playCurrentStepAudio}
              className="h-9 w-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-400)] hover:bg-[var(--color-surface-2)] flex items-center justify-center transition-all cursor-pointer"
              title="Replay Audio [R]"
            >
              <Volume2 size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="h-9 w-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] flex items-center justify-center transition-all cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen [F]" : "Distraction-Free Fullscreen [F]"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Accessibility & Language Preferences Toggle */}
            <button
              type="button"
              onClick={() => setShowA11yModal(true)}
              className="h-9 w-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] flex items-center justify-center transition-all cursor-pointer"
              title="Accessibility & Language Preferences"
              aria-label="Open Accessibility & Language Preferences"
            >
              <Sliders size={16} />
            </button>

            {/* Bookmark */}
            <button
              onClick={handleToggleBookmark}
              aria-label="Bookmark lesson"
              className={`h-9 w-9 flex items-center justify-center rounded-[var(--radius-lg)] border transition-all cursor-pointer ${
                bookmarked
                  ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)]/40 text-[var(--color-brand-400)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
              }`}
              title="Bookmark Lesson [B]"
            >
              <Bookmark size={16} className={bookmarked ? "fill-current" : ""} />
            </button>

            {/* Completed Badge or Mark Complete Button */}
            {completed ? (
              <button
                onClick={() => setShowSummary(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-success)]/15 border border-[var(--color-success)]/30 text-xs font-semibold text-[var(--color-success)] hover:bg-[var(--color-success)]/25 transition-colors cursor-pointer"
                title="View Lesson Summary"
              >
                <CheckCircle2 size={13} /> Completed
              </button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkComplete}
                leftIcon={<CheckCircle2 size={14} className="text-[var(--color-success)]" />}
                className="hidden sm:inline-flex text-xs h-9"
              >
                Complete
              </Button>
            )}
          </div>
        </div>

        {/* Sticky Animated Progress Bar */}
        <div
          className="h-1 bg-[var(--color-surface-3)] w-full"
          role="progressbar"
          aria-valuenow={stepProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Lesson progress: ${stepProgress}%`}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--color-brand-500)] via-[var(--color-brand-400)] to-[var(--color-accent-500)]"
            initial={{ width: 0 }}
            animate={{ width: `${stepProgress}%` }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          />
        </div>
      </header>

      {/* Step Tabs Sub-header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 py-2.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto gap-2">
          {STEPS.map((step, idx) => {
            const isStepActive = idx === currentStepIndex;
            const isStepCompleted = idx < currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => {
                  triggerHaptic("selection");
                  setCurrentStepIndex(idx);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isStepActive
                    ? "bg-[var(--color-surface)] text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/40 shadow-sm"
                    : isStepCompleted
                    ? "text-[var(--color-success)] hover:bg-[var(--color-surface)]/60"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isStepActive
                      ? "bg-[var(--color-brand-500)] text-white"
                      : isStepCompleted
                      ? "bg-[var(--color-success)] text-white"
                      : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {isStepCompleted ? <Check size={10} /> : idx + 1}
                </div>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Content Area with Smooth Physics */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: VOCABULARY */}
          {currentStepIndex === 0 && (
            <motion.div
              key="vocab"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                    Wortschatz · Essential Vocabulary
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Click the speaker for pronunciation. Tap any underlined word for instant translation. Gender codes: <span className="text-[#3b82f6] font-semibold">der (blue)</span>, <span className="text-[#ec4899] font-semibold">die (pink)</span>, <span className="text-[#10b981] font-semibold">das (green)</span>.
                  </p>
                </div>
                <Badge variant="primary" size="sm" className="self-start sm:self-auto">
                  {lesson.vocabulary.length} Words
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {lesson.vocabulary.map((v) => {
                  const isPlaying = playingId === v.id;
                  const articleBadge =
                    v.article === "der" ? (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#3b82f6]/15 text-[#60a5fa] border border-[#3b82f6]/30">
                        der · Maskulin
                      </span>
                    ) : v.article === "die" ? (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#ec4899]/15 text-[#f472b6] border border-[#ec4899]/30">
                        die · Feminin
                      </span>
                    ) : v.article === "das" ? (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                        das · Neutral
                      </span>
                    ) : null;

                  return (
                    <div
                      key={v.id}
                      className="p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex flex-col gap-1.5">
                            {articleBadge}
                            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                              {v.german}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSaveWord(v)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                savedWords[v.german]
                                  ? "bg-[var(--color-accent-500)] text-white shadow-md ring-2 ring-[var(--color-accent-400)]/40"
                                  : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/15 border border-[var(--color-border)]"
                              }`}
                              title={savedWords[v.german] ? "Saved to My Words (click to remove)" : "Save to My Words (Flashcards)"}
                            >
                              <Bookmark size={15} className={savedWords[v.german] ? "fill-current" : ""} />
                            </button>

                            <button
                              type="button"
                              onClick={() => playSpeech(v.article ? `${v.article} ${v.german}` : v.german, v.id)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                isPlaying
                                  ? "bg-[var(--color-brand-500)] text-white scale-110 shadow-lg ring-4 ring-[var(--color-brand-500)]/30 animate-pulse"
                                  : "bg-[var(--color-surface-2)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/20 hover:scale-105 border border-[var(--color-border)] shadow-sm"
                              }`}
                              title="Play native audio"
                            >
                              <Volume2 size={15} />
                            </button>
                          </div>
                        </div>

                        {v.ipa && (
                          <div className="inline-block px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-xs text-[var(--color-text-secondary)] font-mono mb-2.5 border border-[var(--color-border)]/60">
                            {v.ipa}
                          </div>
                        )}

                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                          {v.english}
                        </p>

                        {/* Example Sentence with Tap-to-Translate and Audio */}
                        <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <TapToTranslateText
                              text={v.exampleDe}
                              audioPlaybackRate={isSlowAudio ? 0.75 : 1.0}
                              className="font-semibold text-[var(--color-text-primary)] text-xs sm:text-sm"
                            />
                            <button
                              onClick={() => playSpeech(v.exampleDe, `ex-${v.id}`)}
                              className="p-1 rounded-md text-[var(--color-brand-400)] hover:text-white hover:bg-[var(--color-brand-500)] transition-colors shrink-0 cursor-pointer"
                              title="Listen to example sentence"
                            >
                              <Volume2 size={14} />
                            </button>
                          </div>
                          <p className="text-[var(--color-text-secondary)] italic">
                            {v.exampleEn}
                          </p>
                        </div>
                      </div>

                      {v.grammarNote && (
                        <div className="mt-3.5 pt-2.5 border-t border-[var(--color-border)]/60 flex items-start gap-1.5 text-xs text-amber-400/90">
                          <span className="shrink-0">💡</span>
                          <p className="leading-relaxed">
                            <strong className="text-amber-300">Tip:</strong> {v.grammarNote}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: GRAMMAR */}
          {currentStepIndex === 1 && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="space-y-6"
            >
              <div className="pb-2 border-b border-[var(--color-border)]">
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  {lesson.grammar.title}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                  {lesson.grammar.explanation}
                </p>
              </div>

              {lesson.grammar.ruleHighlight && (
                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 flex items-start gap-3">
                  <Sparkles size={20} className="text-[var(--color-brand-400)] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">
                    {lesson.grammar.ruleHighlight}
                  </p>
                </div>
              )}

              {/* Grammar Tables */}
              {lesson.grammar.tables?.map((table, tIdx) => (
                <div
                  key={tIdx}
                  className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm"
                >
                  <div className="px-5 py-3 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                    <h3 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                      {table.caption}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/40 text-[var(--color-text-muted)] font-semibold uppercase tracking-wider text-[11px]">
                          {table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="px-5 py-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[var(--color-surface-2)]/30 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-5 py-3.5 text-[var(--color-text-primary)] font-medium">
                                {cell.includes("der") ? (
                                  <span className="text-[#3b82f6] font-bold">{cell}</span>
                                ) : cell.includes("die") ? (
                                  <span className="text-[#ec4899] font-bold">{cell}</span>
                                ) : cell.includes("das") ? (
                                  <span className="text-[#10b981] font-bold">{cell}</span>
                                ) : (
                                  cell
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Real Grammar Examples with Tap-to-Translate */}
              <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                  Practical Grammar Applications
                </h3>

                <div className="space-y-3">
                  {lesson.grammar.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)]/60 text-xs sm:text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <TapToTranslateText
                          text={ex.de}
                          audioPlaybackRate={isSlowAudio ? 0.75 : 1.0}
                          className="font-bold text-[var(--color-text-primary)]"
                        />
                        <button
                          onClick={() => playSpeech(ex.de, `gr-${exIdx}`)}
                          className="text-[var(--color-brand-400)] hover:text-[var(--color-brand-500)] p-1 shrink-0 cursor-pointer"
                          title="Listen to grammar example"
                        >
                          <Volume2 size={15} />
                        </button>
                      </div>
                      <p className="text-[var(--color-text-secondary)] mt-0.5">
                        {ex.en}
                      </p>
                      {ex.breakdown && (
                        <p className="text-[11px] text-[var(--color-brand-400)] mt-1 pt-1 border-t border-[var(--color-border)]/40 font-mono">
                          {ex.breakdown}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DIALOGUE */}
          {currentStepIndex === 2 && (
            <motion.div
              key="dialogue"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--color-border)]">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                    {lesson.dialogue.title}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {lesson.dialogue.context}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic("selection");
                      setShowEnglishDialogue((v) => !v);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                  >
                    {showEnglishDialogue ? "Hide English" : "Show English"}
                  </button>
                </div>
              </div>

              {/* Chat Dialogue Bubbles with Tap-to-Translate */}
              <div className="space-y-4 py-2">
                {lesson.dialogue.lines.map((line, lIdx) => {
                  const isLeft = lIdx % 2 === 0;
                  const isPlaying = playingId === `dlg-${lIdx}`;

                  return (
                    <div
                      key={lIdx}
                      className={`flex items-start gap-3 ${isLeft ? "justify-start" : "justify-end"}`}
                    >
                      {isLeft && (
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${line.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {line.avatar}
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-md p-4 rounded-[var(--radius-xl)] border shadow-sm ${
                          isLeft
                            ? "bg-[var(--color-surface)] border-[var(--color-border)] rounded-tl-sm"
                            : "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)]/30 text-[var(--color-text-primary)] rounded-tr-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-400)]">
                            {line.speaker}
                          </span>
                          <button
                            onClick={() => playSpeech(line.german, `dlg-${lIdx}`)}
                            className={`p-1 rounded-full transition-colors cursor-pointer ${
                              isPlaying
                                ? "text-[var(--color-brand-400)] scale-110"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)]"
                            }`}
                            title="Listen"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>

                        <TapToTranslateText
                          text={line.german}
                          audioPlaybackRate={isSlowAudio ? 0.75 : 1.0}
                          className="text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed"
                        />

                        {showEnglishDialogue && (
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 pt-1.5 border-t border-[var(--color-border)]/40 italic">
                            {line.english}
                          </p>
                        )}
                      </div>

                      {!isLeft && (
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${line.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {line.avatar}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Full Dialogue Audio Player */}
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
                  <Play size={14} className="text-[var(--color-brand-400)] fill-current" />
                  <span>Listen to continuous dialogue playback</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    playSpeech(
                      lesson.dialogue.lines.map((l) => l.german).join(". "),
                      "full-dlg"
                    )
                  }
                  leftIcon={<Volume2 size={13} />}
                >
                  Play All Lines
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CULTURE & SUMMARY */}
          {currentStepIndex === 3 && (
            <motion.div
              key="culture"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="space-y-6"
            >
              <div className="pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{lesson.culture.flag}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent-500)]">
                    Kulturnotiz · Cultural Insight
                  </span>
                </div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  {lesson.culture.title}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Region: {lesson.culture.location}
                </p>
              </div>

              {/* Cultural Narrative Card */}
              <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md space-y-4">
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
                  {lesson.culture.content}
                </p>

                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-accent-500)]/10 border border-[var(--color-accent-500)]/30 text-xs sm:text-sm">
                  <p className="font-bold text-[var(--color-text-primary)] mb-1">
                    🎯 Native German Pro-Tip
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    {lesson.culture.proTip}
                  </p>
                </div>
              </div>

              {/* Key Takeaways Checklist */}
              <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-3">
                  Key Takeaways from This Lesson
                </h3>

                <div className="space-y-2.5">
                  {lesson.keyTakeaways.map((takeaway, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--color-text-secondary)]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Completion Action Card */}
              <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-brand-500)]/40 bg-[var(--color-brand-500)]/10 text-center shadow-lg">
                <div className="w-12 h-12 rounded-full bg-[var(--color-brand-500)] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Award size={24} />
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-1">
                  Ready to Complete This Lesson?
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-5 max-w-md mx-auto">
                  Earn +{lesson.xpReward} XP, increment your daily streak, and unlock the next sequential lesson on your German path.
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleMarkComplete}
                  leftIcon={<CheckCircle2 size={16} />}
                  className="shadow-[var(--shadow-glow)] min-h-[50px]"
                >
                  {completed ? "Review Lesson Summary" : "Mark Complete & Claim XP (+XP)"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─────────────────────────────────────────────────────────────────────────
          STICKY BOTTOM ACTION BAR: Thumb-Friendly Touch Targets & Shortcuts
      ───────────────────────────────────────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl py-3.5 shadow-[var(--shadow-xl)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Back Step / Previous Lesson */}
          {currentStepIndex > 0 ? (
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevStep}
              leftIcon={<ArrowLeft size={16} />}
              className="min-h-[48px] shrink-0"
            >
              Previous
            </Button>
          ) : prevLessonInfo ? (
            <Link href={`/lesson/${prevLessonInfo.id}`}>
              <Button
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft size={16} />}
                className="hidden sm:inline-flex min-h-[48px]"
              >
                Prev Lesson
              </Button>
            </Link>
          ) : (
            <Link href={`/courses/${lesson.levelCode}`}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<ArrowLeft size={16} />}
                className="min-h-[48px]"
              >
                Roadmap
              </Button>
            </Link>
          )}

          {/* Desktop Keyboard Hints Pill */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] font-mono">
            <span>[Enter] Next</span>
            <span>·</span>
            <span>[R] Replay</span>
            <span>·</span>
            <span>[S] Speed</span>
            <span>·</span>
            <span>[F] Fullscreen</span>
          </div>

          {/* Primary Forward Action (52px+ one-thumb mobile target) */}
          <div className="flex items-center gap-2">
            {currentStepIndex < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                rightIcon={<ArrowRight size={16} />}
                className="min-h-[48px] px-5 sm:px-6 shadow-[var(--shadow-glow)]"
              >
                <span>Next: {STEPS[currentStepIndex + 1].label}</span>
              </Button>
            ) : completed ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowSummary(true)}
                rightIcon={<Award size={16} />}
                className="min-h-[48px] px-5 sm:px-6 shadow-[var(--shadow-glow)]"
              >
                View Summary
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleMarkComplete}
                leftIcon={<CheckCircle2 size={16} />}
                className="min-h-[48px] px-5 sm:px-6 shadow-[var(--shadow-glow)]"
              >
                Complete Lesson
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
