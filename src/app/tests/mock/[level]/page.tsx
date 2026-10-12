import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { MockExamPlayer } from "@/components/testing/MockExamPlayer";

export const metadata: Metadata = {
  title: "Goethe & telc Format Mock Exam — DeutschPfad",
  description:
    "Timed German mock exam covering Reading, Listening, Grammar/Vocabulary, Writing, and Speaking with auto-submit and review.",
};

interface PageProps {
  params: Promise<{ level: string }>;
}

async function MockExamContent({ params }: PageProps) {
  const { level } = await params;
  return <MockExamPlayer level={level} />;
}

export default function MockExamPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <div className="pt-20 pb-16 flex-1">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto py-20 px-4 text-center">
            <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-[var(--color-text-muted)]">Loading Goethe/telc Mock Exam environment...</p>
          </div>
        }>
          <MockExamContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
