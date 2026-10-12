"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, Lock, Play, BookOpen,
  Sparkles, Award, Clock, ArrowRight, Bookmark, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getLevel,
  getUnitsForLevel,
  getCompletedLessons,
  type UnitItem,
  type LevelItem,
} from "@/lib/courseData";

interface LevelRoadmapViewProps {
  levelCode: string;
}

export function LevelRoadmapView({ levelCode }: LevelRoadmapViewProps) {
  const level = getLevel(levelCode);
  const units = getUnitsForLevel(levelCode);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    setCompletedLessons(getCompletedLessons());
  }, []);

  if (!level) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-4">
          Level Not Found
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          The requested CEFR level does not exist in our curriculum.
        </p>
        <Link href="/courses">
          <Button variant="primary">Back to All Courses</Button>
        </Link>
      </div>
    );
  }

  // Calculate metrics
  const totalLessonsInLevel = units.reduce((acc, u) => acc + u.lessons.length, 0);
  const completedInLevel = completedLessons.filter((id) => id.startsWith(levelCode.toLowerCase())).length;
  const progressPct = Math.min(100, Math.round((completedInLevel / (totalLessonsInLevel || 1)) * 100));

  // Determine the next lesson to resume
  let resumeLessonId = "a1-u1-l1";
  for (const unit of units) {
    for (const l of unit.lessons) {
      if (!completedLessons.includes(l.id)) {
        resumeLessonId = l.id;
        break;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Top Sticky Navigation Strip */}
      <div className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 backdrop-blur-xl">
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="w-9 h-9 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold font-heading shadow-sm"
                style={{ background: level.colorHex }}
              >
                {level.badgeLabel}
              </div>
              <h1 className="font-heading text-sm sm:text-base font-bold text-[var(--color-text-primary)] truncate">
                {level.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] font-semibold text-[var(--color-text-muted)]">
                {completedInLevel} of {totalLessonsInLevel} Lessons Done
              </p>
              <div className="w-28 mt-1">
                <ProgressBar value={progressPct} color={level.code} size="xs" />
              </div>
            </div>

            <Link href={`/lesson/${resumeLessonId}`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play size={13} className="fill-current text-[var(--color-accent-400)]" />}
              >
                Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Level Banner Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] relative overflow-hidden">
          <div
            className="absolute top-0 right-0 w-80 h-40 opacity-10 pointer-events-none rounded-full blur-3xl"
            style={{ background: level.colorHex }}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Badge variant={level.code as any} size="sm">
                  {level.badgeLabel} Pathway
                </Badge>
                <span className="text-xs text-[var(--color-text-muted)]">
                  ~{level.guidedHours} Guided Hours
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                {level.nameDe} Roadmap
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-xl leading-relaxed">
                Follow this vertical path sequentially. Each lesson is bite-sized with audio flashcards, grammar breakdowns, dialogues, and cultural etiquette.
              </p>
            </div>

            <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-center gap-2.5 shrink-0">
              <ShieldCheck size={20} className="text-[var(--color-success)] shrink-0" />
              <div>
                <p className="font-bold text-[var(--color-text-primary)]">Target Credential</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{level.officialExam}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Spine Path */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div className="relative">
          {/* Vertical Connecting Line Spine */}
          <div
            className="absolute left-6 sm:left-8 top-10 bottom-24 w-1 bg-gradient-to-b from-[var(--color-brand-500)] via-[var(--color-accent-500)] to-[var(--color-border)] rounded-full opacity-30"
          />

          <div className="space-y-12">
            {units.map((unit, unitIdx) => {
              const unitLessonsCompleted = unit.lessons.filter((l) =>
                completedLessons.includes(l.id)
              ).length;
              const isUnitFullyCompleted = unitLessonsCompleted === unit.lessons.length;

              return (
                <div key={unit.id} className="relative">
                  {/* Unit Header Section */}
                  <div className="flex items-start gap-4 sm:gap-6 mb-6">
                    {/* Unit Milestone Marker */}
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[var(--radius-xl)] flex items-center justify-center shrink-0 shadow-md font-heading font-bold text-white z-10 transition-transform ${
                        isUnitFullyCompleted
                          ? "bg-[var(--color-success)] ring-4 ring-[var(--color-success)]/20"
                          : "bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-500)] ring-4 ring-[var(--color-brand-500)]/20"
                      }`}
                    >
                      {isUnitFullyCompleted ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <span className="text-lg">0{unit.orderIndex}</span>
                      )}
                    </div>

                    {/* Unit Title Banner */}
                    <div className="flex-1 p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-brand-400)]">
                          Unit {unit.orderIndex}
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] font-medium">
                          {unitLessonsCompleted} / {unit.lessons.length} Finished
                        </span>
                      </div>
                      <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                        {unit.title}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {unit.description}
                      </p>
                    </div>
                  </div>

                  {/* Lessons Along the Spine */}
                  <div className="pl-6 sm:pl-8 ml-6 sm:ml-8 space-y-3.5 border-l-2 border-transparent">
                    {unit.lessons.map((lesson, lessonIdx) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      // In Unit 1: Lesson 1 & 2 are open, others open progressively
                      const isPreviousCompleted = lessonIdx === 0 || completedLessons.includes(unit.lessons[lessonIdx - 1]?.id);
                      const isUnlocked = isCompleted || isPreviousCompleted || lessonIdx <= 1;
                      const isCurrent = isUnlocked && !isCompleted;

                      return (
                        <motion.div
                          key={lesson.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: lessonIdx * 0.05 }}
                          className="relative"
                        >
                          {/* Horizontal Connector Pin */}
                          <div className="absolute -left-[30px] sm:-left-[38px] top-1/2 -translate-y-1/2 w-6 sm:w-7 h-0.5 bg-[var(--color-border)] opacity-80" />

                          {/* Node Icon Circle */}
                          <div
                            className={`absolute -left-[38px] sm:-left-[46px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 z-10 transition-all ${
                              isCompleted
                                ? "bg-[var(--color-success)] border-white shadow-sm ring-2 ring-[var(--color-success)]/30"
                                : isCurrent
                                ? "bg-[var(--color-brand-500)] border-white shadow-md ring-4 ring-[var(--color-brand-500)]/30"
                                : "bg-[var(--color-surface-3)] border-[var(--color-border-2)]"
                            }`}
                          />

                          {/* Lesson Card */}
                          <div
                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                              isCurrent
                                ? "border-[var(--color-brand-500)]/70 bg-[var(--color-surface)] shadow-[0_6px_28px_rgba(99,102,241,0.18)] ring-1 ring-[var(--color-brand-500)]/40 hover:-translate-y-0.5"
                                : isCompleted
                                ? "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/40 shadow-sm hover:-translate-y-0.5"
                                : "border-[var(--color-border)]/60 bg-[var(--color-surface-2)]/40 opacity-75"
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isCompleted
                                    ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                                    : isCurrent
                                    ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]"
                                    : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={20} />
                                ) : isUnlocked ? (
                                  <Play size={18} className="fill-current ml-0.5" />
                                ) : (
                                  <Lock size={16} />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-heading text-sm sm:text-base font-bold text-[var(--color-text-primary)]">
                                    {lesson.title}
                                  </h4>
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                    {lesson.type}
                                  </span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-brand-500)] text-white shadow-sm">
                                      Next Up
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                  {lesson.titleDe}
                                </p>
                              </div>
                            </div>

                            {/* Right action / meta */}
                            <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]/50">
                              <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock size={13} /> {lesson.estMinutes}m
                                </span>
                                <span className="flex items-center gap-1 text-[var(--color-accent-500)] font-semibold">
                                  <Sparkles size={13} className="text-amber-500" /> +{lesson.xpReward} XP
                                </span>
                              </div>

                              {isUnlocked ? (
                                <Link href={`/lesson/${lesson.id}`}>
                                  <Button
                                    variant={isCurrent ? "primary" : "secondary"}
                                    size="sm"
                                    rightIcon={<ArrowRight size={14} />}
                                  >
                                    {isCompleted ? "Review" : "Start Lesson"}
                                  </Button>
                                </Link>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-surface-3)]/60 text-xs text-[var(--color-text-muted)] font-medium border border-[var(--color-border)]/40">
                                  <Lock size={12} /> Locked
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {/* Unit Quiz Call-out */}
                    <div className="p-3.5 rounded-xl border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-600)]/10 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Award size={16} className="text-[var(--color-brand-400)] shrink-0" />
                        <div>
                          <p className="font-bold text-[var(--color-text-primary)]">
                            Unit {unit.orderIndex} Assessment Quiz
                          </p>
                          <p className="text-[10px] text-[var(--color-text-secondary)]">
                            10 questions · Pass mark: 70%
                          </p>
                        </div>
                      </div>

                      <Link href={`/tests/quiz/quiz-${level.code.toLowerCase()}-u${unit.orderIndex}`}>
                        <Button variant="outline" size="sm" className="text-xs" rightIcon={<ArrowRight size={12} />}>
                          Take Quiz
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Final Exam Milestone Node */}
            <div className="relative pt-6">
              <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-accent-500)]/40 bg-[var(--color-accent-500)]/10 text-center shadow-lg relative overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-[var(--color-accent-500)] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Award size={28} />
                </div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                  {level.officialExam}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto mt-1 mb-4">
                  Full-length timed simulation test modelled on standard Goethe/telc format: Reading, Listening, Grammar, Writing, and Speaking.
                </p>
                <Link href={`/tests/mock/${level.code.toLowerCase()}`}>
                  <Button variant="accent" size="md" rightIcon={<ArrowRight size={14} />}>
                    Start {level.officialExam} Mock Exam
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
