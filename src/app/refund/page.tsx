import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Subscription & Refund Policy — Deutsch Pfad",
  description: "Learn about Deutsch Pfad's 7-day free trial, 14-day money-back guarantee, and EU statutory consumer withdrawal rights.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-brand-500)] hover:underline mb-8"
        >
          <ArrowLeft size={14} /> Back to Deutsch Pfad
        </Link>

        <div className="space-y-4 border-b border-[var(--color-border)] pb-8 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)] text-xs font-semibold">
            <RefreshCw size={14} /> Fair Learning Guarantee
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            Subscription &amp; Refund Policy
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Effective Date: October 14, 2026 &bull; Last Updated: October 14, 2026
          </p>
        </div>

        {/* Highlight cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-brand-500)] font-bold text-sm">
              <Clock size={16} /> 7-Day Free Trial
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Cancel anytime before your 7 days finish, and you will not be charged a single cent. Easy one-click cancellation directly from your Billing Portal.
            </p>
          </div>

          <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--color-success)] font-bold text-sm">
              <CheckCircle2 size={16} /> 14-Day Money-Back Guarantee
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Full 100% refund on initial paid subscriptions within 14 days if Deutsch Pfad is not the right fit for your German learning goals.
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              1. 7-Day Free Trial Cancellation
            </h2>
            <p>
              When initiating a trial on Pro or Pro Plus, you have 7 full days of unrestricted access. To avoid automatic conversion to a paid subscription, simply click "Cancel Trial" in your Billing Portal prior to the expiration timestamp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              2. EU Statutory Right of Withdrawal (Directive 2011/83/EU)
            </h2>
            <p>
              In accordance with Directive 2011/83/EU on Consumer Rights, learners resident in the European Union and European Economic Area have the legal right to withdraw from their purchase within 14 calendar days of transaction date without stating reasons.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              3. Accidental Renewal 48-Hour Grace Period
            </h2>
            <p>
              If your recurring subscription renews and you forgot to cancel, email us at <strong>billing@deutschpfad.com</strong> within 48 hours of the charge. Provided there has been no extensive platform usage, we will cancel the renewal and refund the fee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              4. How to Request a Refund
            </h2>
            <p>
              Send an email to <strong>billing@deutschpfad.com</strong> with:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your registered account email address.</li>
              <li>Transaction receipt or invoice ID.</li>
              <li>A brief note explaining why you'd like a refund.</li>
            </ul>
            <p className="pt-2">
              Disbursements are returned directly to the original payment method (Stripe, Razorpay, or credit card) within 5–10 business days.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
