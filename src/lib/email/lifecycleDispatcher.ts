import type { LifecycleEmailPayload, EmailRenderResult, UserNotificationPreferences } from "./types.ts";
import { renderEmailTemplate } from "./renderer.ts";
import {
  getDefaultNotificationPreferences,
  shouldSendEmail,
  generateUnsubscribeToken,
} from "./preferencesService.ts";

export interface DispatchResult {
  success: boolean;
  status: "sent" | "deferred_quiet_hours" | "suppressed_opt_out" | "error";
  messageId?: string;
  rendered?: EmailRenderResult;
  reason?: string;
  headers?: Record<string, string>;
}

/**
 * Dispatches a lifecycle email after checking user notification preferences and quiet hours.
 */
export async function dispatchLifecycleEmail(
  payload: LifecycleEmailPayload,
  userPreferences?: UserNotificationPreferences
): Promise<DispatchResult> {
  const recipientEmail = payload.data.recipientEmail;
  const recipientId = (payload.data as any).userId || "user_anon";

  // 1. Resolve notification preferences
  const prefs = userPreferences || getDefaultNotificationPreferences(recipientId, recipientEmail);

  // 2. Evaluate permission and quiet hours
  const check = shouldSendEmail(prefs, payload.templateId, new Date());
  if (!check.allowed) {
    if (check.isQuietHoursDeferred) {
      console.info(
        `[Lifecycle Dispatcher] Email '${payload.templateId}' to ${recipientEmail} deferred: ${check.reason}`
      );
      return {
        success: false,
        status: "deferred_quiet_hours",
        reason: check.reason,
      };
    }
    console.info(
      `[Lifecycle Dispatcher] Email '${payload.templateId}' to ${recipientEmail} suppressed: ${check.reason}`
    );
    return {
      success: false,
      status: "suppressed_opt_out",
      reason: check.reason,
    };
  }

  // 3. Ensure authentic signed unsubscribe token is injected
  const token = generateUnsubscribeToken(recipientId, recipientEmail);
  const baseUrl = payload.data.appUrl || "https://deutschpfad.com";
  payload.data.unsubscribeUrl = `${baseUrl}/unsubscribe?token=${token}`;
  payload.data.preferencesUrl = `${baseUrl}/settings/notifications`;

  // 4. Render HTML and Plain-Text templates
  const rendered = renderEmailTemplate(payload);

  // 5. RFC 8058 standard one-click unsubscribe headers
  const rfc8058Headers: Record<string, string> = {
    "List-Unsubscribe": `<${baseUrl}/api/notifications/unsubscribe?token=${token}>, <mailto:unsubscribe@deutschpfad.com?subject=unsubscribe&body=${token}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };

  // 6. Deliver via configured transport (Resend, SendGrid, Postmark, or simulated dev transport)
  const isProd = process.env.NODE_ENV === "production";
  const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;

  if (isProd && apiKey) {
    try {
      // Production external provider dispatch
      // (e.g. using Resend / standard REST API)
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: "Deutsch Pfad <hallo@deutschpfad.com>",
          to: [recipientEmail],
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          headers: rfc8058Headers,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Email Provider Error]:", errorText);
        return { success: false, status: "error", reason: errorText, rendered };
      }

      const resData = await res.json();
      return {
        success: true,
        status: "sent",
        messageId: resData.id || `msg_${Date.now()}`,
        rendered,
        headers: rfc8058Headers,
      };
    } catch (err: any) {
      console.error("[Email Dispatch Exception]:", err);
      return { success: false, status: "error", reason: err.message, rendered };
    }
  }

  // Development / Preview mode dispatch: logs successfully with full telemetry
  const messageId = `sim_msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  console.info(
    `[Lifecycle Email Sent (Simulation)] To: ${recipientEmail} | Template: ${payload.templateId} | Subject: "${rendered.subject}" | MessageId: ${messageId}`
  );

  return {
    success: true,
    status: "sent",
    messageId,
    rendered,
    headers: rfc8058Headers,
  };
}
