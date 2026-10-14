"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Bookmark, ArrowRight, CheckCircle2,
  Clock, Play, RotateCcw, Award, Layers, Compass, Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FlashcardDeckSkeleton } from "@/components/ui/Skeleton";
import { getDecks, FlashcardDeck } from "@/lib/flashcardService";
import { FlashcardPlayer } from "./FlashcardPlayer";
import { getDueCardsForDeck, getCardsForDeck } from "@/lib/flashcardService";

export function FlashcardDecksView() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);

  useEffect(() => {
    setDecks(getDecks());
  }, []);

  const totalDueAll = decks.reduce((acc, d) => acc + d.dueCards, 0);

  // If a deck is actively being studied
  if (activeDeckId) {
    const activeDeck = decks.find((d) => d.id === activeDeckId);
    const dueCards = getDueCardsForDeck(activeDeckId);
    // If no cards are due, study all cards in deck
    const studyCards = dueCards.length > 0 ? dueCards : getCardsForDeck(activeDeckId);

    return (
      <div className="py-6">
        <FlashcardPlayer
          deckId={activeDeckId}
          deckTitle={activeDeck?.title || "Flashcard Deck"}
          cards={studyCards}
          onExit={() => {
            setActiveDeckId(null);
            setDecks(getDecks());
          }}
          onFinish={() => {
            setDecks(getDecks());
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-2">
            <Layers size={13} /> SM-2 Spaced Repetition Flashcards
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight">
            German Vocabulary <span className="text-gradient">Decks</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
            Retain nouns with gender colors, hear authentic native audio, and let the SM-2 algorithm calculate optimal review intervals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard">
            <Button variant="secondary" size="sm">
              Dashboard
            </Button>
          </Link>
          <div className="px-3.5 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-accent-400)] flex items-center gap-1.5 shadow-xs">
            <Clock size={13} />
            <span>{totalDueAll} Cards Due Today</span>
          </div>
        </div>
      </div>

      {/* "MY WORDS" HERO DECK CARD */}
      {decks.find((d) => d.id === "my-words") && (
        (() => {
          const myWords = decks.find((d) => d.id === "my-words")!;
          return (
            <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border-2 border-[var(--color-accent-500)]/40 bg-gradient-to-r from-[var(--color-accent-500)]/10 via-[var(--color-surface)] to-[var(--color-surface)] shadow-[var(--shadow-lg)] relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] flex items-center justify-center">
                    <Bookmark size={18} className="fill-current" />
                  </div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {myWords.title}
                  </h2>
                  <Badge variant="accent" size="sm">
                    Personal Deck
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
                  {myWords.description} Words saved from lesson vocabulary lists are automatically prioritized here.
                </p>

                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="text-[var(--color-text-primary)] font-semibold">
                    {myWords.totalCards} Total Words
                  </span>
                  <span>•</span>
                  <span className="text-[var(--color-accent-400)] font-semibold">
                    {myWords.dueCards} Due for Review
                  </span>
                  <span>•</span>
                  <span className="text-[var(--color-success)] font-semibold">
                    {myWords.masteredCards} Mastered
                  </span>
                </div>
              </div>

              <Button
                variant="accent"
                size="md"
                onClick={() => setActiveDeckId("my-words")}
                rightIcon={<ArrowRight size={15} />}
                className="shrink-0 shadow-md"
              >
                Study My Words ({myWords.dueCards > 0 ? myWords.dueCards : myWords.totalCards})
              </Button>
            </div>
          );
        })()
      )}

      {/* CURRICULUM UNIT DECKS GRID */}
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
          Curriculum Unit Decks (A1 Beginner)
        </h2>

        {decks.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No Vocabulary Decks Found"
            description="Start any A1 lesson or save words to your vocabulary notebook to populate your spaced repetition decks."
            actionLabel="Explore Courses"
            actionHref="/courses"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {decks
            .filter((d) => d.id !== "my-words")
            .map((deck) => {
              const isDue = deck.dueCards > 0;

              return (
                <div
                  key={deck.id}
                  className="p-5 sm:p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-brand-500)]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="xs">
                        {deck.levelCode}
                      </Badge>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isDue
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
                            : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        {isDue ? `${deck.dueCards} Due` : "All Caught Up ✓"}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                      {deck.title}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      {deck.titleDe}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                      {deck.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
                      <span>{deck.totalCards} cards</span>
                      <span>•</span>
                      <span className="text-[var(--color-success)]">{deck.masteredCards} mastered</span>
                    </div>

                    <Button
                      variant={isDue ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setActiveDeckId(deck.id)}
                      rightIcon={<Play size={12} className="fill-current" />}
                    >
                      {isDue ? `Study (${deck.dueCards})` : "Review All"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
