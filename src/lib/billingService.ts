/**
 * DeutschPfad Subscription Billing Engine
 * - Plans: Free, Pro, Pro Plus
 * - Billing Cycles: Monthly, Annual (with 25% annual savings)
 * - 7-Day Free Trial on paid tiers
 * - Regional Purchasing Power Parity (PPP) Pricing: US/Global (USD), Eurozone (EUR), UK (GBP), India (INR), etc.
 * - Multi-Gateway / MoR Provider Routing: Stripe + Razorpay (for India UPI/Netbanking) & Paddle/LemonSqueezy
 * - Entitlements Management, Customer Billing Portal, Invoices, and Win-Back Cancellation Offers
 */

export type SubscriptionPlanId = "free" | "pro" | "pro_plus";
export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "paused" | "canceled";
export type PaymentProvider = "stripe" | "razorpay" | "paddle" | "lemonsqueezy";
export type SupportedCurrency = "USD" | "EUR" | "GBP" | "INR" | "CAD" | "AUD";

export interface RegionalPrice {
  currency: SupportedCurrency;
  symbol: string;
  monthlyAmount: number; // in whole units, e.g. 12 = $12
  annualAmount: number;  // total per year, e.g. 99 = $99/yr
  monthlyEquivalentAnnual: number; // e.g. 8.25/mo
  discountPercentage: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

export interface SubscriptionPlanDefinition {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  trialDays: number;
  features: string[];
  entitlements: {
    aiConversationMinutesPerMonth: number;
    writingSubmissionsPerMonth: number;
    unlimitedGrammarLessons: boolean;
    mockExamsIncluded: boolean;
    officialCertificates: boolean;
    audioOfflineDownloads: boolean;
    spacedRepetitionPriority: boolean;
    tutorFeedback: boolean;
  };
  pricing: Record<SupportedCurrency, RegionalPrice>;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currency: SupportedCurrency;
  currentPrice: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  isPaused: boolean;
  pauseResumesAt?: string;
  provider: PaymentProvider;
  providerSubscriptionId: string;
  providerCustomerId: string;
  winBackDiscountPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BillingInvoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: SupportedCurrency;
  status: "paid" | "open" | "void" | "refunded";
  invoiceNumber: string;
  billingDate: string;
  periodStart: string;
  periodEnd: string;
  pdfDownloadUrl: string;
  provider: PaymentProvider;
}

export interface CancellationSurveyRecord {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  reason: "price" | "time" | "goal_reached" | "missing_features" | "bugs" | "other";
  feedback?: string;
  winBackOffered: "discount_50" | "pause_1mo" | "none";
  winBackAccepted: boolean;
  createdAt: string;
}

/* ──────────────── Regional Pricing Catalog ──────────────── */

export const REGIONAL_PRICING_CATALOG: Record<SubscriptionPlanId, Record<SupportedCurrency, RegionalPrice>> = {
  free: {
    USD: { currency: "USD", symbol: "$", monthlyAmount: 0, annualAmount: 0, monthlyEquivalentAnnual: 0, discountPercentage: 0 },
    EUR: { currency: "EUR", symbol: "€", monthlyAmount: 0, annualAmount: 0, monthlyEquivalentAnnual: 0, discountPercentage: 0 },
    GBP: { currency: "GBP", symbol: "£", monthlyAmount: 0, annualAmount: 0, monthlyEquivalentAnnual: 0, discountPercentage: 0 },
    INR: { currency: "INR", symbol: "₹", monthlyAmount: 0, annualAmount: 0, monthlyEquivalentAnnual: 0, discountPercentage: 0 },
    CAD: { currency: "CAD", symbol: "C$", monthlyAmount: 0, annualAmount: 0, monthlyEquivalentAnnual: 0, discountPercentage: 0 },
    AUD: { currency: "AUD", symbol: "A$", monthlyAmount: 0, annualAmount: 0, monthlyEquivalentAnnual: 0, discountPercentage: 0 },
  },
  pro: {
    USD: { currency: "USD", symbol: "$", monthlyAmount: 14, annualAmount: 108, monthlyEquivalentAnnual: 9, discountPercentage: 35 },
    EUR: { currency: "EUR", symbol: "€", monthlyAmount: 12, annualAmount: 96, monthlyEquivalentAnnual: 8, discountPercentage: 33 },
    GBP: { currency: "GBP", symbol: "£", monthlyAmount: 11, annualAmount: 84, monthlyEquivalentAnnual: 7, discountPercentage: 36 },
    INR: { currency: "INR", symbol: "₹", monthlyAmount: 499, annualAmount: 3999, monthlyEquivalentAnnual: 333, discountPercentage: 33 },
    CAD: { currency: "CAD", symbol: "C$", monthlyAmount: 18, annualAmount: 144, monthlyEquivalentAnnual: 12, discountPercentage: 33 },
    AUD: { currency: "AUD", symbol: "A$", monthlyAmount: 20, annualAmount: 156, monthlyEquivalentAnnual: 13, discountPercentage: 35 },
  },
  pro_plus: {
    USD: { currency: "USD", symbol: "$", monthlyAmount: 28, annualAmount: 228, monthlyEquivalentAnnual: 19, discountPercentage: 32 },
    EUR: { currency: "EUR", symbol: "€", monthlyAmount: 25, annualAmount: 199, monthlyEquivalentAnnual: 16.5, discountPercentage: 34 },
    GBP: { currency: "GBP", symbol: "£", monthlyAmount: 22, annualAmount: 179, monthlyEquivalentAnnual: 15, discountPercentage: 32 },
    INR: { currency: "INR", symbol: "₹", monthlyAmount: 999, annualAmount: 7999, monthlyEquivalentAnnual: 666, discountPercentage: 33 },
    CAD: { currency: "CAD", symbol: "C$", monthlyAmount: 36, annualAmount: 288, monthlyEquivalentAnnual: 24, discountPercentage: 33 },
    AUD: { currency: "AUD", symbol: "A$", monthlyAmount: 40, annualAmount: 319, monthlyEquivalentAnnual: 26.5, discountPercentage: 34 },
  },
};

/* ──────────────── Subscription Plan Definitions ──────────────── */

export const SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: "free",
    name: "Free Explorer",
    tagline: "Start learning essential German basics at your own pace",
    trialDays: 0,
    features: [
      "Access to complete A1 Unit 1-3 modules",
      "15 minutes / month AI conversation practice",
      "3 AI writing feedback evaluations / month",
      "Standard SM-2 flashcard review",
      "Daily streak tracking & basic achievements",
    ],
    entitlements: {
      aiConversationMinutesPerMonth: 15,
      writingSubmissionsPerMonth: 3,
      unlimitedGrammarLessons: false,
      mockExamsIncluded: false,
      officialCertificates: false,
      audioOfflineDownloads: false,
      spacedRepetitionPriority: false,
      tutorFeedback: false,
    },
    pricing: REGIONAL_PRICING_CATALOG.free,
  },
  {
    id: "pro",
    name: "Deutsch Pro",
    tagline: "The fastest pathway from zero to conversational German (A1-B2)",
    badge: "Most Popular",
    isPopular: true,
    trialDays: 7,
    features: [
      "Everything in Free, plus:",
      "150 minutes / month AI voice conversation practice",
      "30 comprehensive writing feedback submissions / month",
      "Full access to all A1, A2, B1 & B2 interactive courses",
      "Full Goethe-Zertifikat & telc simulated mock exams",
      "Graded short stories library with synced audio & slow mode",
      "Priority SM-2 spaced repetition algorithm scheduling",
      "Ad-free focused learning experience",
    ],
    entitlements: {
      aiConversationMinutesPerMonth: 150,
      writingSubmissionsPerMonth: 30,
      unlimitedGrammarLessons: true,
      mockExamsIncluded: true,
      officialCertificates: true,
      audioOfflineDownloads: true,
      spacedRepetitionPriority: true,
      tutorFeedback: false,
    },
    pricing: REGIONAL_PRICING_CATALOG.pro,
  },
  {
    id: "pro_plus",
    name: "Pro Plus Immersion",
    tagline: "Master German with unlimited AI tutoring & verified certification",
    badge: "Best Value",
    trialDays: 7,
    features: [
      "Everything in Pro, plus:",
      "UNLIMITED AI conversation practice (zero minute caps)",
      "UNLIMITED writing evaluations with rubric grading",
      "Personalized exam readiness coaching & projected dates",
      "Official DeutschPfad CEFR level graduation certificates",
      "Human examiner rubric feedback option",
      "Unlimited native audio downloads for offline flights/trains",
      "VIP priority support & early feature access",
    ],
    entitlements: {
      aiConversationMinutesPerMonth: 99999,
      writingSubmissionsPerMonth: 99999,
      unlimitedGrammarLessons: true,
      mockExamsIncluded: true,
      officialCertificates: true,
      audioOfflineDownloads: true,
      spacedRepetitionPriority: true,
      tutorFeedback: true,
    },
    pricing: REGIONAL_PRICING_CATALOG.pro_plus,
  },
];

