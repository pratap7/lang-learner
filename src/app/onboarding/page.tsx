import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Welcome to DeutschPfad — Start Learning Free in 3 Minutes",
  description: "Personalize your German learning path, test your level, and learn your first 8 words.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-6 bg-[var(--color-bg)] relative overflow-hidden flex items-center justify-center">
      {/* Tricolor top border stripe */}
      <div className="h-1 w-full tricolor-stripe opacity-90 absolute top-0 left-0 right-0 z-30" />
      {/* Background ambient lighting */}
      <div className="absolute top-1/6 left-1/4 w-[450px] h-[450px] rounded-full bg-[var(--color-brand-600)] opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/4 w-[450px] h-[450px] rounded-full bg-[var(--color-accent-500)] opacity-[0.05] blur-[120px] pointer-events-none" />

      <OnboardingWizard />
    </div>
  );
}
