"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, Volume2, Sparkles, ChevronRight,
  RotateCcw, CheckCircle2, AlertCircle, Clock, Award,
  Plus, Lightbulb, Coffee, Stethoscope, Briefcase, FileCheck,
  ShoppingBag, MessageCircle, ArrowLeft, VolumeX, AlertTriangle,
  Flame, Check
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  CONVERSATION_SCENARIOS,
  ConversationScenario,
  CefrLevel,
  getScenarioById
} from "@/lib/conversationScenarios";
import {
  getUserConversationUsage,
  recordConversationUsage,
  calculateAndLogSessionCost,
  ConversationUsageRecord,
  UserSubscriptionPlan
} from "@/lib/conversationUsageService";
import { saveWordToMyWords } from "@/lib/flashcardService";
import { addXp } from "@/lib/gamificationService";
import { playSuccessChime, playClickSound } from "@/lib/soundEffects";
import { triggerConfetti } from "@/lib/confetti";
import type { VocabularyItem } from "@/lib/courseData";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  hintEn?: string;
  showHint?: boolean;
  timestamp: string;
}

interface GrammarError {
  id: string;
  userSaid: string;
  corrected: string;
  ruleExplanation: string;
}

interface FeedbackReport {
  fluencyScore: number;
  cefrEvaluation: CefrLevel;
  durationMinutes: number;
  turnsCount: number;
  summary: string;
  grammarErrors: GrammarError[];
  vocabularyToReview: VocabularyItem[];
  xpEarned: number;
}

