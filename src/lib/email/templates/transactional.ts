import { emailStyles } from "../styles.ts";
import { wrapInBaseEmailLayout, wrapInBasePlainText } from "../baseTemplate.ts";
import type {
  EmailRenderResult,
  WelcomeEmailData,
  EmailVerificationData,
  PasswordResetData,
  ReceiptInvoiceData,
  TrialEndingData,
  PaymentFailedData,
  SubscriptionCancelledData,
  WinBackData,
} from "../types.ts";

/**
 * 1. Welcome Email
 */
export function renderWelcomeEmail(data: WelcomeEmailData): EmailRenderResult {
  const subject = `Willkommen bei Deutsch Pfad, ${data.recipientName}! 🇩🇪`;
  const preheader = `Your path to German fluency begins today. Target: CEFR Level ${data.targetLevel}.`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Willkommen, ${data.recipientName}!</h1>
    <p style="${emailStyles.p}">
      We are thrilled to welcome you to <strong>Deutsch Pfad</strong>. Learning German is one of the most rewarding journeys you can undertake, and we've designed every lesson, flashcard, and interactive speaking exercise to get you speaking naturally from day one.
    </p>

    <div style="${emailStyles.calloutBox}">
      <table style="${emailStyles.table}">
        <tr>
          <td style="${emailStyles.td}"><strong>Target Proficiency:</strong></td>
          <td style="${emailStyles.td}">CEFR Level ${data.targetLevel.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="${emailStyles.td}"><strong>Daily Commitment:</strong></td>
          <td style="${emailStyles.td}">${data.dailyMinutes} minutes / day</td>
        </tr>
        <tr>
          <td style="${emailStyles.td}"><strong>Curriculum:</strong></td>
          <td style="${emailStyles.td}">Goethe-Institut &amp; telc Aligned</td>
        </tr>
      </table>
    </div>

    <p style="${emailStyles.p}">
      To begin, start with your first 5-minute interactive lesson. You'll master essential daily expressions and practice speaking with native phonetic guidance.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.loginUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Start Your First Lesson &rarr;
      </a>
    </div>

    <p style="${emailStyles.pMuted}">
      Pro Tip: Consistency always beats cramming. Just 15–20 minutes each day builds lasting fluency faster than long weekend study sessions.
    </p>
  `;

  const textContent = `
Willkommen bei Deutsch Pfad, ${data.recipientName}!

We are thrilled to welcome you to Deutsch Pfad. Learning German is one of the most rewarding journeys you can undertake, and we've structured every lesson to get you speaking naturally from day one.

YOUR LEARNING PLAN:
- Target Proficiency: CEFR Level ${data.targetLevel.toUpperCase()}
- Daily Commitment: ${data.dailyMinutes} minutes/day
- Standard: Goethe-Institut & telc Aligned

Start your first 5-minute interactive lesson today:
${data.loginUrl}

Pro Tip: Consistency always beats cramming. Just 15–20 minutes a day builds lasting fluency.
`;

  return {
    templateId: "welcome",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: false }),
    text: wrapInBasePlainText(textContent, data, false),
  };
}

/**
 * 2. Email Verification Email
 */
export function renderEmailVerificationEmail(data: EmailVerificationData): EmailRenderResult {
  const subject = "Confirm your Deutsch Pfad email address";
  const preheader = "Please verify your email address to secure your German learning progress.";

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Verify Your Email</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, thank you for joining Deutsch Pfad. To verify your email address and activate your cloud progress synchronization, please click the button below:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.verificationUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Confirm Email Address &rarr;
      </a>
    </div>

    <p style="${emailStyles.pMuted}">
      Or enter this 6-digit verification code directly in your browser:
    </p>

    <div style="${emailStyles.codeBox}">
      ${data.verificationCode}
    </div>

    <p style="${emailStyles.pMuted}">
      This confirmation link and code will expire in ${data.expiresInMinutes} minutes. If you did not create a Deutsch Pfad account, you can safely disregard this message.
    </p>
  `;

  const textContent = `
Verify Your Email Address

Hallo ${data.recipientName}, thank you for joining Deutsch Pfad.

Please click the link below to confirm your email address:
${data.verificationUrl}

Or enter your 6-digit confirmation code:
${data.verificationCode}

This code expires in ${data.expiresInMinutes} minutes. If you did not create an account, no further action is required.
`;

  return {
    templateId: "email_verification",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: false }),
    text: wrapInBasePlainText(textContent, data, false),
  };
}

