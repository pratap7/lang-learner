"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Award, GraduationCap, Building2, Stethoscope, Star } from "lucide-react";

const frameworks = [
  { name: "CEFR Framework", desc: "Council of Europe A1–C2 Standard", icon: ShieldCheck },
  { name: "Goethe-Institut", desc: "Aligned Examination Blueprints", icon: Award },
  { name: "telc Deutsch", desc: "Official Format & Rubrics", icon: Building2 },
  { name: "TestDaF & DSH", desc: "University Entrance Curriculum", icon: GraduationCap },
  { name: "Medical Approbation", desc: "FSP Clinical Terminology", icon: Stethoscope },
];

const pilotTestimonials = [
  {
    badge: "Pilot Tester · Cohort 2026",
    role: "Relocating Software Engineer",
    target: "B1 Target for Settlement",
    quote:
      "Unlike apps that force random sentences, the color-coded cases (Akkusativ vs. Dativ) finally made German grammar click for an engineering brain. The English explanations are precise.",
  },
  {
    badge: "Beta Learner · Cohort 2026",
    role: "Medical Residency Candidate",
    target: "B2 / Approbation Prep",
    quote:
      "The instant Goethe-style writing rubric feedback caught my subordinating conjunction word-order mistakes immediately. It feels like having an attentive German tutor on demand.",
  },
  {
    badge: "Early Access · Cohort 2026",
    role: "DAAD Scholarship Applicant",
    target: "TestDaF Academic German",
    quote:
      "The SM-2 spaced repetition cards and graded reading stories keep retention high without burnout. It avoids the childish gamification trap and respects your study hours.",
  },
];

export function SocialProofBar() {
  return (
    <section className="py-16 relative border-y border-[var(--color-border)]/60 bg-[var(--color-surface)]/50 backdrop-blur-sm">
      <div className="container-xl">
        {/* Framework Standards Strip */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-6">
            Curriculum Aligned with Official German Language &amp; Immigration Standards
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {frameworks.map((fw) => {
              const Icon = fw.icon;
              return (
                <div
                  key={fw.name}
                  className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/70 flex flex-col items-center text-center hover:border-[var(--color-brand-400)]/40 transition-colors"
                >
                  <Icon size={18} className="text-[var(--color-brand-400)] mb-1.5" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    {fw.name}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    {fw.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Pilot Cohort Feedback (Transparently Marked) */}
        <div className="mt-12 pt-10 border-t border-[var(--color-border)]/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-wider">
                Transparent Pilot Feedback
              </span>
              <h3 className="text-lg font-heading font-bold text-[var(--color-text-primary)]">
                Evaluated by real learners preparing for life in Germany
              </h3>
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-3 py-1 rounded-full border border-[var(--color-border)]">
              Verified 2026 Pilot Cohort
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pilotTestimonials.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm flex flex-col justify-between space-y-4 hover:border-[var(--color-brand-400)]/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] text-[10px] font-semibold border border-[var(--color-brand-500)]/20">
                      {item.badge}
                    </span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)]/50 text-[11px]">
                  <div className="font-semibold text-[var(--color-text-primary)]">{item.role}</div>
                  <div className="text-[var(--color-text-muted)]">{item.target}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
