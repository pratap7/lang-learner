"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundMuted, toggleSoundMuted, triggerHaptic } from "@/lib/soundEffects";

export function AudioToggle({ className = "" }: { className?: string }) {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());

    const handleMuteChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      if (customEvent.detail) {
        setMuted(customEvent.detail.muted);
      }
    };

    window.addEventListener("deutschpfad:audio-mute-changed", handleMuteChange);
    return () => {
      window.removeEventListener("deutschpfad:audio-mute-changed", handleMuteChange);
    };
  }, []);

  const handleToggle = () => {
    triggerHaptic("selection");
    const next = toggleSoundMuted();
    setMuted(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={muted ? "Sound Effects Muted (Click to enable)" : "Sound Effects Enabled (Click to mute)"}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      className={`p-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-95 flex items-center gap-1.5 text-xs shadow-sm ${className}`}
    >
      {muted ? (
        <>
          <VolumeX size={16} className="text-[var(--color-danger)]" />
          <span className="hidden sm:inline text-[11px] font-medium text-[var(--color-text-muted)]">
            Muted
          </span>
        </>
      ) : (
        <>
          <Volume2 size={16} className="text-[var(--color-brand-400)]" />
          <span className="hidden sm:inline text-[11px] font-medium text-[var(--color-text-secondary)]">
            Audio
          </span>
        </>
      )}
    </button>
  );
}
