"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-600)]/10 via-transparent to-[var(--color-accent-500)]/8" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[var(--color-brand-500)] opacity-[0.06] blur-[100px]" />
      </div>

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl p-8 sm:p-14 text-center shadow-[var(--shadow-xl)] overflow-hidden"
        >
          {/* Subtle German flag tricolor bar at top of card */}
          <div className="h-1 w-full tricolor-stripe opacity-90 absolute top-0 left-0 right-0" />

          {/* Ambient lighting glow inside card */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-[var(--color-brand-500)]/20 to-transparent blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs sm:text-sm font-semibold text-[var(--color-brand-400)]">
            <Zap size={14} className="fill-current text-[var(--color-accent-400)]" />
            Free Forever for A1 &amp; A2 · No Credit Card
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-[var(--color-text-primary)] mb-5 leading-tight tracking-tight">
            Ready to start your{" "}
            <span className="text-gradient">German journey?</span>
          </h2>

          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] mb-8 max-w-xl mx-auto leading-relaxed">
            Join 50,000+ learners who are building real German skills every day.
            Begin with interactive dialogues and personalized spaced repetition.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="xl"
                rightIcon={<ArrowRight size={18} />}
                className="w-full sm:w-auto shadow-[var(--shadow-glow)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)]"
              >
                Start learning free
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto"
              >
                Sign in to existing account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
