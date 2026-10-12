"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, X, Sparkles, ShieldCheck, HelpCircle,
  ArrowRight, Globe, Lock, CreditCard, Award, Flame,
  Zap, HeartHandshake, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeutschMascot } from "@/components/mascot/DeutschMascot";
import {
  SUBSCRIPTION_PLANS,
  detectUserCurrency,
  formatPrice,
  activateSubscription,
  SupportedCurrency,
  BillingCycle,
  SubscriptionPlanId,
} from "@/lib/billingService";
import { playSuccessChime, triggerHaptic } from "@/lib/soundEffects";
import { fireConfetti } from "@/lib/confetti";
import { useToast } from "@/components/ui/Toast";

const CURRENCIES: { code: SupportedCurrency; label: string; flag: string }[] = [
  { code: "USD", label: "USD ($)", flag: "🇺🇸" },
  { code: "EUR", label: "EUR (€)", flag: "🇪🇺" },
  { code: "GBP", label: "GBP (£)", flag: "🇬🇧" },
  { code: "INR", label: "INR (₹)", flag: "🇮🇳" },
  { code: "CAD", label: "CAD (C$)", flag: "🇨🇦" },
  { code: "AUD", label: "AUD (A$)", flag: "🇦🇺" },
];

const COMPARISON_ROWS = [
  { feature: "A1 Survival Curriculum (Units 1–3)", free: true, pro: true, proPlus: true },
  { feature: "Full A1–B2 Curriculum (All 24 Units)", free: false, pro: true, proPlus: true },
  { feature: "AI Voice Conversation Practice", free: "15 min/mo", pro: "150 min/mo", proPlus: "Unlimited" },
  { feature: "CEFR Writing Feedback & Rubric Grading", free: "3 / month", pro: "30 / month", proPlus: "Unlimited" },
  { feature: "Full Goethe & telc Mock Exam Simulations", free: false, pro: true, proPlus: true },
  { feature: "Graded Stories Library with Synced Audio", free: "2 Stories", pro: "All Stories", proPlus: "All Stories" },
  { feature: "Slow (0.75x) Speech & Tap-to-Translate", free: true, pro: true, proPlus: true },
  { feature: "Offline Audio Downloads (MP3)", free: false, pro: true, proPlus: true },
  { feature: "Adaptive Mastery & Weak-Topic Targeting", free: "Basic", pro: "Full AI Engine", proPlus: "Full AI Engine" },
  { feature: "Official CEFR Level Completion Certificates", free: false, pro: true, proPlus: true },
  { feature: "Human Examiner Rubric Review Option", free: false, pro: false, proPlus: true },
  { feature: "7-Day Free Trial Included", free: false, pro: true, proPlus: true },
];

const FAQS = [
  {
    q: "How does the 7-day free trial work?",
    a: "When you start a 7-day free trial on Deutsch Pro or Pro Plus, you get complete, unrestricted access immediately. You will not be charged anything today. You can cancel with a single click anytime during the 7 days in your billing portal.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support all major international Credit/Debit cards (Visa, MasterCard, Amex) via Stripe worldwide. In India, we support UPI (Google Pay, PhonePe, Paytm), NetBanking, and RuPay cards via Razorpay with localized purchasing power pricing.",
  },
  {
    q: "Can I switch between monthly and annual plans?",
    a: "Yes! You can switch between monthly and annual billing at any time from your billing portal. Any remaining credit from your current billing cycle will be prorated automatically.",
  },
  {
    q: "What happens if I pause my subscription?",
    a: "If you need a break or are travelling, you can pause your subscription for 1 to 3 months. Your daily streak, saved flashcards, and progress will remain frozen and safe, and billing will be paused until you choose to resume.",
  },
  {
    q: "Are the mock exams official Goethe or telc certificates?",
    a: "DeutschPfad mock exams are modeled strictly on authentic Goethe-Zertifikat and telc exam formats with time limits and CEFR rubrics. Upon passing, you receive an official DeutschPfad Level Completion Certificate demonstrating your readiness.",
  },
];

