"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Bookmark, Check, Sparkles } from "lucide-react";
import { saveWordToMyWords, isWordSavedInMyWords } from "@/lib/flashcardService";
import { useToast } from "@/components/ui/Toast";
import { triggerHaptic } from "@/lib/soundEffects";

// Built-in rapid dictionary for authentic High German words used in lessons and exercises
const COMMON_DICTIONARY: Record<string, { english: string; article?: "der" | "die" | "das"; pos: string }> = {
  hallo: { english: "hello", pos: "greeting" },
  guten: { english: "good (accusative/dative)", pos: "adj" },
  tag: { english: "day", article: "der", pos: "noun" },
  morgen: { english: "morning", article: "der", pos: "noun" },
  abend: { english: "evening", article: "der", pos: "noun" },
  danke: { english: "thank you", pos: "phrase" },
  schön: { english: "beautiful / nicely", pos: "adj" },
  bitte: { english: "please / you are welcome", pos: "phrase" },
  sehr: { english: "very", pos: "adv" },
  kaffee: { english: "coffee", article: "der", pos: "noun" },
  tee: { english: "tea", article: "der", pos: "noun" },
  wasser: { english: "water", article: "das", pos: "noun" },
  milch: { english: "milk", article: "die", pos: "noun" },
  brot: { english: "bread", article: "das", pos: "noun" },
  apfel: { english: "apple", article: "der", pos: "noun" },
  buch: { english: "book", article: "das", pos: "noun" },
  haus: { english: "house", article: "das", pos: "noun" },
  frau: { english: "woman / Mrs.", article: "die", pos: "noun" },
  mann: { english: "man / husband", article: "der", pos: "noun" },
  kind: { english: "child", article: "das", pos: "noun" },
  katze: { english: "cat", article: "die", pos: "noun" },
  hund: { english: "dog", article: "der", pos: "noun" },
  zug: { english: "train", article: "der", pos: "noun" },
  auto: { english: "car", article: "das", pos: "noun" },
  mit: { english: "with (+ Dative)", pos: "prep" },
  nach: { english: "after / to (destination)", pos: "prep" },
  in: { english: "in / into", pos: "prep" },
  weil: { english: "because (verb kicker)", pos: "conj" },
  und: { english: "and", pos: "conj" },
  aber: { english: "but", pos: "conj" },
  oder: { english: "or", pos: "conj" },
  nicht: { english: "not", pos: "adv" },
  kein: { english: "no / none", pos: "pron" },
  ein: { english: "a / an", pos: "art" },
  eine: { english: "a / an (feminine)", pos: "art" },
  einen: { english: "a / an (masculine accusative)", pos: "art" },
  einem: { english: "a / an (masculine/neuter dative)", pos: "art" },
  der: { english: "the (masculine)", article: "der", pos: "art" },
  die: { english: "the (feminine / plural)", article: "die", pos: "art" },
  das: { english: "the (neuter)", article: "das", pos: "art" },
  den: { english: "the (accusative masculine / dative plural)", pos: "art" },
  dem: { english: "the (dative masculine/neuter)", pos: "art" },
  ich: { english: "I", pos: "pron" },
  du: { english: "you (informal)", pos: "pron" },
  er: { english: "he", pos: "pron" },
  sie: { english: "she / they / You (formal)", pos: "pron" },
  es: { english: "it", pos: "pron" },
  wir: { english: "we", pos: "pron" },
  ihr: { english: "you all (plural informal)", pos: "pron" },
  habe: { english: "have (1st person singular)", pos: "verb" },
  hast: { english: "have (2nd person singular)", pos: "verb" },
  hat: { english: "has (3rd person singular)", pos: "verb" },
  haben: { english: "have (plural / infinitive)", pos: "verb" },
  bin: { english: "am", pos: "verb" },
  bist: { english: "are", pos: "verb" },
  ist: { english: "is", pos: "verb" },
  sind: { english: "are (plural)", pos: "verb" },
  lerne: { english: "learn / study", pos: "verb" },
  lernt: { english: "learns", pos: "verb" },
  trinkt: { english: "drinks", pos: "verb" },
  trinken: { english: "drink", pos: "verb" },
  fährt: { english: "drives / travels", pos: "verb" },
  macht: { english: "makes / does", pos: "verb" },
  spaß: { english: "fun", article: "der", pos: "noun" },
  tschüss: { english: "bye / see you", pos: "farewell" },
};

