import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, FileText, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy — Deutsch Pfad",
  description: "Learn how Deutsch Pfad protects your learning data, voice recordings, and adheres strictly to GDPR.",
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck size={14} /> GDPR &amp; Privacy Shield Hardened
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Effective Date: October 14, 2026 &bull; Last Updated: October 14, 2026 &bull; Version 2.0 (GDPR Ready)
          </p>
        </div>

        {/* Quick summary box */}
        <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3 mb-10">
          <h2 className="font-heading text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Lock size={16} className="text-[var(--color-brand-500)]" />
            Our Core Privacy Commitments at a Glance
          </h2>
          <ul className="text-xs text-[var(--color-text-secondary)] space-y-2 list-none">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0 mt-0.5" />
              <span><strong>Minimal Data Collection:</strong> We collect only what is strictly necessary to personalize your German curriculum and save your progress.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0 mt-0.5" />
              <span><strong>Ephemeral Voice Recordings:</strong> Pronunciation audio is evaluated in volatile server memory and purged immediately unless you explicitly opt in for 30-day trend reviews.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0 mt-0.5" />
              <span><strong>Zero Foundation Training:</strong> We never train public foundation AI models on your private writing essays or speech recordings.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-[var(--color-success)] shrink-0 mt-0.5" />
              <span><strong>Self-Service GDPR Rights:</strong> One-click JSON data export (Article 20) and permanent account erasure (Article 17) directly in Settings.</span>
            </li>
          </ul>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-8">
          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              1. Data Controller &amp; Legal Framework
            </h2>
            <p>
              Deutsch Pfad ("we", "us", "our") acts as the Data Controller under Regulation (EU) 2016/679 (General Data Protection Regulation - GDPR). For any privacy-related requests or inquiries, reach out to our privacy office at <strong>privacy@deutschpfad.com</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              2. Lawful Bases for Processing (Article 6 GDPR)
            </h2>
            <p>
              We process personal data solely under recognized legal bases: Contractual Performance (administering curriculum, syncing spaced repetition flashcards, delivering AI feedback), Explicit Consent (optional audio retention and analytical cookies), Legitimate Interests (defending against brute force and prompt injection attacks), and Legal Compliance (fiscal and VAT tax record maintenance).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              3. Voice &amp; Pronunciation Audio Retention Rules
            </h2>
            <p>
              Your speaking recordings are treated with the highest standard of confidentiality:
            </p>
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
              <p className="font-semibold text-[var(--color-text-primary)]">Default Setting: Immediate RAM Purge</p>
              <p>
                When recording an exercise or AI conversation, the audio snippet is converted to phoneme matrices in temporary server RAM. As soon as your feedback is returned, the raw audio file is completely discarded from memory.
              </p>
              <p className="font-semibold text-[var(--color-text-primary)] pt-2">Optional Opt-In: 30-Day Encrypted Storage</p>
              <p>
                Learners who choose to opt in via Account Settings will have their audio retained encrypted for up to 30 days to facilitate pronunciation comparison over time. You may revoke consent at any moment to trigger instant deletion.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              4. Artificial Intelligence Subprocessors
            </h2>
            <p>
              Writing corrections and conversational dialogue inference leverage secured enterprise API gateways (OpenAI API and Google Gemini API). Under our enterprise agreements, student inputs are processed via zero-data retention endpoints and are strictly excluded from model training datasets. All client API keys are kept server-side and niemals exposed to client web applications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              5. Your GDPR Rights &amp; Self-Service Tools
            </h2>
            <p>
              You may exercise your rights at any time directly through your Deutsch Pfad profile:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Article 15 (Access):</strong> View your full profile, study minutes, and scores.</li>
              <li><strong>Article 17 (Erasure):</strong> Permanently wipe all account records via "Delete Account &amp; Purge All Data" in Settings.</li>
              <li><strong>Article 20 (Portability):</strong> Download a machine-readable JSON archive of all your learning records via "Export JSON Archive".</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-[var(--color-border)] pt-6">
            <h2 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
              Contact Privacy Team
            </h2>
            <p>
              Questions, feedback, or formal data protection requests can be directed to:  
              <strong>Email:</strong> privacy@deutschpfad.com &bull; <strong>DPO:</strong> Deutsch Pfad Data Protection Officer
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
