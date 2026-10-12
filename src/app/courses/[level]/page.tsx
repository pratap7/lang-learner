import type { Metadata } from "next";
import { Suspense } from "react";
import { LevelRoadmapView } from "@/components/courses/LevelRoadmapView";
import { getLevel } from "@/lib/courseData";

interface PageProps {
  params: Promise<{
    level: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  const levelData = getLevel(level);

  if (!levelData) {
    return {
      title: "Course Level Not Found — DeutschPfad",
    };
  }

  return {
    title: `${levelData.code.toUpperCase()} German Course — ${levelData.name} | DeutschPfad`,
    description: levelData.description,
  };
}

async function LevelRoadmapContent({ params }: PageProps) {
  const { level } = await params;
  return <LevelRoadmapView levelCode={level} />;
}

export default function LevelPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <span className="w-4 h-4 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin" />
            <span>Loading course curriculum...</span>
          </div>
        </div>
      }
    >
      <LevelRoadmapContent params={params} />
    </Suspense>
  );
}
