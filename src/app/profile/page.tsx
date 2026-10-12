import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView";

export const metadata: Metadata = {
  title: "Profile & Learning Settings — DeutschPfad",
  description: "View and customize your German learning profile, daily commitment, and CEFR target.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-16">
      {/* Top Bar Navigation */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-brand-400)] transition-colors"
          >
            <ArrowLeft size={16} /> Back to DeutschPfad
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-brand-500)] flex items-center justify-center text-white">
              <BookOpen size={14} />
            </div>
            <span className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
              Deutsch<span className="text-[var(--color-brand-500)]">Pfad</span>
            </span>
          </div>
        </div>
      </header>

      <main>
        <ProfileSettingsView />
      </main>
    </div>
  );
}
