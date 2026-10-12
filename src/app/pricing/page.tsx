import { Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { PricingView } from "@/components/billing/PricingView";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing Plans & 7-Day Free Trial | DeutschPfad",
  description: "Fair regional pricing for German language mastery. Free, Pro, and Pro Plus plans with 7-day free trial.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto py-24 text-center">
              <div className="w-8 h-8 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[var(--color-text-muted)]">Loading pricing options...</p>
            </div>
          }
        >
          <PricingView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
