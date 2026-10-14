"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, GraduationCap, FileCheck, Home, Heart, Plane,
  Sparkles, CheckCircle2, Volume2, ArrowRight, ArrowLeft,
  Clock, Target, Award, Check, Lock, Mail, User, ShieldCheck,
  Calendar, Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { DeutschMascot } from "@/components/mascot/DeutschMascot";
import {
  playClickSound,
  playCompletionFanfare,
  playSuccessChime,
  triggerHaptic,
} from "@/lib/soundEffects";
import { fireConfetti } from "@/lib/confetti";
import { trackOnboardingStep } from "@/lib/analyticsService";
import { appCopy } from "@/lib/appCopy";
import type { LearningReason, CefrLevel, DailyStudyMinutes } from "@/types/database.types";

/* ──────────────── Reasons & Study Paces ──────────────── */

const GOAL_REASONS: { id: LearningReason; title: string; desc: string; icon: typeof Plane }[] = [
  { id: "work",      title: "Career & Work",          desc: "Unlock European jobs & speak with colleagues",  icon: Briefcase },
  { id: "migration", title: "Relocation & Life",      desc: "Settle smoothly & meet citizenship requirements", icon: Home },
  { id: "study",     title: "University & Study",     desc: "Prepare for academic degrees in Germany",        icon: GraduationCap },
  { id: "exam",      title: "Certification Exam",     desc: "Pass Goethe-Zertifikat, telc, or TestDaF",       icon: FileCheck },
  { id: "travel",    title: "Travel & Daily Life",    desc: "Order food, navigate, & chat with locals freely", icon: Plane },
  { id: "hobby",     title: "Culture & Passion",      desc: "Explore German literature, cinema, & mindset",   icon: Heart },
];

const STUDY_PACING: { minutes: DailyStudyMinutes; label: string; desc: string }[] = [
  { minutes: 10, label: "Casual · 10 min/day",    desc: "1 bite-sized lesson + flashcards" },
  { minutes: 20, label: "Regular · 20 min/day",   desc: "Recommended: 1 full unit + SRS drills" },
  { minutes: 30, label: "Dedicated · 30 min/day", desc: "Accelerated pathway with dialogues" },
];

/* ──────────────── Quick Level Check Questions (5 items) ──────────────── */

