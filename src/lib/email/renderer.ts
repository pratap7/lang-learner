import type {
  EmailTemplateId,
  LifecycleEmailPayload,
  EmailRenderResult,
  WelcomeEmailData,
  EmailVerificationData,
  PasswordResetData,
  ReceiptInvoiceData,
  TrialEndingData,
  PaymentFailedData,
  SubscriptionCancelledData,
  WinBackData,
  WeeklyProgressData,
  StreakAtRiskData,
  MilestoneCongratulationsData,
} from "./types.ts";
import {
  renderWelcomeEmail,
  renderEmailVerificationEmail,
  renderPasswordResetEmail,
  renderReceiptInvoiceEmail,
  renderTrialEndingEmail,
  renderPaymentFailedEmail,
  renderSubscriptionCancelledEmail,
  renderWinBackEmail,
} from "./templates/transactional.ts";
import {
  renderWeeklyProgressEmail,
  renderStreakAtRiskEmail,
  renderMilestoneCongratulationsEmail,
} from "./templates/engagement.ts";

/**
 * Renders any lifecycle email into responsive HTML and clean Plain-Text formats.
 */
export function renderEmailTemplate(payload: LifecycleEmailPayload): EmailRenderResult {
  switch (payload.templateId) {
    case "welcome":
      return renderWelcomeEmail(payload.data);
    case "email_verification":
      return renderEmailVerificationEmail(payload.data);
    case "password_reset":
      return renderPasswordResetEmail(payload.data);
    case "receipt_invoice":
      return renderReceiptInvoiceEmail(payload.data);
    case "trial_ending":
      return renderTrialEndingEmail(payload.data);
    case "payment_failed":
      return renderPaymentFailedEmail(payload.data);
    case "subscription_cancelled":
      return renderSubscriptionCancelledEmail(payload.data);
    case "win_back":
      return renderWinBackEmail(payload.data);
    case "weekly_progress":
      return renderWeeklyProgressEmail(payload.data);
    case "streak_at_risk":
      return renderStreakAtRiskEmail(payload.data);
    case "milestone_congratulations":
      return renderMilestoneCongratulationsEmail(payload.data);
    default:
      throw new Error(`Unknown email template: ${(payload as any).templateId}`);
  }
}

/**
 * Returns complete, realistic sample payloads for all 11 lifecycle email templates.
 * Useful for in-app template previewing, testing, and screenshots.
 */
export function getMockEmailPayload(templateId: EmailTemplateId, customRecipient?: string): LifecycleEmailPayload {
  const recipientName = "Stefan";
  const recipientEmail = customRecipient || "stefan.learner@example.com";
  const baseUrl = "https://deutschpfad.com";
  const unsubscribeUrl = `${baseUrl}/unsubscribe?token=mock_sample_token_12345`;
  const preferencesUrl = `${baseUrl}/settings/notifications`;

  switch (templateId) {
    case "welcome":
      return {
        templateId: "welcome",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          targetLevel: "B1",
          dailyMinutes: 20,
          loginUrl: `${baseUrl}/dashboard`,
        } as WelcomeEmailData,
      };

    case "email_verification":
      return {
        templateId: "email_verification",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          verificationUrl: `${baseUrl}/auth/callback?code=verify_982341`,
          verificationCode: "982 341",
          expiresInMinutes: 30,
        } as EmailVerificationData,
      };

    case "password_reset":
      return {
        templateId: "password_reset",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          resetUrl: `${baseUrl}/auth/reset-password?token=pwd_reset_token_8872`,
          expiresInMinutes: 60,
          deviceIpSnippet: "194.12.87.xx (Berlin, DE)",
        } as PasswordResetData,
      };

    case "receipt_invoice":
      return {
        templateId: "receipt_invoice",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          invoiceNumber: "DP-2026-8819",
          planName: "Pro (Annual)",
          amountFormatted: "€108.00",
          currency: "EUR",
          billingPeriod: "Oct 14, 2026 – Oct 14, 2027",
          paymentMethodSnippet: "Mastercard ending in 9102",
          downloadPdfUrl: `${baseUrl}/api/billing/invoices/inv_8819.pdf`,
          date: "October 14, 2026",
        } as ReceiptInvoiceData,
      };

    case "trial_ending":
      return {
        templateId: "trial_ending",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          daysRemaining: 3,
          trialEndDate: "October 17, 2026",
          planName: "Deutsch Pfad Pro",
          renewalPriceFormatted: "€12.00 / month",
          portalUrl: `${baseUrl}/settings/billing`,
        } as TrialEndingData,
      };

    case "payment_failed":
      return {
        templateId: "payment_failed",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          planName: "Pro Monthly",
          amountFormatted: "€12.00",
          updatePaymentUrl: `${baseUrl}/settings/billing?action=update_card`,
          gracePeriodDaysRemaining: 3,
          failureReasonSnippet: "Insufficient funds / card expired",
        } as PaymentFailedData,
      };

    case "subscription_cancelled":
      return {
        templateId: "subscription_cancelled",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          planName: "Pro Monthly",
          accessEndDate: "November 14, 2026",
          reactivateUrl: `${baseUrl}/pricing`,
        } as SubscriptionCancelledData,
      };

    case "win_back":
      return {
        templateId: "win_back",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          lastActiveDaysAgo: 21,
          currentLevel: "A2",
          offerHeadline: "Save 20% on your German path renewal",
          offerCode: "WILLKOMMEN20",
          offerDiscount: "20% off",
          claimUrl: `${baseUrl}/pricing?coupon=WILLKOMMEN20`,
          expiryDate: "October 31, 2026",
        } as WinBackData,
      };

    case "weekly_progress":
      return {
        templateId: "weekly_progress",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          weekDateRange: "Oct 7 – Oct 14, 2026",
          xpEarned: 480,
          studyMinutes: 85,
          lessonsCompleted: 6,
          currentStreak: 12,
          accuracyPercentage: 94,
          topWordsLearned: [
            { german: "die Vereinbarung", english: "the agreement", article: "die" },
            { german: "der Feierabend", english: "closing time / end of work day", article: "der" },
            { german: "das Vorstellungsgespräch", english: "job interview", article: "das" },
            { german: "selbstverständlich", english: "of course / naturally" },
          ],
          recommendedNextLesson: {
            title: "Dativ Prepositions in Daily Routine",
            cefrLevel: "A2.3",
            actionUrl: `${baseUrl}/lesson/dativ-prep-1`,
          },
        } as WeeklyProgressData,
      };

    case "streak_at_risk":
      return {
        templateId: "streak_at_risk",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          currentStreak: 14,
          streakFreezeAvailable: true,
          quickPracticeUrl: `${baseUrl}/practice/quick?mode=streak_saver`,
          practiceDurationMinutes: 3,
        } as StreakAtRiskData,
      };

    case "milestone_congratulations":
      return {
        templateId: "milestone_congratulations",
        data: {
          recipientName,
          recipientEmail,
          unsubscribeUrl,
          preferencesUrl,
          milestoneTitle: "CEFR Level A1 Certified Milestone",
          milestoneBadgeName: "A1 Grundstufe Meister",
          milestoneMetric: "520 German Expressions Mastered",
          celebrationNote:
            "You have completed all 24 foundation units, passed the A1 placement check with 92% accuracy, and developed strong listening comprehension for everyday situations.",
          shareUrl: `${baseUrl}/badges/a1-meister?user=stefan`,
          continueUrl: `${baseUrl}/courses/a2`,
        } as MilestoneCongratulationsData,
      };
  }
}
