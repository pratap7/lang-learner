"use client";

import { motion, type Variants } from "framer-motion";
import { ClipboardCheck, BookOpenCheck, Zap, Trophy, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Adaptive Placement Test",
    description:
      "A 10-minute diagnostic pinpoints your exact CEFR level so you jump straight to the content you actually need — zero wasted time.",
    color: "#10b981",
    tag: "10 Min Diagnostic",
  },
  {
    number: "02",
    icon: BookOpenCheck,
    title: "Curated Daily Pathway",
    description:
      "Follow sequenced units covering vocabulary, grammar, reading, listening, and cultural nuance — matched strictly to CEFR standards.",
    color: "#3b82f6",
    tag: "CEFR A1–C2 Ladder",
  },
  {
    number: "03",
    icon: Zap,
    title: "Smart Spaced Practice",
    description:
      "Our SM-2 spaced repetition algorithm schedules vocabulary cards at the precise threshold before you forget. Guaranteed double retention.",
    color: "#6366f1",
    tag: "SRS Algorithm",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Exam Mastery & Level Up",
    description:
      "Take timed mock exams, unlock milestone badges, maintain your streak, and graduate to your next CEFR level with proven certification readiness.",
    color: "#f59e0b",
    tag: "Goethe / telc Ready",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay: i * 0.12 },
  }),
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Subtle divider line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      <div className="container-xl relative z-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Zap size={13} /> The 4-Step Methodology
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            From Zero to Fluent in{" "}
            <span className="text-gradient">Four Proven Steps</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
            A scientifically designed feedback loop that turns daily consistency into lasting conversational mastery.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line on desktop */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-[var(--color-a1)] via-[var(--color-brand-500)] to-[var(--color-accent-500)] opacity-25 pointer-events-none" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              custom={i}
              variants={fadeUp}
              className="relative"
            >
              <div className="group h-full flex flex-col items-center text-center p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/50 hover:shadow-[var(--shadow-xl)] transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden">
                {/* Number badge */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-110 mb-4"
                  style={{ background: step.color }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div
                  className="mb-4 w-14 h-14 rounded-[var(--radius-xl)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner"
                  style={{ background: `color-mix(in srgb, ${step.color} 14%, transparent)` }}
                >
                  <step.icon size={26} style={{ color: step.color }} />
                </div>

                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
                  style={{ background: `color-mix(in srgb, ${step.color} 12%, transparent)`, color: step.color }}
                >
                  {step.tag}
                </span>

                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
