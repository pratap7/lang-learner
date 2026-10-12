"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Briefcase, GraduationCap, FileCheck, Home, Heart,
  Baby, MessageSquare, HelpCircle, ArrowRight, ArrowLeft,
  CheckCircle2, Calendar, Clock, Target, Sparkles, Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { DeutschMascot } from "@/components/mascot/DeutschMascot";
import { playClickSound, playCompletionFanfare, playSuccessChime, triggerHaptic } from "@/lib/soundEffects";
import { fireConfetti } from "@/lib/confetti";
import type { LearningReason, CefrLevel, DailyStudyMinutes } from "@/types/database.types";

const REASONS: { id: LearningReason; title: string; desc: string; icon: typeof Plane }[] = [
  { id: "travel",    title: "Travel & Holidays",      desc: "Order food, ask directions, and explore DACH countries freely", icon: Plane },
  { id: "work",      title: "Career & Work",          desc: "Unlock European career opportunities and speak with colleagues", icon: Briefcase },
  { id: "study",     title: "University & Study",     desc: "Prepare for admissions and academic studies in Germany", icon: GraduationCap },
  { id: "exam",      title: "Certification Exam",     desc: "Pass Goethe-Zertifikat, telc, or TestDaF with high marks", icon: FileCheck },
  { id: "migration", title: "Relocation & Life",      desc: "Settle smoothly, integrate, and meet citizenship requirements", icon: Home },
  { id: "hobby",     title: "Culture & Passion",      desc: "Enjoy German literature, cinema, philosophy, and mind training", icon: Heart },
];

const CURRENT_LEVELS: { id: CefrLevel; title: string; desc: string; badge: string; icon: typeof Baby }[] = [
  {
    id: "beginner",
    title: "Complete Beginner",
    desc: "I am starting from scratch or know only a handful of words (Hallo, Danke).",
    badge: "A1.1",
    icon: Baby,
  },
  {
    id: "intermediate",
    title: "I know some German",
    desc: "I understand basic sentence structure and common everyday vocabulary.",
    badge: "A2–B1",
    icon: MessageSquare,
  },
  {
    id: "not_sure",
    title: "Not sure — Placement Test",
    desc: "We will calibrate your baseline level with an adaptive 10-minute diagnostic.",
    badge: "Diagnostic",
    icon: HelpCircle,
  },
];

const TARGET_LEVELS: { id: CefrLevel; label: string; desc: string }[] = [
  { id: "a1", label: "A1 · Beginner", desc: "Basic survival phrases and introductions" },
  { id: "a2", label: "A2 · Elementary", desc: "Everyday communication and simple routines" },
  { id: "b1", label: "B1 · Intermediate", desc: "Independent speaker (Standard visa/citizenship requirement)" },
  { id: "b2", label: "B2 · Vantage", desc: "Professional workplace fluency & university entry" },
  { id: "c1", label: "C1 · Effective Fluency", desc: "Complex discourse and academic excellence" },
  { id: "c2", label: "C2 · Mastery", desc: "Native-level precision and expression" },
];

const STUDY_TIMES: { minutes: DailyStudyMinutes; label: string; desc: string }[] = [
  { minutes: 10, label: "Casual · 10 min", desc: "1 bite-sized lesson + flashcards" },
  { minutes: 20, label: "Regular · 20 min", desc: "Recommended: 1 full unit + SRS drills" },
  { minutes: 30, label: "Dedicated · 30 min", desc: "Accelerated progress with dialogues" },
  { minutes: 60, label: "Intense · 60 min", desc: "Maximum immersion & mock exams" },
];