export function PricingView() {
  const { addToast } = useToast();
  const detected = detectUserCurrency();
  const [currency, setCurrency] = useState<SupportedCurrency>(detected.currency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanId | null>(null);

  const handleSelectPlan = (planId: SubscriptionPlanId) => {
    if (planId === "free") {
      addToast({ message: "You are already on the Free tier. Explore any A1 unit!", type: "info" });
      return;
    }

    setLoadingPlan(planId);
    triggerHaptic("success");

    setTimeout(() => {
      activateSubscription({
        userId: "demo-user",
        planId,
        billingCycle,
        currency,
        startTrial: true,
      });

      playSuccessChime();
      fireConfetti();
      setLoadingPlan(null);
      addToast({
        message: `7-Day Free Trial started on ${planId === "pro" ? "Deutsch Pro" : "Pro Plus"}!`,
        type: "success",
      });
    }, 700);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/15 border border-[var(--color-brand-500)]/30 text-[var(--color-brand-400)] text-xs font-semibold">
          <Sparkles size={14} /> Fair Regional Pricing · Cancel Anytime
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight">
          Invest in Your German Fluency
        </h1>

        <p className="text-base sm:text-lg text-[var(--color-text-secondary)]">
          Master authentic German with AI voice conversations, Goethe & telc exam simulations, and personalized spaced repetition. Start with a <strong>7-day free trial</strong>.
        </p>

        {/* Currency Picker & Billing Switcher Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Billing Cycle Switch */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-sm">
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setBillingCycle("monthly");
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                setBillingCycle("annual");
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              Annual Billing
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-accent-500)]/20 text-[var(--color-accent-400)] font-bold">
                Save 25% (2 Months Free)
              </span>
            </button>
          </div>

          {/* Regional Currency Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs">
            <Globe size={14} className="text-[var(--color-text-muted)]" />
            <select
              value={currency}
              onChange={(e) => {
                triggerHaptic("selection");
                setCurrency(e.target.value as SupportedCurrency);
              }}
              className="bg-transparent text-[var(--color-text-primary)] font-semibold focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code} className="bg-[var(--color-surface)]">
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const priceRecord = plan.pricing[currency] || plan.pricing.USD;
          const isPro = plan.id === "pro";
          const isProPlus = plan.id === "pro_plus";
          const isFree = plan.id === "free";

          const displayMonthlyAmount =
            billingCycle === "annual"
              ? priceRecord.monthlyEquivalentAnnual
              : priceRecord.monthlyAmount;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`p-6 sm:p-8 rounded-[var(--radius-2xl)] border flex flex-col justify-between relative transition-all shadow-[var(--shadow-md)] ${
                isPro
                  ? "border-[var(--color-brand-500)] bg-[var(--color-surface)] shadow-[0_0_30px_rgba(59,130,246,0.15)] ring-2 ring-[var(--color-brand-500)]"
                  : isProPlus
                  ? "border-[var(--color-accent-500)] bg-[var(--color-surface)] shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-[var(--color-accent-500)]/50"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                      isPro
                        ? "bg-[var(--color-brand-500)] text-white"
                        : "bg-[var(--color-accent-500)] text-white"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
                    {plan.name}
                  </h3>
                  {plan.trialDays > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-success)]/15 text-[var(--color-success)]">
                      7-Day Free Trial
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] mt-1 min-h-[32px]">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-[var(--color-border)]">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-extrabold text-[var(--color-text-primary)]">
                      {formatPrice(displayMonthlyAmount, currency)}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">/month</span>
                  </div>

                  {billingCycle === "annual" && !isFree && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Billed annually at {formatPrice(priceRecord.annualAmount, currency)}/year
                    </p>
                  )}
                  {isFree && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Free forever, no credit card required
                    </p>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 text-xs text-[var(--color-text-secondary)]">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={15}
                        className={`shrink-0 mt-0.5 ${
                          isPro
                            ? "text-[var(--color-brand-400)]"
                            : isProPlus
                            ? "text-[var(--color-accent-500)]"
                            : "text-[var(--color-success)]"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                <Button
                  variant={isPro ? "primary" : isProPlus ? "accent" : "outline"}
                  size="lg"
                  fullWidth
                  loading={loadingPlan === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  rightIcon={!isFree ? <ArrowRight size={16} /> : undefined}
                  className={`font-bold text-sm ${
                    isPro ? "shadow-[var(--shadow-glow)]" : ""
                  }`}
                >
                  {isFree
                    ? "Current Free Plan"
                    : `Start 7-Day Free Trial ($0 Today)`}
                </Button>

                {!isFree && (
                  <p className="text-[11px] text-center text-[var(--color-text-muted)] mt-2">
                    Cancel anytime before trial ends.
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust Strip */}
      <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="flex items-center justify-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck size={18} className="text-[var(--color-brand-400)]" />
          <span><strong>14-Day Guarantee:</strong> Full refund if you are not 100% satisfied.</span>
        </div>
        <div className="flex items-center justify-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
          <Lock size={18} className="text-[var(--color-success)]" />
          <span><strong>SSL 256-Bit Encrypted:</strong> Powered by Stripe & Razorpay.</span>
        </div>
        <div className="flex items-center justify-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
          <HeartHandshake size={18} className="text-[var(--color-accent-500)]" />
          <span><strong>Pause Anytime:</strong> Freeze your streak and plan with 1 click.</span>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            Compare Plan Features Side-by-Side
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Choose the depth of immersion that best matches your German goals.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <th className="py-3 px-4 font-heading font-bold text-sm">Feature</th>
                <th className="py-3 px-4 text-center font-heading font-bold">Free</th>
                <th className="py-3 px-4 text-center font-heading font-bold text-[var(--color-brand-400)]">Pro</th>
                <th className="py-3 px-4 text-center font-heading font-bold text-[var(--color-accent-400)]">Pro Plus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-[var(--color-surface-2)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[var(--color-text-primary)]">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-4 text-center text-[var(--color-text-secondary)]">
                    {typeof row.free === "boolean" ? (
                      row.free ? (
                        <Check size={16} className="text-[var(--color-success)] mx-auto" />
                      ) : (
                        <X size={16} className="text-[var(--color-text-muted)] mx-auto" />
                      )
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-[var(--color-brand-400)]">
                    {typeof row.pro === "boolean" ? (
                      row.pro ? (
                        <Check size={16} className="text-[var(--color-brand-400)] mx-auto" />
                      ) : (
                        <X size={16} className="text-[var(--color-text-muted)] mx-auto" />
                      )
                    ) : (
                      row.pro
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[var(--color-accent-400)]">
                    {typeof row.proPlus === "boolean" ? (
                      row.proPlus ? (
                        <Check size={16} className="text-[var(--color-accent-500)] mx-auto" />
                      ) : (
                        <X size={16} className="text-[var(--color-text-muted)] mx-auto" />
                      )
                    ) : (
                      row.proPlus
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mascot Recommendation Box */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface-2)] to-[var(--color-surface)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <DeutschMascot
            state="celebrating"
            size="lg"
            speechBubble={{
              de: "Bereit für deinen Sprung nach Deutschland?",
              en: "Ready for your leap to Germany?",
            }}
          />
          <div>
            <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
              Unsure which plan is right for you?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
              Start with <strong>Deutsch Pro on a 7-day free trial</strong>. It gives you 150 minutes of AI voice practice and full Goethe/telc simulations — more than enough to test your wings risk-free!
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleSelectPlan("pro")}
          rightIcon={<Sparkles size={16} />}
          className="shrink-0 shadow-[var(--shadow-glow)]"
        >
          Try Pro Free for 7 Days
        </Button>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Everything you need to know about billing, trials, and cancellations.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-[var(--color-text-muted)] text-base font-bold">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed border-t border-[var(--color-border)]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