/* ──────────────── Currency & Regional Detection ──────────────── */

export function detectUserCurrency(countryCodeOrLocale?: string): {
  currency: SupportedCurrency;
  countryCode: string;
  recommendedProvider: PaymentProvider;
} {
  const code = (countryCodeOrLocale || "").toUpperCase();

  // 1. India specific routing (Stripe + Razorpay for UPI / local cards)
  if (code === "IN" || code.includes("-IN")) {
    return { currency: "INR", countryCode: "IN", recommendedProvider: "razorpay" };
  }

  // 2. Eurozone
  const eurozone = ["DE", "AT", "CH", "FR", "IT", "ES", "NL", "BE", "PT", "IE", "GR", "FI"];
  if (eurozone.some((c) => code === c || code.includes(`-${c}`))) {
    return { currency: "EUR", countryCode: "DE", recommendedProvider: "stripe" };
  }

  // 3. United Kingdom
  if (code === "GB" || code === "UK" || code.includes("-GB")) {
    return { currency: "GBP", countryCode: "GB", recommendedProvider: "stripe" };
  }

  // 4. Canada
  if (code === "CA" || code.includes("-CA")) {
    return { currency: "CAD", countryCode: "CA", recommendedProvider: "stripe" };
  }

  // 5. Australia
  if (code === "AU" || code.includes("-AU")) {
    return { currency: "AUD", countryCode: "AU", recommendedProvider: "stripe" };
  }

  // Default to USD & Stripe / MoR
  return { currency: "USD", countryCode: "US", recommendedProvider: "stripe" };
}

