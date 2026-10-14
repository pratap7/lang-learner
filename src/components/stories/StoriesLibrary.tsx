"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  BookmarkPlus,
  BookmarkCheck,
  Award,
  HelpCircle,
  Eye,
  EyeOff,
  Gauge,
  Flame,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  GRADED_STORIES,
  GradedStory,
  StorySentence,
  StoryVocabularyWord,
  CefrLevel,
  StoryCategory,
} from "@/lib/gradedStories";
import {
  getRecommendedStories,
  recordCompletedStory,
  getTotalReadingStats,
  getCompletedStoryIds,
  StoryRecommendation,
} from "@/lib/readingProgressService";
import { saveWordToMyWords } from "@/lib/flashcardService";
import { addXp } from "@/lib/gamificationService";
import { playSuccessChime, playClickSound } from "@/lib/soundEffects";
import { triggerConfetti } from "@/lib/confetti";

export function StoriesLibrary() {
  const { toast } = useToast();

  // Selected story & view: null (library overview) | GradedStory (active reader)
  const [activeStory, setActiveStory] = useState<GradedStory | null>(null);

  // Filters
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Recommendations & user stats
  const [recommendations, setRecommendations] = useState<StoryRecommendation[]>([]);
  const [readingStats, setReadingStats] = useState({
    totalSecondsRead: 480,
    totalWordsRead: 650,
    completedStoriesCount: 0,
    averageWpm: 95,
  });
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  // Reader state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 1.0 or 0.75
  const [showEnglishSubtitle, setShowEnglishSubtitle] = useState<boolean>(false);
  const [activeVocabWord, setActiveVocabWord] = useState<StoryVocabularyWord | null>(null);
  const [savedWordsState, setSavedWordsState] = useState<Record<string, boolean>>({});

  // Reading stopwatch
  const [readingTimerSeconds, setReadingTimerSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Comprehension questions state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Load initial data
  const loadStatsAndRecs = () => {
    const stats = getTotalReadingStats();
    setReadingStats(stats);
    const completed = getCompletedStoryIds();
    setCompletedIds(completed);
    const recs = getRecommendedStories("A1", 3);
    setRecommendations(recs);
  };

  useEffect(() => {
    loadStatsAndRecs();
  }, []);

  // Timer effect when reader is open
  useEffect(() => {
    if (activeStory) {
      setReadingTimerSeconds(0);
      timerRef.current = setInterval(() => {
        setReadingTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStory]);

  // Audio SpeechSynthesis effect
  useEffect(() => {
    if (!activeStory || !isPlayingAudio) return;

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast({
        type: "info",
        title: "Speech audio",
        message: "Audio synthesis is not supported on this browser.",
      });
      setIsPlayingAudio(false);
      return;
    }

    const sentences = activeStory.sentences;
    if (currentSentenceIndex >= sentences.length) {
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const sentence = sentences[currentSentenceIndex];
    const utterance = new SpeechSynthesisUtterance(sentence.textDe);
    utterance.lang = "de-DE";
    utterance.rate = playbackSpeed;

    utterance.onend = () => {
      if (currentSentenceIndex < sentences.length - 1) {
        setCurrentSentenceIndex((prev) => prev + 1);
      } else {
        setIsPlayingAudio(false);
      }
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [activeStory, currentSentenceIndex, isPlayingAudio, playbackSpeed]);

  const handleOpenStory = (story: GradedStory) => {
    setActiveStory(story);
    setCurrentSentenceIndex(0);
    setIsPlayingAudio(false);
    setUserAnswers({});
    setIsQuizSubmitted(false);
    setActiveVocabWord(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseReader = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setActiveStory(null);
    setIsPlayingAudio(false);
    loadStatsAndRecs();
  };

  const toggleAudio = () => {
    playClickSound();
    setIsPlayingAudio((prev) => !prev);
  };

  const handleSaveToFlashcards = (vocab: StoryVocabularyWord) => {
    playClickSound();
    const added = saveWordToMyWords({
      id: `story-vocab-${Date.now()}`,
      german: vocab.baseForm,
      english: vocab.english,
      article: vocab.article,
      plural: vocab.plural,
      partOfSpeech: vocab.partOfSpeech,
      exampleDe: vocab.exampleDe || "",
      exampleEn: vocab.exampleEn || "",
      grammarNote: vocab.grammarNote,
    });

    setSavedWordsState((prev) => ({ ...prev, [vocab.baseForm.toLowerCase()]: true }));
    playSuccessChime();

    toast({
      type: "success",
      title: added ? "+ Added to Flashcards" : "Already in Flashcards",
      message: added
        ? `"${vocab.word}" was saved to your "My Words" deck with SM-2 spaced repetition.`
        : `"${vocab.word}" is already in your review deck.`,
    });
  };

  const handleSelectQuizAnswer = (qId: string, optIndex: number) => {
    if (isQuizSubmitted) return;
    playClickSound();
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!activeStory) return;
    const questions = activeStory.questions;
    let correctCount = 0;

    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    setQuizScore(scorePct);
    setIsQuizSubmitted(true);

    // Save session stats
    recordCompletedStory(activeStory.id, readingTimerSeconds, scorePct);
    addXp(25);
    playSuccessChime();
    triggerConfetti();

    toast({
      type: "success",
      title: "Reading & Quiz Completed! 🎉",
      message: `Score: ${scorePct}%. Awarded +25 XP and recorded to your reading stats.`,
    });
  };

  // Filtered stories
  const filteredStories = GRADED_STORIES.filter((s) => {
    if (selectedLevel !== "ALL" && s.level !== selectedLevel) return false;
    if (selectedCategory !== "ALL" && s.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.titleDe.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* ─── VIEW 1: STORIES LIBRARY OVERVIEW ───────────────────────────────── */}
      {!activeStory && (
        <div className="space-y-8">
          {/* Top Hero Banner */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                    Graded German Stories & Audio Library
                  </h1>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Synced sentence audio · Tap-to-translate · One-tap flashcard saving
                  </p>
                </div>
              </div>
            </div>

            {/* Reading Stats Pills */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[90px] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Time Read
                </p>
                <p className="font-heading text-lg font-bold text-[var(--color-brand-400)]">
                  {Math.round(readingStats.totalSecondsRead / 60)} min
                </p>
              </div>

              <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[90px] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Completed
                </p>
                <p className="font-heading text-lg font-bold text-emerald-400">
                  {completedIds.length} / {GRADED_STORIES.length}
                </p>
              </div>

              <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[90px] shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Pace
                </p>
                <p className="font-heading text-lg font-bold text-indigo-400">
                  {readingStats.averageWpm} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">wpm</span>
                </p>
              </div>
            </div>
          </div>

          {/* ─── "RECOMMENDED FOR YOU" SECTION ────────────────────────────── */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  Recommended for You
                </h2>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Personalized based on CEFR level and flashcard vocabulary
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.story.id}
                    className="p-5 rounded-[var(--radius-2xl)] border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-[var(--color-surface)] to-[var(--color-surface-2)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{rec.story.coverEmoji}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={rec.story.level.toLowerCase() as any} size="xs">
                            {rec.story.level}
                          </Badge>
                          {rec.isCompleted && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              ✓ Read
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors">
                          {rec.story.titleDe}
                        </h3>
                        <p className="text-xs text-[var(--color-brand-400)] font-medium">
                          {rec.story.title}
                        </p>
                      </div>

                      <div className="p-2 rounded-[var(--radius-lg)] bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-medium leading-tight">
                        ✨ {rec.recommendationReason}
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                        {rec.story.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                      <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={12} /> {rec.story.readingTimeMinutes} min read
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleOpenStory(rec.story)}
                      >
                        <span>Read & Listen</span>
                        <ArrowRight size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── FILTERS & SEARCH BAR ─────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/70 border border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] text-[var(--color-text-muted)] font-bold mr-1">
                Level:
              </span>
              {(["ALL", "A1", "A2", "B1", "B2"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition-colors ${
                    selectedLevel === lvl
                      ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                placeholder="Search stories & topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand-500)]"
              />
            </div>
          </div>

          {/* ─── MAIN STORIES GRID ────────────────────────────────────────── */}
          {filteredStories.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Stories Match Filters"
              description="No German graded stories matched your current search criteria. Try selecting 'ALL' levels or clearing the search text."
              actionLabel="Show All Stories"
              onAction={() => {
                setSelectedLevel("ALL");
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStories.map((story) => {
              const isRead = completedIds.includes(story.id);

              return (
                <div
                  key={story.id}
                  className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-500)]/40 transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{story.coverEmoji}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={story.level.toLowerCase() as any} size="xs">
                          {story.level}
                        </Badge>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                          {story.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors">
                        {story.titleDe}
                      </h3>
                      <p className="text-xs text-[var(--color-brand-400)] font-medium mt-0.5">
                        {story.title}
                      </p>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                      {story.summary}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                      <span>{story.wordCount} words</span>
                      <span>{story.sentences.length} sentences</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                      <Clock size={12} /> {story.readingTimeMinutes} min
                    </span>
                    <Button
                      variant={isRead ? "outline" : "primary"}
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleOpenStory(story)}
                    >
                      <span>{isRead ? "Re-read" : "Start Reading"}</span>
                      <ArrowRight size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* ─── VIEW 2: INTERACTIVE STORY READER WITH SYNCED AUDIO ────────────── */}
      {activeStory && (
        <div className="space-y-6">
          {/* Top Return Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleCloseReader}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Library</span>
            </button>
            <div className="flex items-center gap-2">
              <Badge variant={activeStory.level.toLowerCase() as any} size="sm">
                CEFR {activeStory.level}
              </Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                {activeStory.wordCount} words · {readingTimerSeconds}s elapsed
              </span>
            </div>
          </div>

          {/* AUDIO PLAYER CONTROLLER BAR */}
          <div className="sticky top-20 z-30 p-4 rounded-[var(--radius-2xl)] border border-[var(--color-brand-500)]/30 bg-[var(--color-surface)]/95 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAudio}
                className="w-11 h-11 rounded-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
              >
                {isPlayingAudio ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Previous sentence"
                  onClick={() => setCurrentSentenceIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors"
                >
                  <SkipBack size={16} />
                </button>
                <button
                  type="button"
                  title="Next sentence"
                  onClick={() =>
                    setCurrentSentenceIndex((prev) =>
                      Math.min(activeStory.sentences.length - 1, prev + 1)
                    )
                  }
                  className="p-2 rounded-lg hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] transition-colors"
                >
                  <SkipForward size={16} />
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--color-text-primary)]">
                  Sentence {currentSentenceIndex + 1} of {activeStory.sentences.length}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  Click any sentence to play from there
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Speed toggle: 1.0x vs 0.75x */}
              <button
                type="button"
                onClick={() => setPlaybackSpeed(playbackSpeed === 1.0 ? 0.75 : 1.0)}
                className="px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-xs font-mono font-bold text-[var(--color-text-primary)] flex items-center gap-1 transition-colors"
              >
                <Gauge size={13} className="text-amber-400" />
                <span>{playbackSpeed === 1.0 ? "1.0x (Normal)" : "0.75x (Langsamer)"}</span>
              </button>

              {/* English Subtitles toggle */}
              <button
                type="button"
                onClick={() => setShowEnglishSubtitle((prev) => !prev)}
                className="px-2.5 py-1 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5 transition-colors"
              >
                {showEnglishSubtitle ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showEnglishSubtitle ? "Hide English" : "Show English"}</span>
              </button>
            </div>
          </div>

          {/* TAP-TO-TRANSLATE FLOATING POPOVER */}
          <AnimatePresence>
            {activeVocabWord && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-brand-500)]/40 bg-[var(--color-surface)] shadow-xl space-y-3 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                        {activeVocabWord.word}
                      </span>
                      {activeVocabWord.article && (
                        <span
                          className={`text-xs font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            activeVocabWord.article === "der"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : activeVocabWord.article === "die"
                              ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {activeVocabWord.article}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-brand-400)] font-semibold">
                      {activeVocabWord.english}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveVocabWord(null)}
                    className="text-xs text-[var(--color-text-muted)] hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] text-[11px] text-[var(--color-text-muted)] space-y-1">
                  {activeVocabWord.plural && (
                    <div>
                      <span className="font-semibold text-[var(--color-text-primary)]">Plural: </span>
                      <span>{activeVocabWord.plural}</span>
                    </div>
                  )}
                  {activeVocabWord.grammarNote && (
                    <div>
                      <span className="font-semibold text-[var(--color-text-primary)]">Grammatik: </span>
                      <span>{activeVocabWord.grammarNote}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[var(--color-text-muted)] italic">
                    Tap anywhere outside to close
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleSaveToFlashcards(activeVocabWord)}
                  >
                    {savedWordsState[activeVocabWord.baseForm.toLowerCase()] ? (
                      <>
                        <BookmarkCheck size={14} className="text-emerald-300" />
                        <span>In Flashcards</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus size={14} />
                        <span>+ Add to My Flashcards</span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN STORY CONTENT (SENTENCE BY SENTENCE HIGHLIGHTING) */}
          <div className="p-6 md:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
            <div className="border-b border-[var(--color-border)] pb-4">
              <span className="text-3xl">{activeStory.coverEmoji}</span>
              <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                {activeStory.titleDe}
              </h2>
              <p className="text-xs text-[var(--color-brand-400)] font-medium">
                {activeStory.title}
              </p>
            </div>

            <div className="space-y-4 leading-relaxed font-sans text-base text-[var(--color-text-primary)]">
              {activeStory.sentences.map((sent, idx) => {
                const isActive = currentSentenceIndex === idx;

                return (
                  <div
                    key={sent.id}
                    onClick={() => {
                      setCurrentSentenceIndex(idx);
                      setIsPlayingAudio(true);
                    }}
                    className={`p-3.5 rounded-[var(--radius-xl)] transition-all cursor-pointer border ${
                      isActive
                        ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)]/40 shadow-sm"
                        : "hover:bg-[var(--color-surface-2)] border-transparent"
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] font-mono text-[var(--color-text-muted)] select-none">
                        {idx + 1}.
                      </span>
                      <p className="flex-1 font-medium">
                        {sent.textDe.split(/\s+/).map((word, wIdx) => {
                          const cleanWord = word.toLowerCase().replace(/[^a-zäöüß]/gi, "");
                          const vocabItem = activeStory.vocabularyMap[cleanWord];

                          if (vocabItem) {
                            return (
                              <span
                                key={wIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveVocabWord(vocabItem);
                                }}
                                className="underline decoration-dotted decoration-[var(--color-brand-400)] text-[var(--color-brand-400)] font-semibold cursor-pointer hover:bg-[var(--color-brand-500)]/20 px-0.5 rounded transition-colors"
                              >
                                {word}{" "}
                              </span>
                            );
                          }
                          return <span key={wIdx}>{word} </span>;
                        })}
                      </p>
                    </div>

                    {showEnglishSubtitle && (
                      <p className="text-xs text-[var(--color-text-muted)] ml-5 mt-1 font-sans italic">
                        {sent.textEn}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cultural Tip Card */}
            {activeStory.culturalTip && (
              <div className="p-4 rounded-[var(--radius-xl)] bg-indigo-500/10 border border-indigo-500/25 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Info size={13} /> Cultural Insight (Kultur-Tipp)
                </span>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {activeStory.culturalTip}
                </p>
              </div>
            )}
          </div>

          {/* ─── COMPREHENSION QUESTIONS AT THE END ────────────────────────── */}
          <div className="p-6 md:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  Reading Comprehension Questions
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Verify your understanding and earn +25 XP
                </p>
              </div>

              {isQuizSubmitted && (
                <div className="p-2.5 rounded-[var(--radius-lg)] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                  Score: {quizScore}%
                </div>
              )}
            </div>

            <div className="space-y-6">
              {activeStory.questions.map((q, qIdx) => {
                const selectedOpt = userAnswers[q.id];
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] space-y-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-400)]">
                        Question {qIdx + 1}
                      </span>
                      <h4 className="font-heading text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                        {q.questionDe}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] italic">
                        {q.questionEn}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-500)]";

                        if (selectedOpt === optIdx) {
                          btnStyle = "bg-[var(--color-brand-500)]/20 border-[var(--color-brand-500)] text-white font-bold";
                        }

                        if (isQuizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                          } else if (selectedOpt === optIdx && !isCorrect) {
                            btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 line-through";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isQuizSubmitted}
                            onClick={() => handleSelectQuizAnswer(q.id, optIdx)}
                            className={`p-3 rounded-[var(--radius-lg)] border text-xs text-left transition-all ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {isQuizSubmitted && (
                      <p className="text-xs text-[var(--color-text-secondary)] italic bg-[var(--color-surface)] p-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)]">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseReader}
              >
                <span>Back to Library</span>
              </Button>

              {!isQuizSubmitted ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length < activeStory.questions.length}
                >
                  <span>Submit & Complete Story</span>
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCloseReader}
                >
                  <span>Finish & Return</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
