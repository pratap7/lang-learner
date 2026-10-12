"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Flame, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeutschMascot } from "@/components/mascot/DeutschMascot";
import { fireConfetti } from "@/lib/confetti";
import { playMilestoneChime, triggerHaptic } from "@/lib/soundEffects";

export interface MilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  germanTitle?: string;
  description: string;
  xpAwarded?: number;
  streakDays?: number;
  badgeName?: string;
  onContinue?: () => void;
}

export function MilestoneCelebrationModal({
  isOpen,
  onClose,
  title,
  germanTitle = "Ausgezeichnet!",
  description,
  xpAwarded = 50,
  streakDays,
  badgeName,
  onContinue,
}: MilestoneCelebrationProps) {
  useEffect(() => {
    if (isOpen) {
      playMilestoneChime();
      triggerHaptic("success");
      fireConfetti();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    triggerHaptic("selection");
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] text-center overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[var(--color-accent-500)]/20 blur-3xl rounded-full pointer-events-none" />

        {/* Mascot celebrating */}
        <div className="mb-4 flex justify-center">
          <DeutschMascot
            state="celebrating"
            size="lg"
            speechBubble={{
              de: germanTitle,
              en: "Outstanding!",
            }}
          />
        </div>

        {/* Milestone Title */}
        <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
          {title}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto">
          {description}
        </p>

        {/* Milestone Rewards Pill Strip */}
        <div className="flex items-center justify-center gap-3 mt-6 mb-6">
          {xpAwarded > 0 && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-[var(--color-brand-400)] text-xs font-bold shadow-sm">
              <Sparkles size={14} className="text-[var(--color-brand-400)]" />
              <span>+{xpAwarded} XP Earned</span>
            </div>
          )}

          {streakDays && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--color-accent-500)]/15 border border-[var(--color-accent-500)]/30 text-[var(--color-accent-400)] text-xs font-bold shadow-sm">
              <Flame size={14} className="text-[var(--color-accent-500)]" />
              <span>{streakDays}-Day Streak!</span>
            </div>
          )}

          {badgeName && (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--color-success)]/15 border border-[var(--color-success)]/30 text-[var(--color-success)] text-xs font-bold shadow-sm">
              <Award size={14} />
              <span>{badgeName}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNext}
          rightIcon={<ArrowRight size={18} />}
          className="shadow-[var(--shadow-glow)]"
        >
          Weiter! (Continue)
        </Button>
      </motion.div>
    </div>
  );
}