export function OnboardingWizard() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form selections
  const [reason, setReason] = useState<LearningReason>("work");
  const [currentLevel, setCurrentLevel] = useState<CefrLevel>("beginner");
  const [targetLevel, setTargetLevel] = useState<CefrLevel>("b1");
  const [examDate, setExamDate] = useState<string>("");
  const [dailyMinutes, setDailyMinutes] = useState<DailyStudyMinutes>(20);

  // Calculation helpers
  const calculateWeeksToGoal = () => {
    const levelOrder = ["beginner", "a1", "a2", "b1", "b2", "c1", "c2"];
    const fromIdx = currentLevel === "intermediate" ? 2 : currentLevel === "not_sure" ? 1 : 0;
    const toIdx = Math.max(fromIdx + 1, levelOrder.indexOf(targetLevel));
    const levelsDistance = Math.max(1, toIdx - fromIdx);
    const speedFactor = dailyMinutes === 10 ? 1.6 : dailyMinutes === 20 ? 1.0 : dailyMinutes === 30 ? 0.7 : 0.45;
    return Math.round(levelsDistance * 12 * speedFactor);
  };

  const [isCalculatingPlan, setIsCalculatingPlan] = useState(false);

  const handleNext = () => {
    triggerHaptic("selection");
    playClickSound();

    if (step === 3) {
      setIsCalculatingPlan(true);
      setTimeout(() => {
        setIsCalculatingPlan(false);
        setStep(4);
        playCompletionFanfare();
        triggerHaptic("success");
        fireConfetti();
      }, 1200);
    } else if (step < 4) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    triggerHaptic("selection");
    playClickSound();
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);

    try {
      // 1. Check if user is logged in via Supabase
      const { data: { user } } = await supabase.auth.getUser();

      const profilePayload = {
        learning_reason: reason,
        current_level: currentLevel,
        target_level: targetLevel,
        target_exam_date: examDate ? examDate : null,
        daily_study_minutes: dailyMinutes,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      if (user) {
        const { error } = await supabase
          .from("user_profiles")
          .update(profilePayload)
          .eq("id", user.id);

        if (error) {
          console.warn("Could not save to Supabase directly, persisting to local storage:", error.message);
        }
      }

      // Also persist to local storage for local demo fallback
      const stored = localStorage.getItem("deutschpfad_user_profile");
      const existing = stored ? JSON.parse(stored) : {};
      const updatedProfile = {
        ...existing,
        ...profilePayload,
        streak_count: existing.streak_count || 1,
        xp_points: (existing.xp_points || 0) + 50, // Welcome XP bonus!
      };
      localStorage.setItem("deutschpfad_user_profile", JSON.stringify(updatedProfile));

      addToast({
        type: "success",
        title: "Willkommen bei DeutschPfad! 🎉",
        message: "Your personalised study plan is ready. +50 XP bonus earned!",
      });

      router.push("/profile");
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      addToast({
        type: "error",
        title: "Setup error",
        message: "Failed to save profile. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          <span>Step {step} of 4</span>
          <span>{step === 1 ? "Purpose" : step === 2 ? "Current Level" : step === 3 ? "Goal & Pace" : "Plan Ready"}</span>
        </div>
        <ProgressBar value={(step / 4) * 100} size="sm" color="brand" />
      </div>

      {/* Step Container Card */}
      <div className="p-8 sm:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] backdrop-blur-xl relative min-h-[480px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* STEP 1: Reason */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <Badge variant="primary" size="sm" className="mb-2">Goal Alignment</Badge>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                  Why are you learning German?
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  We tailor your vocabulary units, dialogue scenarios, and cultural tips to your exact focus.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
                {REASONS.map((r) => {
                  const Icon = r.icon;
                  const isSelected = reason === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReason(r.id)}
                      className={`text-left p-4 rounded-[var(--radius-xl)] border transition-all duration-200 flex items-start gap-3.5 ${
                        isSelected
                          ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/15 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-brand-400)]/40 bg-[var(--color-surface-2)]/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-[var(--radius-lg)] shrink-0 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                            : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
                          {r.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-snug">
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Current Level */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <Badge variant="accent" size="sm" className="mb-2">Baseline</Badge>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                  What is your current German level?
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Start exactly where you belong. You won&apos;t be bored by things you already know.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {CURRENT_LEVELS.map((lvl) => {
                  const Icon = lvl.icon;
                  const isSelected = currentLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCurrentLevel(lvl.id)}
                      className={`w-full text-left p-5 rounded-[var(--radius-xl)] border transition-all duration-200 flex items-center justify-between gap-4 ${
                        isSelected
                          ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/15 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-brand-400)]/40 bg-[var(--color-surface-2)]/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-[var(--radius-xl)] shrink-0 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                          }`}
                        >
                          <Icon size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-base font-semibold text-[var(--color-text-primary)]">
                              {lvl.title}
                            </span>
                            <Badge size="xs" variant={isSelected ? "primary" : "secondary"}>
                              {lvl.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                            {lvl.desc}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white shadow-sm"
                            : "border-[var(--color-border-2)]"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={14} className="stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentLevel === "not_sure" && (
                <div className="p-3.5 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-info)_25%,transparent)] text-xs text-[var(--color-text-secondary)] flex items-start gap-2.5">
                  <HelpCircle size={16} className="text-[var(--color-info)] shrink-0 mt-0.5" />
                  <span>
                    Our adaptive placement diagnostic takes ~10 minutes. If you proceed, we&apos;ll schedule it immediately upon dashboard entry.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Goal & Pace */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <Badge variant="b1" size="sm" className="mb-2">Target & Commitment</Badge>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                  Set your target level & pace
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Consistency beats intensity. Choose a daily rhythm you can stick to.
                </p>
              </div>

              {/* Target Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2.5 flex items-center gap-1.5">
                  <Target size={14} className="text-[var(--color-brand-400)]" />
                  Target CEFR Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TARGET_LEVELS.map((t) => {
                    const isSelected = targetLevel === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTargetLevel(t.id)}
                        className={`p-3 rounded-[var(--radius-lg)] border text-left transition-all ${
                          isSelected
                            ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/20 shadow-sm"
                            : "border-[var(--color-border)] bg-[var(--color-surface-2)]/50 hover:border-[var(--color-border-2)]"
                        }`}
                      >
                        <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                          {t.label}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daily Study Time */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-[var(--color-accent-500)]" />
                  Daily Study Time
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {STUDY_TIMES.map((s) => {
                    const isSelected = dailyMinutes === s.minutes;
                    return (
                      <button
                        key={s.minutes}
                        type="button"
                        onClick={() => setDailyMinutes(s.minutes)}
                        className={`p-3.5 rounded-[var(--radius-lg)] border text-left transition-all ${
                          isSelected
                            ? "border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            : "border-[var(--color-border)] bg-[var(--color-surface-2)]/50 hover:border-[var(--color-border-2)]"
                        }`}
                      >
                        <p className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                          {s.label}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          {s.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Exam Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[var(--color-brand-400)]" />
                  Target Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full sm:w-64 px-3.5 py-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)]"
                />
              </div>
            </motion.div>
          )}

          {/* Calculating Plan Loading State */}
          {isCalculatingPlan && (
            <motion.div
              key="calculating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-4"
            >
              <DeutschMascot
                state="thinking"
                size="lg"
                speechBubble={{
                  de: "Ich berechne deine optimale Lernroute...",
                  en: "Calculating your optimal study route...",
                }}
              />
              <div className="space-y-1.5 pt-2">
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Generating Your Personalised German Pathway
                </h3>
                <div className="flex flex-col gap-1.5 text-xs text-[var(--color-text-muted)] max-w-xs mx-auto text-left pt-2">
                  <div className="flex items-center gap-2 text-[var(--color-success)]">
                    <CheckCircle2 size={13} /> Calibrating {currentLevel.toUpperCase()} entry baseline
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-success)]">
                    <CheckCircle2 size={13} /> Structuring daily {dailyMinutes}-min micro-sessions
                  </div>
                  <div className="flex items-center gap-2 text-[var(--color-accent-400)] animate-pulse">
                    <Sparkles size={13} /> Projecting target {targetLevel.toUpperCase()} exam timeline
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Plan Confirmation */}
          {step === 4 && !isCalculatingPlan && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-[var(--color-brand-400)] text-xs font-semibold mb-2">
                    <Sparkles size={14} /> Plan Generated
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                    Your Personalised Roadmap
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Here is your structured German learning trajectory based on your preferences.
                  </p>
                </div>
                <DeutschMascot
                  state="celebrating"
                  size="md"
                  speechBubble={{
                    de: "Dein Plan ist fertig!",
                    en: "Your plan is ready!",
                  }}
                />
              </div>

              {/* Summary Overview Card */}
              <div className="p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Starting At</p>
                    <p className="font-heading text-lg font-bold text-[var(--color-text-primary)] uppercase mt-0.5">
                      {currentLevel === "not_sure" ? "Diagnostic" : currentLevel}
                    </p>
                  </div>
                  <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Target Level</p>
                    <p className="font-heading text-lg font-bold text-[var(--color-brand-500)] uppercase mt-0.5">
                      {targetLevel}
                    </p>
                  </div>
                  <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Daily Pace</p>
                    <p className="font-heading text-lg font-bold text-[var(--color-text-primary)] mt-0.5">
                      {dailyMinutes} min
                    </p>
                  </div>
                  <div className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)]">Est. Timeline</p>
                    <p className="font-heading text-lg font-bold text-[var(--color-accent-500)] mt-0.5">
                      ~{calculateWeeksToGoal()} wks
                    </p>
                  </div>
                </div>

                {/* Daily Schedule Breakdown */}
                <div className="pt-2 border-t border-[var(--color-border)] space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Your Daily {dailyMinutes}-Minute Routine
                  </p>
                  <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] shrink-0" />
                      <span>{Math.round(dailyMinutes * 0.3)} min Spaced-Repetition Vocabulary cards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-500)] shrink-0" />
                      <span>{Math.round(dailyMinutes * 0.5)} min Structured Grammar & Dialogue lesson</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] shrink-0" />
                      <span>{Math.round(dailyMinutes * 0.2)} min Pronunciation check & daily streak review</span>
                    </div>
                  </div>
                </div>

                {/* Milestone bonus */}
                <div className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-accent-500)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-accent-500)_25%,transparent)]">
                  <Award size={20} className="text-[var(--color-accent-500)] shrink-0" />
                  <p className="text-xs text-[var(--color-text-primary)]">
                    <strong>Onboarding Bonus:</strong> You will unlock the <em>&ldquo;Erster Schritt&rdquo;</em> (First Step) badge and +50 XP upon confirmation!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Navigation Buttons */}
        <div className="pt-8 border-t border-[var(--color-border)] mt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              disabled={submitting}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              rightIcon={<ArrowRight size={16} />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              loading={submitting}
              onClick={handleComplete}
              rightIcon={<Sparkles size={16} />}
              className="shadow-[var(--shadow-glow)]"
            >
              Confirm & Start DeutschPfad
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
