"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck } from "lucide-react";

interface FAQItemData {
  category: "Price & Value" | "Exam Prep" | "Quality & Method" | "Getting Started";
  q: string;
  a: string;
}

const objectionFaqs: FAQItemData[] = [
  {
    category: "Price & Value",
    q: "Why should I pay for Deutsch Pfad when ChatGPT and YouTube are free?",
    a: "Free LLMs like ChatGPT lack a sequenced CEFR syllabus, lack spaced-repetition memory scheduling, and frequently hallucinate incorrect German word order and case rules. You waste hours prompt engineering without knowing if the feedback is linguistically sound. Deutsch Pfad provides a verified pedagogical curriculum, color-coded grammar decoders, automated Goethe rubric grading, and SM-2 memory retention — all for less than the cost of a single 45-minute private tutoring session.",
  },
  {
    category: "Exam Prep",
    q: "Will Deutsch Pfad actually prepare me to pass official Goethe-Zertifikat or telc exams?",
    a: "Yes. Our courses are explicitly engineered against the official Goethe-Institut and telc gGmbH examination blueprints for A1 through C1. Our mock exams feature exact timed formats, authentic question structures (Lesen, Hören, Schreiben, Sprechen), and our AI Writing Studio evaluates your essays using the official 4-pillar CEFR scoring rubric (Task Fulfillment, Coherence, Vocabulary, Grammar).",
  },
  {
    category: "Quality & Method",
    q: "How do I know the grammar explanations and audio are authentic and accurate?",
    a: "Our linguistic corpus was built from accredited CEFR corpora and reviewed against authoritative Duden German grammars. Pronunciation models use clear High German (Hochdeutsch) recordings. Unlike unconstrained AI models, our syntactic error parser uses deterministic German grammar validation rules to ensure you are never taught incorrect declensions or false idioms.",
  },
  {
    category: "Getting Started",
    q: "I have zero knowledge of German. Is this suitable for absolute beginners?",
    a: "Absolutely. Level A1 starts from the very foundation (the German alphabet, pronunciation of tricky sounds like ä, ö, ü and 'ch', basic greetings, and numbers). All grammatical logic is taught in crystal-clear English so you understand the underlying 'why' before memorizing patterns.",
  },
  {
    category: "Getting Started",
    q: "I already learned German years ago. Do I have to start from A1?",
    a: "No. You can take our free, adaptive 10-minute diagnostic placement test. It tests vocabulary breadth, case accuracy, and reading comprehension across CEFR difficulty bands to place you directly into your ideal module (A2, B1, or B2).",
  },
  {
    category: "Quality & Method",
    q: "How does the AI writing and speech tutor compare to a human native tutor?",
    a: "A private tutor costs €35–€70 per hour and can only review your writing during paid sessions. Deutsch Pfad's AI Writing Studio delivers instant, word-level error feedback and CEFR rubric grades 24/7 with unlimited revisions. You can practice as many essays, emails, and speech drills as you need without watching the clock or breaking your budget.",
  },
  {
    category: "Price & Value",
    q: "How much study time do I need each day to see real progress?",
    a: "Our curriculum is structured into bite-sized 15-to-20-minute daily units. With 20 minutes of focused practice per day (one grammar lesson + SM-2 flashcard review), most learners complete a full CEFR level (such as A1 or A2) in 8 to 12 weeks.",
  },
  {
    category: "Price & Value",
    q: "Can I cancel anytime, and is there a money-back guarantee?",
    a: "Yes. You can cancel your subscription at any time with a single click from your billing dashboard. Additionally, all Pro subscriptions include a 14-day money-back guarantee. If you don't feel Deutsch Pfad is accelerating your fluency, simply email support for an immediate full refund.",
  },
];

function FAQAccordionItem({ item, index }: { item: FAQItemData; index: number }) {
  const [open, setOpen] = useState(index === 0 || index === 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`border rounded-[var(--radius-xl)] overflow-hidden transition-all duration-200 ${
        open
          ? "border-[var(--color-brand-500)]/40 bg-[var(--color-surface)] shadow-md"
          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/30"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[var(--color-surface-2)]/50 transition-colors"
        aria-expanded={open}
      >
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-brand-400)]">
            {item.category}
          </span>
          <span className="font-heading font-semibold text-sm sm:text-base text-[var(--color-text-primary)] block">
            {item.q}
          </span>
        </div>
        <div
          className={`w-7 h-7 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-[var(--color-brand-400)]" : "text-[var(--color-text-muted)]"
          }`}
        >
          <ChevronDown size={16} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/40">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      <div className="container-xl relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-500)]/10 border border-[var(--color-accent-500)]/30 text-xs font-semibold text-[var(--color-accent-400)] mb-3">
            <HelpCircle size={13} /> Common Inquiries &amp; Objections
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Honest answers about price, exam preparation, content accuracy, and what makes Deutsch Pfad different.
          </p>
        </div>

        <div className="space-y-3.5">
          {objectionFaqs.map((faq, idx) => (
            <FAQAccordionItem key={faq.q} item={faq} index={idx} />
          ))}
        </div>

        {/* Support Reassurance Footer */}
        <div className="mt-12 p-6 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
            <span>Have a specific question about your German visa or university timeline?</span>
          </div>
          <a
            href="mailto:support@deutschpfad.app"
            className="text-[var(--color-brand-400)] font-semibold hover:underline"
          >
            Contact our curriculum team →
          </a>
        </div>
      </div>
    </section>
  );
}
