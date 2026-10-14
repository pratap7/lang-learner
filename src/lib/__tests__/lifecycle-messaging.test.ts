import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { EmailTemplateId } from "../email/types.ts";
import { getMockEmailPayload, renderEmailTemplate } from "../email/renderer.ts";
import {
  isQuietHours,
  shouldSendEmail,
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  getDefaultNotificationPreferences,
} from "../email/preferencesService.ts";

const ALL_TEMPLATES: EmailTemplateId[] = [
  "welcome",
  "email_verification",
  "password_reset",
  "receipt_invoice",
  "trial_ending",
  "payment_failed",
  "subscription_cancelled",
  "win_back",
  "weekly_progress",
  "streak_at_risk",
  "milestone_congratulations",
];

describe("Lifecycle Messaging: Template Rendering & Plain-Text Generation", () => {
  it("successfully renders all 11 email templates with both HTML and Plain-Text versions", () => {
    for (const templateId of ALL_TEMPLATES) {
      const payload = getMockEmailPayload(templateId, "test.student@example.com");
      const rendered = renderEmailTemplate(payload);

      assert.equal(rendered.templateId, templateId);
      assert.ok(rendered.subject && rendered.subject.length > 5, `Subject missing for ${templateId}`);
      assert.ok(rendered.preheader && rendered.preheader.length > 5, `Preheader missing for ${templateId}`);
      assert.ok(rendered.html && rendered.html.includes("<!DOCTYPE html>"), `HTML structure missing for ${templateId}`);
      assert.ok(rendered.html.includes("Deutsch"), `Branding missing in HTML for ${templateId}`);
      assert.ok(rendered.text && rendered.text.length > 30, `Plain-text missing for ${templateId}`);
      assert.ok(rendered.text.includes("DEUTSCH PFAD"), `Plain-text branding missing for ${templateId}`);
    }
  });

  it("includes valid unsubscribe and preference links across non-transactional emails", () => {
    const engagementTemplates: EmailTemplateId[] = [
      "weekly_progress",
      "streak_at_risk",
      "milestone_congratulations",
      "win_back",
      "trial_ending",
    ];

    for (const templateId of engagementTemplates) {
      const payload = getMockEmailPayload(templateId);
      const rendered = renderEmailTemplate(payload);

      assert.ok(
        rendered.html.includes("Unsubscribe with 1-click") || rendered.html.includes("unsubscribe"),
        `Unsubscribe link missing in HTML for ${templateId}`
      );
      assert.ok(
        rendered.text.includes("Unsubscribe") || rendered.text.includes("unsubscribe"),
        `Unsubscribe link missing in text for ${templateId}`
      );
    }
  });
});

describe("Lifecycle Messaging: Guilt-Free Copy Verification", () => {
  const FORBIDDEN_GUILT_PATTERNS = [
    /disappointed/i,
    /lazy/i,
    /shame/i,
    /let down/i,
    /broke our heart/i,
    /crying mascot/i,
    /sad mascot/i,
    /you gave up/i,
    /falling behind/i,
    /why did you leave/i,
    /bad student/i,
  ];

  it("verifies that none of the 11 email templates contain manipulative or guilt-based copy", () => {
    for (const templateId of ALL_TEMPLATES) {
      const payload = getMockEmailPayload(templateId);
      const rendered = renderEmailTemplate(payload);

      const combinedContent = `${rendered.subject} ${rendered.preheader} ${rendered.html} ${rendered.text}`;

      for (const pattern of FORBIDDEN_GUILT_PATTERNS) {
        const match = pattern.test(combinedContent);
        assert.equal(
          match,
          false,
          `Guilt-based pattern ${pattern} detected in template '${templateId}'!`
        );
      }
    }
  });
});

describe("Lifecycle Messaging: Quiet Hours & Timezone Rules", () => {
  it("correctly identifies quiet hours across midnight-spanning windows", () => {
    const prefs = getDefaultNotificationPreferences("user-1", "user@test.com");
    prefs.quietHours = {
      enabled: true,
      startHour: 22, // 10 PM
      endHour: 8,    // 8 AM
      timezone: "UTC",
    };

    // 23:30 UTC -> inside quiet hours
    const lateNight = new Date("2026-10-14T23:30:00Z");
    assert.equal(isQuietHours(prefs, lateNight), true);

    // 04:15 UTC -> inside quiet hours
    const earlyMorning = new Date("2026-10-14T04:15:00Z");
    assert.equal(isQuietHours(prefs, earlyMorning), true);

    // 14:00 UTC -> daytime, outside quiet hours
    const afternoon = new Date("2026-10-14T14:00:00Z");
    assert.equal(isQuietHours(prefs, afternoon), false);
  });

  it("bypasses quiet hours when quiet hours toggle is disabled", () => {
    const prefs = getDefaultNotificationPreferences("user-1", "user@test.com");
    prefs.quietHours.enabled = false;

    const midnight = new Date("2026-10-14T01:00:00Z");
    assert.equal(isQuietHours(prefs, midnight), false);
  });
});

describe("Lifecycle Messaging: Dispatch Permissions & Unsubscribe Rules", () => {
  it("always allows transactional security and billing emails", () => {
    const prefs = getDefaultNotificationPreferences("user-1", "user@test.com");
    prefs.unsubscribedAllMarketing = true; // User opted out of marketing
    prefs.quietHours.enabled = true;

    const midnight = new Date("2026-10-14T02:00:00Z");

    // Critical transactional emails must ALWAYS pass through
    assert.equal(shouldSendEmail(prefs, "password_reset", midnight).allowed, true);
    assert.equal(shouldSendEmail(prefs, "payment_failed", midnight).allowed, true);
    assert.equal(shouldSendEmail(prefs, "receipt_invoice", midnight).allowed, true);
    assert.equal(shouldSendEmail(prefs, "email_verification", midnight).allowed, true);
  });

  it("suppresses engagement emails when user opts out or defers during quiet hours", () => {
    const prefs = getDefaultNotificationPreferences("user-1", "user@test.com");
    const afternoon = new Date("2026-10-14T14:00:00Z");
    const lateNight = new Date("2026-10-14T23:30:00Z");

    // Normal afternoon -> allowed
    assert.equal(shouldSendEmail(prefs, "weekly_progress", afternoon).allowed, true);

    // Specific category toggle off
    prefs.weeklyProgress = false;
    assert.equal(shouldSendEmail(prefs, "weekly_progress", afternoon).allowed, false);

    // Streak reminder during quiet hours -> deferred
    prefs.streakReminders = true;
    prefs.quietHours = { enabled: true, startHour: 22, endHour: 8, timezone: "UTC" };
    const quietCheck = shouldSendEmail(prefs, "streak_at_risk", lateNight);
    assert.equal(quietCheck.allowed, false);
    assert.equal(quietCheck.isQuietHoursDeferred, true);
  });
});

describe("Lifecycle Messaging: HMAC One-Click Unsubscribe Tokens", () => {
  it("generates and verifies tamper-proof unsubscribe tokens", () => {
    const userId = "usr_991823";
    const email = "learner@example.com";

    const token = generateUnsubscribeToken(userId, email);
    assert.ok(token && token.includes("."), "Token must contain base64url and HMAC signature");

    // Valid verification
    const verified = verifyUnsubscribeToken(token);
    assert.equal(verified.valid, true);
    assert.equal(verified.userId, userId);
    assert.equal(verified.email, email);

    // Tampered token rejected
    const tampered = token.replace(/a/g, "b");
    const tamperedCheck = verifyUnsubscribeToken(tampered);
    assert.equal(tamperedCheck.valid, false);
  });
});
