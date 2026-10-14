"use client";

import React from "react";
import { triggerHaptic } from "@/lib/soundEffects";

interface UmlautKeyboardBarProps {
  onInsert: (char: string) => void;
  className?: string;
  disabled?: boolean;
}

const GERMAN_CHARACTERS = [
  { char: "ä", label: "a with umlaut (lowercase)" },
  { char: "ö", label: "o with umlaut (lowercase)" },
  { char: "ü", label: "u with umlaut (lowercase)" },
  { char: "ß", label: "eszett / sharp s" },
  { char: "Ä", label: "A with umlaut (uppercase)" },
  { char: "Ö", label: "O with umlaut (uppercase)" },
  { char: "Ü", label: "U with umlaut (uppercase)" },
];

export function UmlautKeyboardBar({
  onInsert,
  className = "",
  disabled = false,
}: UmlautKeyboardBarProps) {
  const handleCharClick = (char: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevents input from losing focus if possible
    if (disabled) return;
    triggerHaptic("selection");
    onInsert(char);
  };

  return (
    <div
      role="region"
      aria-label="German special characters helper"
      className={`flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] text-xs ${className}`}
    >
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[11px] font-semibold text-[var(--color-text-muted)] mr-1 hidden sm:inline">
          Special Keys:
        </span>
        {GERMAN_CHARACTERS.map(({ char, label }) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={(e) => handleCharClick(char, e)}
            aria-label={`Insert German character ${char} (${label})`}
            className="min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] hover:border-[var(--color-brand-400)] hover:text-[var(--color-brand-400)] hover:bg-[var(--color-surface)] hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)] focus-visible:outline-none"
          >
            {char}
          </button>
        ))}
      </div>

      <span className="text-[10px] text-[var(--color-text-muted)] font-mono hidden md:inline">
        Shortcut: Alt+a/o/u/s or ae/oe/ue/ss
      </span>
    </div>
  );
}
