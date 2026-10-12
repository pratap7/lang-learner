"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Volume2, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, RotateCcw, Play } from "lucide-react";

/* ─── Vocabulary lesson data ─────────────────────────────────── */
const vocabWords = [
  {
    german: "der Bahnhof",
    article: "der",
    english: "the train station",
    plural: "die Bahnhöfe",
    gender: "der",
    example: "Entschuldigung, wo ist der Bahnhof?",
    exampleEn: "Excuse me, where is the train station?",
    tip: "Most compound nouns ending in -hof take 'der'.",
  },
  {
    german: "die Straße",
    article: "die",
    english: "the street",
    plural: "die Straßen",
    gender: "die",
    example: "Die Straße ist sehr lang und ruhig.",
    exampleEn: "The street is very long and quiet.",
    tip: "Nouns ending in -e are ~90% feminine (die).",
  },
  {
    german: "das Rathaus",
    article: "das",
    english: "the town hall",
    plural: "die Rathäuser",
    gender: "das",
    example: "Das Rathaus steht am Marktplatz.",
    exampleEn: "The town hall stands on the market square.",
    tip: "Compound nouns ending in -haus always take 'das'.",
  },
  {
    german: "die Bäckerei",
    article: "die",
    english: "the bakery",
    plural: "die Bäckereien",
    gender: "die",
    example: "Ich kaufe frisches Brot in der Bäckerei.",
    exampleEn: "I buy fresh bread at the bakery.",
    tip: "Nouns ending in -ei are 100% feminine.",
  },
];

const genderStyle: Record<string, { color: string; bg: string; border: string; label: string }> = {
  der: {
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.3)",
    label: "Masculine (der)",
  },
  die: {
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.12)",
    border: "rgba(236, 72, 153, 0.3)",
    label: "Feminine (die)",
  },
  das: {
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.3)",
    label: "Neuter (das)",
  },
};

/* ─── Grammar lesson data ───────────────────────────────────── */
const grammarContent = {
  title: "A1/A2 Core Rule: The Accusative Case (Akkusativ)",
  rule: "In German, the direct object of an action is placed in the Accusative case. The magic rule to memorize: Only masculine nouns change ('der' becomes 'den'). Feminine, neuter, and plural stay identical!",
  table: [
    { gender: "Masculine (der)", nominative: "der Mann", accusative: "den Mann", note: "Changes to -en" },
    { gender: "Feminine (die)",  nominative: "die Frau",  accusative: "die Frau",  note: "No change" },
    { gender: "Neuter (das)",    nominative: "das Kind",  accusative: "das Kind",  note: "No change" },
    { gender: "Plural (die)",    nominative: "die Kinder",accusative: "die Kinder",note: "No change" },
  ],
  example: "Ich sehe den Mann. (I see the man — direct object)",
};

/* ─── Dialogue data ────────────────────────────────────────── */
const dialogue = [
  { speaker: "Anna", role: "Tourist", text: "Entschuldigung, wo ist der nächste Supermarkt?", translation: "Excuse me, where is the nearest supermarket?", side: "left" },
  { speaker: "Klaus", role: "Local", text: "Gehen Sie geradeaus, dann die zweite Straße links.", translation: "Go straight ahead, then take the second street on the left.", side: "right" },
  { speaker: "Anna", role: "Tourist", text: "Vielen Dank! Wie weit ist es von hier?", translation: "Thank you very much! How far is it from here?", side: "left" },
  { speaker: "Klaus", role: "Local", text: "Ungefähr fünf Minuten zu Fuß. Sehr nah!", translation: "About five minutes on foot. Very close!", side: "right" },
];

