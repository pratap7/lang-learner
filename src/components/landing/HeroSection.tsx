"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight, Play, BookOpen,
  Sparkles, CheckCircle2, ShieldCheck, Layers, Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Concrete, factual product architecture metrics (no fake learner counts)
const verifiedMetrics = [
  { icon: Layers, label: "Complete CEFR Syllabus", value: "A1 → C2", accent: "var(--color-brand-400)" },
  { icon: BookOpen, label: "Spaced-Repetition Corpus", value: "2,400+", accent: "var(--color-case-akk)" },
  { icon: Award, label: "Official Exam Blueprints", value: "Goethe & telc", accent: "var(--color-accent-500)" },
  { icon: Sparkles, label: "Grammar Logic Architecture", value: "4 Cases", accent: "var(--color-case-gen)" },
];

const floatingGermanPills = [
  { word: "der Bahnhof",   meta: "Masc · Nominativ", x: "6%",  y: "22%", delay: 0,   level: "A1" },
  { word: "des Erfolgs",   meta: "Genitiv · of success", x: "82%", y: "18%", delay: 0.5, level: "B2" },
  { word: "dem Freund",    meta: "Dativ · to the friend", x: "10%", y: "68%", delay: 1.0, level: "A2" },
  { word: "den Vertrag",   meta: "Akkusativ · the contract", x: "78%", y: "66%", delay: 1.5, level: "B1" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center overflow-hidden pt-28 pb-16"
    >
      {/* Background ambient mesh and glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full bg-[var(--color-brand-600)] opacity-[0.14] blur-[140px]" />
        <div className="absolute top-1/4 -right-28 w-[600px] h-[600px] rounded-full bg-[var(--color-accent-500)] opacity-[0.09] blur-[130px]" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] rounded-full bg-[var(--color-brand-400)] opacity-[0.08] blur-[110px]" />

        {/* Subtle geometric dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(var(--color-text-primary) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Floating Grammar & Vocab Tokens */}
      {floatingGermanPills.map(({ word, meta, x, y, delay, level }) => (
        <motion.div
          key={word}
          className="absolute hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-border)]/80 bg-[var(--color-surface)]/85 backdrop-blur-md shadow-sm select-none pointer-events-none"
          style={{ left: x, top: y }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.5 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="w-2 h-2 rounded-full bg-[var(--color-brand-400)] animate-pulse" />
          <span className="font-heading font-semibold text-xs text-[var(--color-text-primary)]">
            {word}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
            · {meta}
          </span>
          <Badge size="xs" variant="primary" className="py-0 px-1 text-[9px] font-semibold">{level}</Badge>
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-400)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-500)]" />
              </span>
              <span className="text-[var(--color-text-primary)] font-semibold">CEFR Framework Aligned</span>
              <span className="text-[var(--color-border-2)]">|</span>
              <span>Goethe-Zertifikat &amp; telc Ready</span>
              <span className="hidden sm:inline text-[var(--color-accent-400)] font-semibold">★ Free Diagnostic Test</span>
            </div>
          </motion.div>

          {/* One-Sentence Promise Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-6xl md:text-7xl font-heading font-bold text-[var(--color-text-primary)] leading-[1.08] mb-6 tracking-tight"
          >
            Master German from zero to C1 with{" "}
            <span className="text-gradient">clinical CEFR rigor</span> and zero AI hallucinations.
          </motion.h1>

          {/* Subheading: Concrete and Benefit-Led */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            Skip the cartoon gamification and unstructured chatbots. Deutsch Pfad pairs English explanations of German logic with color-coded grammar cases, SM-2 memory scheduling, and official Goethe &amp; telc writing rubric feedback.
          </motion.p>

          {/* CTAs: Primary + Secondary "See how it works" */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="xl"
                rightIcon={<ArrowRight size={18} />}
                className="w-full sm:w-auto min-h-[50px] shadow-[var(--shadow-glow)] hover:shadow-[0_0_50px_rgba(99,102,241,0.45)] transition-all font-semibold"
              >
                Start learning free
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                leftIcon={<Play size={16} className="fill-current text-[var(--color-brand-400)]" />}
                className="w-full sm:w-auto min-h-[50px] hover:border-[var(--color-brand-400)]/50"
              >
                See how it works
              </Button>
            </a>
          </motion.div>

          {/* Reassurance strip */}
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
              <span>Official CEFR A1–C2 Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-[var(--color-accent-400)]" />
              <span>SM-2 Memory Decay Modeling</span>
            </div>
          </motion.div>

          {/* Concrete Architectural Metrics */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-3xl mx-auto"
          >
            {verifiedMetrics.map(({ icon: Icon, label, value, accent }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface)]/75 border border-[var(--color-border)] backdrop-blur-md shadow-sm hover:border-[var(--color-brand-400)]/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
                >
                  <Icon size={16} style={{ color: accent }} />
                </div>
                <p className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
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
