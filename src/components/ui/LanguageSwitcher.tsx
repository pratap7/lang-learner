"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n, SupportedLocale } from "@/lib/i18n/I18nContext";
import { triggerHaptic } from "@/lib/soundEffects";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "pill" | "icon" | "select";
}

export function LanguageSwitcher({
  className = "",
  variant = "pill",
}: LanguageSwitcherProps) {
  const { locale, setLocale, availableLocales } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const current = availableLocales.find((l) => l.code === locale) || availableLocales[0];

  const handleSelect = (code: SupportedLocale) => {
    triggerHaptic("selection");
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-start ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select interface language. Currently selected: ${current.name}`}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-text-primary)] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)] focus-visible:outline-none"
      >
        <span aria-hidden="true">{current.flag}</span>
        {variant !== "icon" && <span>{current.nativeName}</span>}
        <Globe size={13} className="text-[var(--color-text-muted)]" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Interface languages"
          className="absolute end-0 mt-1.5 w-48 rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {availableLocales.map((loc) => {
            const isSelected = loc.code === locale;
            return (
              <button
                key={loc.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(loc.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-start ${
                  isSelected
                    ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)] font-bold"
                    : "text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{loc.flag}</span>
                  <div>
                    <p className="font-semibold">{loc.nativeName}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{loc.name} {loc.dir === "rtl" ? "(RTL)" : ""}</p>
                  </div>
                </div>
                {isSelected && <Check size={14} className="text-[var(--color-brand-400)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