/**
 * 3. Password Reset Email
 */
export function renderPasswordResetEmail(data: PasswordResetData): EmailRenderResult {
  const subject = "Reset your Deutsch Pfad password";
  const preheader = "Instructions to securely reset your account credentials.";

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Reset Your Password</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, we received a request to reset the password for your Deutsch Pfad account.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.resetUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Choose a New Password &rarr;
      </a>
    </div>

    <div style="${emailStyles.calloutWarning}">
      <p style="margin: 0; font-size: 13px; color: #92400e;">
        <strong>Security Notice:</strong> This link is valid for <strong>${data.expiresInMinutes} minutes</strong> and can only be used once. ${
          data.deviceIpSnippet ? `Request originated from IP: ${data.deviceIpSnippet}.` : ""
        }
      </p>
    </div>

    <p style="${emailStyles.pMuted}">
      If you did not request a password reset, your password remains completely secure. No changes have been made to your account.
    </p>
  `;

  const textContent = `
Reset Your Password

Hallo ${data.recipientName}, we received a request to reset your Deutsch Pfad password.

To set a new password, click the link below:
${data.resetUrl}

This link is valid for ${data.expiresInMinutes} minutes and can only be used once.

If you did not make this request, your account remains secure and no action is needed.
`;

  return {
    templateId: "password_reset",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: false }),
    text: wrapInBasePlainText(textContent, data, false),
  };
}

/**
 * 4. Receipt / Invoice Email
 */
export function renderReceiptInvoiceEmail(data: ReceiptInvoiceData): EmailRenderResult {
  const subject = `Receipt for Deutsch Pfad ${data.planName} (${data.invoiceNumber})`;
  const preheader = `Thank you for your payment of ${data.amountFormatted}. Your receipt is ready.`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Payment Receipt</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, thank you for supporting Deutsch Pfad! We have successfully processed your payment for <strong>Deutsch Pfad ${data.planName}</strong>.
    </p>

    <div style="${emailStyles.calloutBox}">
      <table style="${emailStyles.table}">
        <tr>
          <td style="${emailStyles.td}"><strong>Invoice Number:</strong></td>
          <td style="${emailStyles.td}">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="${emailStyles.td}"><strong>Date:</strong></td>
          <td style="${emailStyles.td}">${data.date}</td>
        </tr>
        <tr>
          <td style="${emailStyles.td}"><strong>Billing Period:</strong></td>
          <td style="${emailStyles.td}">${data.billingPeriod}</td>
        </tr>
        <tr>
          <td style="${emailStyles.td}"><strong>Payment Method:</strong></td>
          <td style="${emailStyles.td}">${data.paymentMethodSnippet}</td>
        </tr>
        <tr>
          <td style="${emailStyles.tdBold}">Amount Paid:</td>
          <td style="${emailStyles.tdBold}">${data.amountFormatted}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${data.downloadPdfUrl}" target="_blank" style="${emailStyles.btnSecondary}">
        Download Tax Invoice (PDF)
      </a>
    </div>

    <p style="${emailStyles.pMuted}">
      You can manage your subscription, update payment methods, or view past invoices at any time in your Account Settings.
    </p>
  `;

  const textContent = `
Payment Receipt — Deutsch Pfad

Hallo ${data.recipientName}, thank you for your payment!

INVOICE SUMMARY:
- Plan: Deutsch Pfad ${data.planName}
- Invoice Number: ${data.invoiceNumber}
- Date: ${data.date}
- Billing Period: ${data.billingPeriod}
- Payment Method: ${data.paymentMethodSnippet}
- Amount Paid: ${data.amountFormatted}

Download PDF Receipt:
${data.downloadPdfUrl}

Manage subscription settings in your Deutsch Pfad billing portal.
`;

  return {
    templateId: "receipt_invoice",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: false }),
    text: wrapInBasePlainText(textContent, data, false),
  };
}

