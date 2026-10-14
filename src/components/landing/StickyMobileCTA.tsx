"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear after scrolling 450px down past the hero
      setVisible(window.scrollY > 450);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-0 inset-x-0 z-40 p-3 bg-[var(--color-surface)]/95 border-t border-[var(--color-border)] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] backdrop-blur-xl lg:hidden"
        >
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div className="flex flex-col">
              <span className="font-heading text-xs font-bold text-[var(--color-text-primary)] leading-tight">
                DeutschPfad
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                CEFR A1–C2 · No card required
              </span>
            </div>

            <Link href="/auth/signup" className="shrink-0">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
                className="min-h-[44px] px-4 font-semibold shadow-md"
              >
                Start Free
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
