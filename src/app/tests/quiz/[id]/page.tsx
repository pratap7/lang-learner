import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { UnitQuizPlayer } from "@/components/testing/UnitQuizPlayer";

export const metadata: Metadata = {
  title: "Unit Quiz Assessment — DeutschPfad",
  description: "Test your grammar, vocabulary, and reading skills with 10 questions. Pass mark: 70%.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

async function QuizContent({ params }: PageProps) {
  const { id } = await params;
  return <UnitQuizPlayer quizId={id} />;
}

export default function QuizPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <div className="pt-20 pb-16 flex-1">
        <Suspense fallback={
          <div className="max-w-2xl mx-auto py-20 px-4 text-center">
            <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-[var(--color-text-muted)]">Loading unit quiz...</p>
          </div>
        }>
          <QuizContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
