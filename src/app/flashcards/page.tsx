import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FlashcardDecksView } from "@/components/flashcards/FlashcardDecksView";

export const metadata: Metadata = {
  title: "SM-2 Flashcard Decks — DeutschPfad",
  description: "Spaced repetition vocabulary flashcards with 3D flip animation, native German audio, and gender color codes.",
};

export default function FlashcardsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Top Header Navigation */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-400)] transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                Courses
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="ghost" size="sm">
                Practice
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="ghost" size="sm">
                Goals
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <FlashcardDecksView />
      </main>
    </div>
  );
}
