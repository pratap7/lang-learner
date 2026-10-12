"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight, Play, Star, Users, BookOpen,
  TrendingUp, Sparkles, CheckCircle2, ShieldCheck, Flame
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const stats = [
  { icon: Users, label: "Active Learners", value: "50,000+", accent: "var(--color-brand-400)" },
  { icon: BookOpen, label: "Interactive Lessons", value: "1,200+", accent: "var(--color-a1)" },
  { icon: Star, label: "Learner Satisfaction", value: "4.9 / 5", accent: "var(--color-accent-500)" },
  { icon: TrendingUp, label: "Exam Pass Rate", value: "94%", accent: "var(--color-c1)" },
];

const floatingWords = [
  { word: "Hallo!",       meaning: "Hello",       x: "8%",  y: "22%", delay: 0,   level: "A1" },
  { word: "Danke",        meaning: "Thank you",   x: "82%", y: "18%", delay: 0.5, level: "A1" },
  { word: "Fernweh",      meaning: "Wanderlust",  x: "12%", y: "70%", delay: 1.0, level: "B1" },
  { word: "Gemütlichkeit",meaning: "Coziness",    x: "78%", y: "68%", delay: 1.5, level: "B2" },
  { word: "Wunderbar",    meaning: "Wonderful",   x: "65%", y: "84%", delay: 0.8, level: "A2" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center overflow-hidden pt-24 pb-16"
    >
      {/* Background ambient mesh and glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[650px] h-[650px] rounded-full bg-[var(--color-brand-600)] opacity-[0.12] blur-[140px]" />
        <div className="absolute top-1/4 -right-24 w-[550px] h-[550px] rounded-full bg-[var(--color-accent-500)] opacity-[0.08] blur-[120px]" />
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-[var(--color-brand-400)] opacity-[0.07] blur-[100px]" />
        
        {/* Subtle geometric dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(var(--color-text-primary) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Floating German vocabulary pills */}
      {floatingWords.map(({ word, meaning, x, y, delay, level }) => (
        <motion.div
          key={word}
          className="absolute hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border)]/80 bg-[var(--color-surface)]/80 backdrop-blur-md shadow-sm select-none pointer-events-none"
          style={{ left: x, top: y }}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 4.5 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-400)] animate-pulse" />
          <span className="font-heading font-semibold text-xs text-[var(--color-text-primary)]">
            {word}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)]">
            · {meaning}
          </span>
          <Badge size="xs" variant="primary" className="py-0 px-1 text-[9px]">{level}</Badge>
        </motion.div>
      ))}

      <div className="container-xl relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-400)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-500)]" />
              </span>
              <span className="text-[var(--color-text-primary)] font-semibold">CEFR A1–C2 Standard</span>
              <span className="text-[var(--color-border-2)]">|</span>
              <span>Goethe &amp; telc Exam Ready</span>
              <span className="hidden sm:inline text-[var(--color-accent-500)] font-semibold">★ 100% Free to Start</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-6xl md:text-7xl font-heading font-bold text-[var(--color-text-primary)] leading-[1.08] mb-6 tracking-tight"
          >
            Your Structured Path to{" "}
            <span className="text-gradient">German Fluency</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Science-backed spaced repetition, CEFR progression, interactive dialogues, and real exam simulations. All taught with crystal-clear English instruction.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="xl"
                rightIcon={<ArrowRight size={18} />}
                className="w-full sm:w-auto shadow-[var(--shadow-glow)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] transition-all font-semibold"
              >
                Start learning free
              </Button>
            </Link>
            <a href="#lesson-preview" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                leftIcon={<Play size={16} className="fill-current text-[var(--color-brand-400)]" />}
                className="w-full sm:w-auto hover:border-[var(--color-brand-400)]/40"
              >
                Try interactive demo
              </Button>
            </a>
          </motion.div>

          {/* Trust badges strip */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[var(--color-text-muted)] mb-14"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-[var(--color-success)]" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[var(--color-brand-400)]" />
              <span>Goethe &amp; telc Aligned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame size={15} className="text-[var(--color-accent-500)]" />
              <span>Adaptive Spaced Repetition</span>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-3xl mx-auto"
          >
            {stats.map(({ icon: Icon, label, value, accent }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface)]/70 border border-[var(--color-border)] backdrop-blur-md shadow-sm hover:border-[var(--color-brand-400)]/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
                >
                  <Icon size={16} style={{ color: accent }} />
                </div>
                <p className="font-heading text-2xl font-bold text-[var(--color-text-primary)] tabular-nums">
                  {value}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
