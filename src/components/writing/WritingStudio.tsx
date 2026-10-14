"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Award,
  Layers,
  ArrowLeft,
  Flame,
  Info,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  WRITING_TASKS,
  WritingTask,
  WritingTaskType,
  CefrLevel,
  getWritingTasks,
} from "@/lib/writingTasks";
import {
  getUserWritingUsage,
  recordWritingSubmission,
  WritingUsageRecord,
} from "@/lib/writingUsageService";
import {
  WritingEvaluationResult,
  TextDiffSegment,
  WritingErrorItem,
} from "@/lib/writingEvaluationService";
import { recordWritingMistake } from "@/lib/mistakesService";
import { addXp } from "@/lib/gamificationService";
import { playSuccessChime, playClickSound } from "@/lib/soundEffects";
import { triggerConfetti } from "@/lib/confetti";

export function WritingStudio() {
  const { toast } = useToast();

  // Navigation / Views: "picker" | "editor" | "feedback"
  const [currentView, setCurrentView] = useState<"picker" | "editor" | "feedback">("picker");

  // Filter state
  const [selectedType, setSelectedType] = useState<WritingTaskType | "ALL">("ALL");
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | "ALL">("ALL");

  // Active task & writing state
  const [activeTask, setActiveTask] = useState<WritingTask | null>(null);
  const [userText, setUserText] = useState<string>("");
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<WritingEvaluationResult | null>(null);

  // Usage & limits
  const [usage, setUsage] = useState<WritingUsageRecord | null>(null);
  const [showLimitModal, setShowLimitModal] = useState<boolean>(false);

  // UI helpers
  const [copiedCorrected, setCopiedCorrected] = useState<boolean>(false);
  const [diffMode, setDiffMode] = useState<"inline" | "side_by_side">("inline");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load usage on mount
  useEffect(() => {
    const cur = getUserWritingUsage("demo-user", "free");
    setUsage(cur);
  }, []);

  // Restore draft when opening a task
  const handleSelectTask = (task: WritingTask) => {
    setActiveTask(task);
    setCheckedPoints({});
    try {
      const draft = localStorage.getItem(`deutschpfad_writing_draft_${task.id}`);
      setUserText(draft || "");
    } catch {
      setUserText("");
    }
    setCurrentView("editor");
  };

  // Textarea change with autosave
  const handleTextChange = (val: string) => {
    setUserText(val);
    if (activeTask) {
      try {
        localStorage.setItem(`deutschpfad_writing_draft_${activeTask.id}`, val);
      } catch {}
    }
  };

  // Insert German Umlauts / Eszett at cursor
  const insertCharacter = (char: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleTextChange(userText + char);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated = userText.substring(0, start) + char + userText.substring(end);
    handleTextChange(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  // Insert helpful phrase
  const insertPhrase = (phrase: string) => {
    const spacing = userText.length > 0 && !userText.endsWith("\n") && !userText.endsWith(" ") ? " " : "";
    handleTextChange(userText + spacing + phrase + " ");
    playClickSound();
    toast({
      type: "info",
      title: "Phrase inserted",
      message: "Helpful sentence chunk appended to your editor.",
    });
  };

  // Word count calculation
  const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;

  // Submit for rubric evaluation
  const handleSubmitWriting = async () => {
    if (!activeTask) return;

    if (wordCount < 10) {
      toast({
        type: "warning",
        title: "Text too short",
        message: `Please write at least 15–20 words to receive a meaningful rubric evaluation. (Current: ${wordCount})`,
      });
      return;
    }

    // Check usage limits
    const currentUsage = getUserWritingUsage("demo-user", "free");
    if (currentUsage.isLimitReached) {
      setShowLimitModal(true);
      return;
    }

    setIsEvaluating(true);
    playClickSound();

    try {
      const res = await fetch("/api/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeTask.id,
          userText,
          userId: "demo-user",
          userPlan: currentUsage.plan,
          submissionsUsed: currentUsage.submissionsUsedThisMonth,
        }),
      });

      if (res.status === 429) {
        setShowLimitModal(true);
        setIsEvaluating(false);
        return;
      }

      if (!res.ok) {
        throw new Error("Evaluation request failed.");
      }

      const evalData: WritingEvaluationResult = await res.json();
      setEvaluationResult(evalData);

      // Record monthly submission count
      const updatedUsage = recordWritingSubmission("demo-user", currentUsage.plan);
      setUsage(updatedUsage);

      // Automatically save identified errors to Mistake Notebook & weak-topic profile
      if (evalData.errors && evalData.errors.length > 0) {
        for (const err of evalData.errors) {
          await recordWritingMistake({
            grammarTopic: err.grammarTopic,
            level: activeTask.level,
            prompt: `Writing task '${activeTask.titleDe}': ${err.explanation}`,
            userAnswer: err.originalSnippet,
            correctAnswer: err.correctedSnippet,
            explanation: err.explanation,
          });
        }
      }

      // Award XP based on total score
      const xpAward = Math.max(30, Math.round((evalData.totalScore / 20) * 80));
      addXp(xpAward);
      playSuccessChime();
      triggerConfetti();

      toast({
        type: "success",
        title: "Evaluation complete!",
        message: `Awarded +${xpAward} XP. Errors synced to your Mistake Notebook.`,
      });

      // Clear draft
      try {
        localStorage.removeItem(`deutschpfad_writing_draft_${activeTask.id}`);
      } catch {}

      setCurrentView("feedback");
    } catch (err) {
      console.error("Evaluation error:", err);
      toast({
        type: "error",
        title: "Evaluation error",
        message: "Could not evaluate submission. Please check connection and try again.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyCorrected = () => {
    if (!evaluationResult) return;
    navigator.clipboard.writeText(evaluationResult.correctedText);
    setCopiedCorrected(true);
    setTimeout(() => setCopiedCorrected(false), 2000);
    toast({
      type: "success",
      title: "Copied to clipboard",
      message: "Corrected German text copied successfully.",
    });
  };

  const filteredTasks = getWritingTasks({
    type: selectedType,
    level: selectedLevel,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* ─── HEADER BAR ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <PenTool size={20} />
            </div>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                German Writing Feedback Studio
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Rubric-based evaluation · Highlighted diffs · Mistake Notebook sync
              </p>
            </div>
          </div>
        </div>

        {/* Usage Pill */}
        {usage && (
          <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center gap-4 min-w-[220px]">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--color-text-primary)]">
                  Monthly Submissions
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  {usage.submissionsRemaining} left
                </span>
              </div>
              <ProgressBar
                value={Math.round((usage.submissionsUsedThisMonth / usage.monthlySubmissionCap) * 100)}
                size="sm"
                color={usage.isLimitReached ? "error" : "brand"}
              />
              <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                <span>{usage.submissionsUsedThisMonth} / {usage.monthlySubmissionCap} ({usage.plan.toUpperCase()})</span>
                <span>Resets {usage.cycleResetDate}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── VIEW 1: TASK PICKER ──────────────────────────────────────────────── */}
      {currentView === "picker" && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)]">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(
                [
                  { id: "ALL", label: "All Tasks" },
                  { id: "formal_email", label: "Formal Emails" },
                  { id: "informal_letter", label: "Informal Letters" },
                  { id: "opinion_text", label: "Opinion Texts" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedType === tab.id
                      ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium mr-1 hidden sm:inline">
                Level:
              </span>
              {(["ALL", "A1", "A2", "B1", "B2", "C1"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-[var(--radius-md)] text-[11px] font-bold transition-colors ${
                    selectedLevel === lvl
                      ? "bg-[var(--color-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border-hover)]"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => {
              const isFormal = task.type === "formal_email";
              const isInformal = task.type === "informal_letter";

              return (
                <div
                  key={task.id}
                  className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-500)]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={task.level.toLowerCase() as any}
                        size="xs"
                        className="font-bold"
                      >
                        {task.level}
                      </Badge>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center gap-1">
                        {isFormal && <Mail size={11} className="text-blue-400" />}
                        {isInformal && <MessageSquare size={11} className="text-emerald-400" />}
                        {!isFormal && !isInformal && <FileText size={11} className="text-purple-400" />}
                        {task.type.replace("_", " ")}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-xs text-[var(--color-brand-400)] font-medium mt-0.5">
                        {task.titleDe}
                      </p>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                      {task.scenario}
                    </p>

                    <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]/70 text-[11px] text-[var(--color-text-muted)] space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span>Recipient:</span>
                        <span className="text-[var(--color-text-primary)] font-semibold truncate max-w-[150px]">
                          {task.recipient}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-medium">
                        <span>Target Length:</span>
                        <span className="text-amber-400 font-bold">
                          {task.minWords}–{task.maxWords} words
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[var(--color-border)]/60">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => handleSelectTask(task)}
                    >
                      <span>Start Writing</span>
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── VIEW 2: INTERACTIVE WRITING PAD ──────────────────────────────────── */}
      {currentView === "editor" && activeTask && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView("picker")}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Task Selection</span>
            </button>
            <div className="flex items-center gap-2">
              <Badge variant={activeTask.level.toLowerCase() as any} size="sm">
                CEFR {activeTask.level}
              </Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                Target: {activeTask.minWords}–{activeTask.maxWords} words
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT / SIDEBAR: Prompt & Instructions Checklist */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-brand-400)]">
                    Task Prompt
                  </span>
                  <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mt-0.5">
                    {activeTask.title}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)]">{activeTask.titleDe}</p>
                </div>

                <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  <p className="font-semibold text-[var(--color-text-primary)] mb-1">Situation:</p>
                  <p>{activeTask.scenario}</p>
                  <p className="mt-2 text-[var(--color-brand-400)] font-medium">
                    To: {activeTask.recipient}
                  </p>
                </div>

                {/* Checklist of required points */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                      <ListChecks size={14} className="text-amber-400" />
                      Required Points to Address
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {Object.values(checkedPoints).filter(Boolean).length} / {activeTask.bulletPoints.length}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {activeTask.bulletPoints.map((bp, idx) => (
                      <label
                        key={idx}
                        className={`p-2.5 rounded-[var(--radius-lg)] border text-xs flex items-start gap-2.5 cursor-pointer transition-colors ${
                          checkedPoints[idx]
                            ? "bg-emerald-500/10 border-emerald-500/30 text-[var(--color-text-primary)]"
                            : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(checkedPoints[idx])}
                          onChange={(e) =>
                            setCheckedPoints((prev) => ({ ...prev, [idx]: e.target.checked }))
                          }
                          className="mt-0.5 rounded text-[var(--color-brand-500)] focus:ring-0"
                        />
                        <span className="leading-tight">{bp}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Helpful Phrases Bank */}
                <div className="pt-2 border-t border-[var(--color-border)]/60 space-y-2">
                  <span className="text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                    <Lightbulb size={14} className="text-amber-400" />
                    Helpful Sentence Chunks
                  </span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {activeTask.helpfulPhrases.map((phrase, i) => (
                      <button
                        key={i}
                        onClick={() => insertPhrase(phrase.de)}
                        className="w-full text-left p-2 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] hover:bg-[var(--color-brand-500)]/15 border border-[var(--color-border)] group transition-all"
                      >
                        <p className="text-[11px] font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)]">
                          {phrase.de}
                        </p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{phrase.en}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Editor Area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
                {/* Special Characters Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-[11px] text-[var(--color-text-muted)] font-medium mr-1">
                      Quick Umlauts:
                    </span>
                    {["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"].map((char) => (
                      <button
                        key={char}
                        type="button"
                        onClick={() => insertCharacter(char)}
                        className="min-w-[38px] min-h-[38px] w-9 h-9 sm:w-10 sm:h-10 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] hover:bg-[var(--color-brand-500)]/20 active:scale-95 border border-[var(--color-border)] font-mono text-sm font-bold text-[var(--color-text-primary)] flex items-center justify-center transition-all"
                      >
                        {char}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => insertCharacter(activeTask.sampleOpening + "\n\n")}
                      className="min-h-[38px] px-2.5 py-1 rounded-[var(--radius-md)] text-[12px] font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)]/50 transition-colors flex items-center"
                    >
                      + Salutation
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCharacter("\n\n" + activeTask.sampleSignOff)}
                      className="min-h-[38px] px-2.5 py-1 rounded-[var(--radius-md)] text-[12px] font-semibold text-[var(--color-brand-400)] hover:text-[var(--color-brand-300)] bg-[var(--color-surface-2)]/60 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)]/50 transition-colors flex items-center"
                    >
                      + Sign-off
                    </button>
                  </div>
                </div>

                {/* Writing Textarea */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={14}
                    value={userText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder={`Write your ${activeTask.titleDe} here in German...\n\nExample opening:\n${activeTask.sampleOpening}`}
                    className="w-full p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] leading-relaxed focus:outline-none focus:border-[var(--color-brand-500)] resize-y font-sans transition-colors"
                  />
                </div>

                {/* Word Counter & Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {wordCount} words
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        (Target: {activeTask.minWords}–{activeTask.maxWords})
                      </span>
                    </div>
                    <div>
                      {wordCount >= activeTask.minWords ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Target reached
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-400">
                          {activeTask.minWords - wordCount} words to reach minimum
                        </span>
                      )}
                    </div>
                  </div>

                  <ProgressBar
                    value={Math.min(100, Math.round((wordCount / activeTask.minWords) * 100))}
                    size="sm"
                    color={wordCount >= activeTask.minWords ? "success" : "warning"}
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleTextChange("")}
                    className="text-xs text-[var(--color-text-muted)] hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Clear text</span>
                  </button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitWriting}
                    disabled={isEvaluating}
                    className="gap-2"
                  >
                    {isEvaluating ? (
                      <>
                        <Sparkles size={16} className="animate-spin text-white" />
                        <span>Evaluating Rubric...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Submit for Evaluation</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW 3: COMPREHENSIVE EVALUATION & FEEDBACK ──────────────────────── */}
      {currentView === "feedback" && evaluationResult && activeTask && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Score Banner */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface-2)] to-[var(--color-surface)] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={evaluationResult.percentage >= 70 ? "success" : "warning"} size="sm">
                  {evaluationResult.cefrRating} Evaluated
                </Badge>
                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                  {activeTask.title} ({activeTask.titleDe})
                </span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                Rubric Evaluation Report
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Scored across 4 core competencies · {evaluationResult.errors.length} error(s) flagged · Word count: {evaluationResult.wordCount}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center min-w-[110px] shadow-sm">
                <div className="font-heading text-2xl font-extrabold text-[var(--color-brand-400)]">
                  {evaluationResult.totalScore} <span className="text-sm text-[var(--color-text-muted)]">/ 20</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">
                  Total Score
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] text-center min-w-[110px] shadow-sm">
                <div className="font-heading text-2xl font-extrabold text-emerald-400">
                  {evaluationResult.percentage}%
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">
                  Proficiency
                </div>
              </div>
            </div>
          </div>

          {/* 4 Rubric Criteria Grid (0–5 each) */}
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Rubric Assessment Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(evaluationResult.rubric).map(([key, item]) => (
                <div
                  key={key}
                  className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        {item.title}
                      </span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30 font-mono">
                        {item.score} / 5
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-tight">
                      {item.description}
                    </p>
                  </div>

                  <ProgressBar
                    value={(item.score / 5) * 100}
                    size="xs"
                    color={item.score >= 4 ? "success" : item.score >= 3 ? "warning" : "error"}
                  />

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic bg-[var(--color-surface-2)]/60 p-2.5 rounded-[var(--radius-lg)]">
                    &ldquo;{item.feedback}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Corrected Text with Highlighted Changes */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <PenTool size={18} className="text-[var(--color-brand-400)]" />
                  Corrected Text & Changes Highlighted
                </h3>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Red strikethrough denotes original errors; green denotes natural German corrections.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDiffMode(diffMode === "inline" ? "side_by_side" : "inline")}
                  className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)] transition-colors"
                >
                  {diffMode === "inline" ? "Show Side-by-Side" : "Show Inline Diff"}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCorrected}
                  className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-xs font-semibold text-[var(--color-text-secondary)] border border-[var(--color-border)] flex items-center gap-1.5 transition-colors"
                >
                  {copiedCorrected ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedCorrected ? "Copied!" : "Copy Clean German"}</span>
                </button>
              </div>
            </div>

            {diffMode === "inline" ? (
              <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-bg)] border border-[var(--color-border)] font-sans text-sm leading-relaxed whitespace-pre-wrap">
                {evaluationResult.diffSegments.map((seg, idx) => {
                  if (seg.type === "added") {
                    return (
                      <span
                        key={idx}
                        className="bg-emerald-500/20 text-emerald-300 font-semibold px-1 rounded mx-0.5 border-b border-emerald-500/40"
                      >
                        {seg.text}
                      </span>
                    );
                  }
                  if (seg.type === "removed") {
                    return (
                      <span
                        key={idx}
                        className="bg-rose-500/20 text-rose-300 line-through px-1 rounded mx-0.5 opacity-80"
                      >
                        {seg.text}
                      </span>
                    );
                  }
                  return <span key={idx}>{seg.text}</span>;
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg)] border border-rose-500/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Your Original Submission
                  </span>
                  <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
                    {evaluationResult.originalText}
                  </p>
                </div>
                <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-bg)] border border-emerald-500/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Pristine Corrected German
                  </span>
                  <p className="text-xs text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                    {evaluationResult.correctedText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Explanations for Each Error */}
          {evaluationResult.errors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <AlertCircle size={18} className="text-rose-400" />
                  Identified Errors & Grammar Explanations ({evaluationResult.errors.length})
                </h3>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  Synced to Mistake Notebook
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluationResult.errors.map((err, i) => (
                  <div
                    key={err.id || i}
                    className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {err.grammarTopic}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)]">
                        {err.severity.toUpperCase()}
                      </span>
                    </div>

                    {/* Diffs */}
                    <div className="p-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] space-y-1 text-xs font-mono">
                      <div className="flex items-center gap-2 text-rose-400">
                        <span className="text-[10px] font-bold w-4">✗</span>
                        <span className="line-through">{err.originalSnippet}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <span className="text-[10px] font-bold w-4">✓</span>
                        <span>{err.correctedSnippet}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {err.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3 Tailored Suggestions for Improvement */}
          <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" />
              3 Actionable Suggestions for Improvement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {evaluationResult.suggestions.map((sug, i) => (
                <div
                  key={i}
                  className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/70 border border-[var(--color-border)] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono">
                      {i + 1}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
                      {sug}
                    </p>
                  </div>
                  <div className="pt-2 text-[10px] font-bold text-[var(--color-brand-400)] uppercase tracking-wider">
                    High Impact Tip
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-[var(--radius-2xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <Link
              href="/mistakes"
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)] hover:text-[var(--color-brand-400)] transition-colors"
            >
              <BookOpen size={16} className="text-[var(--color-brand-400)]" />
              <span>Drill Mistakes in Mistake Notebook</span>
              <ChevronRight size={14} />
            </Link>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView("editor")}
              >
                <span>Edit & Resubmit</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveTask(null);
                  setEvaluationResult(null);
                  setCurrentView("picker");
                }}
              >
                <span>Pick Another Task</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── LIMIT REACHED MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLimitModal && usage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-[var(--radius-2xl)] border border-amber-500/30 bg-[var(--color-surface)] shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <AlertCircle size={24} />
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                  Monthly Writing Limit Reached
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                  You have used your <strong>{usage.monthlySubmissionCap} essay evaluations</strong> for this billing cycle on the {usage.plan.toUpperCase()} tier. Your limit resets on {usage.cycleResetDate}.
                </p>
              </div>

              <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-muted)] space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span>Pro Plan:</span>
                  <span className="text-[var(--color-text-primary)] font-bold">30 essays / month</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span>Unlimited Plan:</span>
                  <span className="text-[var(--color-text-primary)] font-bold">150 essays / month</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLimitModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Demo upgrade action
                    setShowLimitModal(false);
                    toast({
                      type: "success",
                      title: "Upgraded to Pro Tier",
                      message: "30 monthly writing evaluations unlocked!",
                    });
                  }}
                >
                  Upgrade to Pro
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
