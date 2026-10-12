"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, CheckCircle2, XCircle, RotateCcw, Sparkles,
  ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Filter,
  Play, Lightbulb, Clock, Check, Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  EnrichedMistakeRecord,
  getMistakes,
  getMistakesGroupedByTopic,
  resolveMistake,
  reopenMistake,
  getGrammarTopicsSummary,
} from "@/lib/mistakesService";
import { MistakePracticeModal } from "./MistakePracticeModal";
import { playClickSound } from "@/lib/soundEffects";

interface MistakeNotebookViewProps {
  initialTopicFilter?: string;
}

export function MistakeNotebookView({ initialTopicFilter }: MistakeNotebookViewProps) {
  const { addToast } = useToast();
  const [mistakes, setMistakes] = useState<EnrichedMistakeRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopicFilter || "all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Active modal state
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [practiceMistakes, setPracticeMistakes] = useState<EnrichedMistakeRecord[]>([]);
  const [practiceTopicTitle, setPracticeTopicTitle] = useState("");

  const refreshData = () => {
    setMistakes(getMistakes());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const topicsSummary = getGrammarTopicsSummary();
  const groupedMistakes = getMistakesGroupedByTopic();

  // Filter mistakes
  const filteredList = mistakes.filter((m) => {
    if (statusFilter === "unresolved" && m.resolved) return false;
    if (statusFilter === "resolved" && !m.resolved) return false;
    if (selectedTopic !== "all" && m.grammarTopic !== selectedTopic) return false;
    return true;
  });

  const handleToggleResolve = (m: EnrichedMistakeRecord) => {
    playClickSound();
    if (m.resolved) {
      reopenMistake(m.id);
      addToast({
        type: "info",
        title: "Reopened for Review",
        message: `Marked "${m.prompt.substring(0, 30)}..." back as unresolved.`,
      });
    } else {
      resolveMistake(m.id);
      addToast({
        type: "success",
        title: "Mistake Resolved!",
        message: "Great job! This error has been moved to your mastered notebook.",
      });
    }
    refreshData();
  };

  const handleStartPractice = (topic: string, items: EnrichedMistakeRecord[]) => {
    playClickSound();
    const targetItems = items.length > 0 ? items : filteredList;
    setPracticeMistakes(targetItems);
    setPracticeTopicTitle(topic === "all" ? "All Mistake Drills" : topic);
    setPracticeModalOpen(true);
  };

  const totalUnresolved = mistakes.filter((m) => !m.resolved).length;
  const totalResolved = mistakes.filter((m) => m.resolved).length;

  return (
    <div className="space-y-8">
      {/* HEADER & QUICK DRILL HERO */}
      <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30">
                Fehlerheft · Pedagogical Notebook
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {totalUnresolved} Unresolved Mistakes
              </span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
              Grammar Error Notebook
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              Every wrong answer across lessons, drills, and mock tests is automatically collected and categorized here by grammatical concept.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              disabled={totalUnresolved === 0}
              onClick={() => handleStartPractice("All Unresolved Errors", mistakes.filter((m) => !m.resolved))}
              leftIcon={<Play size={14} className="fill-current" />}
            >
              Practice All Errors ({totalUnresolved})
            </Button>
          </div>
        </div>

        {/* GRAMMAR TOPIC CARDS GRID WITH "PRACTICE THESE" BUTTON */}
        <div className="pt-3 border-t border-[var(--color-border)]/60">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Error Distribution by Grammar Concept:
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topicsSummary.map((ts) => {
              const isSelected = selectedTopic === ts.topic;
              const topicItems = groupedMistakes[ts.topic] || [];

              return (
                <div
                  key={ts.topic}
                  className={`p-4 rounded-[var(--radius-xl)] border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-[var(--color-brand-600)]/15 border-[var(--color-brand-500)] shadow-xs ring-1 ring-[var(--color-brand-500)]/30"
                      : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] hover:border-[var(--color-brand-500)]/40"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                        {ts.level}
                      </span>
                      <span className={`text-[11px] font-bold ${
                        ts.unresolvedCount > 0 ? "text-rose-400" : "text-[var(--color-success)]"
                      }`}>
                        {ts.unresolvedCount > 0 ? `${ts.unresolvedCount} due` : "All resolved ✓"}
                      </span>
                    </div>

                    <h3 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                      {ts.topic}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/50">
                    <button
                      onClick={() => setSelectedTopic(isSelected ? "all" : ts.topic)}
                      className="text-xs text-[var(--color-brand-400)] hover:underline font-medium cursor-pointer"
                    >
                      {isSelected ? "Show all" : `Filter (${ts.totalCount})`}
                    </button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStartPractice(ts.topic, topicItems)}
                      className="text-xs py-1 px-2.5 h-auto"
                      rightIcon={<Play size={10} className="fill-current" />}
                    >
                      Practice these
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & MISTAKES LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
              {selectedTopic === "all" ? "All Recorded Errors" : `Errors in "${selectedTopic}"`}
            </h3>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              ({filteredList.length})
            </span>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[var(--color-surface)] text-[var(--color-brand-400)] shadow-xs"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              All ({mistakes.length})
            </button>
            <button
              onClick={() => setStatusFilter("unresolved")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === "unresolved"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "text-[var(--color-text-muted)] hover:text-rose-400"
              }`}
            >
              Unresolved ({totalUnresolved})
            </button>
            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                statusFilter === "resolved"
                  ? "bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-success)]"
              }`}
            >
              Resolved ({totalResolved})
            </button>
          </div>
        </div>

        {/* MISTAKES LIST */}
        <div className="space-y-3">
          {filteredList.map((m) => {
            const isExpanded = expandedId === m.id;

            return (
              <div
                key={m.id}
                className={`p-5 rounded-[var(--radius-xl)] border transition-all ${
                  m.resolved
                    ? "bg-[var(--color-surface-2)]/30 border-[var(--color-border)] opacity-75"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-brand-500)]/40 shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                        {m.grammarTopic}
                      </span>
                      {m.level && (
                        <span className="text-[10px] font-bold text-[var(--color-brand-400)] uppercase">
                          {m.level}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                        Encountered {m.reviewCount} time{m.reviewCount > 1 ? "s" : ""}
                      </span>
                      {m.resolved && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-success)] px-2 py-0.5 rounded-md bg-[var(--color-success)]/10 border border-[var(--color-success)]/30">
                          <CheckCircle2 size={11} /> Resolved
                        </span>
                      )}
                    </div>

                    <p className="font-heading text-sm sm:text-base font-bold text-[var(--color-text-primary)] leading-snug">
                      {m.prompt}
                    </p>

                    {/* Wrong vs Correct Answer Pills */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-rose-400">
                        <XCircle size={14} className="shrink-0" />
                        <span>Your answer:</span>
                        <span className="line-through font-mono font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                          {m.userAnswer}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[var(--color-success)]">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>Correct answer:</span>
                        <span className="font-mono font-bold bg-[var(--color-success)]/10 px-1.5 py-0.5 rounded">
                          {m.correctAnswer}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 self-start shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleResolve(m)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        m.resolved
                          ? "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-rose-400"
                          : "bg-[var(--color-success)]/15 border-[var(--color-success)]/30 text-[var(--color-success)] hover:bg-[var(--color-success)]/25"
                      }`}
                    >
                      {m.resolved ? "Reopen" : "Mark Resolved"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : m.id)}
                      className="p-1.5 rounded-lg bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                      title={isExpanded ? "Collapse" : "View explanation"}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Grammar Breakdown */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-3 border-t border-[var(--color-border)]/60 text-xs space-y-2"
                    >
                      <div className="p-3.5 rounded-xl bg-[var(--color-brand-600)]/10 border border-[var(--color-brand-500)]/30 text-[var(--color-text-secondary)] leading-relaxed">
                        <strong className="text-[var(--color-brand-400)] block mb-1">
                          💡 Grammatikregel & Erklärung:
                        </strong>
                        {m.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="p-10 text-center rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] space-y-3">
              <ShieldCheck size={32} className="text-[var(--color-success)] mx-auto" />
              <p className="text-sm font-bold text-[var(--color-text-primary)]">
                No mistakes found for this filter!
              </p>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                {statusFilter === "unresolved"
                  ? "All mistakes in this category have been resolved. Excellent grammatical accuracy!"
                  : "Try clearing filters to view all recorded errors."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PRACTICE MODAL */}
      <MistakePracticeModal
        isOpen={practiceModalOpen}
        onClose={() => setPracticeModalOpen(false)}
        mistakes={practiceMistakes}
        topicTitle={practiceTopicTitle}
        onRefresh={refreshData}
      />
    </div>
  );
}
