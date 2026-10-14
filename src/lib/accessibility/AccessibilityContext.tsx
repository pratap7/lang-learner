"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type TextSize = "normal" | "large" | "xlarge";

interface AccessibilityContextType {
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  textSize: TextSize;
  setTextSize: (value: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  captionsEnabled: boolean;
  setCaptionsEnabled: (value: boolean) => void;
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const A11Y_STORAGE_KEY = "deutschpfad_a11y_preferences_v1";

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [highContrast, setHighContrastState] = useState(false);
  const [captionsEnabled, setCaptionsEnabledState] = useState(true);

  // Live region announcement state
  const [politeAnnouncement, setPoliteAnnouncement] = useState("");
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState("");

  // Restore preferences on mount or detect system defaults
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(A11Y_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.reducedMotion === "boolean") setReducedMotionState(parsed.reducedMotion);
        if (["normal", "large", "xlarge"].includes(parsed.textSize)) setTextSizeState(parsed.textSize);
        if (typeof parsed.highContrast === "boolean") setHighContrastState(parsed.highContrast);
        if (typeof parsed.captionsEnabled === "boolean") setCaptionsEnabledState(parsed.captionsEnabled);
      } else {
        // Detect prefers-reduced-motion
        const systemPrefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setReducedMotionState(systemPrefersReduced);
      }
    } catch {}
  }, []);

  // Save preferences and apply classes to <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Apply reduced motion
    if (reducedMotion) {
      root.classList.add("reduced-motion-active");
    } else {
      root.classList.remove("reduced-motion-active");
    }

    // Apply text sizing
    root.classList.remove("text-size-large", "text-size-xlarge");
    if (textSize === "large") {
      root.classList.add("text-size-large");
    } else if (textSize === "xlarge") {
      root.classList.add("text-size-xlarge");
    }

    // Apply high contrast
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    try {
      localStorage.setItem(
        A11Y_STORAGE_KEY,
        JSON.stringify({
          reducedMotion,
          textSize,
          highContrast,
          captionsEnabled,
        })
      );
    } catch {}
  }, [reducedMotion, textSize, highContrast, captionsEnabled]);

  const setReducedMotion = (val: boolean) => setReducedMotionState(val);
  const setTextSize = (val: TextSize) => setTextSizeState(val);
  const setHighContrast = (val: boolean) => setHighContrastState(val);
  const setCaptionsEnabled = (val: boolean) => setCaptionsEnabledState(val);

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (priority === "assertive") {
      setAssertiveAnnouncement("");
      // Brief tick so screen reader catches the re-announcement
      setTimeout(() => setAssertiveAnnouncement(message), 50);
    } else {
      setPoliteAnnouncement("");
      setTimeout(() => setPoliteAnnouncement(message), 50);
    }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        reducedMotion,
        setReducedMotion,
        textSize,
        setTextSize,
        highContrast,
        setHighContrast,
        captionsEnabled,
        setCaptionsEnabled,
        announce,
      }}
    >
      {children}

      {/* Screen Reader Live Announcements Container */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeAnnouncement}
      </div>
      <div className="sr-only" aria-live="assertive" aria-atomic="true" role="alert">
        {assertiveAnnouncement}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    return {
      reducedMotion: false,
      setReducedMotion: () => {},
      textSize: "normal" as TextSize,
      setTextSize: () => {},
      highContrast: false,
      setHighContrast: () => {},
      captionsEnabled: true,
      setCaptionsEnabled: () => {},
      announce: () => {},
    };
  }
  return context;
}
