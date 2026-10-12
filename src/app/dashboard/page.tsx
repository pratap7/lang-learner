import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, User, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Daily Learning Dashboard — DeutschPfad",
  description: "Track your daily German tasks, streak flame, XP progress, weekly heatmap, and goal trajectory.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-24">
      {/* Top Header Navigation */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-600)] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen size={16} />
            </div>
            <span className="font-heading font-bold text-base text-[var(--color-text-primary)]">
              Deutsch<span className="text-[var(--color-brand-400)]">Pfad</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                Courses
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="ghost" size="sm">
                Practice
              </Button>
            </Link>
            <Link href="/goals">
              <Button variant="ghost" size="sm">
                Goals
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="secondary" size="sm" leftIcon={<User size={14} />}>
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <DashboardView />
      </main>
    </div>
  );
}