interface TapToTranslateTextProps {
  text: string;
  className?: string;
  audioPlaybackRate?: number;
}

export function TapToTranslateText({
  text,
  className = "",
  audioPlaybackRate = 1.0,
}: TapToTranslateTextProps) {
  const { addToast } = useToast();
  const [activeWord, setActiveWord] = useState<{
    clean: string;
    raw: string;
    translation: string;
    article?: "der" | "die" | "das";
    pos: string;
    isSaved: boolean;
  } | null>(null);

  const playWordAudio = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "de-DE";
      utterance.rate = audioPlaybackRate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWordTap = (rawWord: string) => {
    triggerHaptic("selection");
    const clean = rawWord.toLowerCase().replace(/[^a-zäöüß]/g, "");
    if (!clean) return;

    const entry = COMMON_DICTIONARY[clean];
    const english = entry?.english || "Tap to translate";
    const article = entry?.article;
    const pos = entry?.pos || "word";
    const isSaved = isWordSavedInMyWords(clean);

    setActiveWord({
      clean,
      raw: rawWord,
      translation: english,
      article,
      pos,
      isSaved,
    });

    playWordAudio(clean);
  };

  const handleSaveToCards = () => {
    if (!activeWord) return;
    triggerHaptic("success");

    saveWordToMyWords({
      id: `word-${activeWord.clean}`,
      german: activeWord.clean,
      english: activeWord.translation,
      article: activeWord.article || null,
      plural: "",
      ipa: "",
      partOfSpeech: (activeWord.pos as any) || "noun",
      exampleDe: text,
      exampleEn: "",
    });

    setActiveWord((prev) => (prev ? { ...prev, isSaved: true } : null));

    addToast({
      type: "success",
      title: "Saved to Flashcards!",
      message: `"${activeWord.clean}" added to your spaced repetition queue.`,
    });
  };

  // Tokenize text into words and spaces/punctuation
  const tokens = text.split(/(\s+)/);

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="leading-relaxed">
        {tokens.map((token, i) => {
          const isWhitespace = /^\s+$/.test(token);
          if (isWhitespace) return <span key={i}>{token}</span>;

          const isCleanWord = /[a-zA-ZäöüÄÖÜß]/.test(token);
          if (!isCleanWord) return <span key={i}>{token}</span>;

          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleWordTap(token)}
              onKeyDown={(e) => e.key === "Enter" && handleWordTap(token)}
              className="inline-block cursor-pointer border-b border-dotted border-[var(--color-border-2)] hover:border-[var(--color-brand-400)] hover:text-[var(--color-brand-400)] hover:bg-[var(--color-brand-500)]/10 rounded px-0.5 transition-colors select-none"
              title="Tap for instant English translation & pronunciation"
            >
              {token}
            </span>
          );
        })}
      </span>

      {/* Floating Translation Popover */}
      <AnimatePresence>
        {activeWord && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 -top-16 z-50 p-2.5 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-brand-500)]/50 shadow-2xl flex items-center gap-2.5 text-xs whitespace-nowrap backdrop-blur-xl"
          >
            <div className="flex items-center gap-1.5 font-bold">
              {activeWord.article && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                    activeWord.article === "der"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : activeWord.article === "die"
                      ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  {activeWord.article}
                </span>
              )}
              <span className="text-[var(--color-text-primary)] font-heading">
                {activeWord.clean}
              </span>
              <span className="text-[var(--color-brand-400)] font-normal">→ {activeWord.translation}</span>
            </div>

            <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-2">
              <button
                type="button"
                onClick={() => playWordAudio(activeWord.clean)}
                className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                title="Play High German audio"
              >
                <Volume2 size={13} />
              </button>

              <button
                type="button"
                onClick={handleSaveToCards}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  activeWord.isSaved
                    ? "text-[var(--color-success)] bg-[var(--color-success)]/15"
                    : "text-[var(--color-accent-400)] hover:bg-[var(--color-accent-500)]/15"
                }`}
                title={activeWord.isSaved ? "Saved to Deck" : "Save Word to Spaced Repetition"}
              >
                {activeWord.isSaved ? <Check size={13} /> : <Bookmark size={13} />}
              </button>

              <button
                type="button"
                onClick={() => setActiveWord(null)}
                className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] ml-0.5 cursor-pointer text-[10px]"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
