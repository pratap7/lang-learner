/**
 * Lifecycle Messaging & Email Template Types
 * Deutsch Pfad Language Learning Platform
 */

export type EmailTemplateId =
  // Transactional
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "receipt_invoice"
  | "trial_ending"
  | "payment_failed"
  | "subscription_cancelled"
  | "win_back"
  // Engagement
  | "weekly_progress"
  | "streak_at_risk"
  | "milestone_congratulations";

export type EmailCategory = "transactional" | "progress" | "reminders" | "milestones" | "announcements";

export interface UserQuietHours {
  enabled: boolean;
  startHour: number; // 0-23, e.g. 22 for 10 PM
  endHour: number;   // 0-23, e.g. 8 for 8 AM
  timezone: string;  // e.g. "Europe/Berlin", "UTC"
}

export interface UserNotificationPreferences {
  userId: string;
  email: string;
  transactional: boolean; // always true, cannot opt out
  weeklyProgress: boolean;
  streakReminders: boolean;
  milestoneAlerts: boolean;
  productUpdates: boolean;
  quietHours: UserQuietHours;
  unsubscribedAllMarketing: boolean;
  updatedAt: string;
}

export interface EmailRenderResult {
  templateId: EmailTemplateId;
  subject: string;
  html: string;
  text: string;
  preheader: string;
}

export interface BaseEmailContext {
  recipientName: string;
  recipientEmail: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  supportEmail?: string;
  appUrl?: string;
}

// Payload definitions for each template

export interface WelcomeEmailData extends BaseEmailContext {
  targetLevel: string; // e.g. "B1"
  dailyMinutes: number;
  loginUrl: string;
}

export interface EmailVerificationData extends BaseEmailContext {
  verificationUrl: string;
  verificationCode: string;
  expiresInMinutes: number;
}

export interface PasswordResetData extends BaseEmailContext {
  resetUrl: string;
  expiresInMinutes: number;
  deviceIpSnippet?: string;
}

export interface ReceiptInvoiceData extends BaseEmailContext {
  invoiceNumber: string;
  planName: string;
  amountFormatted: string;
  currency: string;
  billingPeriod: string;
  paymentMethodSnippet: string; // e.g. "Visa ending in 4242"
  downloadPdfUrl: string;
  date: string;
}

export interface TrialEndingData extends BaseEmailContext {
  daysRemaining: number;
  trialEndDate: string;
  planName: string;
  renewalPriceFormatted: string;
  portalUrl: string;
}

export interface PaymentFailedData extends BaseEmailContext {
  planName: string;
  amountFormatted: string;
  updatePaymentUrl: string;
  gracePeriodDaysRemaining: number;
  failureReasonSnippet?: string;
}

export interface SubscriptionCancelledData extends BaseEmailContext {
  planName: string;
  accessEndDate: string;
  reactivateUrl: string;
}

export interface WinBackData extends BaseEmailContext {
  lastActiveDaysAgo: number;
  currentLevel: string;
  offerHeadline: string;
  offerCode: string;
  offerDiscount: string; // e.g. "20% off"
  claimUrl: string;
  expiryDate: string;
}

export interface WeeklyProgressData extends BaseEmailContext {
  weekDateRange: string;
  xpEarned: number;
  studyMinutes: number;
  lessonsCompleted: number;
  currentStreak: number;
  accuracyPercentage: number;
  topWordsLearned: Array<{ german: string; english: string; article?: string }>;
  recommendedNextLesson: { title: string; cefrLevel: string; actionUrl: string };
}

export interface StreakAtRiskData extends BaseEmailContext {
  currentStreak: number;
  streakFreezeAvailable: boolean;
  quickPracticeUrl: string;
  practiceDurationMinutes: number; // e.g. 3
}

export interface MilestoneCongratulationsData extends BaseEmailContext {
  milestoneTitle: string; // e.g. "Completed Level A1: Beginner German" or "30-Day Streak Club"
  milestoneBadgeName: string;
  milestoneMetric: string; // e.g. "500 German Words Mastered"
  celebrationNote: string;
  shareUrl?: string;
  continueUrl: string;
}

export type LifecycleEmailPayload =
  | { templateId: "welcome"; data: WelcomeEmailData }
  | { templateId: "email_verification"; data: EmailVerificationData }
  | { templateId: "password_reset"; data: PasswordResetData }
  | { templateId: "receipt_invoice"; data: ReceiptInvoiceData }
  | { templateId: "trial_ending"; data: TrialEndingData }
  | { templateId: "payment_failed"; data: PaymentFailedData }
  | { templateId: "subscription_cancelled"; data: SubscriptionCancelledData }
  | { templateId: "win_back"; data: WinBackData }
  | { templateId: "weekly_progress"; data: WeeklyProgressData }
  | { templateId: "streak_at_risk"; data: StreakAtRiskData }
  | { templateId: "milestone_congratulations"; data: MilestoneCongratulationsData };
