"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award, Flame, BookOpen, Layers, Zap, RotateCcw,
  ShieldCheck, Clock, Headphones, Mic, Sparkles, Compass,
  CheckCircle2, Lock, Download, Shield
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BadgeItem, getUserBadges } from "@/lib/gamificationService";
import { LevelCertificateModal } from "./LevelCertificateModal";

export function BadgesGalleryView() {
  const [badges, setBadges] = useState<BadgeItem[]>(() => getUserBadges());
  const [filter, setFilter] = useState<string>("all");
  const [certModalOpen, setCertModalOpen] = useState(false);

  const filteredBadges = badges.filter((b) => {
    if (filter === "all") return true;
    return b.category === filter;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  const renderIcon = (name: string, unlocked: boolean) => {
    const size = 20;
    const cls = unlocked ? "text-white" : "text-[var(--color-text-muted)]";

    switch (name) {
      case "Flame": return <Flame size={size} className={cls} />;
      case "BookOpen": return <BookOpen size={size} className={cls} />;
      case "Layers": return <Layers size={size} className={cls} />;
      case "Zap": return <Zap size={size} className={cls} />;
      case "ShieldCheck": return <ShieldCheck size={size} className={cls} />;
      case "Shield": return <Shield size={size} className={cls} />;
      case "Clock": return <Clock size={size} className={cls} />;
      case "Headphones": return <Headphones size={size} className={cls} />;
      case "Mic": return <Mic size={size} className={cls} />;
      case "RotateCcw": return <RotateCcw size={size} className={cls} />;
      case "Compass": return <Compass size={size} className={cls} />;
      case "CheckCircle2": return <CheckCircle2 size={size} className={cls} />;
      default: return <Award size={size} className={cls} />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* HEADER & CERTIFICATE CLAIM HERO */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border border-[var(--color-brand-500)]/30">
                Achievements & Diplomas
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {unlockedCount} of {totalCount} Badges Unlocked ({progressPct}%)
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              Badges & Milestones
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Celebrate your grammatical breakthroughs, vocabulary thresholds, study streaks, and exam achievements.
            </p>

            <div className="w-full sm:w-72 pt-1">
              <ProgressBar value={progressPct} color="brand" size="md" />
            </div>
          </div>

          {/* Download Certificate Action */}
          <div className="p-5 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-accent-600)]/15 to-[var(--color-brand-600)]/10 border border-[var(--color-accent-500)]/30 text-center space-y-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center mx-auto shadow-sm">
              <Award size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--color-text-primary)]">
                A1 Level Certificate Available
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Download your official completion PDF
              </p>
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => setCertModalOpen(true)}
              leftIcon={<Download size={13} />}
              className="w-full text-xs"
            >
              Claim A1 Certificate
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[var(--color-border)]/60 scrollbar-none">
          {[
            { id: "all", label: `All (${badges.length})` },
            { id: "streak", label: "Streaks" },
            { id: "vocabulary", label: "Vocabulary" },
            { id: "grammar", label: "Grammar" },
            { id: "exam", label: "Exams" },
            { id: "special", label: "Special" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                filter === cat.id
                  ? "bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)] shadow-xs"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 24 BADGES GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              className={`p-5 rounded-[var(--radius-2xl)] border transition-all flex flex-col justify-between space-y-4 ${
                badge.unlocked
                  ? "bg-[var(--color-surface)] border-[var(--color-brand-500)]/40 shadow-xs hover:border-[var(--color-brand-500)]/80"
                  : "bg-[var(--color-surface-2)]/40 border-[var(--color-border)] opacity-60"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Badge Icon Circle */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                  badge.unlocked
                    ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent-500)] border-[var(--color-brand-400)]/50"
                    : "bg-[var(--color-surface-3)] border-[var(--color-border)]"
                }`}>
                  {renderIcon(badge.iconName, badge.unlocked)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                      {badge.titleDe}
                    </h3>
                    <span className="text-[10px] font-bold text-[var(--color-accent-400)] font-mono">
                      +{badge.xpBonus} XP
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-[var(--color-brand-400)]">
                    {badge.title}
                  </p>

                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Status / Progress Footer */}
              <div className="pt-3 border-t border-[var(--color-border)]/50 flex items-center justify-between text-[11px]">
                {badge.unlocked ? (
                  <span className="flex items-center gap-1.5 text-[var(--color-success)] font-bold">
                    <CheckCircle2 size={13} /> Unlocked
                  </span>
                ) : (
                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1">
                        <Lock size={10} /> In Progress
                      </span>
                      {badge.progressTarget && (
                        <span>{badge.progressCurrent || 0} / {badge.progressTarget}</span>
                      )}
                    </div>
                    {badge.progressTarget && (
                      <ProgressBar
                        value={Math.round(((badge.progressCurrent || 0) / badge.progressTarget) * 100)}
                        color="brand"
                        size="sm"
                      />
                    )}
                  </div>
                )}

                {badge.unlocked && badge.unlockedAt && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {new Date(badge.unlockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CERTIFICATE MODAL */}
      <LevelCertificateModal
        isOpen={certModalOpen}
        onClose={() => setCertModalOpen(false)}
        levelCode="A1"
      />
    </div>
  );
}
