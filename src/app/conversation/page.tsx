import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { ConversationStudio } from "@/components/conversation/ConversationStudio";
import { SkeletonCard } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "AI Conversation Practice — DeutschPfad",
  description:
    "Practice speaking and chatting in real-life German scenarios (café, doctor, job interview, visa appointment) with adaptive voice replies, English hints, and feedback reports.",
};

export default function ConversationPage() {
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
          <ConversationStudio />
        </Suspense>
      </main>
    </div>
  );
}
