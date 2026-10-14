"use client";

import { motion } from "framer-motion";
import {
  Brain, Layers, PenTool, Headphones, Award,
  Sparkles, CheckCircle2, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function FeatureShowcase() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[var(--color-surface)]/30">
      <div className="container-xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Sparkles size={13} /> Deep Product Capabilities
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            Engineered for genuine German fluency
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Every feature is designed around the specific friction points of learning German as an English speaker.
          </p>
        </div>

        {/* Feature Grid / Cards with Real UI Component Layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Card 1: 4-Case Color Matrix */}
          <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-case-nom)]">
                <Layers size={16} />
                <span className="uppercase tracking-wider">Grammar Architecture</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                Color-coded 4-case system that ends the guesswork
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                German cases (Nominativ, Akkusativ, Dativ, Genitiv) fail when learners try to memorize arbitrary tables. Deutsch Pfad assigns consistent, accessibility-tested visual tokens and structural markers to every article, pronoun, and adjective ending.
              </p>
            </div>

            {/* Real UI Visual Demonstration */}
            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-case-nom)]/10 border border-[var(--color-case-nom)]/30">
                  <span className="font-bold text-[var(--color-case-nom)] block">Nominativ</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">der / die / das</span>
                </div>
                <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-case-akk)]/10 border border-[var(--color-case-akk)]/30">
                  <span className="font-bold text-[var(--color-case-akk)] block">Akkusativ</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">den / die / das</span>
                </div>
                <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-case-dat)]/10 border border-[var(--color-case-dat)]/30">
                  <span className="font-bold text-[var(--color-case-dat)] block">Dativ</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">dem / der / dem</span>
                </div>
                <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--color-case-gen)]/10 border border-[var(--color-case-gen)]/30">
                  <span className="font-bold text-[var(--color-case-gen)] block">Genitiv</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">des / der / des</span>
                </div>
              </div>
              <div className="text-xs text-[var(--color-text-muted)] flex items-center justify-between pt-1">
                <span>Rule: Two-way prepositions (Wechselpräpositionen)</span>
                <span className="text-[var(--color-brand-400)] font-semibold">An / Auf / In / Unter</span>
              </div>
            </div>
          </div>

          {/* Card 2: SM-2 Spaced Repetition Engine */}
          <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-brand-400)]">
                <Brain size={16} />
                <span className="uppercase tracking-wider">Cognitive Retention</span>
              </div>
              <h3 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                SuperMemo-2 algorithm tailored to German noun genders
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Remembering German vocabulary is impossible if you forget the gender (<span className="font-mono">der/die/das</span>) or plural. Our SM-2 engine tests full nominal phrases and recalculates review intervals precisely before your memory decays.
              </p>
            </div>

            {/* Real UI Visual Demonstration */}
            <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--color-border)]">
                <span className="font-mono text-[var(--color-text-muted)]">Card #1042 · B1 Work German</span>
                <span className="text-emerald-400 font-semibold">Retention Probability: 91%</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                    die Kündigungsfrist
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)]">notice period (contractual)</div>
                </div>
                <Badge variant="default" size="sm">Ease: 2.60</Badge>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-[var(--color-text-muted)]">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Next interval automatically scheduled in 6 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Row 2: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 3: Goethe Writing Rubric */}
          <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-500)]/15 text-[var(--color-accent-400)] flex items-center justify-center">
              <PenTool size={20} />
            </div>
            <h4 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              Official Goethe Writing Rubrics
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Submit formal emails, letters, and opinion texts. Receive detailed 0-20 scores across Task Completion, Coherence, Lexicon, and Grammar with word-level corrections.
            </p>
          </div>

          {/* Feature 4: Graded Bilingual Stories */}
          <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-case-akk)]/15 text-[var(--color-case-akk)] flex items-center justify-center">
              <Headphones size={20} />
            </div>
            <h4 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              Graded Bilingual Audio Reader
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Read captivating short stories graded across A1, A2, and B1. Synchronized native German narration, instant English hover gloss, and sentence-level comprehension quizzes.
            </p>
          </div>

          {/* Feature 5: Diagnostic Placement */}
          <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-400)]/15 text-[var(--color-brand-400)] flex items-center justify-center">
              <Award size={20} />
            </div>
            <h4 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              Adaptive Placement &amp; Diagnostic Exams
            </h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Never waste time on content you already know. Our 10-minute diagnostic scales dynamically across CEFR levels to pinpoint your exact starting module.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
