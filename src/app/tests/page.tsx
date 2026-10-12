import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { TestingHubView } from "@/components/testing/TestingHubView";

export const metadata: Metadata = {
  title: "Testing Center & Exam Mock Tests — DeutschPfad",
  description:
    "Calibrate your proficiency with our adaptive placement test, validate unit mastery with quizzes (70% pass mark), and simulate full timed Goethe/telc exams.",
};

export default function TestsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <div className="pt-20 pb-16 flex-1">
        <TestingHubView />
      </div>
    </div>
  );
}
