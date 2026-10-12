import { Suspense } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { BillingPortalView } from "@/components/billing/BillingPortalView";

export const metadata = {
  title: "Billing & Subscription | DeutschPfad",
  description: "Manage your German learning plan, invoices, and payment preferences.",
};

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto py-24 text-center">
              <div className="w-8 h-8 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-[var(--color-text-muted)]">Loading billing portal...</p>
            </div>
          }
        >
          <BillingPortalView />
        </Suspense>
      </main>
    </div>
  );
}
