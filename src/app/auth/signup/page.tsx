import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Create Account — DeutschPfad",
  description: "Create your free DeutschPfad account and start learning German today.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)] relative overflow-hidden">
      {/* Subtle German flag tricolor bar at the top */}
      <div className="h-0.5 w-full tricolor-stripe opacity-90 absolute top-0 left-0 right-0" />
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-[var(--color-brand-600)] opacity-[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full bg-[var(--color-accent-500)] opacity-[0.05] blur-[100px] pointer-events-none" />

      <Suspense fallback={<div className="text-sm text-[var(--color-text-muted)]">Loading signup form...</div>}>
        <AuthCard mode="signup" />
      </Suspense>
    </div>
  );
}
