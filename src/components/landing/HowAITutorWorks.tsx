"use client";

import { motion } from "framer-motion";
import { Cpu, ShieldCheck, CheckCircle2, RotateCw, Sparkles, Database, FileCheck, Brain } from "lucide-react";

const architectureSteps = [
  {
    step: "01",
    title: "Grounded Linguistic Corpus (Zero Hallucination)",
    icon: Database,
    desc: "Unlike standard chatbots that guess rules or fabricate grammar nuances, our engine is grounded in a verified CEFR linguistic database of German syntax, declension patterns, and official Goethe syllabi.",
    benefit: "You learn 100% verified, authentic German rules without misleading AI advice.",
  },
  {
    step: "02",
    title: "Deep Syntactic Error Parser",
    icon: Cpu,
    desc: "Every sentence you speak or write is analyzed by our grammar parser. It detects verb-second (V2) violations, subordinate clause verb-kicks (weil/dass/obwohl), two-way preposition cases, and adjective declensions.",
    benefit: "You receive word-level diffs showing exactly why a mistake occurred and how to fix it.",
  },
  {
    step: "03",
    title: "Official Goethe & telc Rubric Evaluation",
    icon: FileCheck,
    desc: "When evaluating your writing and speaking, the AI applies the identical 4-pillar rubric used by official German examiners: Task Fulfillment (5 pts), Coherence (5 pts), Lexical Range (5 pts), and Grammar Accuracy (5 pts).",
    benefit: "You know your exact expected exam score before stepping into the testing room.",
  },
  {
    step: "04",
    title: "Active Mistake Memory & SM-2 Re-injection",
    icon: Brain,
    desc: "Every grammar error is automatically logged into your personal Mistake Notebook. The SM-2 scheduling engine re-injects your specific blind spots into subsequent drills until mastery is proven.",
    benefit: "You eliminate persistent weaknesses instead of repeating the same mistakes forever.",
  },
];

export function HowAITutorWorks() {
  return (
    <section id="ai-tutor" className="py-24 relative overflow-hidden">
      <div className="container-xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Cpu size={13} /> The Linguistic Engine
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            How the AI tutor works behind the scenes
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            A purpose-built pedagogical pipeline engineered specifically for German grammar acquisition — not an unconstrained generic chatbot.
          </p>
        </div>

        {/* 4 Architecture Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {architectureSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md hover:border-[var(--color-brand-400)]/40 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] flex items-center justify-center font-bold">
                      <Icon size={20} />
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
                      STAGE {step.step}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] text-xs flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-[var(--color-text-primary)] font-medium">
                    {step.benefit}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