export function formatPrice(amount: number, currency: SupportedCurrency): string {
  const symbolMap: Record<SupportedCurrency, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
  };
  const sym = symbolMap[currency] || "$";
  if (currency === "INR") {
    return `${sym}${amount.toLocaleString("en-IN")}`;
  }
  return `${sym}${amount}`;
}

export function getPlanDefinition(planId: SubscriptionPlanId): SubscriptionPlanDefinition {
  const found = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  return found || SUBSCRIPTION_PLANS[0];
}

/* ──────────────── Client State & Storage Management ──────────────── */

const STORAGE_SUBSCRIPTION_KEY = "deutschpfad_active_subscription_v1";
const STORAGE_INVOICES_KEY = "deutschpfad_invoices_v1";
const STORAGE_SURVEYS_KEY = "deutschpfad_cancellation_surveys_v1";

export function getDefaultSubscription(userId: string = "demo-user"): UserSubscription {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  return {
    id: "sub_free_default",
    userId,
    planId: "free",
    status: "active",
    billingCycle: "monthly",
    currency: "USD",
    currentPrice: 0,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: nextMonth.toISOString(),
    cancelAtPeriodEnd: false,
    isPaused: false,
    provider: "stripe",
    providerSubscriptionId: "sub_free_000",
    providerCustomerId: "cus_demo_000",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function getUserSubscription(userId: string = "demo-user"): UserSubscription {
  if (typeof window === "undefined") {
    return getDefaultSubscription(userId);
  }
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  const def = getDefaultSubscription(userId);
  saveUserSubscription(def);
  return def;
}

export function saveUserSubscription(subscription: UserSubscription): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_SUBSCRIPTION_KEY, JSON.stringify(subscription));
  } catch {}
}

