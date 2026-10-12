"use client";

import { motion, type Variants } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CheckCircle2, Sparkles, BookOpen } from "lucide-react";

const levels = [
  {
    id:    "A1",
    label: "A1 · Beginner (Breakthrough)",
    color:  "a1" as const,
    description: "Greetings, numbers, ordering food, basic grammar rules, and simple survival interactions in German-speaking countries.",
    units: 6,
    lessons: 36,
    weeks: "4–6 weeks",
    progress: 100,
    skills: ["Vocabulary", "Grammar", "Listening", "Survival Speaking"],
    exam: "Goethe-Zertifikat A1: Start Deutsch 1",
  },
  {
    id:    "A2",
    label: "A2 · Elementary (Waystage)",
    color:  "a2" as const,
    description: "Everyday situations, past and future tenses, describing surroundings, routines, and writing simple personal messages.",
    units: 8,
    lessons: 48,
    weeks: "6–8 weeks",
    progress: 85,
    skills: ["Conversational German", "Grammar", "Reading"],
    exam: "Goethe-Zertifikat A2 / telc Deutsch A2",
  },
  {
    id:    "B1",
    label: "B1 · Intermediate (Threshold)",
    color:  "b1" as const,
    description: "Expressing opinions, travel situations, work conversations, Subjunctive II (Konjunktiv II), and reading longer articles.",
    units: 10,
    lessons: 60,
    weeks: "10–14 weeks",
    progress: 45,
    skills: ["Grammar", "Fluent Speaking", "Writing", "German Citizenship Requirement"],
    exam: "Goethe-Zertifikat B1 / DTZ (Deutsch-Test für Zuwanderer)",
  },
  {
    id:    "B2",
    label: "B2 · Upper-Intermediate (Vantage)",
    color:  "b2" as const,
    description: "Complex technical discussions, professional workplace fluency, spontaneous conversation, and nuanced debate.",
    units: 10,
    lessons: 60,
    weeks: "12–16 weeks",
    progress: 0,
    skills: ["Professional German", "Academic Writing", "Culture"],
    exam: "Goethe-Zertifikat B2 / telc Deutsch B2 / TestDaF",
  },
  {
    id:    "C1",
    label: "C1 · Advanced (Effective Fluency)",
    color:  "c1" as const,
    description: "Demanding long texts, implicit meaning, flexible communication for social, academic, and professional goals.",
    units: 8,
    lessons: 48,
    weeks: "14–20 weeks",
    progress: 0,
    skills: ["High Academic German", "Complex Nuance", "Literature"],
    exam: "Goethe-Zertifikat C1 / telc Deutsch C1 Hochschule",
  },
  {
    id:    "C2",
    label: "C2 · Mastery (Native Precision)",
    color:  "c2" as const,
    description: "Effortless comprehension, native-level precision, summarizing complex arguments, and masterful idiomatic expression.",
    units: 6,
    lessons: 36,
    weeks: "20+ weeks",
    progress: 0,
    skills: ["Mastery", "All 4 Skills", "Dialects & Idioms"],
    exam: "Goethe-Zertifikat C2: GDS (Großes Deutsches Sprachdiplom)",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show:   (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay: i * 0.1 },
  }),
};

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 bg-[var(--color-surface-2)]/50 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      <div className="container-xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <BookOpen size={13} /> Official CEFR Standard Curriculum
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            A1 to C2 — Every Level,{" "}
            <span className="text-gradient">Fully Structured</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Six progressive milestones mapped to international standards, with estimated study hours, target exam credentials, and tailored units.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical spine */}
          <div className="absolute left-1/2 -translate-x-px top-8 bottom-8 w-1 bg-gradient-to-b from-[var(--color-a1)] via-[var(--color-b1)] to-[var(--color-c2)] opacity-25 hidden lg:block rounded-full" />

          <div className="grid gap-6">
            {levels.map((level, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={level.id}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.05 }}
                  custom={i}
                  variants={fadeUp}
                  className={`flex flex-col lg:flex-row items-center gap-4 lg:gap-8 ${
                    isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Card */}
                  <div className="w-full lg:w-[calc(50%-3rem)] group">
                    <div className="relative p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/40 hover:shadow-[var(--shadow-xl)] transition-all duration-300 hover:-translate-y-1">
                      {/* Subtle level background accent */}
                      <div
                        className="absolute inset-0 rounded-[var(--radius-2xl)] opacity-[0.03] pointer-events-none"
                        style={{ background: `var(--color-${level.id.toLowerCase()})` }}
                      />

                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={level.color} size="md">
                              {level.id}
                            </Badge>
                            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                              {level.weeks}
                            </span>
                          </div>
                          <h3 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
                            {level.label}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-[var(--color-surface-2)] text-[11px] font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                            {level.units} units · {level.lessons} lessons
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                        {level.description}
                      </p>

                      {/* Exam certification pill */}
                      <div className="mb-4 p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]/70 border border-[var(--color-border)]/80 text-[11px] text-[var(--color-text-secondary)] flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-[var(--color-success)] shrink-0" />
                        <span>Prepares for: <strong className="text-[var(--color-text-primary)]">{level.exam}</strong></span>
                      </div>

                      {/* Skill pills */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {level.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Progress */}
                      <ProgressBar
                        value={level.progress}
                        color={level.color}
                        size="sm"
                        showValue
                        label={level.progress === 100 ? "Completed Mastered" : level.progress > 0 ? "In Progress" : "Available to Unlock"}
                      />
                    </div>
                  </div>

                  {/* Spine node */}
                  <div
                    className="hidden lg:flex w-12 h-12 shrink-0 rounded-full border-4 border-[var(--color-surface)] items-center justify-center font-heading font-bold text-sm text-white shadow-lg z-10 group-hover:scale-110 transition-transform"
                    style={{ background: `var(--color-${level.id.toLowerCase()})` }}
                  >
                    {level.id}
                  </div>

                  {/* Spacer for alternate side */}
                  <div className="hidden lg:block w-[calc(50%-3rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
