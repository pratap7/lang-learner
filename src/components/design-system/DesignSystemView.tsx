"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CheckCircle2, ShieldCheck, AlertCircle, Info,
  ArrowRight, Copy, Check, Eye, EyeOff, Volume2, VolumeX,
  Target, ArrowRightCircle, Gift, KeyRound, Play, RotateCcw,
  Layers, Palette, Type, Grid, Activity, Smile, Box, Compass,
  Flame, BookOpen, ExternalLink, HelpCircle, AlertTriangle,
  CheckCheck, XCircle, Sliders, Moon, Sun, Smartphone, Laptop
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/courses/ProgressRing";
import { DeutschMascot, MascotState } from "@/components/mascot/DeutschMascot";
import { AudioToggle } from "@/components/ui/AudioToggle";
import {
  BRAND_PERSONALITY_PILLARS,
  TONE_OF_VOICE_GUIDELINES,
  COLOR_PHILOSOPHY,
  COLOR_TOKENS,
  GRAMMAR_GENDER_TOKENS,
  GRAMMAR_CASE_TOKENS,
  TYPOGRAPHY_SCALE,
  SPACING_GRID_TOKENS,
  RADIUS_TOKENS,
  BORDER_TOKENS,
  ELEVATION_TOKENS,
  MOTION_PRINCIPLES,
  ICONOGRAPHY_GUIDELINES,
  MASCOT_BRIEF_STATES,
} from "@/lib/designSystemData";
import {
  playSuccessChime,
  playErrorBuzzer,
  playMilestoneChime,
  playCompletionFanfare,
  playClickSound,
  playCardFlipSound,
  triggerHaptic,
} from "@/lib/soundEffects";
import { fireConfetti } from "@/lib/confetti";
import { useToast } from "@/components/ui/Toast";

type SectionTab =
  | "brand"
  | "colors"
  | "grammar"
  | "typography"
  | "spatial"
  | "motion"
  | "mascot"
  | "components";

type ColorBlindFilter = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