export function getSubscriptionInvoices(subscriptionId?: string): BillingInvoice[] {
  const defaultInvoices: BillingInvoice[] = [
    {
      id: "inv_101",
      subscriptionId: subscriptionId || "sub_pro_123",
      amount: 14,
      currency: "USD",
      status: "paid",
      invoiceNumber: "DP-2026-00412",
      billingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      periodEnd: new Date().toISOString().split("T")[0],
      pdfDownloadUrl: "#download-receipt",
      provider: "stripe",
    },
    {
      id: "inv_102",
      subscriptionId: subscriptionId || "sub_pro_123",
      amount: 14,
      currency: "USD",
      status: "paid",
      invoiceNumber: "DP-2026-00628",
      billingDate: new Date().toISOString().split("T")[0],
      periodStart: new Date().toISOString().split("T")[0],
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      pdfDownloadUrl: "#download-receipt",
      provider: "stripe",
    },
  ];

  if (typeof window === "undefined") return defaultInvoices;
  try {
    const raw = localStorage.getItem(STORAGE_INVOICES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return defaultInvoices;
}

/* ──────────────── Lifecycle Subscription Operations ──────────────── */

/**
 * Initiates 7-Day Free Trial or instant plan activation
 */
export function activateSubscription({
  userId,
  planId,
  billingCycle,
  currency,
  startTrial = true,
}: {
  userId: string;
  planId: SubscriptionPlanId;
  billingCycle: BillingCycle;
  currency: SupportedCurrency;
  startTrial?: boolean;
}): UserSubscription {
  const planDef = getPlanDefinition(planId);
  const priceRecord = planDef.pricing[currency] || planDef.pricing.USD;
  const currentPrice = billingCycle === "monthly" ? priceRecord.monthlyAmount : priceRecord.annualAmount;

  const now = new Date();
  const trialEnd = new Date(now.getTime() + (planDef.trialDays || 7) * 24 * 60 * 60 * 1000);
  const periodEndDays = billingCycle === "annual" ? 365 : 30;
  const periodEnd = new Date(now.getTime() + periodEndDays * 24 * 60 * 60 * 1000);

  const provider = currency === "INR" ? "razorpay" : "stripe";

  const updatedSub: UserSubscription = {
    id: `sub_${planId}_${Date.now()}`,
    userId,
    planId,
    status: startTrial && planDef.trialDays > 0 ? "trialing" : "active",
    billingCycle,
    currency,
    currentPrice,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
    trialStart: startTrial && planDef.trialDays > 0 ? now.toISOString() : undefined,
    trialEnd: startTrial && planDef.trialDays > 0 ? trialEnd.toISOString() : undefined,
    cancelAtPeriodEnd: false,
    isPaused: false,
    provider,
    providerSubscriptionId: `${provider}_sub_${Date.now()}`,
    providerCustomerId: `${provider}_cus_${Date.now()}`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  saveUserSubscription(updatedSub);

  // Record an initial invoice
  if (typeof window !== "undefined") {
    const invoices = getSubscriptionInvoices(updatedSub.id);
    const newInvoice: BillingInvoice = {
      id: `inv_${Date.now()}`,
      subscriptionId: updatedSub.id,
      amount: startTrial ? 0 : currentPrice,
      currency,
      status: "paid",
      invoiceNumber: `DP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      billingDate: now.toISOString().split("T")[0],
      periodStart: now.toISOString().split("T")[0],
      periodEnd: periodEnd.toISOString().split("T")[0],
      pdfDownloadUrl: "#download-receipt",
      provider,
    };
    invoices.unshift(newInvoice);
    try {
      localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(invoices));
    } catch {}
  }

  return updatedSub;
}

/**
 * Pauses subscription for specified months (e.g. 1 month)
 */
export function pauseSubscription(subscription: UserSubscription, months: number = 1): UserSubscription {
  const resumesAt = new Date();
  resumesAt.setMonth(resumesAt.getMonth() + months);

  const updated: UserSubscription = {
    ...subscription,
    status: "paused",
    isPaused: true,
    pauseResumesAt: resumesAt.toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveUserSubscription(updated);
  return updated;
}

/**
 * Resumes a paused subscription immediately
 */
export function resumeSubscription(subscription: UserSubscription): UserSubscription {
  const updated: UserSubscription = {
    ...subscription,
    status: "active",
    isPaused: false,
    pauseResumesAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  saveUserSubscription(updated);
  return updated;
}

/**
 * Applies win-back offer (e.g. 50% discount for the next 3 months)
 */
export function applyWinBackOffer(
  subscription: UserSubscription,
  offer: "discount_50" | "pause_1mo",
  reason: CancellationSurveyRecord["reason"],
  feedback?: string
): { updatedSubscription: UserSubscription; survey: CancellationSurveyRecord } {
  let updatedSub = { ...subscription };

  if (offer === "discount_50") {
    updatedSub = {
      ...subscription,
      currentPrice: Math.round(subscription.currentPrice * 0.5),
      winBackDiscountPercent: 50,
      cancelAtPeriodEnd: false,
      status: "active",
      updatedAt: new Date().toISOString(),
    };
  } else if (offer === "pause_1mo") {
    updatedSub = pauseSubscription(subscription, 1);
  }

  saveUserSubscription(updatedSub);

  const survey: CancellationSurveyRecord = {
    id: `survey_${Date.now()}`,
    userId: subscription.userId,
    planId: subscription.planId,
    reason,
    feedback,
    winBackOffered: offer,
    winBackAccepted: true,
    createdAt: new Date().toISOString(),
  };

  recordCancellationSurvey(survey);

  return { updatedSubscription: updatedSub, survey };
}

/**
 * Cancels subscription at period end when win-back offer is declined
 */
export function cancelSubscription(
  subscription: UserSubscription,
  reason: CancellationSurveyRecord["reason"],
  feedback?: string
): { updatedSubscription: UserSubscription; survey: CancellationSurveyRecord } {
  const updatedSub: UserSubscription = {
    ...subscription,
    cancelAtPeriodEnd: true,
    updatedAt: new Date().toISOString(),
  };

  saveUserSubscription(updatedSub);

  const survey: CancellationSurveyRecord = {
    id: `survey_${Date.now()}`,
    userId: subscription.userId,
    planId: subscription.planId,
    reason,
    feedback,
    winBackOffered: "discount_50",
    winBackAccepted: false,
    createdAt: new Date().toISOString(),
  };

  recordCancellationSurvey(survey);

  return { updatedSubscription: updatedSub, survey };
}

function recordCancellationSurvey(survey: CancellationSurveyRecord): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_SURVEYS_KEY);
    const surveys: CancellationSurveyRecord[] = raw ? JSON.parse(raw) : [];
    surveys.unshift(survey);
    localStorage.setItem(STORAGE_SURVEYS_KEY, JSON.stringify(surveys));
  } catch {}
}

/**
 * Checks whether user has an active entitlement
 */
export function checkUserEntitlement(
  subscription: UserSubscription,
  feature: keyof SubscriptionPlanDefinition["entitlements"]
): boolean {
  if (subscription.isPaused) return false;
  const plan = getPlanDefinition(subscription.planId);
  const val = plan.entitlements[feature];
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val > 0;
  return false;
}

export function isTrialActive(subscription: UserSubscription): boolean {
  if (subscription.status !== "trialing" || !subscription.trialEnd) return false;
  return new Date(subscription.trialEnd).getTime() > Date.now();
}

export function getRemainingTrialDays(subscription: UserSubscription): number {
  if (!isTrialActive(subscription) || !subscription.trialEnd) return 0;
  const diffMs = new Date(subscription.trialEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