/**
 * 5. Trial-Ending Reminder Email
 */
export function renderTrialEndingEmail(data: TrialEndingData): EmailRenderResult {
  const subject = `Your Deutsch Pfad free trial ends in ${data.daysRemaining} days`;
  const preheader = `A friendly reminder regarding your 7-day trial of ${data.planName}. Zero surprises.`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Your Trial is Ending Soon</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, we hope you've been enjoying your practice on <strong>Deutsch Pfad ${data.planName}</strong>!
    </p>

    <p style="${emailStyles.p}">
      We believe in complete billing transparency. Your 7-day free trial will conclude on <strong>${data.trialEndDate}</strong>.
    </p>

    <div style="${emailStyles.calloutBox}">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
        What happens next?
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.6;">
        <li>If you're loving the course and want to continue, your plan will seamlessly renew at <strong>${data.renewalPriceFormatted}</strong>.</li>
        <li>If you don't wish to continue, you can cancel before ${data.trialEndDate} with a single click. You will not be charged a single cent.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.portalUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Review Plan in Billing Portal &rarr;
      </a>
    </div>

    <p style="${emailStyles.pMuted}">
      Even if you decide not to renew, all your vocabulary flashcards, streaks, and progress records remain saved on your free account forever.
    </p>
  `;

  const textContent = `
Your Free Trial Ends in ${data.daysRemaining} Days

Hallo ${data.recipientName}, we hope you're enjoying Deutsch Pfad ${data.planName}!

Your 7-day free trial will conclude on: ${data.trialEndDate}

WHAT HAPPENS NEXT:
- If you'd like to continue: Your plan will renew at ${data.renewalPriceFormatted}.
- If you don't wish to continue: Simply cancel before ${data.trialEndDate} in your billing portal and you will not be charged.

Manage your plan:
${data.portalUrl}

Your progress and flashcards always remain safely saved on your account.
`;

  return {
    templateId: "trial_ending",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: true }),
    text: wrapInBasePlainText(textContent, data, true),
  };
}

/**
 * 6. Payment Failed Email (Clear fix, helpful tone, no panic)
 */
export function renderPaymentFailedEmail(data: PaymentFailedData): EmailRenderResult {
  const subject = `Action needed: Update payment method for Deutsch Pfad ${data.planName}`;
  const preheader = `We couldn't process your renewal of ${data.amountFormatted}. Let's get this sorted.`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Payment Could Not Be Processed</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, we attempted to process the renewal payment of <strong>${data.amountFormatted}</strong> for your Deutsch Pfad ${data.planName} subscription, but the charge was declined by your bank or card issuer.
    </p>

    <div style="${emailStyles.calloutWarning}">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Your learning remains uninterrupted:</strong> We have placed a <strong>${data.gracePeriodDaysRemaining}-day grace period</strong> on your account so your active lessons and Goethe mock exam access continue without interruption while you resolve this.
      </p>
    </div>

    <p style="${emailStyles.p}">
      Usually, this happens because a card has expired, a daily online limit was reached, or your bank requested additional 3D-Secure authentication.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.updatePaymentUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Update Payment Method &rarr;
      </a>
    </div>

    <p style="${emailStyles.pMuted}">
      If you need any assistance, simply reply directly to this email and our billing team will be happy to help.
    </p>
  `;

  const textContent = `
Payment Could Not Be Processed — Action Needed

Hallo ${data.recipientName},

We attempted to process your renewal of ${data.amountFormatted} for Deutsch Pfad ${data.planName}, but the payment was declined by your bank.

GRACE PERIOD:
Your learning access remains active for ${data.gracePeriodDaysRemaining} days so you don't lose study momentum while updating your payment method.

Update your payment details here:
${data.updatePaymentUrl}

Need help? Reply directly to this email.
`;

  return {
    templateId: "payment_failed",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: false }),
    text: wrapInBasePlainText(textContent, data, false),
  };
}

/**
 * 7. Subscription Cancelled Email
 */
