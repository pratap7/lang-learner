import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { BadgesGalleryView } from "@/components/gamification/BadgesGalleryView";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Badges & Certificates — DeutschPfad",
  description:
    "Explore 20+ CEFR German milestones, track streak achievements, and generate official downloadable completion certificates.",
};

export default function BadgesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <main className="pt-24 pb-16 flex-1 container-lg">
        <Suspense
          fallback={
            <div className="max-w-5xl mx-auto space-y-4 pt-10">
              <SkeletonCard />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          }
        >
          <BadgesGalleryView />
        </Suspense>
      </main>
    </div>
  );
}