interface LevelQuestion {
  id: number;
  level: "A1" | "A2" | "B1";
  prompt: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

const LEVEL_QUESTIONS: LevelQuestion[] = [
  {
    id: 1,
    level: "A1",
    prompt: "How do you say 'Thank you very much' in authentic German?",
    options: [
      { text: "Danke schön", isCorrect: true },
      { text: "Guten Tag", isCorrect: false },
      { text: "Bitte sehr", isCorrect: false },
      { text: "Auf Wiedersehen", isCorrect: false },
    ],
    explanation: "'Danke schön' means 'Thank you very much'. 'Bitte sehr' is 'You are very welcome'.",
  },
  {
    id: 2,
    level: "A1",
    prompt: "Which article completes: '___ Mann trinkt Kaffee'?",
    options: [
      { text: "Der", isCorrect: true },
      { text: "Das", isCorrect: false },
      { text: "Die", isCorrect: false },
      { text: "Den", isCorrect: false },
    ],
    explanation: "'Mann' is masculine (der Mann) in the nominative subject position.",
  },
  {
    id: 3,
    level: "A2",
    prompt: "Choose the correct accusative direct object: 'Ich habe ___ Apfel (der Apfel).'",
    options: [
      { text: "einen", isCorrect: true },
      { text: "ein", isCorrect: false },
      { text: "einem", isCorrect: false },
      { text: "einer", isCorrect: false },
    ],
    explanation: "Masculine nouns in the accusative take 'einen' ('Ich habe einen Apfel').",
  },
  {
    id: 4,
    level: "A2",
    prompt: "Subordinating clause word order: 'Ich lerne Deutsch, weil es Spaß ___.'",
    options: [
      { text: "macht", isCorrect: true },
      { text: "machen", isCorrect: false },
      { text: "gemacht", isCorrect: false },
      { text: "mache", isCorrect: false },
    ],
    explanation: "'weil' forces the conjugated verb ('macht') to the very end of the subordinate clause.",
  },
  {
    id: 5,
    level: "B1",
    prompt: "Dative preposition rule: 'Sie fährt mit ___ Zug (der Zug) nach Berlin.'",
    options: [
      { text: "dem", isCorrect: true },
      { text: "den", isCorrect: false },
      { text: "der", isCorrect: false },
      { text: "das", isCorrect: false },
    ],
    explanation: "'mit' always governs the dative case. Masculine 'der Zug' changes to 'dem Zug'.",
  },
];

/* ──────────────── 8 Core Words for Mini Lesson ──────────────── */

interface LearnedWord {
  german: string;
  english: string;
  phonetic: string;
  category: string;
}

const EIGHT_WORDS: LearnedWord[] = [
  { german: "Hallo",        english: "Hello",              phonetic: "HAH-loh",       category: "Greeting" },
  { german: "Guten Tag",    english: "Good day / Hello",   phonetic: "GOO-ten TAHK",  category: "Greeting" },
  { german: "Bitte",        english: "Please / Welcome",   phonetic: "BIT-teh",       category: "Courtesies" },
  { german: "Danke schön",  english: "Thank you kindly",   phonetic: "DAHN-keh shern", category: "Courtesies" },
  { german: "Kaffee",       english: "Coffee",             phonetic: "KAH-feh",       category: "Café" },
  { german: "Tee",          english: "Tea",                phonetic: "TEH",           category: "Café" },
  { german: "Ja",           english: "Yes",                phonetic: "YAH",           category: "Basics" },
  { german: "Tschüss",      english: "Bye / See you",      phonetic: "CHYUSS",        category: "Farewell" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();

  // ─── STAGES: 1: Goal -> 2: Level Check -> 3: Mini Lesson -> 4: Reward -> 5: Plan -> 6: Save Account
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Selections
  const [reason, setReason] = useState<LearningReason>("work");
  const [dailyMinutes, setDailyMinutes] = useState<DailyStudyMinutes>(20);
  const [targetLevel, setTargetLevel] = useState<CefrLevel>("b1");

  // Level Check State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [levelCheckAnswers, setLevelCheckAnswers] = useState<Record<number, boolean>>({});
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [showQuestionFeedback, setShowQuestionFeedback] = useState(false);
  const [calibratedLevel, setCalibratedLevel] = useState<CefrLevel>("a1");

  // Mini Lesson Interactive State
  const [miniLessonStep, setMiniLessonStep] = useState<"words" | "drill">("words");
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [drillAnswer, setDrillAnswer] = useState<string | null>(null);
  const [drillSuccess, setDrillSuccess] = useState<boolean | null>(null);

  // Account Creation State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Audio helper
  const playSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Initial event track
  useEffect(() => {
    trackOnboardingStep("goal_selection");
  }, []);

  /* ──────────────── Handlers for Step 1 (Goal & Pace) ──────────────── */

  const handleGoalContinue = () => {
    triggerHaptic("selection");
    playClickSound();
    trackOnboardingStep("level_check_started", { reason, dailyMinutes });
    setStage(2);
  };

  /* ──────────────── Handlers for Step 2 (Level Check) ──────────────── */

  const handleSkipLevelCheck = () => {
    triggerHaptic("selection");
    playClickSound();
    trackOnboardingStep("level_check_skipped");
    setCalibratedLevel("a1");
    setStage(3);
    trackOnboardingStep("mini_lesson_started");
  };

  const handleSelectOption = (idx: number, isCorrect: boolean) => {
    if (showQuestionFeedback) return;
    setSelectedOptionIdx(idx);
    setShowQuestionFeedback(true);

    if (isCorrect) {
      playSuccessChime();
      triggerHaptic("success");
    } else {
      triggerHaptic("error");
    }

    setLevelCheckAnswers((prev) => ({ ...prev, [currentQuestionIdx]: isCorrect }));
    trackOnboardingStep("question_answered", {
      questionId: LEVEL_QUESTIONS[currentQuestionIdx].id,
      isCorrect,
    });

    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentQuestionIdx < LEVEL_QUESTIONS.length - 1) {
        setCurrentQuestionIdx((i) => i + 1);
        setSelectedOptionIdx(null);
        setShowQuestionFeedback(false);
      } else {
        // Evaluate level from score
        const correctCount = Object.values({
          ...levelCheckAnswers,
          [currentQuestionIdx]: isCorrect,
        }).filter(Boolean).length;

        let detected: CefrLevel = "a1";
        if (correctCount >= 4) detected = "b1";
        else if (correctCount >= 2) detected = "a2";

        setCalibratedLevel(detected);
        trackOnboardingStep("level_check_completed", { correctCount, detectedLevel: detected });
        setStage(3);
        trackOnboardingStep("mini_lesson_started");
      }
    }, 1100);
  };

  /* ──────────────── Handlers for Step 3 (Mini Lesson) ──────────────── */

  const handleNextWord = () => {
    triggerHaptic("selection");
    playClickSound();
    if (activeWordIdx < EIGHT_WORDS.length - 1) {
      setActiveWordIdx((i) => i + 1);
      playSpeech(EIGHT_WORDS[activeWordIdx + 1].german);
    } else {
      setMiniLessonStep("drill");
    }
  };

  const handleCheckDrill = (chosen: string) => {
    setDrillAnswer(chosen);
    const passed = chosen === "Ein Kaffee, bitte!";
    setDrillSuccess(passed);

    if (passed) {
      playSuccessChime();
      triggerHaptic("success");
      setTimeout(() => {
        playCompletionFanfare();
        fireConfetti();
        trackOnboardingStep("mini_lesson_completed", { wordsLearned: 8 });
        setStage(4); // Reward screen!
      }, 700);
    } else {
      triggerHaptic("error");
    }
  };

  /* ──────────────── Handlers for Step 4 (Reward Screen) ──────────────── */

  const handleProceedToPlan = () => {
    triggerHaptic("selection");
    playClickSound();
    trackOnboardingStep("plan_revealed", { calibratedLevel, targetLevel });
    setStage(5);
  };

  /* ──────────────── Handlers for Step 5 (Personalized Plan Reveal) ──────────────── */

  const handleProceedToAccount = () => {
    triggerHaptic("selection");
    playClickSound();
    trackOnboardingStep("signup_prompt_viewed");
    setStage(6);
  };

  /* ──────────────── Handlers for Step 6 (Save Account / Continue) ──────────────── */

  const persistProfileLocally = (userId: string, name?: string, userEmail?: string) => {
    const profile = {
      id: userId,
      full_name: name || "German Learner",
      email: userEmail || "guest@deutschpfad.com",
      learning_reason: reason,
      current_level: calibratedLevel,
      target_level: targetLevel,
      daily_study_minutes: dailyMinutes,
      onboarding_completed: true,
      streak_count: 1,
      xp_points: 50, // Reward XP earned in onboarding!
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("deutschpfad_user_profile", JSON.stringify(profile));
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);
    setIsSubmittingAccount(true);

    if (!email || !password) {
      setAccountError("Please provide an email and password to secure your progress.");
      setIsSubmittingAccount(false);
      return;
    }
    if (password.length < 6) {
      setAccountError("Password must be at least 6 characters long.");
      setIsSubmittingAccount(false);
      return;
    }

    try {
      const isSupabaseConfigured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      if (!isSupabaseConfigured) {
        document.cookie = `deutschpfad_demo_user=demo-user-123; path=/; max-age=86400`;
        persistProfileLocally("demo-user-123", fullName, email);
        trackOnboardingStep("signup_completed", { method: "demo" });
        fireConfetti();
        addToast({
          type: "success",
          title: "Progress Saved!",
          message: "Welcome to DeutschPfad. Your 8 learned words & 50 XP are ready.",
        });
        router.push("/dashboard");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            learning_reason: reason,
            current_level: calibratedLevel,
            target_level: targetLevel,
            daily_study_minutes: dailyMinutes,
          },
        },
      });

      if (signUpError) {
        setAccountError(signUpError.message);
      } else {
        persistProfileLocally(data.user?.id || "user-new", fullName, email);
        trackOnboardingStep("signup_completed", { method: "email" });
        fireConfetti();
        addToast({
          type: "success",
          title: "Account Created!",
          message: "Your personalized roadmap is saved. Let's begin!",
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setAccountError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  const handleContinueAsGuest = () => {
    triggerHaptic("selection");
    document.cookie = `deutschpfad_demo_user=guest-explorer; path=/; max-age=86400`;
    persistProfileLocally("guest-explorer", "Guest Learner", "guest@deutschpfad.com");
    trackOnboardingStep("guest_continue");
    addToast({
      type: "info",
      title: "Continuing as Guest",
      message: "Your 50 XP and 8 words are temporarily stored in your browser.",
    });
    router.push("/dashboard");
  };

  /* ──────────────── Timeline Estimation Helper ──────────────── */

  const calculateEstimatedWeeks = () => {
    const levelRanks: Record<string, number> = { beginner: 1, a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 6 };
    const fromRank = levelRanks[calibratedLevel] || 1;
    const toRank = Math.max(fromRank + 1, levelRanks[targetLevel] || 3);
    const distance = toRank - fromRank;
    const paceMult = dailyMinutes === 10 ? 1.5 : dailyMinutes === 20 ? 1.0 : 0.7;
    return Math.max(4, Math.round(distance * 10 * paceMult));
  };

  /* ──────────────── Top Continuous Progress Bar Calculation ──────────────── */

  const progressPercentage = Math.round((stage / 6) * 100);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col justify-between min-h-[580px] sm:min-h-[640px] p-5 sm:p-8 rounded-[var(--radius-3xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-2xl)] relative overflow-hidden backdrop-blur-xl">
      {/* Subtle top indicator strip */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)]">
          <span className="uppercase tracking-wider">
            {stage === 1 && "Step 1 of 5 · Your Goal"}
            {stage === 2 && "Step 2 of 5 · Level Check"}
            {stage === 3 && "Step 3 of 5 · First 8 Words"}
            {stage === 4 && "Step 3 of 5 · Milestone Reward"}
            {stage === 5 && "Step 4 of 5 · Roadmap Reveal"}
            {stage === 6 && "Step 5 of 5 · Save Progress"}
          </span>
          <span className="font-mono text-[var(--color-brand-400)]">{progressPercentage}%</span>
        </div>
        <ProgressBar value={progressPercentage} color="brand" size="sm" />
      </div>

      {/* Main Animated Screen Container */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ══════════════════════════════════════════════════════════
              STAGE 1: GOAL QUESTION & DAILY PACE
             ══════════════════════════════════════════════════════════ */}
          {stage === 1 && (
            <motion.div
              key="stage1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-left space-y-1.5">
                <Badge variant="brand" size="xs">Step 1 · Orientation</Badge>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                  Why are you learning German?
                </h1>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  We tailor your dialogue scenarios and vocabulary decks to your immediate goal.
                </p>
              </div>

              {/* Goal Reason Cards - Optimized for 1-hand tap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOAL_REASONS.map((r) => {
                  const isSelected = reason === r.id;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setReason(r.id);
                      }}
                      className={`min-h-[58px] p-3 sm:p-3.5 rounded-[var(--radius-xl)] border text-left flex items-center gap-3 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/15 shadow-sm text-[var(--color-brand-300)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:border-[var(--color-border-2)] text-[var(--color-text-primary)]"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-[var(--color-brand-500)] text-white"
                            : "bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-heading text-xs sm:text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                          {r.title}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Daily Pace Choice */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Clock size={13} className="text-[var(--color-accent-400)]" />
                  <span>Daily Study Commitment</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {STUDY_PACING.map((p) => {
                    const isSelected = dailyMinutes === p.minutes;
                    return (
                      <button
                        key={p.minutes}
                        type="button"
                        onClick={() => {
                          triggerHaptic("selection");
                          setDailyMinutes(p.minutes);
                        }}
                        className={`p-2.5 rounded-[var(--radius-lg)] border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/15 text-[var(--color-accent-400)] font-bold shadow-sm"
                            : "border-[var(--color-border)] bg-[var(--color-surface-2)]/40 text-[var(--color-text-secondary)]"
                        }`}
                      >
                        <p className="font-heading text-xs font-bold">{p.minutes} min</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                          {p.minutes === 20 ? "Recommended" : p.minutes === 10 ? "Casual" : "Intense"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sticky Action Button */}
              <div className="pt-4">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleGoalContinue}
                  rightIcon={<ArrowRight size={18} />}
                  className="shadow-[var(--shadow-glow)] min-h-[52px]"
                >
                  Continue to Quick Level Check
                </Button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STAGE 2: QUICK LEVEL CHECK (5 QUESTIONS + SKIP OPTION)
             ══════════════════════════════════════════════════════════ */}
          {stage === 2 && (
            <motion.div
              key="stage2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Question Header & Skip option */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="xs">
                    Question {currentQuestionIdx + 1} of 5
                  </Badge>
                  <span className="text-[11px] font-bold text-[var(--color-accent-400)]">
                    CEFR {LEVEL_QUESTIONS[currentQuestionIdx].level}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSkipLevelCheck}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] transition-colors underline cursor-pointer py-1"
                >
                  Skip (I&apos;m a complete beginner)
                </button>
              </div>

              {/* Prompt */}
              <div className="space-y-2 text-left">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)] leading-snug">
                  {LEVEL_QUESTIONS[currentQuestionIdx].prompt}
                </h2>
              </div>

              {/* Multiple Choice Options - Large thumb-friendly cards */}
              <div className="space-y-2.5">
                {LEVEL_QUESTIONS[currentQuestionIdx].options.map((opt, idx) => {
                  const isSelected = selectedOptionIdx === idx;
                  let cardStyle = "border-[var(--color-border)] bg-[var(--color-surface-2)]/70 hover:border-[var(--color-brand-500)]/40";
                  if (showQuestionFeedback) {
                    if (opt.isCorrect) {
                      cardStyle = "border-[var(--color-success)] bg-[var(--color-success)]/15 text-[var(--color-success)]";
                    } else if (isSelected && !opt.isCorrect) {
                      cardStyle = "border-[var(--color-error)] bg-[var(--color-error)]/15 text-[var(--color-error)]";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={showQuestionFeedback}
                      onClick={() => handleSelectOption(idx, opt.isCorrect)}
                      className={`w-full min-h-[52px] p-3.5 rounded-[var(--radius-xl)] border text-left font-medium text-sm flex items-center justify-between transition-all duration-200 active:scale-[0.99] cursor-pointer ${cardStyle}`}
                    >
                      <span className="font-heading text-sm text-[var(--color-text-primary)]">
                        {opt.text}
                      </span>
                      {showQuestionFeedback && opt.isCorrect && (
                        <Check size={18} className="text-[var(--color-success)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback rule text if answered */}
              {showQuestionFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed"
                >
                  <span className="font-bold text-[var(--color-text-primary)]">Rule: </span>
                  {LEVEL_QUESTIONS[currentQuestionIdx].explanation}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STAGE 3: MINI LESSON (FIRST 8 WORDS)
             ══════════════════════════════════════════════════════════ */}
          {stage === 3 && miniLessonStep === "words" && (
            <motion.div
              key="stage3-words"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" size="xs">Mini Lesson · Word {activeWordIdx + 1} of 8</Badge>
                  <span className="text-[11px] text-[var(--color-text-muted)] font-semibold">60-sec fast drill</span>
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)]">
                  Listen &amp; Learn Your First Words
                </h2>
              </div>

              {/* Word Showcase Card */}
              <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-brand-500)]/40 bg-gradient-to-b from-[var(--color-surface-2)] to-[var(--color-surface)] shadow-lg space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] text-xs font-semibold">
                  <span>{EIGHT_WORDS[activeWordIdx].category}</span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                    {EIGHT_WORDS[activeWordIdx].german}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-mono">
                    /{EIGHT_WORDS[activeWordIdx].phonetic}/
                  </p>
                  <p className="text-base text-[var(--color-text-secondary)] font-medium pt-1">
                    {EIGHT_WORDS[activeWordIdx].english}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => playSpeech(EIGHT_WORDS[activeWordIdx].german)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] hover:border-[var(--color-brand-500)] transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Volume2 size={16} className="text-[var(--color-brand-400)] animate-pulse" />
                  <span>Listen Audio</span>
                </button>
              </div>

              {/* Word Navigation */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleNextWord}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[52px]"
                >
                  {activeWordIdx < EIGHT_WORDS.length - 1 ? "Next Word →" : "Check What You Learned →"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Mini Lesson Drill Test */}
          {stage === 3 && miniLessonStep === "drill" && (
            <motion.div
              key="stage3-drill"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="space-y-1">
                <Badge variant="accent" size="xs">Quick Check</Badge>
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[var(--color-text-primary)]">
                  Order a coffee in a German café:
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Use the words you just learned: <em>Kaffee</em> + <em>Bitte</em>
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  "Ein Kaffee, bitte!",
                  "Guten Tag, danke!",
                  "Tschüss, Tee!",
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleCheckDrill(opt)}
                    className="w-full min-h-[54px] p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/70 hover:border-[var(--color-brand-500)] text-left font-heading text-sm font-bold text-[var(--color-text-primary)] flex items-center justify-between transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <span>{opt}</span>
                    <ArrowRight size={16} className="text-[var(--color-text-muted)]" />
                  </button>
                ))}
              </div>

              {drillSuccess === false && (
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-error)]/15 border border-[var(--color-error)]/30 text-xs text-[var(--color-error)] font-medium">
                  Not quite — remember &ldquo;Kaffee&rdquo; means coffee and &ldquo;bitte&rdquo; means please! Tap &ldquo;Ein Kaffee, bitte!&rdquo;
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STAGE 4: REWARD SCREEN ("You Just Learned 8 German Words")
             ══════════════════════════════════════════════════════════ */}
          {stage === 4 && (
            <motion.div
              key="stage4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[var(--color-accent-400)] to-[var(--color-accent-600)] text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <Award size={36} />
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] text-xs font-bold">
                  <Sparkles size={14} /> +50 XP Earned
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                  You just learned 8 German words in 2 minutes!
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                  Grossartig! You now know core greetings, polite courtesies, and cafe ordering essentials.
                </p>
              </div>

              {/* 8 Words Showcase Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                {EIGHT_WORDS.map((w) => (
                  <div
                    key={w.german}
                    className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                        {w.german}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{w.english}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => playSpeech(w.german)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] p-1 cursor-pointer"
                      title="Play Audio"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleProceedToPlan}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[52px] shadow-[var(--shadow-glow)]"
                >
                  See My Personalized Roadmap
                </Button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STAGE 5: PERSONALISED PLAN REVEAL WITH ANIMATED TIMELINE
             ══════════════════════════════════════════════════════════ */}
          {stage === 5 && (
            <motion.div
              key="stage5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] text-xs font-bold">
                  <Sparkles size={14} /> Plan Calibrated
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                  Your Personalized Roadmap
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  Based on your pace ({dailyMinutes} min/day) and entry level ({calibratedLevel.toUpperCase()}).
                </p>
              </div>

              {/* Roadmap Milestones Animated Timeline */}
              <div className="p-4 sm:p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 space-y-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--color-border)] font-semibold">
                  <span className="text-[var(--color-text-muted)]">Target Horizon:</span>
                  <span className="text-[var(--color-accent-400)] font-bold">~{calculateEstimatedWeeks()} Weeks to {targetLevel.toUpperCase()}</span>
                </div>

                {/* Timeline Items */}
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--color-border)]">
                  {/* Milestone 1 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[var(--color-brand-500)] border-2 border-[var(--color-surface)] shadow-sm" />
                    <p className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                      Weeks 1–2 · Survival High German (A1)
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Ordering food, café dialogues, pronunciation &amp; gender articles.
                    </p>
                  </div>

                  {/* Milestone 2 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[var(--color-accent-500)] border-2 border-[var(--color-surface)] shadow-sm" />
                    <p className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                      Weeks 3–8 · Everyday Autonomy (A2)
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Apartment hunting, Bürgeramt appointments, past tense, accusative &amp; dative.
                    </p>
                  </div>

                  {/* Milestone 3 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[var(--color-success)] border-2 border-[var(--color-surface)] shadow-sm" />
                    <p className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                      Weeks 9–{calculateEstimatedWeeks()} · Professional Independent Speaker ({targetLevel.toUpperCase()})
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Complex discussions, workplace emails, and Goethe-Zertifikat certification readiness.
                    </p>
                  </div>
                </div>

                {/* Daily Breakdown */}
                <div className="pt-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center justify-between">
                  <span>Daily: {Math.round(dailyMinutes * 0.4)}m vocab + {Math.round(dailyMinutes * 0.6)}m dialogue</span>
                  <span className="text-[var(--color-success)] font-semibold">100% Free to begin</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleProceedToAccount}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[52px] shadow-[var(--shadow-glow)]"
                >
                  Save Progress &amp; Enter Dashboard
                </Button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STAGE 6: ACCOUNT CREATION PROMPT (TO SAVE PROGRESS)
             ══════════════════════════════════════════════════════════ */}
          {stage === 6 && (
            <motion.div
              key="stage6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 text-left"
            >
              <div className="space-y-1 text-center">
                <Badge variant="brand" size="xs">Save Your Achievements</Badge>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                  Save Your Roadmap &amp; 50 XP
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  You learned 8 German words today. Create a free account so your spaced repetition schedule is preserved.
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-around text-xs text-[var(--color-text-primary)] font-semibold">
                <div className="flex items-center gap-1.5 text-[var(--color-success)]">
                  <CheckCircle2 size={15} /> 8 Words Learned
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-accent-400)]">
                  <Sparkles size={15} /> +50 XP Saved
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-brand-400)]">
                  <Target size={15} /> {targetLevel.toUpperCase()} Roadmap
                </div>
              </div>

              {accountError && (
                <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-error)]/15 border border-[var(--color-error)]/30 text-xs text-[var(--color-error)]">
                  {accountError}
                </div>
              )}

              {/* Fast Form */}
              <form onSubmit={handleSaveAccount} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      placeholder="Johann Wolfgang"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  fullWidth
                  loading={isSubmittingAccount}
                  rightIcon={<ArrowRight size={18} />}
                  className="min-h-[50px] shadow-[var(--shadow-glow)] mt-2"
                >
                  Save Progress &amp; Start Learning
                </Button>
              </form>

              {/* Guest Pass Option - Zero Hard Wall */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] underline cursor-pointer"
                >
                  Skip for now, continue as Guest →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
