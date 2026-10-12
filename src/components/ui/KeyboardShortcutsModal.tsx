"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Command, Keyboard } from "lucide-react";
import { Button } from "./Button";

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Keyboard Shortcut Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-brand-500)] shadow-md flex items-center justify-center transition-all cursor-pointer opacity-70 hover:opacity-100"
        title="Keyboard Shortcuts (?)"
        aria-label="View Keyboard Shortcuts"
      >
        <Keyboard size={16} />
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] flex items-center justify-center">
                    <Keyboard size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                      Keyboard Shortcuts
                    </h3>
                    <p className="text-[10px] text-[var(--color-text-muted)]">
                      Speed up your German practice
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center justify-center cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Shortcuts Groups */}
              <div className="space-y-4 text-xs">
                {/* Spaced Repetition Flashcards */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[var(--color-brand-400)] uppercase text-[10px] tracking-wider">
                    Flashcard Player (SM-2)
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)]">Flip Flashcard</span>
                      <div className="flex gap-1"><kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">Space</kbd> or <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">Enter</kbd></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)]">Rate Again / Hard / Good / Easy</span>
                      <div className="flex gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">1</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">2</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">3</kbd>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">4</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)]">Pronounce Word / Example Audio</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">A</kbd>
                        <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">S</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                {/* General Drills */}
                <div className="space-y-2 pt-2 border-t border-[var(--color-border)]/60">
                  <h4 className="font-bold text-[var(--color-brand-400)] uppercase text-[10px] tracking-wider">
                    Interactive Exercises
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)]">Select Option 1–4</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">A–D</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)]">Submit & Check Answer</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">Enter</kbd>
                    </div>
                  </div>
                </div>

                {/* Global Shortcuts */}
                <div className="space-y-2 pt-2 border-t border-[var(--color-border)]/60">
                  <h4 className="font-bold text-[var(--color-brand-400)] uppercase text-[10px] tracking-wider">
                    Global
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)]">Toggle Shortcuts Modal</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">?</kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-secondary)]">Close Active Modal / Overlay</span>
                      <kbd className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-[10px]">Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="w-full text-xs">
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
