"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen, CheckCircle2, Lock, ArrowRight, Sparkles,
  Flame, Award, Bookmark, Clock, ShieldCheck, Compass, HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "./ProgressRing";
import {
  CEFR_LEVELS,
  type LevelItem,
  getCompletedLessons,
  getBookmarkedLessons,
  calculateLevelCompletionPercentage,
} from "@/lib/courseData";

export function CoursesOverview() {
  const [completedCount, setCompletedCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [userProfile, setUserProfile] = useState<{
    current_level?: string;
    target_level?: string;
    xp_points?: number;
    streak_count?: number;
  }>({
    current_level: "a1",
    target_level: "b1",
    xp_points: 120,
    streak_count: 5,
  });

  const [levelProgress, setLevelProgress] = useState<Record<string, number>>({
    a1: 25,
    a2: 0,
    b1: 0,
    b2: 0,
    c1: 0,
    c2: 0,
  });

  useEffect(() => {
    // Read completed lessons and bookmarks
    const completed = getCompletedLessons();
    setCompletedCount(completed.length);

    const bookmarks = getBookmarkedLessons();
    setBookmarksCount(bookmarks.length);

    // Compute progress for each CEFR level
    const progressMap: Record<string, number> = {};
    for (const lvl of CEFR_LEVELS) {
      progressMap[lvl.code] = calculateLevelCompletionPercentage(lvl.code);
    }
    setLevelProgress(progressMap);

    // Read profile
    const stored = localStorage.getItem("deutschpfad_user_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
      } catch {
        // Ignore
      }
    }
  }, []);

  const currentLevelCode = (userProfile.current_level || "a1").toLowerCase();
  const targetLevelCode = (userProfile.target_level || "b1").toLowerCase();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Top Header Hero */}
      <div className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur-xl pb-12 overflow-hidden">
        {/* Subtle Brand gradient bar at top */}
        <div className="h-1 w-full bg-gradient-to-r from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-accent-500)] opacity-90 absolute top-0 left-0 right-0" />

        {/* Top Navigation Row */}
        <div className="container-xl pt-4 pb-6 flex items-center justify-between border-b border-[var(--color-border)]/50 mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-600)] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen size={16} />
            </div>
            <span className="font-heading font-bold text-base text-[var(--color-text-primary)]">
              Deutsch<span className="text-[var(--color-brand-400)]">Pfad</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="ghost" size="sm">
                Goals & Exam
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary" size="sm">
                Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient lighting glow */}
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-[var(--color-brand-600)] opacity-[0.08] blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[var(--color-accent-500)] opacity-[0.06] blur-[120px] pointer-events-none" />

        <div className="container-xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
                <Compass size={13} /> Official CEFR Standard Curriculum
              </div>
              <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight">
                Course Pathways · <span className="text-gradient">A1 to C2</span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 max-w-2xl leading-relaxed">
                Step-by-step units structured to Goethe-Institut and telc certification standards. Learn with interactive vocabulary audio, grammar matrices, and real dialogues.
              </p>
            </div>

            {/* User Quick Stats Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[var(--color-surface-2)]/90 border border-[var(--color-border)] shadow-sm backdrop-blur-md shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/70 text-center min-w-[74px]">
                <div className="flex items-center justify-center gap-1 text-[var(--color-accent-500)]">
                  <Flame size={15} className="fill-current text-amber-500" />
                  <span className="font-heading text-sm font-bold">{userProfile.streak_count || 3}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">Streak</p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/70 text-center min-w-[74px]">
                <div className="flex items-center justify-center gap-1 text-[var(--color-brand-400)]">
                  <Sparkles size={15} />
                  <span className="font-heading text-sm font-bold">{userProfile.xp_points || 120}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">XP</p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/70 text-center min-w-[74px]">
                <div className="flex items-center justify-center gap-1 text-[var(--color-success)]">
                  <CheckCircle2 size={15} />
                  <span className="font-heading text-sm font-bold">{completedCount}</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">Completed</p>
              </div>

              {bookmarksCount > 0 && (
                <div className="px-3.5 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]/70 text-center min-w-[74px]">
                  <div className="flex items-center justify-center gap-1 text-[var(--color-c2)]">
                    <Bookmark size={15} className="fill-current" />
                    <span className="font-heading text-sm font-bold">{bookmarksCount}</span>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">Saved</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid of Level Cards */}
      <div className="container-xl py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CEFR_LEVELS.map((level, i) => {
            const isA1 = level.code === "a1";
            const isA2 = level.code === "a2";
            // Lock logic: A1 and A2 unlocked, B1+ unlocked if user target/current matches or placement done
            const isUnlocked = isA1 || isA2 || currentLevelCode === level.code || targetLevelCode === level.code;
            const isRecommended = currentLevelCode === level.code || (currentLevelCode === "beginner" && isA1);
            const isTarget = targetLevelCode === level.code;
            const progressPct = levelProgress[level.code] ?? 0;

            return (
              <motion.div
                key={level.code}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                  isRecommended
                    ? "border-[var(--color-brand-500)]/70 bg-[var(--color-surface)] shadow-[0_12px_40px_-10px_rgba(99,102,241,0.22)] ring-1 ring-[var(--color-brand-500)]/40 hover:-translate-y-1"
                    : isUnlocked
                    ? "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/50 hover:shadow-[var(--shadow-lg)] hover:-translate-y-1"
                    : "border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/40 opacity-85"
                }`}
              >
                {/* Top Level Stripe Accent */}
                <div
                  className="h-1.5 w-full bg-gradient-to-r opacity-90"
                  style={{ backgroundImage: `linear-gradient(to right, ${level.colorHex}, ${level.colorHex}aa)` }}
                />

                {/* Recommended / Target Ribbon */}
                {isRecommended && (
                  <div className="absolute top-3.5 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] text-white text-[11px] font-bold shadow-md uppercase tracking-wider border border-white/15">
                      <Sparkles size={11} /> Recommended
                    </span>
                  </div>
                )}
                {!isRecommended && isTarget && (
                  <div className="absolute top-3.5 right-4 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] text-slate-950 text-[11px] font-bold shadow-md uppercase tracking-wider">
                      Target Goal
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-7 flex-1">
                  {/* Top Level Info Strip */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-heading text-lg font-bold text-white shadow-md shrink-0"
                        style={{ background: level.colorHex }}
                      >
                        {level.badgeLabel}
                      </div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)] leading-snug">
                          {level.name}
                        </h2>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium mt-0.5">
                          {level.nameDe}
                        </p>
                      </div>
                    </div>

                    {/* Progress Ring */}
                    {isUnlocked ? (
                      <ProgressRing
                        progress={progressPct}
                        color={level.colorHex}
                        size={60}
                        strokeWidth={5}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-text-muted)] border border-[var(--color-border)] shrink-0" title="Locked Level">
                        <Lock size={16} />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5 line-clamp-3">
                    {level.description}
                  </p>

                  {/* Official Exam Badge */}
                  <div className="mb-4 p-2.5 rounded-xl bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[var(--color-success)] shrink-0" />
                    <span className="truncate">Exam: <strong className="text-[var(--color-text-primary)]">{level.officialExam}</strong></span>
                  </div>

                  {/* Units & Guided Hours Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--color-border)]/70 text-center text-xs mb-4">
                    <div>
                      <p className="font-heading font-bold text-sm text-[var(--color-text-primary)]">{level.unitsCount}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium mt-0.5">Units</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm text-[var(--color-text-primary)]">{level.lessonsCount}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium mt-0.5">Lessons</p>
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm text-[var(--color-text-primary)]">~{level.guidedHours}h</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium mt-0.5">Guided</p>
                    </div>
                  </div>

                  {/* Key Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {level.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2.5 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  {isUnlocked ? (
                    <Link href={`/courses/${level.code}`} className="block w-full">
                      <Button
                        variant={isRecommended ? "primary" : "secondary"}
                        size="md"
                        className="w-full justify-between"
                        rightIcon={<ArrowRight size={15} />}
                      >
                        {isA1 ? "Continue A1 Path" : `Explore ${level.badgeLabel} Path`}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/onboarding" className="block w-full">
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full justify-between opacity-80 hover:opacity-100"
                        leftIcon={<Lock size={13} className="text-[var(--color-text-muted)]" />}
                        rightIcon={<ArrowRight size={14} />}
                      >
                        Unlock via Placement
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
