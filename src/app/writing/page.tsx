import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { WritingStudio } from "@/components/writing/WritingStudio";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "German Writing Feedback Studio — DeutschPfad",
  description:
    "Rubric-based German writing evaluation for formal emails, informal letters, and opinion texts. Receive inline diffs, error explanations in English, and Mistake Notebook sync.",
};

export default function WritingPage() {
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
          <WritingStudio />
        </Suspense>
      </main>
    </div>
  );
}
