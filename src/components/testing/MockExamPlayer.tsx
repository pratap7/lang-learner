"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Flag, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft,
  Volume2, Mic, BookOpen, Layers, Edit3, Send, Check, AlertCircle,
  HelpCircle, Sparkles, X, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import {
  MOCK_EXAMS,
  MockExamDefinition,
  TestQuestionItem,
  saveTestAttempt,
  TestAttemptRecord,
  SkillSection,
} from "@/lib/testingService";
import { playClickSound, playSuccessSound, playErrorSound } from "@/lib/soundEffects";

interface MockExamPlayerProps {
  level: string;
}

export function MockExamPlayer({ level }: MockExamPlayerProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [exam, setExam] = useState<MockExamDefinition | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(45 * 60);
  const [startTime, setStartTime] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [writingContent, setWritingContent] = useState("");
  const [speakingTranscript, setSpeakingTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const found = MOCK_EXAMS.find((m) => m.level.toLowerCase() === level.toLowerCase()) || MOCK_EXAMS[0];
    setExam(found);
    const initialSeconds = found.durationMinutes * 60;
    setTimeRemainingSeconds(initialSeconds);
    setStartTime(Date.now());

    // Countdown Timer with Auto-Submit
    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [level]);

  const handleAutoSubmit = () => {
    addToast({
      type: "error",
      title: "Time is Up!",
      message: "The countdown timer reached 00:00. Your mock exam is being automatically submitted.",
    });
    performSubmit();
  };

  if (!exam) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[var(--color-text-muted)]">Loading {level.toUpperCase()} Goethe/telc Mock Exam environment...</p>
      </div>
    );
  }

  const currentSection = exam.sections[activeSectionIndex];
  const currentQuestion = currentSection?.questions[activeQuestionIndex];

  // Flatten all questions across all sections for global navigation & stats
  const allQuestions = exam.sections.flatMap((s) => s.questions);
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isTimeUrgent = timeRemainingSeconds < 300; // Under 5 minutes

  const handleSelectOption = (qId: string, optIdx: number) => {
    playClickSound();
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleToggleFlag = (qId: string) => {
    playClickSound();
    setFlagged((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Play audio for listening questions via Web Speech API
  const handlePlayAudio = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    playClickSound();

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.88;

    setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API Voice Recognition for Speaking Section
  const handleStartRecording = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast({
        type: "error",
        title: "Microphone Not Supported",
        message: "Your browser does not support Speech Recognition. You can type your response instead.",
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "de-DE";
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsRecording(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpeakingTranscript(transcript);
        if (currentQuestion) {
          setAnswers((prev) => ({ ...prev, [currentQuestion.id]: transcript }));
        }
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
    } catch {
      setIsRecording(false);
    }
  };

  const handleWritingChange = (text: string) => {
    setWritingContent(text);
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: text }));
    }
  };

  const handleNextInExam = () => {
    if (activeQuestionIndex < currentSection.questions.length - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else if (activeSectionIndex < exam.sections.length - 1) {
      setActiveSectionIndex((prev) => prev + 1);
      setActiveQuestionIndex(0);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrevInExam = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    } else if (activeSectionIndex > 0) {
      setActiveSectionIndex((prev) => prev - 1);
      setActiveQuestionIndex(exam.sections[activeSectionIndex - 1].questions.length - 1);
    }
  };

  const performSubmit = () => {
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const totalDuration = Math.max(10, Math.round((Date.now() - startTime) / 1000));
    let totalScoreEarned = 0;
    const review: TestAttemptRecord["questionReview"] = [];
    const answersMeta: TestAttemptRecord["answers"] = {};
    const sectionMap = new Map<SkillSection, { earned: number; max: number; label: string }>();
    const weakTopicMap = new Map<string, { count: number; total: number; sec: SkillSection }>();

    exam.sections.forEach((sec) => {
      let secEarned = 0;
      let secMax = 0;

      sec.questions.forEach((q) => {
        const userAns = answers[q.id];
        let isCorrect = false;

        if (q.section === "writing") {
          // Writing evaluation: min words check
          const wordsCount = typeof userAns === "string" ? userAns.trim().split(/\s+/).filter(Boolean).length : 0;
          isCorrect = wordsCount >= (q.writingRubric?.minWords || 20);
        } else if (q.section === "speaking") {
          // Speaking evaluation: attempted and has words
          isCorrect = typeof userAns === "string" && userAns.trim().length > 10;
        } else {
          isCorrect = userAns === q.correctAnswer;
        }

        const pts = isCorrect ? q.points : 0;
        totalScoreEarned += pts;
        secEarned += pts;
        secMax += q.points;

        // Weak topics map
        const wt = weakTopicMap.get(q.topic) || { count: 0, total: 0, sec: q.section };
        wt.total++;
        if (!isCorrect) wt.count++;
        weakTopicMap.set(q.topic, wt);

        review.push({
          id: q.id,
          level: q.level,
          section: q.section,
          topic: q.topic,
          prompt: q.prompt,
          contextText: q.contextText,
          options: q.options,
          userAnswer: userAns !== undefined ? userAns : -1,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation,
        });

        answersMeta[q.id] = {
          userAnswer: userAns !== undefined ? userAns : -1,
          isCorrect,
          flagged: !!flagged[q.id],
        };
      });

      sectionMap.set(sec.id, {
        earned: secEarned,
        max: secMax,
        label: sec.titleDe,
      });
    });

    const scorePct = Math.round((totalScoreEarned / exam.totalPoints) * 100);
    const passed = scorePct >= exam.passMarkPct;

    const sectionScores = Array.from(sectionMap.entries()).map(([secId, stats]) => ({
      section: secId,
      label: stats.label,
      score: stats.earned,
      maxScore: stats.max,
      percentage: stats.max > 0 ? Math.round((stats.earned / stats.max) * 100) : 0,
      timeSeconds: Math.round(totalDuration / exam.sections.length),
    }));

    const weakTopics: TestAttemptRecord["weakTopics"] = [];
    weakTopicMap.forEach((val, key) => {
      if (val.count > 0) {
        weakTopics.push({
          topic: key,
          section: val.sec,
          missedCount: val.count,
          totalCount: val.total,
          advice: `Review ${key} in Goethe exam training modules before your next simulation.`,
        });
      }
    });

    const attemptId = `attempt-mock-${Date.now()}`;
    const attemptRecord: TestAttemptRecord = {
      id: attemptId,
      testType: "mock_exam",
      title: exam.title,
      level: exam.level,
      totalQuestions,
      score: totalScoreEarned,
      maxScore: exam.totalPoints,
      percentage: scorePct,
      passed,
      durationSeconds: totalDuration,
      completedAt: new Date().toISOString(),
      sectionScores,
      answers: answersMeta,
      weakTopics,
      questionReview: review,
    };

    saveTestAttempt(attemptRecord);
    setShowConfirmModal(false);

    router.push(`/tests/results/${attemptId}`);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* EXAM STICKY CONTROL BAR */}
      <div className="sticky top-18 z-30 p-4 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="primary" size="sm">
            {exam.level} MOCK EXAM
          </Badge>
          <span className="hidden sm:inline text-xs font-semibold text-[var(--color-text-secondary)]">
            {exam.titleDe}
          </span>
        </div>

        {/* Countdown Timer with Visual Urgency */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-mono font-bold text-sm border shadow-xs transition-colors ${
          isTimeUrgent
            ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
            : "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] border-[var(--color-border)]"
        }`}>
          <Clock size={16} className={isTimeUrgent ? "text-rose-400" : "text-[var(--color-brand-400)]"} />
          <span>{formatTime(timeRemainingSeconds)}</span>
        </div>

        {/* Global Progress & Submit Button */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs text-[var(--color-text-muted)]">
            {answeredCount} / {totalQuestions} Answered
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            rightIcon={<Send size={13} />}
            className="text-xs"
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* SECTION TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exam.sections.map((sec, secIdx) => {
          const isSecActive = secIdx === activeSectionIndex;
          const secAnsweredCount = sec.questions.filter((q) => answers[q.id] !== undefined).length;

          return (
            <button
              key={sec.id}
              onClick={() => {
                playClickSound();
                setActiveSectionIndex(secIdx);
                setActiveQuestionIndex(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
                isSecActive
                  ? "bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)] shadow-sm"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
              }`}
            >
              <span>{sec.titleDe}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isSecActive ? "bg-white/20 text-white" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
              }`}>
                {secAnsweredCount}/{sec.questions.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN EXAM LAYOUT */}
      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* LEFT 3 COLUMNS: ACTIVE QUESTION WORKSPACE */}
        <div className="lg:col-span-3">
          {currentQuestion && (
            <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
              {/* Question Header & Flagging Action */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-brand-400)] border border-[var(--color-border)]">
                    {currentSection.titleDe} · Question {activeQuestionIndex + 1}
                  </span>
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">
                    {currentQuestion.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[var(--color-accent-400)]">
                    {currentQuestion.points} Points
                  </span>

                  {/* Flag for Review Button */}
                  <button
                    onClick={() => handleToggleFlag(currentQuestion.id)}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      flagged[currentQuestion.id]
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                        : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-amber-400"
                    }`}
                    title="Flag question for later review"
                  >
                    <Flag size={14} className={flagged[currentQuestion.id] ? "fill-current" : ""} />
                    <span className="hidden sm:inline">
                      {flagged[currentQuestion.id] ? "Flagged" : "Flag"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Reading Passage if Reading Section */}
              {currentQuestion.contextText && (
                <div className="p-4 sm:p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] leading-relaxed italic space-y-1">
                  <span className="font-bold text-[var(--color-brand-400)] not-italic block mb-1">
                    📖 Lesetext / Textvorlage:
                  </span>
                  <p>{currentQuestion.contextText}</p>
                </div>
              )}

              {/* Audio Player if Listening Section */}
              {currentQuestion.audioText && (
                <div className="p-4 rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-brand-600)]/15 to-[var(--color-accent-600)]/10 border border-[var(--color-brand-500)]/30 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(currentQuestion.audioText!)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isPlayingAudio
                          ? "bg-[var(--color-brand-500)] text-white scale-105 ring-4 ring-[var(--color-brand-500)]/30 animate-pulse"
                          : "bg-[var(--color-surface)] text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/20 border border-[var(--color-border)]"
                      }`}
                      title="Play spoken announcement"
                    >
                      <Volume2 size={20} />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">
                        Hörtext abspielen · Native German Speech
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        Click the speaker to hear authentic pronunciation. You can replay up to 2 times.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Writing Task Prompt */}
              {currentQuestion.section === "writing" && currentQuestion.writingRubric && (
                <div className="space-y-4">
                  <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs space-y-2">
                    <span className="font-bold text-[var(--color-accent-400)] block">
                      Schreibaufgabe & Kriterien:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
                      {currentQuestion.writingRubric.criteria.map((cr, idx) => (
                        <li key={idx}>{cr}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span>Ihre Nachricht (Deutsch):</span>
                      <span className={`font-mono font-bold ${
                        writingContent.trim().split(/\s+/).filter(Boolean).length >= currentQuestion.writingRubric.minWords
                          ? "text-[var(--color-success)]"
                          : "text-amber-400"
                      }`}>
                        {writingContent.trim().split(/\s+/).filter(Boolean).length} / {currentQuestion.writingRubric.minWords} words
                      </span>
                    </div>

                    <textarea
                      value={writingContent}
                      onChange={(e) => handleWritingChange(e.target.value)}
                      placeholder="Lieber Max, vielen Dank für deine Einladung..."
                      rows={6}
                      className="w-full p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Speaking Task Prompt */}
              {currentQuestion.section === "speaking" && currentQuestion.speakingPrompt && (
                <div className="space-y-4">
                  <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs space-y-2">
                    <span className="font-bold text-[var(--color-brand-400)] block">
                      Sprechaufgabe & Zielpunkte:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
                      {currentQuestion.speakingPrompt.targetPoints.map((tp, idx) => (
                        <li key={idx}>{tp}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isRecording
                            ? "bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30"
                            : "bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)]"
                        }`}
                        title="Record your German speech"
                      >
                        <Mic size={20} />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)]">
                          {isRecording ? "Listening to your German speech..." : "Click microphone to record"}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          Powered by Web Speech Recognition
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto text-xs text-[var(--color-text-secondary)] italic">
                      {speakingTranscript ? `"${speakingTranscript}"` : "No speech recorded yet."}
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Choice Options (for reading, listening, grammar) */}
              {currentQuestion.section !== "writing" && currentQuestion.section !== "speaking" && (
                <div className="space-y-3">
                  <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)] leading-snug">
                    {currentQuestion.prompt}
                  </h2>

                  <div className="space-y-2.5">
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQuestion.id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`w-full p-4 rounded-[var(--radius-xl)] border text-left text-sm font-medium transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-[var(--color-brand-600)]/15 border-[var(--color-brand-500)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-brand-500)]/40"
                              : "bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-brand-400)]/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                              isSelected
                                ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)] text-white"
                                : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isSelected && (
                            <CheckCircle2 size={16} className="text-[var(--color-brand-400)] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Step Navigation Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]/60">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeSectionIndex === 0 && activeQuestionIndex === 0}
                  onClick={handlePrevInExam}
                  leftIcon={<ArrowLeft size={13} />}
                  className="text-xs"
                >
                  Previous
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNextInExam}
                  rightIcon={<ArrowRight size={13} />}
                  className="text-xs"
                >
                  {activeSectionIndex === exam.sections.length - 1 &&
                  activeQuestionIndex === currentSection.questions.length - 1
                    ? "Review & Submit"
                    : "Next Question"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 1 COLUMN: QUESTION NAVIGATOR PALETTE */}
        <div className="p-5 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
              Question Navigator
            </h3>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {answeredCount}/{totalQuestions} Done
            </span>
          </div>

          {/* Status Key */}
          <div className="grid grid-cols-3 gap-1 text-[10px] text-[var(--color-text-muted)] pt-1">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]" /> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-surface-3)]" /> Unanswered
            </span>
          </div>

          {/* Section Question Grid */}
          <div className="space-y-3 pt-2">
            {exam.sections.map((sec, secIdx) => (
              <div key={sec.id} className="space-y-1.5">
                <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                  {sec.titleDe}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sec.questions.map((q, qIdx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isFlag = flagged[q.id];
                    const isCurrent = secIdx === activeSectionIndex && qIdx === activeQuestionIndex;

                    let bgClass = "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]";
                    if (isAnswered) {
                      bgClass = "bg-[var(--color-success)]/15 border-[var(--color-success)]/40 text-[var(--color-success)] font-bold";
                    }
                    if (isFlag) {
                      bgClass = "bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold";
                    }
                    if (isCurrent) {
                      bgClass += " ring-2 ring-[var(--color-brand-500)]";
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          playClickSound();
                          setActiveSectionIndex(secIdx);
                          setActiveQuestionIndex(qIdx);
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-mono flex items-center justify-center border transition-all cursor-pointer ${bgClass}`}
                        title={`${sec.titleDe} Q${qIdx + 1}`}
                      >
                        {qIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIRM-BEFORE-SUBMIT MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <ShieldAlert size={18} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                    Confirm Submission
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Are you ready to submit your official {exam.level} Mock Exam? Once submitted, your answers will be graded against Goethe/telc benchmarks.
              </p>

              {/* Status Checklist Card */}
              <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Answered questions:</span>
                  <span className="font-bold text-[var(--color-success)]">{answeredCount} of {totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Unanswered questions:</span>
                  <span className={`font-bold ${unansweredCount > 0 ? "text-rose-400" : "text-[var(--color-text-muted)]"}`}>
                    {unansweredCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">Flagged for review:</span>
                  <span className={`font-bold ${flaggedCount > 0 ? "text-amber-400" : "text-[var(--color-text-muted)]"}`}>
                    {flaggedCount}
                  </span>
                </div>
              </div>

              {unansweredCount > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    You have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}. You can return to the exam to complete them.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-1/2 text-xs"
                >
                  Keep Working
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  onClick={performSubmit}
                  className="w-1/2 text-xs"
                  rightIcon={<Send size={13} />}
                >
                  Confirm & Submit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
