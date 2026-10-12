"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Volume2, Bookmark, CheckCircle2,
  Sparkles, BookOpen, MessageSquare, Globe, Heart, Check,
  Share2, RotateCcw, Award, Flame, Play
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
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
  const [showCelebration, setShowCelebration] = useState(false);
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});

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
  }, [lessonId, lesson]);

  const handleToggleSaveWord = (v: VocabularyItem) => {
    const isSaved = !!savedWords[v.german];
    if (isSaved) {
      removeWordFromMyWords(v.german);
      setSavedWords((prev) => ({ ...prev, [v.german]: false }));
      addToast({
        type: "info",
        title: "Removed from My Words",
        message: `"${v.german}" was removed from your personal flashcard deck.`,
      });
    } else {
      saveWordToMyWords(v);
      setSavedWords((prev) => ({ ...prev, [v.german]: true }));
      addToast({
        type: "success",
        title: "Saved to My Words!",
        message: `"${v.german}" is now in your Spaced Repetition review queue.`,
      });
    }
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

  // Native Web Speech API audio player
  const playSpeech = (text: string, id: string) => {
    setPlayingId(id);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingId(null), 1200);
    }
  };

  const handleToggleBookmark = () => {
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
    markLessonAsCompleted(lessonId);
    setCompleted(true);
    setShowCelebration(true);

    addToast({
      type: "success",
      title: "Lesson Completed! 🎉",
      message: `You earned +${lesson.xpReward} XP! Fantastic progress on your German path.`,
    });

    // Automatically hide celebration modal after a short delay
    setTimeout(() => {
      setShowCelebration(false);
    }, 3500);
  };

  const handleNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const stepProgress = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-44">
      {/* Celebration Modal / Confetti Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <div className="max-w-md w-full p-8 rounded-[var(--radius-2xl)] border border-[var(--color-accent-500)]/40 bg-[var(--color-surface)] shadow-[var(--shadow-xl)] text-center relative overflow-hidden">
              <div className="h-1.5 w-full tricolor-stripe absolute top-0 left-0 right-0" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-400)] to-[var(--color-accent-600)] text-white flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                <Award size={32} />
              </div>

              <h3 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">
                Wunderbar! Lesson Mastered
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mb-6">
                You have completed <strong>{lesson.title}</strong> and absorbed all core vocabulary and grammar rules.
              </p>

              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] min-w-[100px]">
                  <p className="font-heading text-xl font-bold text-[var(--color-accent-500)]">+{lesson.xpReward}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">XP Earned</p>
                </div>
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-[var(--color-success)] font-heading text-xl font-bold">
                    <CheckCircle2 size={18} />
                    <span>Done</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium">Status</p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                {nextLessonInfo ? (
                  <Link href={`/lesson/${nextLessonInfo.id}`}>
                    <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight size={16} />}>
                      Next: {nextLessonInfo.title}
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/courses/${lesson.levelCode}`}>
                    <Button variant="primary" size="lg" className="w-full">
                      Back to Roadmap
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowCelebration(false)}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl">
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${lesson.levelCode}`}
              className="w-9 h-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
              title="Back to Roadmap"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={lesson.levelCode} size="xs">
                  {lesson.levelCode.toUpperCase()}
                </Badge>
                <h1 className="font-heading text-sm font-bold text-[var(--color-text-primary)] truncate max-w-[200px] sm:max-w-xs">
                  {lesson.title}
                </h1>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] font-medium">
                Step {currentStepIndex + 1} of {STEPS.length} · {STEPS[currentStepIndex].label}
              </p>
            </div>
          </div>

          {/* Action buttons on right */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              aria-label="Bookmark lesson"
              className={`h-9 w-9 flex items-center justify-center rounded-[var(--radius-lg)] border transition-all ${
                bookmarked
                  ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)]/40 text-[var(--color-brand-400)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              <Bookmark size={16} className={bookmarked ? "fill-current" : ""} />
            </button>

            {completed ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success)]/15 border border-[var(--color-success)]/30 text-xs font-semibold text-[var(--color-success)]">
                <CheckCircle2 size={13} /> Completed
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkComplete}
                leftIcon={<CheckCircle2 size={14} className="text-[var(--color-success)]" />}
                className="hidden sm:inline-flex text-xs"
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Top Progress Bar */}
        <div className="h-1 bg-[var(--color-surface-3)] w-full">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-accent-500)]"
            initial={{ width: 0 }}
            animate={{ width: `${stepProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Step Tabs Sub-header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 py-2.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto gap-2">
          {STEPS.map((step, idx) => {
            const isStepActive = idx === currentStepIndex;
            const isStepCompleted = idx < currentStepIndex;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
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

      {/* Main Step Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: VOCABULARY */}
          {currentStepIndex === 0 && (
            <motion.div
              key="vocab"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                    Wortschatz · Essential Vocabulary
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Click the speaker to hear authentic native German pronunciation. Notice the gender colors: <span className="text-[#3b82f6] font-semibold">der (blue)</span>, <span className="text-[#ec4899] font-semibold">die (pink)</span>, <span className="text-[#10b981] font-semibold">das (green)</span>.
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

                        {/* Example Sentence with Audio */}
                        <div className="p-3.5 rounded-xl bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-xs space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[var(--color-text-primary)] text-xs sm:text-sm">
                              {v.exampleDe}
                            </span>
                            <button
                              onClick={() => playSpeech(v.exampleDe, `ex-${v.id}`)}
                              className="p-1 rounded-md text-[var(--color-brand-400)] hover:text-white hover:bg-[var(--color-brand-500)] transition-colors shrink-0"
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
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

              {/* Real Grammar Examples */}
              <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                  Practical Grammar Applications
                </h3>

                <div className="space-y-3">
                  {lesson.grammar.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)]/60 text-xs sm:text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-[var(--color-text-primary)]">
                          {ex.de}
                        </p>
                        <button
                          onClick={() => playSpeech(ex.de, `gr-${exIdx}`)}
                          className="text-[var(--color-brand-400)] hover:text-[var(--color-brand-500)]"
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
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
                    onClick={() => setShowEnglishDialogue((v) => !v)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    {showEnglishDialogue ? "Hide English" : "Show English"}
                  </button>
                </div>
              </div>

              {/* Chat Dialogue Bubbles */}
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
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${line.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
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
                            className={`p-1 rounded-full transition-colors ${
                              isPlaying
                                ? "text-[var(--color-brand-400)] scale-110"
                                : "text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)]"
                            }`}
                            title="Listen"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed">
                          {line.german}
                        </p>

                        {showEnglishDialogue && (
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 pt-1.5 border-t border-[var(--color-border)]/40 italic">
                            {line.english}
                          </p>
                        )}
                      </div>

                      {!isLeft && (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${line.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
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
                  <span>Listen to the full dialogue continuous playback</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => playSpeech(lesson.dialogue.lines.map((l) => l.german).join(". "), "full-dlg")}
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
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
                    <div key={tIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--color-text-secondary)]">
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
                  className="shadow-[var(--shadow-glow)]"
                >
                  {completed ? "Completed (Claim Again)" : "Mark Complete & Claim XP"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Controls Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl py-3.5 shadow-[var(--shadow-xl)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Back Step / Previous Lesson */}
          {currentStepIndex > 0 ? (
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevStep}
              leftIcon={<ArrowLeft size={16} />}
            >
              Previous Step
            </Button>
          ) : prevLessonInfo ? (
            <Link href={`/lesson/${prevLessonInfo.id}`}>
              <Button
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft size={16} />}
                className="hidden sm:inline-flex"
              >
                Previous Lesson
              </Button>
            </Link>
          ) : (
            <Link href={`/courses/${lesson.levelCode}`}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<ArrowLeft size={16} />}
              >
                Roadmap
              </Button>
            </Link>
          )}

          {/* Right Action */}
          <div className="flex items-center gap-3">
            {currentStepIndex < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                rightIcon={<ArrowRight size={16} />}
              >
                Next Step: {STEPS[currentStepIndex + 1].label}
              </Button>
            ) : nextLessonInfo ? (
              <Link href={`/lesson/${nextLessonInfo.id}`}>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight size={16} />}
                  className="shadow-[var(--shadow-glow)]"
                >
                  Next Lesson: {nextLessonInfo.title}
                </Button>
              </Link>
            ) : (
              <Link href={`/courses/${lesson.levelCode}`}>
                <Button variant="primary" size="md">
                  Back to Roadmap
                </Button>
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
