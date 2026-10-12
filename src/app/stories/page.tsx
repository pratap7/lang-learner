import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { StoriesLibrary } from "@/components/stories/StoriesLibrary";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Graded German Stories & Audio Library — DeutschPfad",
  description:
    "Explore graded German stories with synced sentence audio, normal and slow speed, tap-to-translate vocabulary popover, one-tap flashcard saving, and comprehension questions.",
};

export default function StoriesPage() {
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
          <StoriesLibrary />
        </Suspense>
      </main>
    </div>
  );
}
