"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Briefcase, Stethoscope, Landmark,
  Compass, ArrowRight, CheckCircle2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const pathways = [
  {
    id: "work",
    title: "Work & Career",
    subtitle: "German Tech, Engineering & Corporate",
    icon: Briefcase,
    targetLevel: "B1 → B2+",
    accentColor: "var(--color-case-nom)",
    tagline: "Speak with authority in standups, client meetings, and salary negotiations.",
    highlights: [
      "Conduct professional Scrum standups, retros, and project handovers in German",
      "Draft polished formal emails, executive summaries, and Slack updates",
      "Understand labor contracts (Arbeitsvertrag), notice periods (Kündigungsfrist), and workers councils",
      "Fulfill EU Blue Card fast-track settlement requirements at 21 or 27 months",
    ],
    samplePhrase: "„Könnten wir die Prioritäten für den nächsten Sprint noch einmal abstimmen?“",
    sampleEn: "(Could we align on the priorities for the next sprint once more?)",
  },
  {
    id: "study",
    title: "University & Study",
    subtitle: "TestDaF, DSH & Studienkolleg Prep",
    icon: GraduationCap,
    targetLevel: "B2 → C1",
    accentColor: "var(--color-brand-400)",
    tagline: "Excel in university lectures, seminar debates, and academic thesis writing.",
    highlights: [
      "Master academic connectors, nominal style (Nominalstil), and scientific passive",
      "Pass TestDaF with TDN 4 or 5 for unrestricted German university admission",
      "Draft structured argumentative essays with counterarguments (Pro- und Contra-Erörterung)",
      "Navigate campus administration (Prüfungsamt, Immatrikulation, Mensa)",
    ],
    samplePhrase: "„Die vorliegende Studie verdeutlicht den Zusammenhang zwischen beiden Faktoren.“",
    sampleEn: "(The present study illustrates the correlation between both factors.)",
  },
  {
    id: "healthcare",
    title: "Healthcare & Medicine",
    subtitle: "Approbation & Fachsprachprüfung (FSP)",
    icon: Stethoscope,
    targetLevel: "B2 → C1",
    accentColor: "var(--color-case-akk)",
    tagline: "Designed for foreign doctors and nurses seeking clinical licensure in Germany.",
    highlights: [
      "Conduct structured medical anamnesis (patient history taking) with empathetic bedside manner",
      "Translate Latin clinical terms into layman German (e.g., Appendizitis → Blinddarmentzündung)",
      "Draft hospital physician discharge letters (Arztbrief) under time pressure",
      "Prepare specifically for the three parts of the State Chamber Fachsprachprüfung (FSP)",
    ],
    samplePhrase: "„Seit wann verspüren Sie diese stechenden Schmerzen im rechten Unterbauch?“",
    sampleEn: "(Since when have you been feeling this sharp pain in your right lower abdomen?)",
  },
  {
    id: "migration",
    title: "Migration & Settlement",
    subtitle: "Citizenship & Permanent Residency (DTZ)",
    icon: Landmark,
    targetLevel: "A2 → B1",
    accentColor: "var(--color-case-dat)",
    tagline: "Secure your German passport, settlement permit, and navigate German bureaucracy.",
    highlights: [
      "Ace the DTZ (Deutsch-Test für Zuwanderer) exam for naturalization (Einbürgerung)",
      "Prepare for the 33 official questions of the Einbürgerungstest (German constitution & history)",
      "Confidently speak with officials at the Ausländerbehörde, Bürgeramt, and Finanzamt",
      "Understand German lease agreements (Mietvertrag), utilities (Nebenkosten), and tax returns",
    ],
    samplePhrase: "„Ich möchte gerne die Unterlagen für meine Einbürgerung einreichen.“",
    sampleEn: "(I would like to submit the documentation for my naturalization.)",
  },
  {
    id: "travel",
    title: "Travel & Culture",
    subtitle: "Everyday Independence in DACH",
    icon: Compass,
    targetLevel: "A1 → B1",
    accentColor: "var(--color-accent-400)",
    tagline: "Explore Germany, Austria, and Switzerland like an insider with cultural confidence.",
    highlights: [
      "Order regional specialties and wines across Berlin, Bavaria, Vienna, and Zurich",
      "Understand regional accents, Bavarian & Swiss idioms, and cultural etiquette",
      "Handle hotel check-ins, regional trains (ICE/ÖBB), mountain huts, and emergencies",
      "Build genuine personal connections and friendships with locals",
    ],
    samplePhrase: "„Grüß Gott! Hätten Sie noch einen gemütlichen Tisch auf der Terrasse frei?“",
    sampleEn: "(Hello! Would you happen to have a cozy table available on the terrace?)",
  },
];

export function LearnerPathways() {
  const [activePathwayId, setActivePathwayId] = useState("work");
  const activePathway = pathways.find((p) => p.id === activePathwayId) || pathways[0];

  return (
    <section id="pathways" className="py-24 relative overflow-hidden bg-[var(--color-surface)]/20">
      <div className="container-xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Sparkles size={13} /> Specialized Curricula
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            Custom pathways for your specific ambition
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Don&apos;t waste months learning vocabulary you will never use. Select the pathway that maps to your visa, career, or university milestone.
          </p>
        </div>

        {/* Pathway Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-3xl mx-auto">
          {pathways.map((pathway) => {
            const Icon = pathway.icon;
            const isSelected = pathway.id === activePathwayId;
            return (
              <button
                key={pathway.id}
                onClick={() => setActivePathwayId(pathway.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-md border border-[var(--color-border)] scale-105"
                    : "bg-[var(--color-surface-2)]/60 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent"
                }`}
              >
                <Icon size={15} style={{ color: pathway.accentColor }} />
                <span>{pathway.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Pathway Detail Card */}
        <div className="max-w-4xl mx-auto rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl p-8 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePathway.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {activePathway.subtitle}
                  </div>
                  <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mt-1">
                    {activePathway.title} Pathway
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="md">
                    Target: {activePathway.targetLevel}
                  </Badge>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-base sm:text-lg text-[var(--color-text-primary)] font-medium leading-relaxed">
                {activePathway.tagline}
              </p>

              {/* 4 Outcome Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePathway.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/70 flex items-start gap-3"
                  >
                    <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Sample Authentic Phrase Box */}
              <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-1.5">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                  Representative Real-World Training Prompt:
                </div>
                <div className="font-serif text-base sm:text-lg text-[var(--color-text-primary)] font-medium">
                  {activePathway.samplePhrase}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] italic">
                  {activePathway.sampleEn}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Includes curated flashcard decks, writing prompts, and simulated dialogues.
                </span>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight size={16} />}
                  onClick={() => window.location.href = "/auth/signup"}
                >
                  Start This Pathway Free
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
