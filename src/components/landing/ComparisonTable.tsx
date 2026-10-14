"use client";

import { Check, X, Sparkles, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ComparisonRow {
  feature: string;
  tooltip: string;
  deutschPfad: boolean | string;
  chatgpt: boolean | string;
  duolingo: boolean | string;
  vhsSchool: boolean | string;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: "Structured CEFR A1 → C2 Syllabus",
    tooltip: "Curated sequence aligned strictly with the European Language Framework",
    deutschPfad: "Complete 6-Level Path",
    chatgpt: "Unstructured / Prompt-dependent",
    duolingo: "Fragmented / Arbitrary",
    vhsSchool: "Structured (Slow Fixed Schedule)",
  },
  {
    feature: "English Explanations of German Logic",
    tooltip: "Breaks down why cases and word order behave differently than English",
    deutschPfad: true,
    chatgpt: "Inconsistent & Verbose",
    duolingo: false,
    vhsSchool: "German-only immersion (often confusing)",
  },
  {
    feature: "4-Case Color-Coded Grammar Architecture",
    tooltip: "Consistent color & token cues for der/die/das and Nominativ, Akkusativ, Dativ, Genitiv",
    deutschPfad: true,
    chatgpt: false,
    duolingo: false,
    vhsSchool: false,
  },
  {
    feature: "Algorithmic SM-2 Spaced Repetition",
    tooltip: "Calculates Ebbinghaus forgetting curve intervals and card ease factors",
    deutschPfad: true,
    chatgpt: false,
    duolingo: "Basic flashcards without SM-2",
    vhsSchool: false,
  },
  {
    feature: "Official Goethe / telc Writing Rubrics",
    tooltip: "0-20 score evaluation across task fulfillment, cohesion, vocabulary, and grammar",
    deutschPfad: true,
    chatgpt: "Generic text without CEFR rubric scoring",
    duolingo: false,
    vhsSchool: "Manual grading (takes 1-2 weeks)",
  },
  {
    feature: "Hallucination-Free Linguistic Engine",
    tooltip: "Deterministic grammar validation backed by authentic German linguistic rules",
    deutschPfad: true,
    chatgpt: "Hallucinates false rules regularly",
    duolingo: true,
    vhsSchool: true,
  },
  {
    feature: "Dedicated Professional & Healthcare Tracks",
    tooltip: "Targeted modules for Medical Approbation (FSP), Tech, and German Citizenship (DTZ)",
    deutschPfad: true,
    chatgpt: "Requires manual prompt engineering",
    duolingo: false,
    vhsSchool: "Expensive separate specialty courses",
  },
  {
    feature: "Automated Mistake Notebook & Re-injection",
    tooltip: "Logs your grammatical blind spots and re-tests them in future review sessions",
    deutschPfad: true,
    chatgpt: false,
    duolingo: "Basic review queue",
    vhsSchool: "Manual paper notes only",
  },
  {
    feature: "Price & Time Efficiency",
    tooltip: "Affordable self-paced mastery vs. rigid €400-800/mo classroom tuition",
    deutschPfad: "Free to start / €12/mo Pro",
    chatgpt: "$20/mo (ChatGPT Plus)",
    duolingo: "Free with ads / $13/mo Super",
    vhsSchool: "€450–€900 per 2-month level",
  },
];

export function ComparisonTable() {
  const renderValue = (val: boolean | string, isPrimary: boolean = false) => {
    if (val === true) {
      return (
        <div className="flex items-center justify-center">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check size={14} strokeWidth={3} />
          </span>
        </div>
      );
    }
    if (val === false) {
      return (
        <div className="flex items-center justify-center">
          <span className="w-6 h-6 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center">
            <X size={14} />
          </span>
        </div>
      );
    }
    return (
      <span
        className={`text-xs ${
          isPrimary
            ? "font-semibold text-emerald-400"
            : "text-[var(--color-text-secondary)]"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section id="comparison" className="py-24 relative overflow-hidden">
      <div className="container-xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-500)]/10 border border-[var(--color-accent-500)]/30 text-xs font-semibold text-[var(--color-accent-400)] mb-3">
            <Sparkles size={13} /> The Honest Comparison
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            Why not just use ChatGPT or Duolingo?
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Generic LLMs hallucinate German word order, gamified apps teach trivial vocabulary, and in-person schools cost thousands. Here is how Deutsch Pfad compares.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/60">
                <th className="py-5 px-6 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-[36%]">
                  Learning Architecture
                </th>
                <th className="py-5 px-4 text-center w-[22%] bg-[var(--color-brand-500)]/10 border-x border-[var(--color-brand-500)]/30">
                  <div className="flex flex-col items-center">
                    <span className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                      Deutsch Pfad
                    </span>
                    <Badge variant="primary" size="xs" className="mt-1">
                      Dedicated System
                    </Badge>
                  </div>
                </th>
                <th className="py-5 px-4 text-center w-[14%]">
                  <div className="flex flex-col items-center">
                    <span className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                      Generic ChatGPT
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Unstructured LLM</span>
                  </div>
                </th>
                <th className="py-5 px-4 text-center w-[14%]">
                  <div className="flex flex-col items-center">
                    <span className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                      Duolingo
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Gamified App</span>
                  </div>
                </th>
                <th className="py-5 px-4 text-center w-[14%]">
                  <div className="flex flex-col items-center">
                    <span className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                      VHS / Goethe School
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">In-Person Classroom</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]/60 text-xs sm:text-sm">
              {comparisonData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[var(--color-surface-2)]/40 transition-colors"
                >
                  {/* Feature Label & Tooltip */}
                  <td className="py-4 px-6">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {row.feature}
                    </div>
                    <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5 leading-tight">
                      {row.tooltip}
                    </div>
                  </td>

                  {/* Deutsch Pfad (Featured Column) */}
                  <td className="py-4 px-4 text-center bg-[var(--color-brand-500)]/5 border-x border-[var(--color-brand-500)]/20 font-medium">
                    {renderValue(row.deutschPfad, true)}
                  </td>

                  {/* Generic ChatGPT */}
                  <td className="py-4 px-4 text-center">
                    {renderValue(row.chatgpt)}
                  </td>

                  {/* Duolingo */}
                  <td className="py-4 px-4 text-center">
                    {renderValue(row.duolingo)}
                  </td>

                  {/* VHS Language School */}
                  <td className="py-4 px-4 text-center">
                    {renderValue(row.vhsSchool)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