export function ConversationStudio() {
  const { addToast } = useToast();

  // State: Scenario selection vs Active Chat vs Feedback
  const [selectedScenario, setSelectedScenario] = useState<ConversationScenario | null>(null);
  const [levelFilter, setLevelFilter] = useState<CefrLevel | "ALL">("ALL");
  const [activeSession, setActiveSession] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [usage, setUsage] = useState<ConversationUsageRecord | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState<FeedbackReport | null>(null);
  const [savedVocabIds, setSavedVocabIds] = useState<string[]>([]);

  // Speech Recognition & TTS references
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize usage record on mount
  useEffect(() => {
    const currentUsage = getUserConversationUsage("user-default", "free");
    setUsage(currentUsage);

    // Initialize Web Speech Recognition if available
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "de-DE";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join("");
          setInputText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecordingMic(false);
        };

        recognition.onend = () => {
          setIsRecordingMic(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Live session timer
  useEffect(() => {
    if (activeSession) {
      timerIntervalRef.current = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [activeSession]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Handle Scenario Start
  const handleStartScenario = (scenario: ConversationScenario) => {
    playClickSound();
    if (usage?.isLimitReached) {
      setShowLimitModal(true);
      return;
    }

    setSelectedScenario(scenario);
    setSessionSeconds(0);
    setFeedbackReport(null);
    setSavedVocabIds([]);

    const initialAiMsg: ChatMessage = {
      id: "ai-starter",
      role: "assistant",
      content: scenario.starterMessageDe,
      hintEn: scenario.starterHintEn,
      showHint: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([initialAiMsg]);
    setActiveSession(true);

    // Speak initial AI greeting natively
    speakGerman(scenario.starterMessageDe);
  };

  // Text to Speech playback
  const speakGerman = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.92;

    utterance.onstart = () => setIsSpeakingAudio(true);
    utterance.onend = () => setIsSpeakingAudio(false);
    utterance.onerror = () => setIsSpeakingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Input (Mic)
  const toggleMicrophone = () => {
    if (!recognitionRef.current) {
      addToast({
        type: "warning",
        title: "Voice Input Unavailable",
        message: "Your browser does not support SpeechRecognition. Please use keyboard input.",
      });
      return;
    }

    if (isRecordingMic) {
      recognitionRef.current.stop();
      setIsRecordingMic(false);
    } else {
      setInputText("");
      recognitionRef.current.start();
      setIsRecordingMic(true);
    }
  };

  // Send message to server-side AI API route
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isAiTyping || !selectedScenario) return;

    if (isRecordingMic && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingMic(false);
    }

    playClickSound();
    setInputText("");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/conversation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          userLevel: selectedScenario.recommendedLevel,
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          minutesUsed: usage?.minutesUsedThisMonth || 0,
        }),
      });

      if (res.status === 429) {
        setIsAiTyping(false);
        setShowLimitModal(true);
        return;
      }

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.replyDe,
        hintEn: data.hintEn,
        showHint: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakGerman(data.replyDe);
    } catch (err) {
      console.error("Failed to send message:", err);
      addToast({
        type: "error",
        title: "Network Error",
        message: "Could not reach conversation engine. Please check your connection.",
      });
    } finally {
      setIsAiTyping(false);
    }
  };

  // End Session & Generate Feedback Report
  const handleEndSessionAndReport = async () => {
    if (!selectedScenario || messages.length <= 1) {
      setActiveSession(false);
      setSelectedScenario(null);
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    playClickSound();
    setActiveSession(false);

    // Meter session usage
    const sessionMinutes = Math.max(1, Math.round(sessionSeconds / 60));
    const updatedUsage = recordConversationUsage("user-default", sessionMinutes, "free");
    setUsage(updatedUsage);

    // Calculate telemetry and log cost
    const userTexts = messages.filter((m) => m.role === "user").map((m) => m.content);
    const aiTexts = messages.filter((m) => m.role === "assistant").map((m) => m.content);
    calculateAndLogSessionCost({
      userId: "user-default",
      scenarioId: selectedScenario.id,
      durationSeconds: sessionSeconds,
      userMessagesText: userTexts,
      aiMessagesText: aiTexts,
    });

    try {
      const res = await fetch("/api/conversation/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          userLevel: selectedScenario.recommendedLevel,
          durationSeconds: sessionSeconds,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const reportData = (await res.json()) as FeedbackReport;
        setFeedbackReport(reportData);

        // Award XP
        addXp(reportData.xpEarned);
        playSuccessChime();
        triggerConfetti();

        addToast({
          type: "success",
          title: "Session Completed!",
          message: `+${reportData.xpEarned} XP awarded for your German conversation practice.`,
        });
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    }
  };

  // Add word to flashcards
  const handleAddWordToFlashcards = (vocab: VocabularyItem) => {
    playClickSound();
    const added = saveWordToMyWords(vocab);
    if (added) {
      setSavedVocabIds((prev) => [...prev, vocab.id]);
      addToast({
        type: "success",
        title: "Added to Flashcards!",
        message: `"${vocab.german}" added to your "My Words" spaced repetition deck.`,
      });
    } else {
      addToast({
        type: "info",
        title: "Already in Deck",
        message: `"${vocab.german}" is already present in your flashcards.`,
      });
    }
  };

  const getScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case "Coffee": return <Coffee size={20} />;
      case "Stethoscope": return <Stethoscope size={20} />;
      case "ShoppingBag": return <ShoppingBag size={20} />;
      case "MessageCircle": return <MessageCircle size={20} />;
      case "FileCheck": return <FileCheck size={20} />;
      case "Briefcase": return <Briefcase size={20} />;
      default: return <MessageCircle size={20} />;
    }
  };

  const filteredScenarios = CONVERSATION_SCENARIOS.filter((s) => {
    if (levelFilter === "ALL") return true;
    return s.cefrLevels.includes(levelFilter);
  });

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      {/* ─── HEADER & METERING STATUS BAR ─────────────────────────────────────── */}
      <div className="surface-card p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[var(--color-brand-500)]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-600)] text-white uppercase tracking-wider">
              AI Voice & Chat Studio
            </span>
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-medium">
              <Sparkles size={13} className="text-[var(--color-accent-400)]" />
              <span>Real-time Native Dialogues</span>
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
            AI Conversation Practice
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-xl">
            Simulate authentic life in Germany, Austria, and Switzerland. Speak or type naturally, receive spoken answers, and get a post-session error feedback report.
          </p>
        </div>

        {/* Usage Meter Card */}
        {usage && (
          <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] flex flex-col gap-2 min-w-[240px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-text-primary)]">
                Monthly Voice Cap
              </span>
              <span className="text-[11px] font-mono text-[var(--color-text-muted)]">
                {usage.minutesRemaining} min left
              </span>
            </div>
            <ProgressBar
              value={Math.round((usage.minutesUsedThisMonth / usage.monthlyMinutesCap) * 100)}
              size="sm"
              color={usage.isLimitReached ? "error" : "brand"}
            />
            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
              <span>{usage.minutesUsedThisMonth} / {usage.monthlyMinutesCap} mins ({usage.plan.toUpperCase()})</span>
              <span>Resets {usage.cycleResetDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── VIEW 1: SCENARIO PICKER (If no active session & no report) ───────── */}
      {!activeSession && !feedbackReport && (
        <div className="space-y-6">
          {/* CEFR Level Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs">
              {(["ALL", "A1", "A2", "B1", "B2"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    playClickSound();
                    setLevelFilter(lvl);
                  }}
                  className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                    levelFilter === lvl
                      ? "bg-[var(--color-brand-600)] text-white shadow-xs font-bold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {lvl === "ALL" ? "All Scenarios" : `CEFR ${lvl}`}
                </button>
              ))}
            </div>

            <span className="text-xs text-[var(--color-text-muted)]">
              Showing {filteredScenarios.length} scenarios
            </span>
          </div>

          {/* Grid of Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredScenarios.map((sc) => (
              <div
                key={sc.id}
                className="surface-card p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] hover:border-[var(--color-brand-500)]/60 shadow-sm transition-all hover:shadow-[var(--shadow-md)] flex flex-col justify-between group relative overflow-hidden"
              >
                <div
                  className="h-1 w-full absolute top-0 left-0 right-0"
                  style={{ backgroundColor: sc.colorAccent }}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: sc.colorAccent }}
                    >
                      {getScenarioIcon(sc.iconName)}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                      {sc.badgeLabel}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors">
                      {sc.title}
                    </h3>
                    <p className="text-xs text-[var(--color-accent-400)] font-semibold mt-0.5">
                      {sc.titleDe}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                      {sc.settingDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)]/60 space-y-1.5 text-[11px] text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--color-text-primary)]">AI Partner:</span>
                      <span>{sc.aiRole}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[var(--color-text-primary)]">Your Role:</span>
                      <span>{sc.userRole}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[var(--color-border)]/40">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    rightIcon={<ChevronRight size={14} />}
                    onClick={() => handleStartScenario(sc)}
                  >
                    Start Roleplay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── VIEW 2: ACTIVE CHAT SESSION ─────────────────────────────────────── */}
      {activeSession && selectedScenario && (
        <div className="surface-card rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-xl overflow-hidden flex flex-col h-[75vh] max-h-[800px] relative">
          {/* Active Session Top Bar */}
          <div className="p-4 sm:px-6 bg-[var(--color-surface-2)]/90 border-b border-[var(--color-border)] flex items-center justify-between gap-4 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveSession(false);
                }}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-all cursor-pointer"
                title="Back to scenarios"
              >
                <ArrowLeft size={16} />
              </button>

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: selectedScenario.colorAccent }}
              >
                {getScenarioIcon(selectedScenario.iconName)}
              </div>

              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <span>{selectedScenario.titleDe}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-brand-600)] text-white font-sans font-bold">
                    {selectedScenario.recommendedLevel}
                  </span>
                </h3>
                <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
                  Roleplay with {selectedScenario.aiRole}
                </p>
              </div>
            </div>

            {/* Timer & Finish Session Action */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-primary)]">
                <Clock size={13} className="text-[var(--color-brand-400)] animate-pulse" />
                <span>{formatTimer(sessionSeconds)}</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={handleEndSessionAndReport}
              >
                Finish & Get Report
              </Button>
            </div>
          </div>

          {/* Chat Stream View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                    msg.role === "user"
                      ? "bg-[var(--color-brand-600)] text-white"
                      : "bg-slate-800 text-[var(--color-accent-400)] border border-slate-700"
                  }`}
                >
                  {msg.role === "user" ? "Me" : "AI"}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[var(--color-brand-600)] text-white rounded-tr-none shadow-sm"
                        : "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p>{msg.content}</p>

                    {/* AI Spoken Audio Play Button */}
                    {msg.role === "assistant" && (
                      <div className="mt-2.5 pt-2 border-t border-[var(--color-border)]/50 flex items-center justify-between gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => speakGerman(msg.content)}
                          className="flex items-center gap-1.5 text-[11px] text-[var(--color-brand-400)] hover:underline font-semibold cursor-pointer"
                        >
                          <Volume2 size={13} />
                          <span>Listen (Audio)</span>
                        </button>

                        {/* Hint Toggle */}
                        {msg.hintEn && (
                          <button
                            type="button"
                            onClick={() => {
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.id === msg.id ? { ...m, showHint: !m.showHint } : m
                                )
                              );
                            }}
                            className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                          >
                            <Lightbulb size={12} className="text-amber-400" />
                            <span>{msg.showHint ? "Hide hint" : "Show English hint"}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expanded English Hint Box */}
                  {msg.showHint && msg.hintEn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed"
                    >
                      💡 {msg.hintEn}
                    </motion.div>
                  )}

                  <span className="text-[10px] text-[var(--color-text-muted)] block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] p-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-500)] animate-ping" />
                <span>{selectedScenario.aiRole} is thinking...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Starter Suggestions */}
          {selectedScenario.suggestedUserStarters && messages.length <= 3 && (
            <div className="px-4 py-2 bg-[var(--color-surface-2)]/60 border-t border-[var(--color-border)]/60 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] shrink-0">
                Suggested Starters:
              </span>
              {selectedScenario.suggestedUserStarters.map((starter, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(starter.de)}
                  className="px-2.5 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-400)] text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                  title={starter.en}
                >
                  &ldquo;{starter.de}&rdquo;
                </button>
              ))}
            </div>
          )}

          {/* Bottom Chat Input Controls */}
          <div className="p-3 sm:p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] shrink-0 flex items-center gap-2">
            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={toggleMicrophone}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isRecordingMic
                  ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30"
                  : "bg-[var(--color-surface-2)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/15 border border-[var(--color-border)]"
              }`}
              title={isRecordingMic ? "Click to stop recording" : "Speak in German (Speech-to-Text)"}
            >
              {isRecordingMic ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input with Enter submission */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isRecordingMic
                  ? "Listening... speak now in German..."
                  : "Type in German (or click mic to speak)..."
              }
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-brand-500)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
            />

            {/* Send Button */}
            <Button
              variant="primary"
              size="sm"
              disabled={!inputText.trim() || isAiTyping}
              onClick={() => handleSendMessage()}
              className="h-11 px-4"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ─── VIEW 3: POST-SESSION FEEDBACK REPORT ─────────────────────────────── */}
      {feedbackReport && selectedScenario && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="surface-card p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-2xl space-y-8"
        >
          {/* Top Banner with Fluency Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--color-border)]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success)] text-white uppercase tracking-wider">
                  Session Completed
                </span>
                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                  {selectedScenario.titleDe}
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                AI Conversation Feedback Report
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                Completed {feedbackReport.turnsCount} turns across {feedbackReport.durationMinutes} minutes of active conversation.
              </p>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] shrink-0">
              <div className="text-center">
                <div className="font-heading text-3xl font-extrabold text-[var(--color-brand-400)]">
                  {feedbackReport.fluencyScore}%
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Fluency Score
                </div>
              </div>

              <div className="h-10 w-[1px] bg-[var(--color-border)]" />

              <div className="text-center">
                <div className="font-heading text-xl font-bold text-[var(--color-accent-400)]">
                  +{feedbackReport.xpEarned} XP
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Earned Reward
                </div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-2xl bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 text-sm text-[var(--color-text-primary)] leading-relaxed">
            {feedbackReport.summary}
          </div>

          {/* Grammar Corrections */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-400" />
              <span>Grammar Errors & Corrections</span>
            </h3>

            {feedbackReport.grammarErrors.length === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-xs text-[var(--color-success)] flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Ausgezeichnet! No major grammatical errors detected in your responses.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbackReport.grammarErrors.map((err) => (
                  <div
                    key={err.id}
                    className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                        What you said:
                      </span>
                      <p className="line-through text-[var(--color-text-muted)] mt-0.5 font-mono">
                        &ldquo;{err.userSaid}&rdquo;
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[var(--color-success)] uppercase tracking-wider block">
                        Natural German Correction:
                      </span>
                      <p className="font-semibold text-[var(--color-text-primary)] mt-0.5">
                        &ldquo;{err.corrected}&rdquo;
                      </p>
                    </div>

                    <p className="text-[11px] text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border)]/60">
                      💡 {err.ruleExplanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vocabulary to Review (One-Tap Add to Flashcards) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--color-accent-400)]" />
                <span>Vocabulary to Review (One-Tap Add to Flashcards)</span>
              </h3>
              <span className="text-xs text-[var(--color-text-muted)]">
                Save words to your SM-2 spaced repetition deck
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedbackReport.vocabularyToReview.map((vocab) => {
                const isSaved = savedVocabIds.includes(vocab.id);

                return (
                  <div
                    key={vocab.id}
                    className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex flex-col justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        {vocab.article && (
                          <span
                            className={`font-mono text-xs font-bold uppercase ${
                              vocab.article === "der"
                                ? "text-blue-400"
                                : vocab.article === "die"
                                ? "text-pink-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {vocab.article}
                          </span>
                        )}
                        <span className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                          {vocab.german}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-secondary)]">{vocab.english}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] italic mt-2">
                        &ldquo;{vocab.exampleDe}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddWordToFlashcards(vocab)}
                      disabled={isSaved}
                      className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                        isSaved
                          ? "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30"
                          : "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] text-white shadow-xs"
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check size={14} />
                          <span>Saved to Flashcards</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>+ Add to My Flashcards</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--color-border)]">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RotateCcw size={15} />}
              onClick={() => {
                playClickSound();
                setFeedbackReport(null);
                setActiveSession(false);
                setSelectedScenario(null);
              }}
            >
              Choose Another Scenario
            </Button>

            <Link href="/flashcards">
              <Button variant="primary" size="md" rightIcon={<ChevronRight size={15} />}>
                Review Flashcard Decks
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* ─── GRACEFUL LIMIT REACHED MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {showLimitModal && usage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface-card max-w-md w-full p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                  Monthly Conversation Limit Reached
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                  You have used your <strong>{usage.monthlyMinutesCap} minutes</strong> of AI German conversation practice for this month on the {usage.plan.toUpperCase()} tier.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Current Plan:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{usage.plan.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Monthly Cap:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">{usage.monthlyMinutesCap} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Reset Date:</span>
                  <span className="font-semibold text-[var(--color-brand-400)]">{usage.cycleResetDate}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    addToast({
                      type: "info",
                      title: "Pro Upgrade",
                      message: "Pro plan unlocked with 120 minutes/month AI voice dialogue!",
                    });
                    const updated = recordConversationUsage("user-default", -10, "pro");
                    setUsage(updated);
                    setShowLimitModal(false);
                  }}
                >
                  Upgrade to Pro (120 min/month)
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLimitModal(false)}
                >
                  Close & Continue with Flashcards
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
