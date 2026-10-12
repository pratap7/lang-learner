import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { TestResultsView } from "@/components/testing/TestResultsView";

export const metadata: Metadata = {
  title: "Test Results & Skill Radar — DeutschPfad",
  description:
    "Comprehensive test breakdown featuring CEFR pass evaluation, skill radar chart, section time analysis, and question explanations.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ResultsContent({ params }: PageProps) {
  const { id } = await params;
  return <TestResultsView attemptId={id} />;
}

export default function ResultsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <div className="pt-20 pb-16 flex-1">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto py-20 px-4 text-center">
            <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-[var(--color-text-muted)]">Loading test results & performance analysis...</p>
          </div>
        }>
          <ResultsContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
