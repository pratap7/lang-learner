"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, HelpCircle, ThumbsUp, PartyPopper } from "lucide-react";
import { playClickSound, triggerHaptic } from "@/lib/soundEffects";

export type MascotState =
  | "idle"
  | "happy"
  | "celebrating"
  | "thinking"
  | "encouraging"
  | "oops"
  | "sleeping";

export interface DeutschMascotProps {
  state?: MascotState;
  size?: "sm" | "md" | "lg" | "xl";
  speechBubble?: {
    de: string;
    en?: string;
  };
  interactive?: boolean;
  className?: string;
  onTap?: () => void;
}

const SIZE_MAP = {
  sm: { width: 56, height: 56, textClass: "text-xs" },
  md: { width: 88, height: 88, textClass: "text-sm" },
  lg: { width: 128, height: 128, textClass: "text-base" },
  xl: { width: 176, height: 176, textClass: "text-lg" },
};

export function DeutschMascot({
  state = "idle",
  size = "md",
  speechBubble,
  interactive = true,
  className = "",
  onTap,
}: DeutschMascotProps) {
  const [isWiggling, setIsWiggling] = useState(false);
  const dims = SIZE_MAP[size];

  const handleMascotClick = () => {
    if (!interactive) return;
    playClickSound();
    triggerHaptic("selection");
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 600);
    if (onTap) onTap();
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble (Optional) */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-2 max-w-xs px-3.5 py-2 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-md)] text-center relative z-10"
          >
            <p className="font-heading font-bold text-xs text-[var(--color-text-primary)]">
              &ldquo;{speechBubble.de}&rdquo;
            </p>
            {speechBubble.en && (
              <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                {speechBubble.en}
              </p>
            )}
            {/* Bubble pointer beak */}
            <div className="w-2.5 h-2.5 bg-[var(--color-surface)] border-r border-b border-[var(--color-border)] rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot Vector Artwork */}
      <motion.div
        whileHover={interactive ? { scale: 1.05 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        animate={
          isWiggling
            ? { rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.1, 1] }
            : state === "celebrating"
            ? { y: [0, -8, 0], rotate: [-2, 2, -2] }
            : state === "happy"
            ? { y: [0, -5, 0] }
            : { y: [0, -2, 0] }
        }
        transition={
          isWiggling
            ? { duration: 0.5 }
            : state === "celebrating"
            ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            : state === "happy"
            ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
            : { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
        }
        onClick={handleMascotClick}
        className={`relative ${interactive ? "cursor-pointer" : ""}`}
        style={{ width: dims.width, height: dims.height }}
      >
        {/* Glow halo for celebrating / encouraging */}
        {(state === "celebrating" || state === "happy") && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--color-brand-500)]/25 to-[var(--color-accent-500)]/25 blur-xl -z-10" />
        )}

        <svg
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Defs for gradients & patterns */}
          <defs>
            <linearGradient id="bodyFur" x1="80" y1="20" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="0.6" stopColor="#D97706" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="whiteFur" x1="80" y1="60" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#F3F4F6" />
            </linearGradient>
            <linearGradient id="earDark" x1="30" y1="30" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#92400E" />
              <stop offset="1" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="bandana" x1="50" y1="120" x2="110" y2="150" gradientUnits="userSpaceOnUse">
              <stop stopColor="#DC2626" />
              <stop offset="0.5" stopColor="#B91C1C" />
              <stop offset="1" stopColor="#991B1B" />
            </linearGradient>
          </defs>

          {/* Floppy Left Ear */}
          <motion.path
            d="M 44 48 C 24 50 14 74 20 100 C 24 116 38 120 46 108 C 52 98 52 64 44 48 Z"
            fill="url(#earDark)"
            animate={
              state === "celebrating"
                ? { rotate: [0, -12, 0] }
                : state === "happy"
                ? { rotate: [0, -6, 0] }
                : undefined
            }
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ transformOrigin: "44px 48px" }}
          />

          {/* Floppy Right Ear */}
          <motion.path
            d="M 116 48 C 136 50 146 74 140 100 C 136 116 122 120 114 108 C 108 98 108 64 116 48 Z"
            fill="url(#earDark)"
            animate={
              state === "celebrating"
                ? { rotate: [0, 12, 0] }
                : state === "happy"
                ? { rotate: [0, 6, 0] }
                : undefined
            }
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ transformOrigin: "116px 48px" }}
          />

          {/* Main Head Base */}
          <circle cx="80" cy="80" r="50" fill="url(#bodyFur)" />

          {/* St. Bernard White Blaze on Face */}
          <path
            d="M 80 40 C 72 40 68 56 68 76 C 68 96 56 108 56 120 C 56 130 68 132 80 132 C 92 132 104 130 104 120 C 104 108 92 96 92 76 C 92 56 88 40 80 40 Z"
            fill="url(#whiteFur)"
          />

          {/* Snout & Muzzle */}
          <ellipse cx="80" cy="100" rx="24" ry="18" fill="url(#whiteFur)" />

          {/* Cute Nose */}
          <path
            d="M 74 92 C 74 88 86 88 86 92 C 86 98 82 101 80 101 C 78 101 74 98 74 92 Z"
            fill="#1E1E1E"
          />
          {/* Nose shine */}
          <ellipse cx="78" cy="91" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.8" />

          {/* Mouth expressions */}
          {state === "happy" || state === "celebrating" ? (
            /* Big Joyful Smile */
            <g>
              <path
                d="M 72 102 Q 80 106 88 102"
                stroke="#1E1E1E"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 74 103 Q 80 114 86 103 Z"
                fill="#EF4444"
              />
            </g>
          ) : state === "oops" ? (
            /* Wobbly sympathetic small 'o' mouth */
            <ellipse cx="80" cy="106" rx="3.5" ry="4" fill="#374151" />
          ) : state === "thinking" ? (
            /* Pensive slanted smile */
            <path
              d="M 75 104 Q 82 104 88 101"
              stroke="#1E1E1E"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : state === "sleeping" ? (
            /* Gentle peaceful straight line */
            <path
              d="M 75 104 Q 80 106 85 104"
              stroke="#1E1E1E"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            /* Friendly gentle smile (idle / encouraging) */
            <path
              d="M 73 103 Q 80 108 87 103"
              stroke="#1E1E1E"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Cheeks blush */}
          <ellipse cx="60" cy="100" rx="6" ry="3.5" fill="#F87171" opacity="0.45" />
          <ellipse cx="100" cy="100" rx="6" ry="3.5" fill="#F87171" opacity="0.45" />

          {/* Eyes expressions */}
          {state === "sleeping" ? (
            /* Sleeping closed curved eye arcs */
            <g stroke="#1E1E1E" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 60 76 Q 66 82 72 76" />
              <path d="M 88 76 Q 94 82 100 76" />
            </g>
          ) : state === "happy" || state === "celebrating" ? (
            /* Joyful laughing crescent eyes */
            <g stroke="#1E1E1E" strokeWidth="3.2" strokeLinecap="round" fill="none">
              <path d="M 59 78 Q 66 70 73 78" />
              <path d="M 87 78 Q 94 70 101 78" />
            </g>
          ) : state === "thinking" ? (
            /* Looking up & to the right */
            <g>
              <ellipse cx="66" cy="74" rx="7" ry="8" fill="#1E1E1E" />
              <circle cx="68" cy="72" r="3" fill="#FFFFFF" />
              <ellipse cx="94" cy="72" rx="7" ry="8" fill="#1E1E1E" />
              <circle cx="96" cy="70" r="3" fill="#FFFFFF" />
            </g>
          ) : (
            /* Big, bright, friendly eyes (idle / encouraging / oops) */
            <g>
              {/* Left Eye */}
              <ellipse cx="66" cy="76" rx="7.5" ry="9" fill="#1E1E1E" />
              <circle cx="64" cy="73" r="3.2" fill="#FFFFFF" />
              <circle cx="68" cy="78" r="1.5" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="94" cy="76" rx="7.5" ry="9" fill="#1E1E1E" />
              <circle cx="92" cy="73" r="3.2" fill="#FFFFFF" />
              <circle cx="96" cy="78" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Traditional German/Alpine Bandana Collar */}
          <path
            d="M 52 120 C 66 126 94 126 108 120 L 80 148 Z"
            fill="url(#bandana)"
          />
          {/* Bandana golden bell / medal */}
          <circle cx="80" cy="130" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />

          {/* State Specific Overlays */}
          {state === "celebrating" && (
            /* Party Cone Hat */
            <g>
              <path
                d="M 66 38 L 80 8 L 94 38 Z"
                fill="#3B82F6"
              />
              <path
                d="M 70 30 L 80 8 L 86 34 Z"
                fill="#F59E0B"
                opacity="0.9"
              />
              <circle cx="80" cy="7" r="4.5" fill="#EF4444" />
            </g>
          )}

          {state === "thinking" && (
            /* Lightbulb / Thought dots */
            <g>
              <circle cx="118" cy="45" r="3" fill="#FBBF24" opacity="0.6" />
              <circle cx="126" cy="35" r="4.5" fill="#FBBF24" opacity="0.8" />
              <circle cx="138" cy="24" r="7" fill="#FBBF24" />
              <path d="M 136 21 L 140 21 M 138 18 L 138 25" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}
        </svg>

        {/* Floating sleeping Zzz's */}
        {state === "sleeping" && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [-4, -20], x: [0, 8] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
            className="absolute -top-3 right-0 font-heading font-bold text-xs text-[var(--color-brand-400)] pointer-events-none"
          >
            Zzz...
          </motion.div>
        )}

        {/* Celebrating Sparkles icon badge */}
        {state === "celebrating" && (
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute -top-2 -right-1 p-1 rounded-full bg-[var(--color-accent-500)] text-white shadow-sm"
          >
            <Sparkles size={14} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