export function DesignSystemView() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<SectionTab>("brand");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Accessibility & simulation states
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindFilter>("none");
  const [simulateReducedMotion, setSimulateReducedMotion] = useState(false);

  // Mascot interactive playground
  const [mascotState, setMascotState] = useState<MascotState>("happy");
  const [mascotCustomSpeech, setMascotCustomSpeech] = useState("Deutsch lernen macht Spaß!");
  const [mascotSize, setMascotSize] = useState<"sm" | "md" | "lg" | "xl">("lg");

  // Grammar case interactive inspector
  const [selectedCase, setSelectedCase] = useState<"NOM" | "AKK" | "DAT" | "GEN">("AKK");
  const [interactiveSentencePart, setInteractiveSentencePart] = useState<string | null>(null);

  // Motion playground state
  const [motionTriggerCount, setMotionTriggerCount] = useState(0);

  // Interactive component states
  const [sampleInputVal, setSampleInputVal] = useState("Der Hund läuft im Garten");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [selectedExerciseOption, setSelectedExerciseOption] = useState<number | null>(null);
  const [exerciseEvaluated, setExerciseEvaluated] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedToken(text);
      triggerHaptic("selection");
      addToast({ message: `Copied ${label} (${text}) to clipboard`, type: "success" });
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const insertSpecialChar = (char: string) => {
    setSampleInputVal((prev) => prev + char);
    triggerHaptic("selection");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 ${
        simulateReducedMotion ? "reduced-motion-active" : ""
      }`}
    >
      {/* Hidden SVG Filters for Color Blindness Simulation */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0   0.558, 0.442, 0, 0, 0   0, 0.242, 0.758, 0, 0   0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0   0.7, 0.3, 0, 0, 0   0, 0.3, 0.7, 0, 0   0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0   0, 0.433, 0.567, 0, 0   0, 0.475, 0.525, 0, 0   0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>

      {/* ──────────────── Header Banner ──────────────── */}
      <div className="p-8 sm:p-10 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-l from-[var(--color-brand-500)]/20 via-[var(--color-accent-500)]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-[var(--color-brand-400)] text-xs font-bold">
              <Compass size={14} /> Deutsch Pfad Design Language System · v2.5
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
              Design Language & Tokens
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              The official design language for Deutsch Pfad. Engineered for global English-speaking German learners, combining linguistic precision, warm companion empathy, and modern European aesthetics.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/80 border border-[var(--color-border)]">
            <DeutschMascot state="encouraging" size="md" speechBubble={{ de: "Präzise & Ermutigend!" }} />
            <div>
              <p className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                Barni Brand Companion
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                St. Bernard Alpine Guide
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded-full border border-[var(--color-success)]/20">
                  <ShieldCheck size={12} /> WCAG AA Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Accessibility Simulators Bar */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Eye size={14} /> Vision Filter:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "none", label: "Normal Vision" },
                { id: "deuteranopia", label: "Deuteranopia (Green)" },
                { id: "protanopia", label: "Protanopia (Red)" },
                { id: "tritanopia", label: "Tritanopia (Blue)" },
                { id: "achromatopsia", label: "Monochrome" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic("selection");
                    setColorBlindMode(m.id as ColorBlindFilter);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    colorBlindMode === m.id
                      ? "bg-[var(--color-brand-500)] text-white shadow-sm font-bold"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setSimulateReducedMotion((prev) => !prev);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                simulateReducedMotion
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Activity size={13} />
              {simulateReducedMotion ? "Reduced Motion: SIMULATED (ON)" : "Simulate Reduced Motion"}
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 mt-6 border-t border-[var(--color-border)] scrollbar-none">
          {[
            { id: "brand", label: "1. Brand & Tone", icon: Compass },
            { id: "colors", label: "2. Color & WCAG AA", icon: Palette },
            { id: "grammar", label: "3. Grammar Coding", icon: Layers },
            { id: "typography", label: "4. Typography Scale", icon: Type },
            { id: "spatial", label: "5. Spatial & Elevation", icon: Grid },
            { id: "motion", label: "6. Motion Principles", icon: Activity },
            { id: "mascot", label: "7. Mascot States (Barni)", icon: Smile },
            { id: "components", label: "8. Component Kit", icon: Box },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic("selection");
                  setActiveTab(tab.id as SectionTab);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[var(--color-brand-500)] text-white shadow-md shadow-[var(--color-brand-500)]/20"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area Wrapped with Vision Filter */}
      <div
        className={
          colorBlindMode === "deuteranopia"
            ? "sim-deuteranopia"
            : colorBlindMode === "protanopia"
            ? "sim-protanopia"
            : colorBlindMode === "tritanopia"
            ? "sim-tritanopia"
            : colorBlindMode === "achromatopsia"
            ? "sim-achromatopsia"
            : ""
        }
      >
        {/* ──────────────── TAB 1: Brand Personality & Tone ──────────────── */}
        {activeTab === "brand" && (
          <div className="space-y-12">
            {/* 3 Pillars */}
            <div className="space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  Brand Personality Triad
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  Three core pillars guide every screen, error message, button, and illustration across Deutsch Pfad.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {BRAND_PERSONALITY_PILLARS.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] flex flex-col justify-between space-y-4 hover:border-[var(--color-brand-500)]/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[var(--color-brand-400)]">
                          0{idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                          {p.germanTitle}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                        {p.adjective}
                      </h3>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        {p.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[var(--color-border)] space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        UI Manifestation
                      </p>
                      <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                        {p.uiPrinciples.map((rule, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-[var(--color-brand-400)] shrink-0 mt-0.5" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tone of Voice Guide */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  Tone of Voice Guide: &ldquo;This, Not That&rdquo;
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  Concrete copy guidelines across key learner touchpoints. We treat adult learners with intellectual respect, normalizing grammar hurdles into clear structural milestones.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TONE_OF_VOICE_GUIDELINES.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <p className="font-heading text-xs font-bold uppercase tracking-wider text-[var(--color-brand-400)] mb-3">
                        Scenario: {item.scenario}
                      </p>

                      {/* DO */}
                      <div className="p-3.5 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/25 space-y-1 mb-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-success)]">
                          <CheckCircle2 size={14} /> SAY THIS (Deutsch Pfad Voice)
                        </div>
                        <p className="text-xs text-[var(--color-text-primary)] font-medium">
                          &ldquo;{item.doText}&rdquo;
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] italic pt-1">
                          Why: {item.doRationale}
                        </p>
                      </div>

                      {/* DON'T */}
                      <div className="p-3.5 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/25 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-error)]">
                          <AlertCircle size={14} /> NOT THAT (Avoid)
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          &ldquo;{item.dontText}&rdquo;
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)] italic pt-1">
                          Risk: {item.dontRationale}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 2: Colors & WCAG AA ──────────────── */}
        {activeTab === "colors" && (
          <div className="space-y-12">
            {/* Color Philosophy Box */}
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]">
                  <ShieldCheck size={18} />
                </span>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  {COLOR_PHILOSOPHY.title}
                </h3>
              </div>
              <ul className="grid sm:grid-cols-2 gap-3 text-xs text-[var(--color-text-secondary)]">
                {COLOR_PHILOSOPHY.principles.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 bg-[var(--color-surface)]/70 p-3 rounded-xl border border-[var(--color-border)]">
                    <CheckCircle2 size={14} className="text-[var(--color-brand-400)] shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Color Scale Groups */}
            <div className="space-y-10">
              {[
                { title: "Primary Scale (Prussian Indigo)", category: "primary" },
                { title: "Secondary Scale (Slate Steel)", category: "secondary" },
                { title: "Accent Scale (Warm Ochre / Alpine Gold)", category: "accent" },
                { title: "Semantic Scales (Success, Warning, Error, Info)", category: "semantic" },
                { title: "Neutral Scale — Light Mode Surfaces", category: "neutral-light" },
                { title: "Neutral Scale — Dark Mode Surfaces (Midnight)", category: "neutral-dark" },
              ].map((group) => {
                const tokens = COLOR_TOKENS.filter((c) => c.category === group.category);
                return (
                  <div key={group.category} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                      <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                        {group.title}
                      </h3>
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">
                        {tokens.length} Tokens
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {tokens.map((c) => (
                        <div
                          key={c.variable}
                          className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-3 hover:border-[var(--color-border-2)] transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div
                              className="h-16 w-full rounded-[var(--radius-lg)] border border-black/10 flex items-end p-2.5 justify-between shadow-inner"
                              style={{ backgroundColor: c.hex }}
                            >
                              <span className="font-mono text-xs font-bold text-white drop-shadow-md">
                                {c.hex}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(c.hex, c.name)}
                                className="p-1 rounded bg-black/40 text-white hover:bg-black/60 transition-colors"
                                title="Copy hex"
                              >
                                {copiedToken === c.hex ? <Check size={13} /> : <Copy size={13} />}
                              </button>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
                                  {c.name}
                                </h4>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  c.wcagStatus === "AAA"
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : c.wcagStatus === "AA"
                                    ? "bg-indigo-500/15 text-indigo-400"
                                    : "bg-amber-500/15 text-amber-400"
                                }`}>
                                  {c.wcagStatus}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => copyToClipboard(`var(${c.variable})`, c.name)}
                                className="text-[11px] font-mono text-[var(--color-brand-400)] hover:underline block text-left"
                                title="Click to copy CSS variable"
                              >
                                {c.variable}
                              </button>
                              <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2">
                                {c.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between text-[10px] text-[var(--color-text-muted)] font-mono">
                            <span>vs Light: <strong>{c.contrastAgainstLight}:1</strong></span>
                            <span>vs Dark: <strong>{c.contrastAgainstDark}:1</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ──────────────── TAB 3: Grammar Coding ──────────────── */}
        {activeTab === "grammar" && (
          <div className="space-y-12">
            {/* Gender Section */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-[var(--color-brand-400)] text-xs font-bold mb-2">
                  <ShieldCheck size={14} /> Colour-Blind Safe (Protanopia · Deuteranopia · Tritanopia · Monochromacy)
                </div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  German Gender Coding: der / die / das / die (Plural)
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  <strong>Non-Negotiable Rule: Never rely on color alone.</strong> Each grammatical gender couples an accessible hue with an explicit shape marker (Square, Circle, Diamond, Pill), a universal symbol (♂ / ♀ / ◇ / ⚏), and text abbreviations.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {GRAMMAR_GENDER_TOKENS.map((g) => (
                  <div
                    key={g.article}
                    className="p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white font-heading font-bold text-sm shadow-sm ${
                            g.badgeShape === "square"
                              ? "rounded-md"
                              : g.badgeShape === "circle"
                              ? "rounded-full"
                              : g.badgeShape === "diamond"
                              ? "rounded-lg rotate-0"
                              : "rounded-full px-4"
                          }`}
                          style={{ backgroundColor: g.hex }}
                        >
                          <span className="text-base">{g.shapeSymbol}</span>
                          <span>{g.symbol}</span>
                          <span>{g.article}</span>
                        </span>
                        <span className="text-xs text-[var(--color-text-muted)] font-mono uppercase">
                          Shape: {g.badgeShape}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                          {g.englishLabel}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {g.germanGender}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                        <p className="text-[11px] text-[var(--color-text-muted)]">Example Vocabulary:</p>
                        <p className="font-heading text-sm font-bold text-[var(--color-text-primary)] mt-0.5">
                          <span style={{ color: g.hex }}>{g.article}</span> {g.exampleWord.split(" ")[1]}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] italic mt-0.5">
                          {g.exampleEnglish}
                        </p>
                      </div>

                      <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                        {g.accessibilityNotes}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                      <span>Contrast Dark: <strong>{g.contrastOnDark}:1</strong></span>
                      <span className="text-[var(--color-success)] font-bold">Passes AA</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cases Section */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  The Four German Cases: Nominativ, Akkusativ, Dativ, Genitiv
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  Each grammatical case has an assigned hue, functional icon, interrogative question test, and distinct syntactic role.
                </p>
              </div>

              {/* Case selector strip */}
              <div className="grid sm:grid-cols-4 gap-3">
                {GRAMMAR_CASE_TOKENS.map((c) => {
                  const isSelected = selectedCase === c.caseCode;
                  return (
                    <button
                      key={c.caseCode}
                      type="button"
                      onClick={() => {
                        triggerHaptic("selection");
                        setSelectedCase(c.caseCode);
                      }}
                      className={`p-4 rounded-[var(--radius-xl)] border text-left transition-all ${
                        isSelected
                          ? "border-[var(--color-brand-500)] bg-[var(--color-surface-2)] shadow-sm ring-2 ring-[var(--color-brand-500)]/30"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-2)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-mono font-bold text-white"
                          style={{ backgroundColor: c.hex }}
                        >
                          {c.caseCode}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                          {c.questionPrompt}
                        </span>
                      </div>
                      <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                        {c.germanName.split(" ")[0]}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
                        {c.englishRole.split("—")[0]}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Active Case Inspector Card */}
              {(() => {
                const current = GRAMMAR_CASE_TOKENS.find((c) => c.caseCode === selectedCase)!;
                return (
                  <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-white font-mono font-bold text-xs shadow-sm mb-1.5"
                          style={{ backgroundColor: current.hex }}
                        >
                          [{current.caseCode}] {current.germanName}
                        </span>
                        <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                          {current.englishRole}
                        </h3>
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
                        Interrogative Question: <strong>&ldquo;{current.questionPrompt}&rdquo;</strong>
                      </div>
                    </div>

                    {/* Sentence Declension Demo */}
                    <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
                      <p className="text-xs text-[var(--color-text-muted)]">Example in Sentence Context:</p>
                      <p className="font-heading text-lg text-[var(--color-text-primary)]">
                        {current.exampleSentence.split(current.highlightSnippet)[0]}
                        <span
                          className="px-2 py-0.5 rounded font-bold text-white shadow-sm inline-block"
                          style={{ backgroundColor: current.hex }}
                        >
                          {current.highlightSnippet}
                        </span>
                        {current.exampleSentence.split(current.highlightSnippet)[1]}
                      </p>
                      <p className="text-xs text-[var(--color-brand-400)] font-medium pt-1">
                        Grammar Rule: {current.grammarBreakdown}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Interactive Sentence Case Declension Explorer */}
              <div className="p-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    Interactive Multi-Case Sentence Workbench
                  </h3>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Click any highlighted phrase to decode its case & gender
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex flex-wrap items-center gap-2 text-base font-heading">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setInteractiveSentencePart("nom");
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      interactiveSentencePart === "nom"
                        ? "bg-[#0284C7] text-white border-[#0284C7] shadow-md ring-2 ring-[#0284C7]/30"
                        : "bg-[#0284C7]/15 text-[#0284C7] border-[#0284C7]/30 hover:bg-[#0284C7]/25"
                    }`}
                  >
                    [NOM ■] Der nette Kellner
                  </button>

                  <span className="text-[var(--color-text-primary)]">bringt</span>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setInteractiveSentencePart("dat");
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      interactiveSentencePart === "dat"
                        ? "bg-[#D97706] text-white border-[#D97706] shadow-md ring-2 ring-[#D97706]/30"
                        : "bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30 hover:bg-[#D97706]/25"
                    }`}
                  >
                    [DAT ●] der durstigen Dame
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setInteractiveSentencePart("akk");
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      interactiveSentencePart === "akk"
                        ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-md ring-2 ring-[#7C3AED]/30"
                        : "bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30 hover:bg-[#7C3AED]/25"
                    }`}
                  >
                    [AKK ■] den frischen Apfelsaft
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("selection");
                      setInteractiveSentencePart("gen");
                    }}
                    className={`px-2.5 py-1 rounded-lg border transition-all ${
                      interactiveSentencePart === "gen"
                        ? "bg-[#BE123C] text-white border-[#BE123C] shadow-md ring-2 ring-[#BE123C]/30"
                        : "bg-[#BE123C]/15 text-[#BE123C] border-[#BE123C]/30 hover:bg-[#BE123C]/25"
                    }`}
                  >
                    [GEN ◆] des Hauses.
                  </button>
                </div>

                {/* Feedback for selected phrase */}
                <div className="text-xs text-[var(--color-text-secondary)] p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                  {interactiveSentencePart === "nom" && (
                    <p>
                      <strong className="text-[#0284C7]">Nominativ (Masculine · der Kellner):</strong> The subject performing the action. Answer to: <em>Wer bringt den Saft?</em> (Der nette Kellner).
                    </p>
                  )}
                  {interactiveSentencePart === "dat" && (
                    <p>
                      <strong className="text-[#D97706]">Dativ (Feminine · die Dame):</strong> The indirect recipient. Notice feminine &ldquo;die Dame&rdquo; inflects to &ldquo;der Dame&rdquo; in the Dativ! Answer to: <em>Wem bringt er den Saft?</em> (Der durstigen Dame).
                    </p>
                  )}
                  {interactiveSentencePart === "akk" && (
                    <p>
                      <strong className="text-[#7C3AED]">Akkusativ (Masculine · der Apfelsaft):</strong> The direct object receiving the action. Masculine &ldquo;der&rdquo; becomes &ldquo;den&rdquo; + &ldquo;-en&rdquo; adjective ending. Answer to: <em>Wen oder was bringt er?</em> (Den frischen Apfelsaft).
                    </p>
                  )}
                  {interactiveSentencePart === "gen" && (
                    <p>
                      <strong className="text-[#BE123C]">Genitiv (Neuter · das Haus):</strong> Possession of the juice. Takes article &ldquo;des&rdquo; and appends &ldquo;-es&rdquo; to the noun. Answer to: <em>Wessen Apfelsaft?</em> (Des Hauses).
                    </p>
                  )}
                  {!interactiveSentencePart && (
                    <p className="text-[var(--color-text-muted)] italic">
                      Click any colored phrase above to see its complete gender inflection, question test, and case rule.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 4: Typography Scale ──────────────── */}
        {activeTab === "typography" && (
          <div className="space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                Typography System & German Orthography Stress Testing
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                Paired for readability, character, and flawless rendering of German umlauts (ä, ö, ü), capital umlauts (Ä, Ö, Ü), Eszett (ß / ẞ), and compound nouns.
              </p>
            </div>

            {/* Pairing Specimen */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-[var(--color-brand-400)]">
                  Heading Typeface
                </span>
                <h3 className="font-heading text-3xl font-extrabold text-[var(--color-text-primary)]">
                  Outfit Display
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Clean, geometric sans with optical warmth. Used across headers, navigation, lesson cards, and milestone titles.
                </p>
                <div className="p-3 rounded-lg bg-[var(--color-surface-2)] font-heading text-sm text-[var(--color-text-primary)]">
                  Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-[var(--color-accent-400)]">
                  UI & Body Typeface
                </span>
                <h3 className="font-sans text-3xl font-semibold text-[var(--color-text-primary)]">
                  Inter UI
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Engineered for interface legibility on high-density mobile displays. Crisp numerals, punctuation, and clear letter spacing.
                </p>
                <div className="p-3 rounded-lg bg-[var(--color-surface-2)] font-sans text-sm text-[var(--color-text-primary)]">
                  Ää Öö Üü ß (Eszett) 1234567890 !?@€$&% (Umlaut Stress Test)
                </div>
              </div>
            </div>

            {/* German Orthography & Compound Words Stress Test */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
              <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                German Compound Words & Orthography Stress Test
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                German words can stretch past 50 letters without spaces. Our type system uses strict word-break rules (<code>hyphens: auto</code>) to prevent layout breakages on mobile screens.
              </p>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
                  <p className="text-[11px] font-mono text-[var(--color-brand-400)] uppercase font-bold">
                    Super-Compound Word Stress Test
                  </p>
                  <p className="font-heading text-base font-bold text-[var(--color-text-primary)] break-words">
                    Rechtsschutzversicherungsgesellschaften
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Translation: Legal protection insurance companies (39 characters)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
                  <p className="text-[11px] font-mono text-[var(--color-accent-400)] uppercase font-bold">
                    Capital Eszett (ẞ) & Umlauts
                  </p>
                  <p className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    GROSSES STRASSE &bull; STRAẞE &bull; ÜBEREINKOMMEN
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Official German uppercase Eszett (ẞ) support alongside Ä, Ö, Ü.
                  </p>
                </div>
              </div>
            </div>

            {/* Type Scale Table */}
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
              <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Complete Typography Scale
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Token Name</th>
                      <th className="py-2.5 px-3">Size / Line Height</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Font Family</th>
                      <th className="py-2.5 px-3">Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {TYPOGRAPHY_SCALE.map((t, idx) => (
                      <tr key={idx} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[var(--color-brand-400)]">
                          {t.name}
                        </td>
                        <td className="py-3 px-3 text-[var(--color-text-primary)]">
                          {t.size} (lh: {t.lineHeight})
                        </td>
                        <td className="py-3 px-3 text-[var(--color-text-secondary)]">
                          {t.weight}
                        </td>
                        <td className="py-3 px-3 text-[var(--color-text-muted)] font-mono">
                          {t.fontFamily}
                        </td>
                        <td className="py-3 px-3 text-[var(--color-text-secondary)]">
                          {t.usage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 5: Spatial & Elevation ──────────────── */}
        {activeTab === "spatial" && (
          <div className="space-y-12">
            {/* Spacing 4/8px Grid */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
              <div>
                <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  Spacing Scale (4 / 8px Modular Grid)
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                  Every layout margin, padding, and gap snaps to the 4/8px mathematical rhythm for clean visual alignment across mobile and desktop displays.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {SPACING_GRID_TOKENS.map((s) => (
                  <div
                    key={s.token}
                    className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[var(--color-brand-400)]">
                        {s.token}
                      </span>
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        {s.px}
                      </span>
                    </div>
                    <div
                      className="h-3 bg-[var(--color-brand-500)] rounded-sm"
                      style={{ width: s.px }}
                    />
                    <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">
                      {s.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Border Radius & Borders */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Radius */}
              <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Border Radius Scale
                </h3>
                <div className="space-y-3">
                  {RADIUS_TOKENS.map((r) => (
                    <div
                      key={r.token}
                      className="p-3 border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between"
                      style={{ borderRadius: r.value }}
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-[var(--color-text-primary)]">
                          {r.token} ({r.value})
                        </span>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          {r.usage}
                        </p>
                      </div>
                      <div className="w-8 h-8 bg-[var(--color-brand-500)]/20 border border-[var(--color-brand-500)]" style={{ borderRadius: r.value }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Borders & Outlines */}
              <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Border Width & Focus Rules
                </h3>
                <div className="space-y-3">
                  {BORDER_TOKENS.map((b) => (
                    <div
                      key={b.token}
                      className="p-3.5 border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between rounded-xl"
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-[var(--color-text-primary)]">
                          {b.token} ({b.value})
                        </span>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          {b.usage}
                        </p>
                      </div>
                      <div
                        className="w-8 h-8 rounded-md bg-[var(--color-surface)] border-[var(--color-brand-500)]"
                        style={{ borderWidth: b.value }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shadows & Elevations */}
            <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
              <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Elevation & Shadow Tokens
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ELEVATION_TOKENS.map((e) => (
                  <div
                    key={e.token}
                    className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between space-y-3"
                    style={{ boxShadow: e.value }}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[var(--color-brand-400)]">
                        {e.token}
                      </span>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {e.usage}
                      </p>
                    </div>
                    <code className="text-[10px] font-mono text-[var(--color-text-muted)] break-all">
                      {e.value}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 6: Motion Principles ──────────────── */}
        {activeTab === "motion" && (
          <div className="space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                Motion Principles, Physics & Accessibility Rules
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                Animations serve cognitive clarity, never superficial decoration. Tuned with spring physics (damping: 25) and strict adherence to <code>prefers-reduced-motion</code>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {MOTION_PRINCIPLES.map((m) => (
                <div
                  key={m.durationToken}
                  className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[var(--color-brand-400)]">
                        {m.durationToken}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--color-surface-2)] text-[var(--color-text-primary)]">
                        {m.timeMs}ms
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                      {m.usage.split("(")[0]}
                    </h3>
                    <code className="text-[10px] font-mono text-[var(--color-text-muted)] block">
                      {m.easing}
                    </code>
                    <p className="text-xs text-[var(--color-text-secondary)] pt-1">
                      <strong>Rule:</strong> {m.doRule}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/25 text-[11px] text-[var(--color-error)]">
                    <strong>When NOT to animate:</strong> {m.whenNotToAnimate}
                  </div>
                </div>
              ))}
            </div>

            {/* Motion & Reduced Motion Playground */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center space-y-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Interactive Spring Motion & Reduced Motion Testbench
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Click below to trigger spring physics. When &ldquo;Simulate Reduced Motion&rdquo; is enabled above, all transitions become instantaneous (0.01ms).
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 py-4">
                <motion.div
                  key={motionTriggerCount}
                  initial={{ scale: 0.85, rotate: -6 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={
                    simulateReducedMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 20 }
                  }
                  className="p-6 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent-500)] text-white font-heading font-bold text-lg shadow-xl"
                >
                  Spring Physics (Stiffness: 400 · Damping: 20)
                </motion.div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    triggerHaptic("medium");
                    playClickSound();
                    setMotionTriggerCount((c) => c + 1);
                  }}
                  leftIcon={<Play size={15} />}
                >
                  Trigger Spring Transition
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    triggerHaptic("selection");
                    setSimulateReducedMotion((s) => !s);
                  }}
                >
                  Toggle Reduced Motion Simulation
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 7: Mascot States ──────────────── */}
        {activeTab === "mascot" && (
          <div className="space-y-10">
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                Mascot Design Brief: Barni the St. Bernard Alpine Guide
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                Inspired by the heroic rescue dogs of the Swiss-German Alps. Warm, resilient, supportive, and outfitted with 6 expressive emotion states to guide English learners through German grammar.
              </p>
            </div>

            {/* Interactive Mascot Studio */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] grid lg:grid-cols-2 gap-8 items-center">
              {/* Live Mascot Display */}
              <div className="p-8 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-32 bg-[var(--color-brand-500)]/10 blur-2xl pointer-events-none" />

                <DeutschMascot
                  state={mascotState}
                  size={mascotSize}
                  speechBubble={{ de: mascotCustomSpeech }}
                />

                <div className="mt-6 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-brand-400)]">
                    Current State: {mascotState}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    (Click mascot for interactive reaction)
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2.5">
                    Select Expression State (6 Core States)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["happy", "thinking", "celebrating", "encouraging", "sleepy", "surprised"] as MascotState[]).map(
                      (st) => {
                        const isSelected = mascotState === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              triggerHaptic("selection");
                              setMascotState(st);
                              const brief = MASCOT_BRIEF_STATES.find((b) => b.state === st);
                              if (brief) setMascotCustomSpeech(brief.germanCatchphrase);
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                              isSelected
                                ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)] text-white shadow-md"
                                : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                    Custom Speech Bubble Text
                  </label>
                  <input
                    type="text"
                    value={mascotCustomSpeech}
                    onChange={(e) => setMascotCustomSpeech(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                    Mascot Size Preset
                  </label>
                  <div className="flex gap-2">
                    {(["sm", "md", "lg", "xl"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMascotSize(s)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold uppercase ${
                          mascotSize === s
                            ? "border-[var(--color-brand-500)] bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)]"
                            : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6 States Brief Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MASCOT_BRIEF_STATES.map((b) => (
                <div
                  key={b.state}
                  className="p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-bold capitalize text-[var(--color-text-primary)]">
                        {b.state}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                        {b.emotion}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      <strong>Visuals:</strong> {b.visualTriggers}
                    </p>
                    <div className="p-2.5 rounded-lg bg-[var(--color-surface-2)] text-xs">
                      <p className="font-bold text-[var(--color-brand-400)]">
                        &ldquo;{b.germanCatchphrase}&rdquo;
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] italic">
                        {b.englishMeaning}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)] space-y-1 text-[11px] text-[var(--color-text-muted)]">
                    <p><strong>Context:</strong> {b.uiContext}</p>
                    <p><strong>Audio:</strong> {b.audioFeedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ──────────────── TAB 8: Component Kit ──────────────── */}
        {activeTab === "components" && (
          <div className="space-y-12">
            {/* Buttons */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                Button Hierarchy & States
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="md">
                  Primary Button
                </Button>
                <Button variant="secondary" size="md">
                  Secondary Button
                </Button>
                <Button variant="outline" size="md">
                  Outline Button
                </Button>
                <Button variant="ghost" size="md">
                  Ghost Button
                </Button>
                <Button variant="accent" size="md">
                  Accent Action
                </Button>
                <Button variant="danger" size="md">
                  Destructive Action
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} />}>
                  Small with Icon
                </Button>
                <Button variant="primary" size="lg" loading>
                  Loading State
                </Button>
                <Button variant="outline" size="md" disabled>
                  Disabled Button
                </Button>
              </div>
            </div>

            {/* Badges & Pills */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                Badges & CEFR Level Indicators
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="a1">CEFR A1 Breakthrough</Badge>
                <Badge variant="a2">CEFR A2 Waystage</Badge>
                <Badge variant="b1">CEFR B1 Threshold</Badge>
                <Badge variant="b2">CEFR B2 Vantage</Badge>
                <Badge variant="c1">CEFR C1 Effective</Badge>
                <Badge variant="c2">CEFR C2 Mastery</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Badge variant="primary" dot>Active Unit</Badge>
                <Badge variant="accent" dot>14-Day Streak</Badge>
                <Badge variant="success">Completed (100%)</Badge>
                <Badge variant="warning">Needs Review</Badge>
                <Badge variant="error">3 Weak Areas</Badge>
              </div>
            </div>

            {/* Form Controls & German Special Char Helper */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                Form Inputs & German Umlaut Helper Bar
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Global English keyboards lack native keys for ä, ö, ü, and ß. Every Deutsch Pfad text input features a quick-insert toolbar.
              </p>

              <div className="max-w-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--color-text-primary)]">
                    Translation / Free Writing Input
                  </label>
                  {/* Virtual Umlaut Key Bar */}
                  <div className="flex items-center gap-1">
                    {["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"].map((char) => (
                      <button
                        key={char}
                        type="button"
                        onClick={() => insertSpecialChar(char)}
                        className="px-2 py-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-bold hover:bg-[var(--color-brand-500)] hover:text-white transition-colors"
                        title={`Insert ${char}`}
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={sampleInputVal}
                  onChange={(e) => setSampleInputVal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20"
                />
              </div>
            </div>

            {/* Interactive Flashcard & Exercise Option */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Flashcard */}
              <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    Vocabulary Flashcard (3D Flip)
                  </h3>
                  <span className="text-[11px] text-[var(--color-text-muted)]">Click card to flip</span>
                </div>

                <div
                  onClick={() => {
                    playCardFlipSound();
                    triggerHaptic("selection");
                    setIsFlashcardFlipped((f) => !f);
                  }}
                  className="h-44 rounded-2xl p-6 border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface)] cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--color-gender-der)] text-white">
                      [m ■] Maskulinum
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">A1 Vocabulary</span>
                  </div>

                  <div className="text-center py-2">
                    <h4 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                      {isFlashcardFlipped ? "the apple tree" : "der Apfelbaum"}
                    </h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {isFlashcardFlipped ? "English Translation" : "Plural: die Apfelbäume"}
                    </p>
                  </div>

                  <div className="text-center text-[11px] text-[var(--color-brand-400)] font-medium">
                    {isFlashcardFlipped ? "Tap to see German" : "Tap to flip definition"}
                  </div>
                </div>
              </div>

              {/* Grammar Exercise Choice Tile */}
              <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-[var(--color-text-primary)]">
                    Quiz Option State Matrix
                  </h3>
                  <span className="text-[11px] text-[var(--color-text-muted)]">Select an answer</span>
                </div>

                <p className="text-xs text-[var(--color-text-primary)] font-medium">
                  &ldquo;Ich habe gestern mit _______ Lehrer gesprochen.&rdquo;
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: "dem (Dativ Maskulinum)", correct: true },
                    { id: 1, text: "den (Akkusativ Maskulinum)", correct: false },
                    { id: 2, text: "des (Genitiv Maskulinum)", correct: false },
                  ].map((opt) => {
                    const isSelected = selectedExerciseOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedExerciseOption(opt.id);
                          setExerciseEvaluated(true);
                          if (opt.correct) {
                            playSuccessChime();
                            triggerHaptic("success");
                          } else {
                            playErrorBuzzer();
                            triggerHaptic("error");
                          }
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                          exerciseEvaluated && isSelected && opt.correct
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold"
                            : exerciseEvaluated && isSelected && !opt.correct
                            ? "bg-rose-500/15 border-rose-500 text-rose-400 font-bold"
                            : isSelected
                            ? "bg-[var(--color-brand-500)]/15 border-[var(--color-brand-500)] text-[var(--color-brand-400)]"
                            : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:border-[var(--color-brand-500)]/40 text-[var(--color-text-primary)]"
                        }`}
                      >
                        <span>{opt.text}</span>
                        {exerciseEvaluated && isSelected && opt.correct && <CheckCircle2 size={16} />}
                        {exerciseEvaluated && isSelected && !opt.correct && <XCircle size={16} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Progress Bars & Rings */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
              <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                Progress Visualization
              </h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-[var(--color-text-primary)]">A1 Goal Readiness</span>
                      <span className="text-[var(--color-brand-400)] font-bold">78%</span>
                    </div>
                    <ProgressBar value={78} color="brand" size="md" />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-[var(--color-text-primary)]">Daily Flashcard Goal (18/20)</span>
                      <span className="text-[var(--color-accent-400)] font-bold">90%</span>
                    </div>
                    <ProgressBar value={90} color="accent" size="md" />
                  </div>
                </div>

                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <ProgressRing progress={85} size={84} strokeWidth={7} color="var(--color-brand-500)" />
                    <p className="text-[11px] font-bold text-[var(--color-text-primary)] mt-2">Grammar Mastery</p>
                  </div>
                  <div className="text-center">
                    <ProgressRing progress={65} size={84} strokeWidth={7} color="var(--color-accent-500)" />
                    <p className="text-[11px] font-bold text-[var(--color-text-primary)] mt-2">Speaking Prep</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sound & Haptic Trigger Showcase */}
            <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                    Web Audio Synthesizer & Haptic Feedback Kit
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    100% native Web Audio API synthesis without external audio asset downloads.
                  </p>
                </div>
                <AudioToggle />
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    triggerHaptic("success");
                    playSuccessChime();
                  }}
                  leftIcon={<Volume2 size={14} className="text-[var(--color-success)]" />}
                >
                  Success Chime (E5→A5)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    triggerHaptic("error");
                    playErrorBuzzer();
                  }}
                  leftIcon={<Volume2 size={14} className="text-[var(--color-error)]" />}
                >
                  Mistake Buzzer
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    triggerHaptic("success");
                    playMilestoneChime();
                    fireConfetti();
                  }}
                  leftIcon={<Sparkles size={14} className="text-[var(--color-accent-400)]" />}
                >
                  Milestone Fanfare + Confetti
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    triggerHaptic("medium");
                    playCardFlipSound();
                  }}
                  leftIcon={<Volume2 size={14} className="text-[var(--color-brand-400)]" />}
                >
                  Card Flip Acoustic
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
