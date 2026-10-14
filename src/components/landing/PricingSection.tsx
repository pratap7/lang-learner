"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, ShieldCheck, ArrowRight, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  REGIONAL_PRICING_CATALOG,
  detectUserCurrency,
  SupportedCurrency,
  BillingCycle,
} from "@/lib/billingService";

const CURRENCIES: { code: SupportedCurrency; label: string; symbol: string }[] = [
  { code: "EUR", label: "EUR (€) · Europe", symbol: "€" },
  { code: "USD", label: "USD ($) · United States / Global", symbol: "$" },
  { code: "GBP", label: "GBP (£) · United Kingdom", symbol: "£" },
  { code: "INR", label: "INR (₹) · India (PPP Adjusted)", symbol: "₹" },
  { code: "CAD", label: "CAD (C$) · Canada", symbol: "C$" },
  { code: "AUD", label: "AUD (A$) · Australia", symbol: "A$" },
];

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [currency, setCurrency] = useState<SupportedCurrency>("EUR");

  // Automatically detect user currency on mount
  useEffect(() => {
    try {
      const userLocale = navigator.language || "";
      const detection = detectUserCurrency(userLocale);
      if (detection && detection.currency) {
        setCurrency(detection.currency);
      }
    } catch {
      // Default fallback EUR
    }
  }, []);

  const freePrices = REGIONAL_PRICING_CATALOG.free[currency];
  const proPrices = REGIONAL_PRICING_CATALOG.pro[currency];
  const proPlusPrices = REGIONAL_PRICING_CATALOG.pro_plus[currency];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-[var(--color-surface)]/40">
      <div className="container-xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 text-xs font-semibold text-[var(--color-brand-400)] mb-3">
            <Sparkles size={13} /> Transparent Pricing
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight mb-4">
            Invest in fluency, not endless classroom tuition
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            A fraction of the cost of in-person language institutes (€400–€800 per level). Start 100% free with no credit card required.
          </p>
        </div>

        {/* Controls: Monthly / Annual Toggle & Currency Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center p-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-sm">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-[var(--color-brand-500)] text-white shadow-sm font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-bold">
                Save 33%
              </span>
            </button>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
            <Globe size={14} className="text-[var(--color-brand-400)]" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              aria-label="Select currency"
              className="bg-transparent text-xs font-medium text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* TIER 1: FREE EXPLORER */}
          <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Free Starter
                </span>
                <Badge variant="default" size="sm">Forever Free</Badge>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Perfect for complete beginners exploring the German language foundation.
              </p>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold text-[var(--color-text-primary)]">
                    {freePrices.symbol}0
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">/ forever</span>
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Zero credit card required to start
                </div>
              </div>

              {/* Feature Inclusions */}
              <div className="space-y-2.5 pt-4 border-t border-[var(--color-border)]/60 text-xs">
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Full access to A1 Units 1–3</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>20 Spaced Repetition flashcards / day</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>2 Goethe rubric writing evaluations / mo</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Adaptive CEFR diagnostic placement test</span>
                </div>
                <div className="flex items-start gap-2 text-[var(--color-text-muted)]">
                  <span className="w-3.5 h-3.5 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[10px] mr-0.5">✕</span>
                  <span>B2–C2 Advanced modules not included</span>
                </div>
              </div>
            </div>

            <Link href="/auth/signup" className="w-full">
              <Button variant="secondary" size="md" className="w-full min-h-[44px]">
                Start Learning Free
              </Button>
            </Link>
          </div>

          {/* TIER 2: PRO FLUENCY (FEATURED) */}
          <div className="p-8 rounded-[var(--radius-2xl)] border-2 border-[var(--color-brand-500)] bg-[var(--color-surface)] shadow-2xl relative flex flex-col justify-between space-y-6 scale-105 z-10">
            {/* Best Value Ribbon */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-accent-500)] text-white text-[11px] font-bold shadow-md">
                ★ Most Popular for Exam Success
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Pro Fluency
                </span>
                <Badge variant="primary" size="sm">7-Day Free Trial</Badge>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                The complete structured engine for learners targeting official B1/B2/C1 certification.
              </p>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)]">
                    {proPrices.symbol}
                    {billingCycle === "annual"
                      ? proPrices.monthlyEquivalentAnnual
                      : proPrices.monthlyAmount}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    / month {billingCycle === "annual" ? "(billed annually)" : ""}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  {billingCycle === "annual"
                    ? `Billed as ${proPrices.symbol}${proPrices.annualAmount}/year (save ${proPrices.discountPercentage}%)`
                    : "Cancel anytime with 1-click"}
                </div>
              </div>

              {/* Feature Inclusions */}
              <div className="space-y-2.5 pt-4 border-t border-[var(--color-border)]/60 text-xs">
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    Complete A1 through C2 syllabus unlocked
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Unlimited SM-2 Spaced Repetition cards</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Unlimited Goethe &amp; telc writing rubric evaluations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>AI Conversation &amp; Pronunciation Coach</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Full Mistake Notebook &amp; weak spot re-injection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Timed Mock Exams &amp; Readiness Predictor</span>
                </div>
              </div>
            </div>

            <Link href="/auth/signup" className="w-full">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight size={16} />}
                className="w-full min-h-[46px] shadow-[var(--shadow-glow)] font-semibold"
              >
                Start 7-Day Free Trial
              </Button>
            </Link>
          </div>

          {/* TIER 3: PRO PLUS / INTENSIVE */}
          <div className="p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                  Pro Plus / Career
                </span>
                <Badge variant="default" size="sm">Intensive</Badge>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                For medical licensure (FSP), rapid Blue Card settlement, and academic research.
              </p>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold text-[var(--color-text-primary)]">
                    {proPlusPrices.symbol}
                    {billingCycle === "annual"
                      ? proPlusPrices.monthlyEquivalentAnnual
                      : proPlusPrices.monthlyAmount}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    / month {billingCycle === "annual" ? "(billed annually)" : ""}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  {billingCycle === "annual"
                    ? `Billed as ${proPlusPrices.symbol}${proPlusPrices.annualAmount}/year`
                    : "Cancel anytime with 1-click"}
                </div>
              </div>

              {/* Feature Inclusions */}
              <div className="space-y-2.5 pt-4 border-t border-[var(--color-border)]/60 text-xs">
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    Everything in Pro Fluency
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Specialized Medical (FSP) &amp; Legal modules</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Priority human tutor review on essay drafts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Offline audio downloads for travel</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Official CEFR Course Certificates</span>
                </div>
              </div>
            </div>

            <Link href="/auth/signup" className="w-full">
              <Button variant="secondary" size="md" className="w-full min-h-[44px]">
                Start Pro Plus Trial
              </Button>
            </Link>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[var(--color-brand-400)]" />
            14-Day Money-Back Guarantee
          </span>
          <span>·</span>
          <span>Cancel in 1 click anytime</span>
          <span>·</span>
          <span>Strict EU GDPR Data Privacy</span>
        </div>
      </div>
    </section>
  );
}
