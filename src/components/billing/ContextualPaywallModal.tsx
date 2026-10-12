"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CheckCircle2, ShieldCheck, X, Zap,
  Clock, ArrowRight, Lock, Award, HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeutschMascot } from "@/components/mascot/DeutschMascot";
import {
  SUBSCRIPTION_PLANS,
  detectUserCurrency,
  formatPrice,
  activateSubscription,
  SubscriptionPlanId,
  BillingCycle,
} from "@/lib/billingService";
import { playSuccessChime, triggerHaptic } from "@/lib/soundEffects";
import { fireConfetti } from "@/lib/confetti";

export type PaywallTriggerMoment = "ai_limit" | "mock_test" | "locked_content" | "general";

export interface ContextualPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerMoment?: PaywallTriggerMoment;
  customHeadline?: string;
  customSubtext?: string;
  onSuccess?: () => void;
}

export function ContextualPaywallModal({
  isOpen,
  onClose,
  triggerMoment = "general",
  customHeadline,
  customSubtext,
  onSuccess,
}: ContextualPaywallModalProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>("pro");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const { currency } = detectUserCurrency();
  const proPlan = SUBSCRIPTION_PLANS.find((p) => p.id === "pro")!;
  const proPlusPlan = SUBSCRIPTION_PLANS.find((p) => p.id === "pro_plus")!;

  const getMomentContent = () => {
    switch (triggerMoment) {
      case "ai_limit":
        return {
          badge: "AI Practice Cap Reached",
          headline: customHeadline || "Keep Speaking & Writing Without Interruption",
          subtext:
            customSubtext ||
            "You have hit your free monthly AI practice limit. Unlock 150 minutes of voice dialogue and full Goethe-standard writing evaluation with Deutsch Pro.",
          mascotSpeech: "Du machst tolle Fortschritte! Lass uns weitersprechen.",
        };
      case "mock_test":
        return {
          badge: "Exam Simulation Completed",
          headline: customHeadline || "Unlock Complete Examiner Report & Certificate",
          subtext:
            customSubtext ||
            "Get detailed CEFR competency breakdowns, examiner rubric corrections, and official Goethe/telc predicted scoring with Deutsch Pro.",
          mascotSpeech: "Super Prüfung! Schalte deine detaillierte Analyse frei.",
        };
      case "locked_content":
        return {
          badge: "Full Curriculum Access",
          headline: customHeadline || "Unlock the Complete A1–B2 Pathway",
          subtext:
            customSubtext ||
            "Access every grammar module, graded story with synchronized audio, and unlimited spaced repetition flashcards.",
          mascotSpeech: "Schalte alle Lektionen frei!",
        };
      default:
        return {
          badge: "Accelerate Your German",
          headline: customHeadline || "Reach German Fluency 3x Faster",
          subtext:
            customSubtext ||
            "Start your 7-day free trial. Unlock full AI conversation, Goethe & telc mock tests, and personalized study pacing.",
          mascotSpeech: "Starte deine 7 Tage kostenlos!",
        };
    }
  };

  const moment = getMomentContent();

  const handleStartTrial = () => {
    setIsCheckingOut(true);
    triggerHaptic("success");

    setTimeout(() => {
      activateSubscription({
        userId: "demo-user",
        planId: selectedPlanId,
        billingCycle,
        currency,
        startTrial: true,
      });

      playSuccessChime();
      fireConfetti();
      setIsCheckingOut(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Paywall Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] overflow-hidden"
      >
        {/* German tricolor bar */}
        <div className="h-1 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-90" />

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-36 bg-gradient-to-l from-[var(--color-brand-500)]/15 via-[var(--color-accent-500)]/10 to-transparent blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-all"
        >
          <X size={18} />
        </button>

        {/* Header with Mascot */}
        <div className="flex items-center gap-4 mb-5 pt-2">
          <DeutschMascot
            state="encouraging"
            size="md"
            speechBubble={{
              de: moment.mascotSpeech,
            }}
          />
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-[var(--color-brand-400)] text-[11px] font-bold">
              <Sparkles size={12} /> {moment.badge}
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mt-1">
              {moment.headline}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-5">
          {moment.subtext}
        </p>

        {/* Billing Cycle Switcher */}
        <div className="flex items-center justify-center p-1 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-5 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              billingCycle === "monthly"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
              billingCycle === "annual"
                ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Annual
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] font-bold">
              Save 25%
            </span>
          </button>
        </div>

        {/* Tier Selection Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Pro Plan Card */}
          <div
            onClick={() => setSelectedPlanId("pro")}
            className={`p-4 rounded-[var(--radius-xl)] border cursor-pointer transition-all relative ${
              selectedPlanId === "pro"
                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-[var(--color-brand-500)]"
                : "border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:border-[var(--color-border-2)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading font-bold text-sm text-[var(--color-text-primary)]">
                Deutsch Pro
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-brand-500)] text-white">
                Popular
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                {billingCycle === "annual"
                  ? formatPrice(proPlan.pricing[currency]?.monthlyEquivalentAnnual || 9, currency)
                  : formatPrice(proPlan.pricing[currency]?.monthlyAmount || 14, currency)}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">/month</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2">
              150 min AI dialogue, 30 writing evaluations & Goethe mock exams.
            </p>
          </div>

          {/* Pro Plus Plan Card */}
          <div
            onClick={() => setSelectedPlanId("pro_plus")}
            className={`p-4 rounded-[var(--radius-xl)] border cursor-pointer transition-all relative ${
              selectedPlanId === "pro_plus"
                ? "border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-[var(--color-accent-500)]"
                : "border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:border-[var(--color-border-2)]"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading font-bold text-sm text-[var(--color-text-primary)]">
                Pro Plus
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--color-accent-500)] text-white">
                Unlimited
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-1">
              <span className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                {billingCycle === "annual"
                  ? formatPrice(proPlusPlan.pricing[currency]?.monthlyEquivalentAnnual || 19, currency)
                  : formatPrice(proPlusPlan.pricing[currency]?.monthlyAmount || 28, currency)}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">/month</span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2">
              Zero minute caps, unlimited writing reviews & official certificates.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 mb-6 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[var(--color-success)] shrink-0" />
            <span><strong>7 Days 100% Free:</strong> No charge today. Cancel anytime with 1 click.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-[var(--color-success)] shrink-0" />
            <span>Instant sync across mobile, tablet, and desktop.</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[var(--color-brand-400)] shrink-0" />
            <span>Secure encryption via Stripe / Razorpay. 14-day money-back guarantee.</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isCheckingOut}
          onClick={handleStartTrial}
          rightIcon={<ArrowRight size={18} />}
          className="shadow-[var(--shadow-glow)] font-bold text-sm"
        >
          Start 7-Day Free Trial ($0 Today)
        </Button>

        <p className="text-[11px] text-center text-[var(--color-text-muted)] mt-3">
          After 7 days, renews at{" "}
          {billingCycle === "annual"
            ? `${formatPrice(
                (selectedPlanId === "pro" ? proPlan : proPlusPlan).pricing[currency]?.annualAmount || 108,
                currency
              )}/year`
            : `${formatPrice(
                (selectedPlanId === "pro" ? proPlan : proPlusPlan).pricing[currency]?.monthlyAmount || 14,
                currency
              )}/month`}
          . Cancel anytime before trial ends.
        </p>
      </motion.div>
    </div>
  );
}
