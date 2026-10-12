"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, X, CheckCircle2, ShieldCheck, Sparkles, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LevelCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  levelCode?: string;
  completionDate?: string;
}

export function LevelCertificateModal({
  isOpen,
  onClose,
  userName = "Alex Schneider",
  levelCode = "A1",
  completionDate,
}: LevelCertificateModalProps) {
  const [recipientName, setRecipientName] = useState(userName);
  const [isDownloading, setIsDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const displayDate = completionDate || new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const certId = `DP-CERT-${levelCode.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleDownload = () => {
    setIsDownloading(true);
    // Use printable window or trigger print
    setTimeout(() => {
      window.print();
      setIsDownloading(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="max-w-3xl w-full p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl space-y-6 my-auto"
        >
          {/* Top Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent-500)]/15 text-[var(--color-accent-400)] border border-[var(--color-accent-500)]/30">
                Official CEFR Milestone
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Certificate of Completion
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Edit Name Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <label className="text-[var(--color-text-secondary)] font-medium">
              Certificate recipient name:
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)] w-full sm:w-64"
              placeholder="Your Full Name"
            />
          </div>

          {/* PRINTABLE CERTIFICATE CANVAS CONTAINER */}
          <div
            ref={certRef}
            id="printable-certificate"
            className="p-8 sm:p-12 rounded-[var(--radius-2xl)] border-4 border-double border-[var(--color-accent-400)]/60 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b]/40 to-[#0f172a] text-center shadow-xl relative overflow-hidden space-y-6"
          >
            {/* Top German Flag Ribbon */}
            <div className="h-2 w-full tricolor-stripe absolute top-0 left-0 right-0" />

            {/* Seal / Gold Badge */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-slate-950 flex items-center justify-center mx-auto shadow-lg ring-4 ring-amber-400/30">
              <Award size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent-400)] block">
                Zertifikat über den erfolgreichen Abschluss
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                DeutschPfad Certificate of Competence
              </h2>
            </div>

            <p className="text-xs text-slate-300 italic max-w-md mx-auto">
              This officially certifies that the following candidate has satisfied all curriculum requirements, vocabulary thresholds, and unit examinations for:
            </p>

            {/* Recipient Name in Display Typography */}
            <div className="py-2 border-b-2 border-dashed border-amber-400/40 max-w-md mx-auto">
              <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-amber-300 tracking-wide font-serif">
                {recipientName || "Alex Schneider"}
              </h3>
            </div>

            {/* Level Award Descriptor */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/80 border border-amber-400/40 shadow-inner">
              <span className="font-heading text-xl font-black text-amber-400">
                CEFR {levelCode.toUpperCase()}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-200">
                {levelCode.toUpperCase() === "A1" ? "Breakthrough (Elementare Sprachverwendung)" : `${levelCode.toUpperCase()} Proficiency`}
              </span>
            </div>

            {/* Bottom Metadata & Verification */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
              <div className="text-left space-y-0.5">
                <span className="block text-slate-500">ISSUED ON</span>
                <span className="font-semibold text-slate-300">{displayDate}</span>
              </div>

              <div className="text-center space-y-0.5">
                <span className="block text-slate-500">ACCREDITATION HASH</span>
                <span className="font-mono text-[10px] text-amber-400/90">{certId}</span>
              </div>

              <div className="text-right space-y-0.5">
                <span className="block text-slate-500">EXAMINER BOARD</span>
                <span className="font-semibold text-slate-300">DeutschPfad Prüfungsrat</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="md" onClick={onClose} className="text-xs">
              Close
            </Button>

            <Button
              variant="primary"
              size="md"
              loading={isDownloading}
              onClick={handleDownload}
              leftIcon={<Download size={15} />}
              className="text-xs"
            >
              Print / Save Certificate (PDF)
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
