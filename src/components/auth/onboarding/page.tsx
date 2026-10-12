import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Personalise Your German Path — DeutschPfad",
  description: "Set your learning goals, baseline level, and study pace.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen py-16 px-4 bg-[var(--color-bg)] relative overflow-hidden flex items-center justify-center">
      {/* Subtle German flag tricolor bar at the top */}
      <div className="h-0.5 w-full tricolor-stripe opacity-90 absolute top-0 left-0 right-0" />
      {/* Background ambient lighting */}
      <div className="absolute top-1/6 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-brand-600)] opacity-[0.05] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-accent-500)] opacity-[0.04] blur-[120px] pointer-events-none" />

      <OnboardingWizard />
    </div>
  );
}
