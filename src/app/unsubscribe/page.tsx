"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, ShieldCheck, ArrowLeft, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const errorParam = searchParams.get("error");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(errorParam ? "The unsubscribe link is invalid or expired." : "");
  const [email, setEmail] = useState(emailParam || "your email");

  // Granular opt-out options
  const [unsubAll, setUnsubAll] = useState(true);
  const [keepWeekly, setKeepWeekly] = useState(false);
  const [keepMilestones, setKeepMilestones] = useState(false);

  useEffect(() => {
    // If token is present, perform automatic 1-click unsubscribe
    if (token && !errorParam) {
      handleConfirmUnsubscribe();
    }
  }, [token, errorParam]);

  const handleConfirmUnsubscribe = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/notifications/unsubscribe?token=${token}`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(true);
        if (data.email) setEmail(data.email);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.message || "Failed to process unsubscription. Please try again.");
      }
    } catch {
      setErrorMessage("Network error processing unsubscribe request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-500)] flex items-center justify-center mx-auto">
            {success ? <CheckCircle2 size={24} className="text-[var(--color-success)]" /> : <Mail size={24} />}
          </div>
          <h1 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
            {success ? "You are Unsubscribed" : "Notification Preferences"}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {email ? `For account: ${email}` : "Deutsch Pfad Language Learning"}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[var(--color-error)]/30 text-xs text-[var(--color-error)] flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] space-y-2">
              <p className="font-semibold text-[var(--color-text-primary)]">
                You will no longer receive:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Weekly study reports &amp; streak reminders</li>
                <li>Milestone &amp; achievement congratulations</li>
                <li>Re-engagement &amp; product update announcements</li>
              </ul>
              <p className="pt-2 text-[11px] text-[var(--color-text-muted)] border-t border-[var(--color-border)]">
                <ShieldCheck size={12} className="inline mr-1" />
                Essential security and payment invoice receipts will still be sent when required.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/settings/notifications">
                <Button variant="outline" size="sm" className="w-full">
                  Customize Notification Channels
                </Button>
              </Link>
              <Link href="/">
                <Button variant="primary" size="sm" className="w-full" leftIcon={<ArrowLeft size={14} />}>
                  Return to Deutsch Pfad
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              We respect your inbox. Choose whether you'd like to stop all engagement emails, or keep just your weekly German progress summary:
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={unsubAll}
                  onChange={(e) => {
                    setUnsubAll(e.target.checked);
                    if (e.target.checked) {
                      setKeepWeekly(false);
                      setKeepMilestones(false);
                    }
                  }}
                  className="rounded text-[var(--color-brand-500)]"
                />
                <span className="font-semibold text-[var(--color-text-primary)]">
                  Unsubscribe from all engagement emails
                </span>
              </label>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              loading={loading}
              onClick={handleConfirmUnsubscribe}
              leftIcon={<Save size={15} />}
            >
              Confirm 1-Click Unsubscribe
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-sm text-[var(--color-text-muted)]">Loading preferences...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
