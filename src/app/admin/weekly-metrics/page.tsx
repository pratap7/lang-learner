import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminWeeklyMetricsTab } from "@/components/admin/AdminWeeklyMetricsTab";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Weekly Monday Metrics — DeutschPfad Executive View",
  description:
    "The 10 critical operational, growth, and unit-economic numbers to check every Monday morning for DeutschPfad.",
};

export default function WeeklyMetricsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur border-b border-[var(--color-border)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Admin Console
              </Button>
            </Link>
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">/</span>
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              Executive Weekly Metrics
            </span>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-xs">
              Learner App
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full pb-16">
        <AdminWeeklyMetricsTab />
      </main>
    </div>
  );
}