export function LessonPreview() {
  const [currentWord, setCurrentWord] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(false);

  const word = vocabWords[currentWord];
  const gStyle = genderStyle[word.gender];

  const playSpeech = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.9;
      setPlayingAudio(true);
      utterance.onend = () => setPlayingAudio(false);
      utterance.onerror = () => setPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section id="lesson-preview" className="py-24 bg-[var(--color-surface-2)]/60 relative overflow-hidden">
      {/* Subtle border lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      <div className="container-xl relative z-10">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Sparkles size={13} /> Interactive Simulator
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            Experience a <span className="text-gradient">DeutschPfad Lesson</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Test real bite-sized modules below: vocabulary with gender coding, structured grammar, and authentic everyday dialogues.
          </p>
        </motion.div>

        {/* Live Lesson Simulator Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] overflow-hidden"
        >
          {/* Mock app header */}
          <div className="px-6 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between gap-4 bg-[var(--color-surface-2)]/80">
            <div className="flex items-center gap-3">
              <Badge variant="b1" size="sm">B1 · Unit 4</Badge>
              <span className="text-xs sm:text-sm font-semibold text-[var(--color-text-primary)]">
                Getting Around in the City (In der Stadt)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[var(--color-text-muted)] hidden sm:inline">Progress</span>
              <ProgressBar value={65} size="xs" color="b1" className="w-24 hidden sm:block" />
            </div>
          </div>

          {/* Interactive tabs */}
          <div className="p-6 sm:p-8">
            <Tabs defaultTab="vocab" variant="pill">
              <TabsList className="mb-6 grid grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="vocab">1. Vocabulary</TabsTrigger>
                <TabsTrigger value="grammar">2. Grammar</TabsTrigger>
                <TabsTrigger value="dialogue">3. Dialogue</TabsTrigger>
              </TabsList>

              {/* TAB 1: Vocabulary with SRS & Native Audio */}
              <TabsContent value="vocab">
                <div className="space-y-6">
                  {/* Gender legend */}
                  <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-medium text-[var(--color-text-secondary)] py-1">
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> der (Masculine)
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-400">
                      <span className="w-2 h-2 rounded-full bg-pink-500" /> die (Feminine)
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> das (Neuter)
                    </span>
                  </div>

                  {/* Vocabulary Flashcard */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentWord}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 sm:p-8 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 relative overflow-hidden shadow-sm"
                    >
                      {/* Left colored gender spine */}
                      <div
                        className="absolute inset-y-0 left-0 w-2"
                        style={{ background: gStyle.color }}
                      />

                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-md"
                              style={{ background: gStyle.bg, color: gStyle.color, border: `1px solid ${gStyle.border}` }}
                            >
                              {gStyle.label}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)]">
                              Plural: {word.plural}
                            </span>
                          </div>
                          <h3 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)]">
                            {word.german}
                          </h3>
                        </div>

                        {/* Audio pronunciation button */}
                        <button
                          type="button"
                          onClick={() => playSpeech(word.german)}
                          aria-label={`Listen to ${word.german}`}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                            playingAudio
                              ? "bg-[var(--color-brand-500)] text-white scale-110 shadow-[var(--shadow-glow)]"
                              : "bg-[var(--color-surface)] text-[var(--color-brand-400)] border border-[var(--color-border)] hover:bg-[var(--color-brand-500)]/15"
                          }`}
                        >
                          <Volume2 size={18} className={playingAudio ? "animate-pulse" : ""} />
                        </button>
                      </div>

                      <p className="text-lg font-medium text-[var(--color-text-secondary)] mb-4">
                        {word.english}
                      </p>

                      {/* Example sentence with German quote formatting */}
                      <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)]/80 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[var(--color-text-primary)]">
                            „{word.example}“
                          </p>
                          <button
                            type="button"
                            onClick={() => playSpeech(word.example)}
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] transition-colors shrink-0"
                            title="Hear example sentence"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {word.exampleEn}
                        </p>
                      </div>

                      {/* Memory Tip */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-accent-500)]">
                        <Sparkles size={12} />
                        <span><strong>Tip:</strong> {word.tip}</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Card Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                      Card {currentWord + 1} of {vocabWords.length}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ChevronLeft size={14} />}
                        onClick={() => setCurrentWord((w) => (w - 1 + vocabWords.length) % vocabWords.length)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ChevronRight size={14} />}
                        onClick={() => setCurrentWord((w) => (w + 1) % vocabWords.length)}
                      >
                        Next Word
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: Grammar Accusative Rule Table */}
              <TabsContent value="grammar">
                <div className="space-y-5">
                  <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)]">
                    <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-1">
                      {grammarContent.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {grammarContent.rule}
                    </p>
                  </div>

                  {/* Case Table */}
                  <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden shadow-sm">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                          <th className="px-4 py-3">Gender Category</th>
                          <th className="px-4 py-3">Nominative (Subject)</th>
                          <th className="px-4 py-3">Accusative (Object)</th>
                          <th className="px-4 py-3">Pattern</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {grammarContent.table.map((row) => (
                          <tr key={row.gender} className="hover:bg-[var(--color-surface-2)]/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                              {row.gender}
                            </td>
                            <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                              {row.nominative}
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {row.gender.includes("der") ? (
                                <span className="px-2 py-0.5 rounded-md bg-[var(--color-accent-500)]/20 text-[var(--color-accent-500)] font-bold">
                                  {row.accusative}
                                </span>
                              ) : (
                                <span className="text-[var(--color-text-secondary)]">{row.accusative}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-[11px] text-[var(--color-text-muted)]">
                              {row.note}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 text-xs text-[var(--color-text-primary)] flex items-center justify-between">
                    <div>
                      <strong>Example Sentence:</strong> {grammarContent.example}
                    </div>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => playSpeech("Ich sehe den Mann.")}
                      leftIcon={<Volume2 size={13} />}
                    >
                      Listen
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 3: Dialogue Simulation */}
              <TabsContent value="dialogue">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-2">
                    <span className="font-semibold text-[var(--color-text-secondary)]">Scenario: Asking for Directions</span>
                    <button
                      type="button"
                      onClick={() => setShowTranslation((s) => !s)}
                      className="text-[var(--color-brand-400)] hover:underline flex items-center gap-1 font-medium"
                    >
                      <RotateCcw size={12} /> {showTranslation ? "Hide English Translations" : "Show English Translations"}
                    </button>
                  </div>

                  {/* Chat message bubbles */}
                  <div className="space-y-3.5 p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/40 border border-[var(--color-border)]">
                    {dialogue.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${item.side === "right" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            item.side === "left"
                              ? "bg-[var(--color-brand-500)] text-white shadow-sm"
                              : "bg-[var(--color-accent-500)] text-white shadow-sm"
                          }`}
                        >
                          {item.speaker[0]}
                        </div>
                        <div
                          className={`max-w-[78%] p-3.5 rounded-[var(--radius-lg)] text-xs sm:text-sm ${
                            item.side === "left"
                              ? "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-tl-none shadow-sm"
                              : "bg-[var(--color-brand-600)] text-white rounded-tr-none shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="font-bold text-[11px] opacity-80">
                              {item.speaker} ({item.role})
                            </span>
                            <button
                              type="button"
                              onClick={() => playSpeech(item.text)}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                              title="Listen"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                          <p className="font-medium leading-relaxed">{item.text}</p>
                          {showTranslation && (
                            <p className={`text-[11px] mt-1 italic ${item.side === "left" ? "text-[var(--color-text-muted)]" : "text-white/80"}`}>
                              {item.translation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => playSpeech("Entschuldigung, wo ist der nächste Supermarkt?")}
                      leftIcon={<Play size={13} className="fill-current" />}
                    >
                      Play Dialogue Audio
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
