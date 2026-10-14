"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Volume2, CheckCircle2, RotateCw, ArrowRight,
  BookOpen, Brain, PenTool, Headphones, Check, Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type DemoTab = "grammar" | "flashcard" | "writing" | "stories";

export function ProductDemoArea() {
  const [activeTab, setActiveTab] = useState<DemoTab>("grammar");
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>("den Bahnhof");
  const [audioPlaying, setAudioPlaying] = useState(false);

  const playDemoAudio = () => {
    setAudioPlaying(true);
    setTimeout(() => setAudioPlaying(false), 1600);
  };

  return (
    <section id="demo" className="py-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[var(--color-brand-500)]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="container-xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Sparkles size={13} /> Interactive Product Tour
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            See the actual learning engine in action
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Test the real interactive UI components before signing up. No mock videos or generic marketing slides.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-2xl mx-auto p-1.5 rounded-full bg-[var(--color-surface-2)]/70 border border-[var(--color-border)] backdrop-blur-md">
          <button
            onClick={() => setActiveTab("grammar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === "grammar"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)] font-semibold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Layers size={14} className="text-[var(--color-case-nom)]" />
            <span>Grammar Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab("flashcard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === "flashcard"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)] font-semibold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Brain size={14} className="text-[var(--color-brand-400)]" />
            <span>SM-2 Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab("writing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === "writing"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)] font-semibold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <PenTool size={14} className="text-[var(--color-accent-400)]" />
            <span>Goethe Writing Rubric</span>
          </button>

          <button
            onClick={() => setActiveTab("stories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              activeTab === "stories"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)] font-semibold"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Headphones size={14} className="text-[var(--color-case-akk)]" />
            <span>Bilingual Audio Stories</span>
          </button>
        </div>

        {/* Mockup Frame (Funded Startup Browser / App Container) */}
        <div className="max-w-4xl mx-auto rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/95 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Top Window Chrome */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-[var(--color-text-muted)] ml-3 hidden sm:inline">
                deutschpfad.app/live-sandbox
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Engine
              </span>
            </div>
          </div>

          {/* Interactive Tab Body */}
          <div className="p-6 sm:p-8 min-h-[440px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {/* TAB 1: GRAMMAR MATRIX */}
              {activeTab === "grammar" && (
                <motion.div
                  key="grammar"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--color-border)]">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-case-akk)]">
                        A1.2 Unit 4 · Akkusativ Direct Objects
                      </span>
                      <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                        Interactive Case Decoding Engine
                      </h3>
                    </div>
                    <Badge variant="default" size="sm">Grammar Focus</Badge>
                  </div>

                  {/* Interactive German Sentence */}
                  <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-3">
                    <p className="text-xs text-[var(--color-text-muted)]">Tap any highlighted token to inspect its grammatical role:</p>
                    <div className="flex flex-wrap items-center gap-2 text-lg sm:text-2xl font-bold">
                      <span className="text-[var(--color-text-primary)]">Ich</span>
                      <span className="text-[var(--color-text-primary)]">suche</span>
                      
                      <button
                        onClick={() => setSelectedWord("den Bahnhof")}
                        className={`px-3 py-1 rounded-[var(--radius-md)] border transition-all ${
                          selectedWord === "den Bahnhof"
                            ? "bg-[var(--color-case-akk)]/20 border-[var(--color-case-akk)] text-[var(--color-case-akk)] scale-105"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-case-akk)]"
                        }`}
                      >
                        den Bahnhof
                      </button>

                      <span className="text-[var(--color-text-primary)]">in</span>

                      <button
                        onClick={() => setSelectedWord("der Stadt")}
                        className={`px-3 py-1 rounded-[var(--radius-md)] border transition-all ${
                          selectedWord === "der Stadt"
                            ? "bg-[var(--color-case-dat)]/20 border-[var(--color-case-dat)] text-[var(--color-case-dat)] scale-105"
                            : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-case-dat)]"
                        }`}
                      >
                        der Stadt
                      </button>
                      <span className="text-[var(--color-text-primary)]">.</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] italic">
                      &quot;I am looking for the train station in the city.&quot;
                    </p>
                  </div>

                  {/* Deep Linguistic Breakdown Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-case-akk)]/30 bg-[var(--color-case-akk)]/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--color-case-akk)]">
                          den Bahnhof · Akkusativ
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-case-akk)]/20 text-[var(--color-case-akk)] font-bold">
                          Direct Object
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        Masculine noun (<span className="text-[var(--color-case-nom)] font-mono">der Bahnhof</span>) receives the direct action of the verb <span className="font-semibold text-[var(--color-text-primary)]">suchen</span>, transforming <span className="font-mono">der → den</span>.
                      </p>
                    </div>

                    <div className="p-4 rounded-[var(--radius-lg)] border border-[var(--color-case-dat)]/30 bg-[var(--color-case-dat)]/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--color-case-dat)]">
                          der Stadt · Dativ
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-case-dat)]/20 text-[var(--color-case-dat)] font-bold">
                          Two-Way Preposition
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        Preposition <span className="font-semibold text-[var(--color-text-primary)]">in</span> indicates location/static state (Wo?), forcing the feminine noun (<span className="font-mono text-pink-400">die Stadt</span>) into Dativ: <span className="font-mono">die → der</span>.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SM-2 FLASHCARD */}
              {activeTab === "flashcard" && (
                <motion.div
                  key="flashcard"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-brand-400)]">
                        Memory Algorithm · SuperMemo-2 (SM-2)
                      </span>
                      <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                        Spaced Repetition Flashcard Review
                      </h3>
                    </div>
                    <Badge variant="primary" size="sm">B1 Vocabulary</Badge>
                  </div>

                  {/* 3D Flip Card Container */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer group p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-2)] hover:border-[var(--color-brand-400)]/60 transition-all shadow-md relative min-h-[220px] flex flex-col items-center justify-center text-center"
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playDemoAudio();
                        }}
                        className={`w-9 h-9 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-400)] hover:scale-105 transition-all ${
                          audioPlaying ? "ring-2 ring-[var(--color-brand-500)] animate-pulse" : ""
                        }`}
                        title="Listen native audio"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    {!isFlipped ? (
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-case-akk)]">
                          die Verhandlung · Feminine
                        </span>
                        <h4 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
                          die Verhandlung
                        </h4>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          [diː fɛɐ̯ˈhantlʊŋ] · Plural: die Verhandlungen
                        </p>
                        <p className="text-xs text-[var(--color-brand-400)] font-medium pt-2 flex items-center justify-center gap-1 group-hover:underline">
                          <RotateCw size={12} /> Tap card to reveal English meaning &amp; context
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-fadeIn">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--color-accent-400)]">
                          English Translation
                        </span>
                        <h4 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                          negotiation / hearing
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto italic">
                          &quot;Die Verhandlungen verliefen sehr erfolgreich.&quot;
                          <br />
                          <span className="text-[11px] text-[var(--color-text-muted)] font-normal">
                            (The negotiations went very successfully.)
                          </span>
                        </p>
                        <p className="text-[11px] text-emerald-400 font-semibold pt-1">
                          ✓ Ease Factor: 2.50 · Repetitions: 3
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4 SM-2 Grading Interval Triggers */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="p-3 rounded-[var(--radius-lg)] border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-center transition-colors"
                    >
                      <div className="font-bold text-xs">Again (1)</div>
                      <div className="text-[10px] text-rose-400/80">&lt; 10 mins</div>
                    </button>
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="p-3 rounded-[var(--radius-lg)] border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-center transition-colors"
                    >
                      <div className="font-bold text-xs">Hard (2)</div>
                      <div className="text-[10px] text-amber-400/80">1 day</div>
                    </button>
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="p-3 rounded-[var(--radius-lg)] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-center transition-colors"
                    >
                      <div className="font-bold text-xs">Good (3)</div>
                      <div className="text-[10px] text-emerald-400/80">6 days</div>
                    </button>
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="p-3 rounded-[var(--radius-lg)] border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-center transition-colors"
                    >
                      <div className="font-bold text-xs">Easy (4)</div>
                      <div className="text-[10px] text-blue-400/80">14 days</div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: WRITING STUDIO */}
              {activeTab === "writing" && (
                <motion.div
                  key="writing"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-accent-500)]">
                        Goethe-Zertifikat B1 · Schreiben Teil 1
                      </span>
                      <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                        Real-Time CEFR 4-Pillar Rubric Feedback
                      </h3>
                    </div>
                    <Badge variant="default" size="sm">Score: 18 / 20</Badge>
                  </div>

                  {/* Submission and error correction diff */}
                  <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] space-y-3">
                    <p className="text-xs text-[var(--color-text-muted)] font-medium">
                      Task: Formal email rescheduling a job interview appointment:
                    </p>
                    <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs sm:text-sm font-sans leading-relaxed text-[var(--color-text-primary)]">
                      Sehr geehrte Frau Dr. Weber, ich bitte um Entschuldigung,{" "}
                      <span className="line-through text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded">
                        weil der Zug hatte Verspätung
                      </span>{" "}
                      →{" "}
                      <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        weil der Zug Verspätung hatte
                      </span>
                      . Könnten wir den Termin um eine Stunde verschieben? Mit freundlichen Grüßen, Lucas.
                    </div>
                  </div>

                  {/* Rubric Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <div className="text-[10px] text-[var(--color-text-muted)]">Task Fulfillment</div>
                      <div className="text-base font-bold text-emerald-400">5.0 / 5.0</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">All 3 points covered</div>
                    </div>
                    <div className="p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <div className="text-[10px] text-[var(--color-text-muted)]">Coherence &amp; Flow</div>
                      <div className="text-base font-bold text-emerald-400">4.5 / 5.0</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Proper connectors used</div>
                    </div>
                    <div className="p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <div className="text-[10px] text-[var(--color-text-muted)]">Lexical Range</div>
                      <div className="text-base font-bold text-emerald-400">4.5 / 5.0</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Formal register B1+</div>
                    </div>
                    <div className="p-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <div className="text-[10px] text-[var(--color-text-muted)]">Grammar Accuracy</div>
                      <div className="text-base font-bold text-amber-400">4.0 / 5.0</div>
                      <div className="text-[10px] text-amber-400/90">Subordinating &apos;weil&apos; word order</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: BILINGUAL STORIES */}
              {activeTab === "stories" && (
                <motion.div
                  key="stories"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-case-akk)]">
                        Graded Reader · Level A2
                      </span>
                      <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                        Der Ankunft am Münchner Flughafen
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--color-text-muted)]">125 WPM</span>
                      <Badge variant="secondary" size="sm">Audio Synced</Badge>
                    </div>
                  </div>

                  {/* Story Text Box with Hover Gloss */}
                  <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)] space-y-4">
                    <p className="text-base sm:text-lg leading-relaxed text-[var(--color-text-primary)] font-serif">
                      Als Jonas das Terminal verließ, spürte er die kalte Morgenluft der bayerischen Landeshauptstadt. Er kaufte eine Fahrkarte für die{" "}
                      <span className="border-b border-dashed border-[var(--color-brand-400)] text-[var(--color-brand-400)] font-semibold cursor-help" title="suburban commuter train">
                        S-Bahn
                      </span>{" "}
                      und freute sich auf sein neues Studium.
                    </p>

                    <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                      <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-[var(--color-text-primary)]">English Gloss:</strong> As Jonas left the terminal, he felt the crisp morning air of the Bavarian state capital. He bought a ticket for the S-Bahn and looked forward to his new university studies.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <span>Includes 5 comprehension questions &amp; vocabulary flashcard export</span>
                    <span className="text-[var(--color-brand-400)] font-semibold">Native speaker audio included</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sandbox Footer CTA */}
          <div className="px-6 py-4 bg-[var(--color-surface-2)]/70 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-[var(--color-text-muted)]">
              This interactive sandbox reflects the exact production learning engine.
            </span>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight size={14} />}
              onClick={() => window.location.href = "/auth/signup"}
            >
              Start Free Full Access
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
