import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { LearningInsightsView } from "@/components/insights/LearningInsightsView";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Learning Insights & Adaptive Mastery — DeutschPfad",
  description:
    "Explore your German knowledge graph, strengths and weaknesses, recency-weighted topic mastery, and projected CEFR readiness date.",
};

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <main className="pt-24 pb-16 flex-1 container-lg">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto space-y-4 pt-8">
              <SkeletonCard />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          }
        >
          <LearningInsightsView />
        </Suspense>
      </main>
    </div>
  );
}
