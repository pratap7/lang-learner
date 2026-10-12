import type { Metadata } from "next";
import { Suspense } from "react";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { getLesson } from "@/lib/courseData";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);

  if (!lesson) {
    return {
      title: "Lesson Not Found — DeutschPfad",
    };
  }

  return {
    title: `${lesson.titleDe} (${lesson.title}) — DeutschPfad`,
    description: lesson.summary,
  };
}

async function LessonPlayerContent({ params }: PageProps) {
  const { id } = await params;
  return <LessonPlayer lessonId={id} />;
}

export default function LessonPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <span className="w-4 h-4 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin" />
            <span>Loading interactive lesson player...</span>
          </div>
        </div>
      }
    >
      <LessonPlayerContent params={params} />
    </Suspense>
  );
}
