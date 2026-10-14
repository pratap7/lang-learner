import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Terms of Service — Deutsch Pfad",
  description: "Terms and conditions governing the use of Deutsch Pfad language learning services, subscription billing, and AI features.",
};

export default function TermsOfServicePage() {
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
            <FileText size={14} /> Platform Agreement
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Effective Date: October 14, 2026 &bull; Last Updated: October 14, 2026
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              1. Acceptance of Terms &amp; Eligibility
            </h2>
            <p>
              By accessing or creating an account on Deutsch Pfad (https://deutschpfad.com), you acknowledge and agree to comply with these Terms of Service. You must be at least 16 years of age (or the age of majority in your jurisdiction) to form a binding agreement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              2. Subscription Plans, 7-Day Free Trial, &amp; Billing
            </h2>
            <p>
              Deutsch Pfad offers Free, Pro, and Pro Plus plans:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>7-Day Free Trial:</strong> Eligible users may test premium features for 7 days without upfront charge. You may cancel anytime before the 7 days elapse to avoid payment.</li>
              <li><strong>Automatic Renewal:</strong> Unless cancelled prior to renewal, paid subscriptions automatically renew monthly or annually.</li>
              <li><strong>Cancellation:</strong> You can cancel renewal anytime in Account Settings &gt; Billing Portal. You retain access until the end of your billing cycle.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <ShieldAlert size={18} className="text-[var(--color-accent-500)]" />
              3. AI Features &amp; Acceptable Use Policy
            </h2>
            <p>
              When utilizing interactive dialogue, speech evaluations, and automated essay evaluations:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Prompt Injection Prohibited:</strong> You must not attempt adversarial jailbreaks, prompt override instructions, delimiter breakouts, or system instruction extraction.</li>
              <li><strong>No Reverse Engineering:</strong> You agree not to inspect, decompile, scrape, or extract server-side API keys or internal grading schemas.</li>
              <li><strong>Educational Purpose:</strong> Evaluations simulate certified Goethe-Institut / telc rubrics for educational training; they do not replace official external examination certificates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              4. Intellectual Property
            </h2>
            <p>
              All course lessons, audio recordings, mascot assets, and software code are the exclusive intellectual property of Deutsch Pfad. You retain full ownership of text and audio created by you; you grant Deutsch Pfad a limited license to evaluate and return feedback to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              5. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted under applicable law, Deutsch Pfad's cumulative liability for all claims arising from the service shall not exceed the amount paid by you during the twelve months preceding the event.
            </p>
          </section>

          <section className="space-y-3 border-t border-[var(--color-border)] pt-6">
            <h2 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
              Legal Inquiries
            </h2>
            <p>
              For legal notices or questions regarding these terms: <strong>legal@deutschpfad.com</strong>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
