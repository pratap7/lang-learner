"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Settings, X, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  voiceRetention: boolean;
  decided: boolean;
}

const STORAGE_KEY = "deutschpfad_gdpr_consent_v1";

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    essential: true,
    analytics: false,
    voiceRetention: false,
    decided: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConsent({ ...parsed, decided: true });
        setIsOpen(false);
      } else {
        // Delay opening slightly for smooth entrance
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = async (analytics: boolean, voiceRetention: boolean) => {
    const newState: ConsentState = {
      essential: true,
      analytics,
      voiceRetention,
      decided: true,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setConsent(newState);
      setIsOpen(false);
      setShowModal(false);

      // Async sync to server endpoint
      await fetch("/api/user/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consentEssential: true,
          consentAnalytics: analytics,
          consentVoiceRetention: voiceRetention,
        }),
      }).catch(() => null);
    } catch (e) {
      console.warn("Could not save cookie consent:", e);
    }
  };

  const handleAcceptAll = () => saveConsent(true, true);
  const handleEssentialOnly = () => saveConsent(false, false);

  if (!isOpen && !showModal) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {isOpen && (
        <aside
          role="region"
          aria-label="Privacy and cookie consent"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 p-5 rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-500)] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                Your Privacy & Learning Data
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Deutsch Pfad adheres strictly to GDPR. We collect only what is necessary to track your German progress. Voice recordings are processed in memory and discarded immediately unless you explicitly opt in.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button variant="primary" size="sm" onClick={handleAcceptAll}>
                  Accept All
                </Button>
                <Button variant="outline" size="sm" onClick={handleEssentialOnly}>
                  Essential Only
                </Button>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-xs font-semibold text-[var(--color-brand-500)] hover:underline inline-flex items-center gap-1 ml-auto p-1.5"
                >
                  <Settings size={13} />
                  Customize
                </button>
              </div>
              <div className="pt-1 text-[11px] text-[var(--color-text-muted)]">
                Read our{" "}
                <Link href="/privacy" className="underline hover:text-[var(--color-brand-500)]">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="underline hover:text-[var(--color-brand-500)]">
                  Terms of Service
                </Link>.
              </div>
            </div>
            <button
              onClick={handleEssentialOnly}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-md"
              aria-label="Dismiss banner with essential cookies only"
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* Modal: Granular Consent Preferences */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gdpr-settings-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-[var(--color-brand-500)]" />
                <h2 id="gdpr-settings-title" className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                  Consent & Privacy Preferences
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                aria-label="Close preferences"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs">
              {/* Essential */}
              <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
                    <Lock size={13} className="text-[var(--color-text-muted)]" />
                    Strictly Essential Cookies & Session State
                  </div>
                  <p className="text-[var(--color-text-secondary)]">
                    Required for core authentication, security tokens, CSRF protection, and saving your active lesson progress.
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--color-brand-500)]/20 text-[var(--color-brand-500)]">
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-[var(--color-text-primary)]">
                    Aggregated Analytics & Performance
                  </div>
                  <p className="text-[var(--color-text-secondary)]">
                    Anonymous, aggregated metrics to diagnose app latency, memory bottlenecks, and UI errors. No third-party ad profiling.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => setConsent((prev) => ({ ...prev, analytics: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded accent-[var(--color-brand-500)] cursor-pointer"
                  aria-label="Allow Aggregated Analytics"
                />
              </div>

              {/* Voice Retention */}
              <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-[var(--color-text-primary)]">
                    Pronunciation Audio Retention (30-day History)
                  </div>
                  <p className="text-[var(--color-text-secondary)]">
                    By default, your voice is evaluated in volatile RAM and immediately discarded. If enabled, your speaking audio is saved encrypted for 30 days to let you listen to past attempts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={consent.voiceRetention}
                  onChange={(e) => setConsent((prev) => ({ ...prev, voiceRetention: e.target.checked }))}
                  className="mt-1 h-4 w-4 rounded accent-[var(--color-brand-500)] cursor-pointer"
                  aria-label="Allow 30-day Voice Audio Retention"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
              <Button variant="outline" size="sm" onClick={() => saveConsent(false, false)}>
                Reject Optional
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => saveConsent(consent.analytics, consent.voiceRetention)}
                leftIcon={<Check size={14} />}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
