"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Award, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const cefrMilestones = [
  {
    level: "A1",
    title: "Breakthrough (Anfänger)",
    hours: "80 Study Hours",
    exam: "Goethe-Zertifikat A1 · Start Deutsch 1",
    description: "Everyday survival: greetings, ordering in restaurants, train ticket booking, basic personal questions, and simple present-tense sentences.",
    capabilities: [
      "Ask directions and understand basic transit announcements",
      "Order food and shop with correct numbers and currency",
      "Master Nominativ articles (der, die, das) and basic pronouns",
    ],
    color: "var(--color-case-nom)",
  },
  {
    level: "A2",
    title: "Waystage (Grundkenntnisse)",
    hours: "150 Study Hours",
    exam: "Goethe-Zertifikat A2 / telc Deutsch A2",
    description: "Direct exchanges: describing your routine, surroundings, past experiences (Perfekt), simple two-way prepositions, and routine workplace tasks.",
    capabilities: [
      "Narrate past events using conversational Perfekt & Präteritum",
      "Navigate Bürgeramt registration and doctor visits",
      "Master Akkusativ direct objects and common modal verbs",
    ],
    color: "var(--color-case-akk)",
  },
  {
    level: "B1",
    title: "Threshold (Mittelstufe)",
    hours: "300 Study Hours",
    exam: "Goethe B1 / DTZ (Deutsch-Test für Zuwanderer)",
    badge: "German Citizenship Requirement",
    description: "Independent speaker: express opinions, argue points, draft formal emails, understand the main points of radio or news, and meet naturalization criteria.",
    capabilities: [
      "Fulfill legal requirement for German Permanent Residency (Niederlassung)",
      "Express hypothetical situations with Konjunktiv II (hätte, wäre, würde)",
      "Master Dativ indirect objects and subordinating conjunctions (weil, dass, obwohl)",
    ],
    color: "var(--color-case-dat)",
  },
  {
    level: "B2",
    title: "Vantage (Gute Mittelstufe)",
    hours: "450 Study Hours",
    exam: "Goethe-Zertifikat B2 / telc B2 / TestDaF",
    badge: "Professional & Blue Card Standard",
    description: "Professional fluency: participate spontaneously in technical meetings, understand complex abstract texts, write detailed reports, and negotiate terms.",
    capabilities: [
      "Work in German-speaking companies and conduct technical standups",
      "Understand native-speed podcasts, German news, and films without subtitles",
      "Master Passive voice, Genitiv relations, and prepositional verbs",
    ],
    color: "var(--color-case-gen)",
  },
  {
    level: "C1",
    title: "Effective Operational (Oberstufe)",
    hours: "650 Study Hours",
    exam: "TestDaF (TDN 4/5) / Goethe C1 / DSH-2",
    badge: "University Admission Standard",
    description: "Academic & executive fluency: express ideas spontaneously without searching for words, conduct university-level research, and draft sophisticated essays.",
    capabilities: [
      "Qualify for direct admission to German-taught university degrees",
      "Read complex German academic papers, contracts, and legal frameworks",
      "Master complex Partizipialattribute, Subjunctive I (indirect speech), and stylistic nuance",
    ],
    color: "var(--color-brand-400)",
  },
  {
    level: "C2",
    title: "Mastery (Muttersprachlich)",
    hours: "850+ Study Hours",
    exam: "Goethe-Zertifikat C2: GDS",
    description: "Near-native precision: effortlessly comprehend virtually everything heard or read, summarize arguments from diverse sources, and express subtle shades of meaning.",
    capabilities: [
      "Equal to educated native German speakers in linguistic command",
      "Engage in literary criticism, high-level political debate, and judicial writing",
      "Total mastery of idiomatic expressions, regional dialects, and rhetorical subtleties",
    ],
    color: "var(--color-accent-400)",
  },
];

export function LearningJourney() {
  return (
    <section id="journey" className="py-24 relative overflow-hidden">
      <div className="container-xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-case-dat)]/10 border border-[var(--color-case-dat)]/30 text-xs font-semibold text-[var(--color-case-dat)] mb-3">
            <Clock size={13} /> The Complete CEFR Roadmap
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            From absolute zero to native nuance
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Every level has clear hour investments, tangible real-world milestones, and aligned official certification exams.
          </p>
        </div>

        {/* Milestone Cards Ladder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cefrMilestones.map((milestone, idx) => (
            <motion.div
              key={milestone.level}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md hover:border-[var(--color-brand-400)]/40 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Level Tag & Exam Title */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center font-heading text-base font-bold text-white shadow-sm"
                      style={{ background: milestone.color }}
                    >
                      {milestone.level}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] leading-tight">
                        {milestone.title}
                      </h3>
                      <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={11} /> {milestone.hours}
                      </span>
                    </div>
                  </div>
                </div>

                {milestone.badge && (
                  <Badge variant="primary" size="xs" className="w-fit">
                    {milestone.badge}
                  </Badge>
                )}

                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {milestone.description}
                </p>

                {/* Key Capabilities */}
                <div className="space-y-2 pt-2 border-t border-[var(--color-border)]/60">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
                    Core Outcomes:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                    {milestone.capabilities.map((cap, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exam Blueprint Badge */}
              <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)]/80 text-[11px] text-[var(--color-text-muted)] flex items-center gap-2">
                <Award size={14} className="text-[var(--color-brand-400)] shrink-0" />
                <span className="truncate">{milestone.exam}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
