"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, HeartHandshake, CheckCircle2,
  Clock, ArrowRight, X, Sparkles, Shield
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeutschMascot } from "@/components/mascot/DeutschMascot";
import {
  UserSubscription,
  applyWinBackOffer,
  cancelSubscription,
  CancellationSurveyRecord,
} from "@/lib/billingService";
import { appCopy } from "@/lib/appCopy";
import { playSuccessChime, triggerHaptic } from "@/lib/soundEffects";
import { fireConfetti } from "@/lib/confetti";

export interface CancellationSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onSubscriptionUpdated: (updated: UserSubscription) => void;
}

type CancellationReason = CancellationSurveyRecord["reason"];

const CANCELLATION_REASONS: { id: CancellationReason; label: string; desc: string }[] = [
  { id: "price", label: "Too expensive / Financial reasons", desc: "I need to trim down my monthly software expenses." },
  { id: "time", label: "Not enough time to practice right now", desc: "Work or personal schedule has become too busy." },
  { id: "goal_reached", label: "I achieved my German goal!", desc: "I passed my exam / reached the level I needed." },
  { id: "missing_features", label: "Missing specific learning features", desc: "The app is missing something I need for fluency." },
  { id: "bugs", label: "Technical bugs or app friction", desc: "I encountered issues with audio or speech recognition." },
  { id: "other", label: "Other / Switching to a different app", desc: "I am trying a different approach to language learning." },
];

export function CancellationSurveyModal({
  isOpen,
  onClose,
  subscription,
  onSubscriptionUpdated,
}: CancellationSurveyModalProps) {
  const [step, setStep] = useState<"survey" | "win_back" | "confirmed">("survey");
  const [selectedReason, setSelectedReason] = useState<CancellationReason>("price");
  const [feedbackText, setFeedbackText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [winBackOutcome, setWinBackOutcome] = useState<"accepted" | "declined">("accepted");

  if (!isOpen) return null;

  const handleProceedToOffer = () => {
    triggerHaptic("selection");
    setStep("win_back");
  };

  const handleAcceptWinBack = (offer: "discount_50" | "pause_1mo") => {
    setIsProcessing(true);
    triggerHaptic("success");

    setTimeout(() => {
      const { updatedSubscription } = applyWinBackOffer(
        subscription,
        offer,
        selectedReason,
        feedbackText
      );
      playSuccessChime();
      fireConfetti();
      setWinBackOutcome("accepted");
      setIsProcessing(false);
      setStep("confirmed");
      onSubscriptionUpdated(updatedSubscription);
    }, 600);
  };

  const handleDeclineAndCancel = () => {
    setIsProcessing(true);
    triggerHaptic("error");

    setTimeout(() => {
      const { updatedSubscription } = cancelSubscription(
        subscription,
        selectedReason,
        feedbackText
      );
      setWinBackOutcome("declined");
      setIsProcessing(false);
      setStep("confirmed");
      onSubscriptionUpdated(updatedSubscription);
    }, 600);
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

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-all"
        >
          <X size={18} />
        </button>

        {/* STEP 1: Survey Question */}
        {step === "survey" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <DeutschMascot
                state="idle"
                size="sm"
                speechBubble={appCopy.cancellation.mascotThought}
              />
              <div>
                <h2 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                  {appCopy.cancellation.title}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {appCopy.cancellation.subtitle}
                </p>
              </div>
            </div>

            {/* Reasons List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {CANCELLATION_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.id)}
                    className={`w-full p-3 rounded-[var(--radius-lg)] border text-left transition-all ${
                      isSelected
                        ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/15 shadow-sm"
                        : "border-[var(--color-border)] bg-[var(--color-surface-2)]/50 hover:border-[var(--color-border-2)]"
                    }`}
                  >
                    <p className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                      {r.label}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {r.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Optional Feedback */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                Any specific feedback? (Optional)
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what we could improve..."
                rows={2}
                className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-xs focus:outline-none focus:border-[var(--color-brand-500)] resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Keep My Subscription
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleProceedToOffer}
                rightIcon={<ArrowRight size={14} />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Win-Back Offer */}
        {step === "win_back" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <DeutschMascot
                  state="encouraging"
                  size="md"
                  speechBubble={appCopy.cancellation.mascotThought}
                />
              </div>

              {selectedReason === "time" ? (
                <>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {appCopy.cancellation.pauseOption.headline}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto">
                    {appCopy.cancellation.pauseOption.description}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {appCopy.cancellation.discountOption.headline}
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto">
                    {appCopy.cancellation.discountOption.description}
                  </p>
                </>
              )}
            </div>

            {/* Win Back Benefit Card */}
            <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-accent-500)]/40 bg-[var(--color-accent-500)]/10 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] text-xs font-bold">
                <Sparkles size={14} />
                {selectedReason === "time"
                  ? appCopy.cancellation.pauseOption.badge
                  : appCopy.cancellation.discountOption.badge}
              </div>
              <p className="text-xs text-[var(--color-text-primary)] font-medium">
                {selectedReason === "time"
                  ? appCopy.cancellation.pauseOption.summary
                  : appCopy.cancellation.discountOption.summary}
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isProcessing}
                onClick={() =>
                  handleAcceptWinBack(selectedReason === "time" ? "pause_1mo" : "discount_50")
                }
                leftIcon={<HeartHandshake size={18} />}
                className="shadow-[var(--shadow-glow)] font-bold text-sm"
              >
                {selectedReason === "time"
                  ? appCopy.cancellation.pauseOption.action
                  : appCopy.cancellation.discountOption.action}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                fullWidth
                loading={isProcessing}
                onClick={handleDeclineAndCancel}
                className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 text-xs"
              >
                {appCopy.cancellation.confirmCancel}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Outcome Confirmation */}
        {step === "confirmed" && (
          <div className="text-center space-y-5 py-2">
            <div className="flex justify-center mb-2">
              <DeutschMascot
                state={winBackOutcome === "accepted" ? "celebrating" : "idle"}
                size="lg"
                speechBubble={{
                  de: winBackOutcome === "accepted" ? "Wunderbar!" : "Auf Wiedersehen!",
                  en: winBackOutcome === "accepted" ? "Wonderful decision!" : "See you soon!",
                }}
              />
            </div>

            <div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                {winBackOutcome === "accepted"
                  ? "Win-Back Offer Applied!"
                  : "Subscription Cancellation Confirmed"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto">
                {winBackOutcome === "accepted"
                  ? "Your account has been updated with the special offer. Keep up your German learning momentum!"
                  : `Your subscription will remain active until ${new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString()}. You will not be charged again.`}
              </p>
            </div>

            <Button variant="primary" size="md" onClick={onClose} fullWidth>
              Fertig (Done)
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
