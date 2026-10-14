import { NextRequest, NextResponse } from "next/server";
import { SendTestEmailSchema } from "@/lib/validations/apiSchemas";
import { getMockEmailPayload } from "@/lib/email/renderer";
import { dispatchLifecycleEmail } from "@/lib/email/lifecycleDispatcher";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`notif-test:${clientIp}`, 20, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429, headers: rateLimit.headers });
  }

  try {
    const body = await req.json();
    const validation = SendTestEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", issues: validation.error.issues },
        { status: 422, headers: rateLimit.headers }
      );
    }

    const { templateId, recipientEmail } = validation.data;
    const payload = getMockEmailPayload(templateId, recipientEmail);

    const result = await dispatchLifecycleEmail(payload);

    return NextResponse.json(
      {
        success: result.success,
        status: result.status,
        templateId,
        messageId: result.messageId,
        recipientEmail: payload.data.recipientEmail,
        subject: result.rendered?.subject,
        preheader: result.rendered?.preheader,
        htmlPreview: result.rendered?.html,
        textPreview: result.rendered?.text,
      },
      { headers: rateLimit.headers }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
  }
}