export function renderSubscriptionCancelledEmail(data: SubscriptionCancelledData): EmailRenderResult {
  const subject = `Confirmation: Deutsch Pfad ${data.planName} cancelled`;
  const preheader = `Your subscription has been cancelled. You retain full access until ${data.accessEndDate}.`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Subscription Cancelled</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, this email confirms that your subscription to <strong>Deutsch Pfad ${data.planName}</strong> has been cancelled as requested.
    </p>

    <div style="${emailStyles.calloutBox}">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">
        Key Details:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.6;">
        <li>You will not be billed again.</li>
        <li>You retain full Pro access until <strong>${data.accessEndDate}</strong>.</li>
        <li>Your completed lessons, spaced repetition flashcard deck, and CEFR progress are permanently saved.</li>
      </ul>
    </div>

    <p style="${emailStyles.p}">
      Thank you for learning with us. If you ever decide to resume your structured German path in the future, you can reactivate anytime in a few seconds.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${data.reactivateUrl}" target="_blank" style="${emailStyles.btnSecondary}">
        Reactivate Subscription Anytime
      </a>
    </div>
  `;

  const textContent = `
Subscription Cancellation Confirmation

Hallo ${data.recipientName},

This confirms that your subscription to Deutsch Pfad ${data.planName} has been cancelled.

KEY DETAILS:
- You will not be billed again.
- You retain full access until: ${data.accessEndDate}
- All your flashcards, vocabulary progress, and test scores remain saved permanently.

Thank you for being part of Deutsch Pfad. You can reactivate anytime at:
${data.reactivateUrl}
`;

  return {
    templateId: "subscription_cancelled",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: true }),
    text: wrapInBasePlainText(textContent, data, true),
  };
}

/**
 * 8. Win-Back Email (Gentle, value-driven, NEVER guilt-based)
 */
export function renderWinBackEmail(data: WinBackData): EmailRenderResult {
  const subject = `Special invitation: Continue your German path (${data.offerDiscount})`;
  const preheader = `Whenever you're ready to learn again, here is a special ${data.offerDiscount} to restart.`;

  const htmlContent = `
    <h1 style="${emailStyles.h1}">Your German Path is Ready When You Are</h1>
    <p style="${emailStyles.p}">
      Hallo ${data.recipientName}, language learning is a marathon, and taking breaks is a completely natural part of the process.
    </p>

    <p style="${emailStyles.p}">
      Since your last session, we've introduced new graded German reading stories, enhanced AI speech recognition, and updated Goethe B1 exam simulations.
    </p>

    <div style="${emailStyles.calloutSuccess}">
      <p style="margin: 0 0 8px 0; font-size: 16px; color: #065f46; font-weight: 800;">
        ${data.offerHeadline}
      </p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #047857;">
        Use coupon code <strong style="font-family: monospace; background-color: #d1fae5; padding: 2px 6px; border-radius: 4px;">${data.offerCode}</strong> to receive <strong>${data.offerDiscount}</strong> your subscription.
      </p>
      <p style="margin: 0; font-size: 12px; color: #059669;">
        Valid until ${data.expiryDate}.
      </p>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.claimUrl}" target="_blank" style="${emailStyles.btnPrimary}">
        Claim ${data.offerDiscount} &amp; Resume Learning &rarr;
      </a>
    </div>

    <p style="${emailStyles.pMuted}">
      Prefer the free tier? No problem at all—your daily lesson drills and flashcards are always available.
    </p>
  `;

  const textContent = `
Your German Path is Ready When You Are

Hallo ${data.recipientName}, language learning is a marathon, and taking breaks is a completely natural part of the journey.

SPECIAL INVITATION:
${data.offerHeadline}
Get ${data.offerDiscount} with coupon code: ${data.offerCode}
Valid through: ${data.expiryDate}

Claim your offer:
${data.claimUrl}

Your flashcards and saved progress are right where you left them.
`;

  return {
    templateId: "win_back",
    subject,
    preheader,
    html: wrapInBaseEmailLayout({ preheader, contentHtml: htmlContent, context: data, showUnsubscribe: true }),
    text: wrapInBasePlainText(textContent, data, true),
  };
}
