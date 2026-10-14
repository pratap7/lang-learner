import { createHmac } from "crypto";
import type { UserNotificationPreferences, EmailTemplateId } from "./types.ts";

const HMAC_SECRET = process.env.NOTIFICATION_UNSUBSCRIBE_SECRET || "deutschpfad_secure_unsubscribe_secret_2026";

/**
 * Returns default notification preferences for newly registered learners
 */
export function getDefaultNotificationPreferences(userId: string, email: string): UserNotificationPreferences {
  return {
    userId,
    email,
    transactional: true,
    weeklyProgress: true,
    streakReminders: true,
    milestoneAlerts: true,
    productUpdates: true,
    quietHours: {
      enabled: true,
      startHour: 22, // 10 PM
      endHour: 8,    // 8 AM
      timezone: "Europe/Berlin",
    },
    unsubscribedAllMarketing: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Checks whether the current moment falls within the user's quiet hours window.
 * Properly handles midnight-spanning windows (e.g. 22:00 to 08:00).
 */
export function isQuietHours(preferences: UserNotificationPreferences, targetDate: Date = new Date()): boolean {
  if (!preferences.quietHours || !preferences.quietHours.enabled) {
    return false;
  }

  const { startHour, endHour, timezone } = preferences.quietHours;

  try {
    // Format the hour in the target timezone
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || "Europe/Berlin",
      hour: "numeric",
      hour12: false,
    });

    const hourStr = formatter.format(targetDate);
    const currentHour = parseInt(hourStr, 10);

    if (isNaN(currentHour)) {
      return false;
    }

    if (startHour > endHour) {
      // Window spans midnight (e.g. 22:00 to 08:00)
      return currentHour >= startHour || currentHour < endHour;
    } else {
      // Window is within the same day (e.g. 13:00 to 15:00)
      return currentHour >= startHour && currentHour < endHour;
    }
  } catch (err) {
    console.warn("[QuietHours] Timezone formatting error, falling back to UTC:", err);
    const utcHour = targetDate.getUTCHours();
    if (startHour > endHour) {
      return utcHour >= startHour || utcHour < endHour;
    }
    return utcHour >= startHour && utcHour < endHour;
  }
}

export interface SendPermissionResult {
  allowed: boolean;
  reason?: string;
  isQuietHoursDeferred?: boolean;
}

/**
 * Decides whether a given lifecycle email should be dispatched immediately,
 * deferred due to quiet hours, or suppressed per user preferences.
 */
export function shouldSendEmail(
  preferences: UserNotificationPreferences,
  templateId: EmailTemplateId,
  targetDate: Date = new Date()
): SendPermissionResult {
  // 1. Transactional emails are critical and always bypass marketing filters and quiet hours
  const isTransactional = [
    "welcome",
    "email_verification",
    "password_reset",
    "receipt_invoice",
    "payment_failed",
    "subscription_cancelled",
  ].includes(templateId);

  if (isTransactional) {
    return { allowed: true };
  }

  // 2. Global marketing unsubscribe check
  if (preferences.unsubscribedAllMarketing) {
    return {
      allowed: false,
      reason: "User has globally unsubscribed from all marketing and engagement communications.",
    };
  }

  // 3. Category-level preference checks
  if (templateId === "weekly_progress" && !preferences.weeklyProgress) {
    return { allowed: false, reason: "User has opted out of weekly progress reports." };
  }

  if (templateId === "streak_at_risk" && !preferences.streakReminders) {
    return { allowed: false, reason: "User has opted out of streak reminder alerts." };
  }

  if (templateId === "milestone_congratulations" && !preferences.milestoneAlerts) {
    return { allowed: false, reason: "User has opted out of milestone celebrations." };
  }

  if (templateId === "win_back" && !preferences.productUpdates) {
    return { allowed: false, reason: "User has opted out of re-engagement promotions." };
  }

  // 4. Quiet Hours evaluation for engagement emails
  if (isQuietHours(preferences, targetDate)) {
    return {
      allowed: false,
      isQuietHoursDeferred: true,
      reason: `Message withheld during quiet hours (${preferences.quietHours.startHour}:00 - ${preferences.quietHours.endHour}:00 ${preferences.quietHours.timezone}). Queued for next delivery window.`,
    };
  }

  return { allowed: true };
}

/**
 * Generates a tamper-proof HMAC signed token for RFC 8058 1-click unsubscribe links
 */
export function generateUnsubscribeToken(userId: string, email: string): string {
  const payload = `${userId}:${email}:${Date.now()}`;
  const signature = createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
  const base64Data = Buffer.from(payload).toString("base64url");
  return `${base64Data}.${signature}`;
}

/**
 * Verifies an unsubscribe token and returns the authenticated user info
 */
export function verifyUnsubscribeToken(token: string): { valid: boolean; userId?: string; email?: string } {
  try {
    const [base64Data, signature] = token.split(".");
    if (!base64Data || !signature) {
      return { valid: false };
    }

    const payload = Buffer.from(base64Data, "base64url").toString("utf8");
    const [userId, email, timestampStr] = payload.split(":");

    if (!userId || !email || !timestampStr) {
      return { valid: false };
    }

    // Verify HMAC signature
    const expectedSig = createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
    if (expectedSig !== signature) {
      return { valid: false };
    }

    return { valid: true, userId, email };
  } catch {
    return { valid: false };
  }
}
