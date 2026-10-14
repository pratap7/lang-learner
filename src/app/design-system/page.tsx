import { Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { DesignSystemView } from "@/components/design-system/DesignSystemView";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Design System & Tokens | DeutschPfad",
  description:
    "Complete design language, brand pillars, color-blind safe grammar palettes, typography scale, motion rules, and mascot brief for DeutschPfad.",
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto py-24 text-center">
              <div className="w-8 h-8 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[var(--color-text-muted)]">Loading design system documentation...</p>
            </div>
          }
        >
          <DesignSystemView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
