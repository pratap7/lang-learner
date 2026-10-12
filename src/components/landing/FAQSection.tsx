"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need any prior knowledge of German?",
    a: "Not at all! Our A1 course starts from absolute zero. If you already know some German, take our free 10-minute placement test to jump straight to the right level.",
  },
  {
    q: "How long does it take to reach B2?",
    a: "It depends on your daily study time, but most learners reach B2 within 12–18 months studying 30–45 minutes a day. The CEFR recommends around 500–600 hours of guided learning from A1 to B2.",
  },
  {
    q: "Is DeutschPfad really free to start?",
    a: "Yes — A1 and A2 are completely free, no credit card required. Premium unlocks B1–C2, mock tests, offline mode, and unlimited flashcard reviews.",
  },
  {
    q: "What makes the flashcards different from other apps?",
    a: "We use a scientifically calibrated spaced-repetition algorithm (similar to SM-2) that schedules each card exactly when you're about to forget it, maximising retention with minimal study time.",
  },
  {
    q: "Can I prepare for official CEFR exams (Goethe, TELC, TestDaF)?",
    a: "Absolutely. Our mock tests simulate the format and timing of official exams. The detailed result analysis breaks down performance by skill (reading, writing, listening, speaking) so you know exactly where to focus.",
  },
  {
    q: "Is there a mobile app?",
    a: "DeutschPfad is a fully responsive progressive web app — you can add it to your home screen on iOS and Android. A native app is on our roadmap for early 2025.",
  },
  {
    q: "How does the streak system work?",
    a: "Complete at least one lesson or exercise each day to maintain your streak. You earn bonus XP for streaks of 7, 30, 60, 100, and 365 days. Streak shields let you protect your streak if you miss a day.",
  },
];

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <div
        className={`border rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 ${
          open
            ? "border-[var(--color-brand-500)]/40 bg-[var(--color-surface)] shadow-[0_4px_20px_rgba(99,102,241,0.08)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/40"
        }`}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[var(--color-surface-2)]/60 transition-colors duration-150 cursor-pointer"
          aria-expanded={open}
        >
          <span className={`font-semibold text-sm sm:text-base transition-colors ${
            open ? "text-[var(--color-brand-400)]" : "text-[var(--color-text-primary)]"
          }`}>
            {faq.q}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`shrink-0 transition-colors ${
              open ? "text-[var(--color-brand-400)]" : "text-[var(--color-text-muted)]"
            }`}
          >
            <ChevronDown size={18} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)] pt-4">
                {faq.a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-[var(--color-surface-2)] relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border-2)] to-transparent" />

      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-brand-400)] mb-3">
            FAQ
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            Questions? <span className="text-gradient">We&apos;ve got answers</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
