"use client";

import { motion, type Variants } from "framer-motion";
import {
  Brain, Flame, StickyNote, BarChart2,
  Mic, BookOpen, Timer, Award, Sparkles
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Spaced Repetition Flashcards",
    description:
      "Our adaptive SRS algorithm schedules each vocabulary card at the exact cognitive threshold before forgetting, doubling long-term retention.",
    color: "#6366f1",
    bg: "rgba(99, 102, 241, 0.12)",
  },
  {
    icon: Flame,
    title: "Daily Streaks & XP Habit",
    description:
      "Gamified streak milestones, daily XP targets, and achievement badges build an effortless, self-sustaining study routine.",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
  },
  {
    icon: StickyNote,
    title: "Interactive Grammar Matrix",
    description:
      "Crystal-clear English explanations with color-coded article charts (der/die/das), cases (Akkusativ/Dativ), and declension tables.",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.12)",
  },
  {
    icon: BarChart2,
    title: "Detailed Progress Analytics",
    description:
      "Interactive radar charts and retention curves visualize your vocabulary mastery, unit completion, and skill strengths across all levels.",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
  },
  {
    icon: Mic,
    title: "Speaking & Pronunciation",
    description:
      "Record yourself, compare your intonation with native German audio, and master tricky sounds like 'ch', 'r', and the umlauts (ä, ö, ü).",
    color: "#06b6d4",
    bg: "rgba(6, 182, 212, 0.12)",
  },
  {
    icon: BookOpen,
    title: "Everyday German Dialogues",
    description:
      "Immerse yourself in authentic conversations set across Berlin, Munich, and Vienna — at the café, bakery, Bürgeramt, and doctor's office.",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
  },
  {
    icon: Timer,
    title: "Timed Full Mock Exams",
    description:
      "Simulate Goethe-Institut, telc, and TestDaF exam formats under timed conditions with instant score breakdowns and review analysis.",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
  },
  {
    icon: Award,
    title: "Adaptive Placement Test",
    description:
      "Skip what you already know. Our diagnostic assessment accurately places you in your exact CEFR level in under 10 minutes.",
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.07 },
  }),
};

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      {/* Decorative ambient lighting */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-brand-600)] opacity-[0.05] blur-[140px] pointer-events-none" />

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Sparkles size={13} /> Comprehensive Toolset
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Master German</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
            A complete, science-backed learning ecosystem — not just a vocabulary list.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              custom={i}
              variants={fadeUp}
              className="group p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/40 hover:shadow-[var(--shadow-xl)] transition-all duration-300 hover:-translate-y-1.5 cursor-default relative overflow-hidden"
            >
              <div
                className="w-12 h-12 rounded-[var(--radius-xl)] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner"
                style={{ background: f.bg }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)] mb-2">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
