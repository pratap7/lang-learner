"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTABanner() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background radial gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[var(--color-brand-600)] opacity-[0.16] blur-[140px] rounded-full" />
      </div>

      <div className="container-xl relative z-10">
        <div className="max-w-4xl mx-auto rounded-[var(--radius-3xl)] p-8 sm:p-14 border border-[var(--color-brand-500)]/40 bg-gradient-to-b from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-surface-2)] shadow-2xl text-center relative overflow-hidden">
          {/* Subtle top brand line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--color-brand-600)] via-[var(--color-brand-500)] to-[var(--color-accent-500)]" />

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-6">
            <Sparkles size={13} /> Your Path to German Fluency
          </div>

          {/* Headline */}
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-5 max-w-2xl mx-auto">
            Ready to speak German with clarity and confidence?
          </h2>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Join thousands of ambitious professionals, medical candidates, and university applicants on the clinical CEFR path.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="xl"
                rightIcon={<ArrowRight size={18} />}
                className="w-full sm:w-auto min-h-[50px] shadow-[var(--shadow-glow)] hover:shadow-[0_0_50px_rgba(99,102,241,0.45)] transition-all font-semibold"
              >
                Start learning free today
              </Button>
            </Link>
            <Link href="/tests/placement" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="xl"
                className="w-full sm:w-auto min-h-[50px] hover:border-[var(--color-brand-400)]/50"
              >
                Take free placement test
              </Button>
            </Link>
          </div>

          {/* Reassurance pills */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-border)]/60">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>Free to start · No credit card</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[var(--color-brand-400)]" />
              <span>14-day refund guarantee on Pro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-[var(--color-accent-400)]" />
              <span>Instant web &amp; mobile access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
