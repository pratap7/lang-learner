import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { LeaderboardView } from "@/components/gamification/LeaderboardView";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Weekly Leaderboard — DeutschPfad",
  description:
    "Compete with fellow German learners across the globe. Opt in or out anytime to protect your privacy.",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <main className="pt-24 pb-16 flex-1 container-lg">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto space-y-4 pt-10">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          }
        >
          <LeaderboardView />
        </Suspense>
      </main>
    </div>
  );
}
