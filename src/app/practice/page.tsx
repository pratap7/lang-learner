"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Volume2, Mic, CheckCircle2, ArrowRight,
  Flame, Heart, Filter, ShieldAlert, Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ExerciseEngine } from "@/components/exercise/ExerciseEngine";
import { SAMPLE_A1_EXERCISES } from "@/lib/exerciseData";
import { Exercise, ExerciseKind } from "@/types/exercise.types";
import { getUnresolvedMistakes } from "@/lib/mistakesService";

const EXERCISE_TYPE_FILTERS: { type: ExerciseKind | "all"; label: string; icon: string }[] = [
  { type: "all", label: "All 10 Types", icon: "✨" },
  { type: "multiple_choice", label: "Multiple Choice", icon: "🔘" },
  { type: "article_selection", label: "der/die/das", icon: "🏷️" },
  { type: "fill_in_the_blank", label: "Fill Blank", icon: "✏️" },
  { type: "matching_pairs", label: "Matching Pairs", icon: "🧩" },
  { type: "sentence_reordering", label: "Sentence Order", icon: "🔄" },
  { type: "translation", label: "Translation", icon: "🌐" },
  { type: "listening", label: "Listening", icon: "🎧" },
  { type: "speaking", label: "Speaking (Mic)", icon: "🎙️" },
  { type: "writing_task", label: "Writing Task", icon: "📝" },
];

export default function PracticePage() {
  const [selectedFilter, setSelectedFilter] = useState<ExerciseKind | "all">("all");
  const [infiniteHearts, setInfiniteHearts] = useState(false);
  const [isEngineActive, setIsEngineActive] = useState(false);

  // Filter exercises
  const filteredExercises: Exercise[] =
    selectedFilter === "all"
      ? SAMPLE_A1_EXERCISES
      : SAMPLE_A1_EXERCISES.filter((ex) => ex.type === selectedFilter);

  const unresolvedMistakesCount = typeof window !== "undefined" ? getUnresolvedMistakes().length : 0;

  if (isEngineActive) {
    return (
      <ExerciseEngine
        exercises={filteredExercises}
        title={
          selectedFilter === "all"
            ? "A1 Comprehensive Workout"
            : `${selectedFilter.replace(/_/g, " ").toUpperCase()} Practice`
        }
        allowInfiniteHearts={infiniteHearts}
        onExit={() => setIsEngineActive(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Top Header */}
      <div className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur-xl pb-12 overflow-hidden">
        <div className="h-1 w-full tricolor-stripe opacity-90 absolute top-0 left-0 right-0" />

        {/* Top Nav Row */}
        <div className="container-xl pt-4 pb-6 flex items-center justify-between border-b border-[var(--color-border)]/50 mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-600)] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen size={16} />
            </div>
            <span className="font-heading font-bold text-base text-[var(--color-text-primary)]">
              Deutsch<span className="text-[var(--color-brand-400)]">Pfad</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                Courses
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary" size="sm">
                Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero title */}
        <div className="container-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Sparkles size={13} /> Interactive Drill Engine · 9 Modalities
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight">
            German Practice & <span className="text-gradient">Exercise Lab</span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 max-w-2xl leading-relaxed">
            Test yourself with multiple-choice, fill-in-the-blank, matching pairs, sentence reordering, translations, audio listening, mic speech recognition, article selection, and short writing.
          </p>
        </div>
      </div>

      <div className="container-xl py-10 space-y-8">
        {/* Settings Bar */}
        <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              Session Configuration
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Select an exercise modality or practice all 10 curated A1 exercises.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Infinite Hearts Switch */}
            <button
              type="button"
              onClick={() => setInfiniteHearts(!infiniteHearts)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                infiniteHearts
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-500"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              <Heart size={14} className={infiniteHearts ? "fill-current" : ""} />
              <span>{infiniteHearts ? "Infinite Hearts Mode" : "Standard 5 Hearts"}</span>
            </button>

            {/* Launch Button */}
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsEngineActive(true)}
              rightIcon={<ArrowRight size={16} />}
              className="shadow-[var(--shadow-glow)]"
            >
              Start Drill ({filteredExercises.length} Exercises)
            </Button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            Filter By Exercise Modality:
          </p>
          <div className="flex flex-wrap gap-2">
            {EXERCISE_TYPE_FILTERS.map((f) => {
              const isSelected = selectedFilter === f.type;
              return (
                <button
                  key={f.type}
                  type="button"
                  onClick={() => setSelectedFilter(f.type)}
                  className={`px-3.5 py-2 rounded-[var(--radius-xl)] text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[var(--color-brand-600)] text-white border-[var(--color-brand-500)] shadow-sm"
                      : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercise Preview Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-500)]/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={ex.level} size="xs">
                    {ex.level.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] font-mono font-semibold uppercase text-[var(--color-brand-400)] px-2 py-0.5 rounded bg-[var(--color-brand-500)]/10">
                    {ex.type.replace(/_/g, " ")}
                  </span>
                </div>

                <h3 className="font-heading text-sm font-bold text-[var(--color-text-primary)] mb-1 line-clamp-2">
                  {ex.prompt}
                </h3>

                {ex.promptDe && (
                  <p className="text-xs text-[var(--color-text-secondary)] italic mb-2 line-clamp-1">
                    {ex.promptDe}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--color-border)]/50 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span className="font-semibold text-[var(--color-accent-400)]">+{ex.xpReward} XP</span>
                <span className="capitalize">{ex.difficulty}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
