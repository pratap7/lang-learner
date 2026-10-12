"use client";

import { motion, type Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const testimonials = [
  {
    name: "Sophie Müller",
    role: "Software Engineer, Berlin",
    avatar: "SM",
    avatarBg: "from-[var(--color-brand-400)] to-[var(--color-brand-600)]",
    rating: 5,
    text: "I tried five other apps before DeutschPfad. The structured CEFR path and spaced-repetition cards are exactly what I needed to go from A2 to B2 in nine months. The grammar explanations in English finally made the Dativ case click for me.",
    level: "B2",
  },
  {
    name: "James Okafor",
    role: "PhD Student, Munich",
    avatar: "JO",
    avatarBg: "from-[var(--color-a1)] to-[var(--color-a2)]",
    rating: 5,
    text: "The mock tests with detailed result breakdowns helped me pass the Goethe-Institut B1 exam on my first try. I especially loved the culture lessons — they made learning feel like exploring a new world, not just memorising vocabulary.",
    level: "B1",
  },
  {
    name: "Priya Nair",
    role: "Marketing Manager, Vienna",
    avatar: "PN",
    avatarBg: "from-[var(--color-c1)] to-[var(--color-c2)]",
    rating: 5,
    text: "The streak system kept me accountable every single day. 180-day streak and counting! The placement test saved me weeks by putting me straight into B1 content. Daily tasks are perfectly bite-sized for a busy schedule.",
    level: "C1",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay: i * 0.12 },
  }),
};

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      {/* Glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--color-accent-500)] opacity-[0.04] blur-[120px] pointer-events-none" />

      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--color-brand-400)] mb-3">
            Learner Stories
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            Loved by thousands of{" "}
            <span className="text-gradient">German learners</span>
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Real stories from people who transformed their German with DeutschPfad.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              custom={i}
              variants={fadeUp}
              className="group relative p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-400)]/40 hover:shadow-[0_16px_36px_-10px_rgba(99,102,241,0.2)] hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote size={32} className="absolute top-5 right-6 text-[var(--color-border-2)] opacity-30 group-hover:text-[var(--color-brand-400)] group-hover:opacity-60 transition-all" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={15} className="text-[var(--color-accent-500)] fill-current" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 relative z-10">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant={t.level.toLowerCase() as "a1" | "a2" | "b1" | "b2" | "c1" | "c2"} size="xs">
                    {t.level} Certified
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-wrap justify-center items-center gap-8"
        >
          {["Goethe-Institut aligned", "CEFR A1–C2", "No ads, ever", "Cancel anytime"].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              {badge}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
