import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { ProgressView } from "@/components/progress/ProgressView";

export const metadata: Metadata = {
  title: "Learning Progress & Mistake Notebook — DeutschPfad",
  description:
    "Track your CEFR level completion, skill radar chart, accuracy trend, weekly study minutes, and eliminate errors in your personal grammar notebook.",
};

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <div className="pt-20 pb-16 flex-1">
        <Suspense
          fallback={
            <div className="max-w-6xl mx-auto py-20 px-4 text-center">
              <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs text-[var(--color-text-muted)]">Loading learning analytics & mistake notebook...</p>
            </div>
          }
        >
          <ProgressView />
        </Suspense>
      </div>
    </div>
  );
}
