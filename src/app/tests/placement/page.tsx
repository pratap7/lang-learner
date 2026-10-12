import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { PlacementTestPlayer } from "@/components/testing/PlacementTestPlayer";

export const metadata: Metadata = {
  title: "Adaptive CEFR Placement Test — DeutschPfad",
  description:
    "Take our 25-question adaptive placement test to calibrate your exact German CEFR proficiency level (A1 to C1).",
};

export default function PlacementTestPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <div className="pt-20 pb-16 flex-1">
        <PlacementTestPlayer />
      </div>
    </div>
  );
}
