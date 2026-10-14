"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Eye, Type, Sparkles, Volume2, Globe, X, Check,
  Sliders, ShieldCheck
} from "lucide-react";
import { useAccessibility, TextSize } from "@/lib/accessibility/AccessibilityContext";
import { useI18n } from "@/lib/i18n/I18nContext";
import { Button } from "@/components/ui/Button";
import { triggerHaptic } from "@/lib/soundEffects";

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilitySettingsModal({
  isOpen,
  onClose,
}: AccessibilitySettingsModalProps) {
  const {
    reducedMotion,
    setReducedMotion,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    captionsEnabled,
    setCaptionsEnabled,
  } = useAccessibility();

  const { locale, setLocale, availableLocales, t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-modal-title"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            transition={{ duration: 0.15 }}
            className="max-w-lg w-full rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-2xl)] p-6 space-y-6 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] flex items-center justify-center">
                  <Sliders size={18} />
                </div>
                <div>
                  <h2
                    id="a11y-modal-title"
                    className="font-heading text-lg font-bold text-[var(--color-text-primary)]"
                  >
                    {t("accessibility.title")}
                  </h2>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    WCAG 2.2 AA Compliant Ergonomics
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close settings"
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Sections */}
            <div className="space-y-5 text-xs text-[var(--color-text-secondary)]">
              {/* 1. Interface Language */}
              <div className="space-y-2">
                <label className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Globe size={14} className="text-[var(--color-brand-400)]" />
                  <span>{t("accessibility.language")}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableLocales.map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setLocale(loc.code);
                      }}
                      className={`p-2.5 rounded-[var(--radius-lg)] border text-start transition-all flex items-center justify-between cursor-pointer ${
                        locale === loc.code
                          ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)]/50 text-[var(--color-brand-400)] font-bold shadow-xs"
                          : "border-[var(--color-border)] bg-[var(--color-surface-2)]/60 text-[var(--color-text-primary)] hover:border-[var(--color-border-2)]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{loc.flag}</span>
                        <div>
                          <p className="text-xs font-semibold">{loc.nativeName}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">{loc.name}</p>
                        </div>
                      </div>
                      {locale === loc.code && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Text Sizing */}
              <div className="space-y-2">
                <label className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <Type size={14} className="text-[var(--color-accent-400)]" />
                  <span>{t("accessibility.textSize")}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "normal", label: "100%", desc: "Standard" },
                      { id: "large", label: "115%", desc: "Large" },
                      { id: "xlarge", label: "130%", desc: "Extra-Large" },
                    ] as const
                  ).map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setTextSize(size.id);
                      }}
                      className={`p-2.5 rounded-[var(--radius-lg)] border text-center transition-all cursor-pointer ${
                        textSize === size.id
                          ? "bg-[var(--color-accent-500)]/15 border-[var(--color-accent-500)]/50 text-[var(--color-accent-400)] font-bold shadow-xs"
                          : "border-[var(--color-border)] bg-[var(--color-surface-2)]/60 text-[var(--color-text-primary)] hover:border-[var(--color-border-2)]"
                      }`}
                    >
                      <p className="font-bold text-sm">{size.label}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{size.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Toggles: Reduced Motion, High Contrast, Audio Captions */}
              <div className="space-y-3 pt-1 border-t border-[var(--color-border)]">
                {/* Reduced Motion */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/70">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {t("accessibility.reducedMotion")}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {t("accessibility.reducedMotionDesc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={reducedMotion}
                    onClick={() => {
                      triggerHaptic("selection");
                      setReducedMotion(!reducedMotion);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      reducedMotion ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-surface-3)]"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                        reducedMotion ? "translate-x-5" : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </button>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/70">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {t("accessibility.highContrast")}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {t("accessibility.highContrastDesc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    onClick={() => {
                      triggerHaptic("selection");
                      setHighContrast(!highContrast);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      highContrast ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-surface-3)]"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                        highContrast ? "translate-x-5" : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </button>
                </div>

                {/* Live Captions / Transcripts */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/70">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {t("accessibility.captions")}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {t("accessibility.captionsDesc")}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={captionsEnabled}
                    onClick={() => {
                      triggerHaptic("selection");
                      setCaptionsEnabled(!captionsEnabled);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      captionsEnabled ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-surface-3)]"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                        captionsEnabled ? "translate-x-5" : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end">
              <Button variant="primary" size="sm" onClick={onClose}>
                {t("common.done")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
