import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { BillingWebhookSchema } from "@/lib/validations/apiSchemas";
import { recordBillingAuditLog } from "@/lib/billingAuditService";

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. Rate limiting on webhook endpoint (60 req/min per IP)
  const rateLimit = checkRateLimit(`billing-webhook:${clientIp}`, 60, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", message: "Too many webhook requests" },
      { status: 429, headers: rateLimit.headers }
    );
  }

  try {
    const rawBody = await req.text();
    const headers = req.headers;

    // Detect provider signature header
    const stripeSignature = headers.get("stripe-signature");
    const razorpaySignature = headers.get("x-razorpay-signature");

    let parsedBody: any = null;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "INVALID_JSON", message: "Invalid JSON payload received" },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // 2. Schema validation
    const validation = BillingWebhookSchema.safeParse(parsedBody);
    if (!validation.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: validation.error.format() },
        { status: 422, headers: rateLimit.headers }
      );
    }

    const eventPayload = validation.data;
    const eventType = eventPayload.event || eventPayload.type || "unknown";
    const provider = stripeSignature ? "stripe" : razorpaySignature ? "razorpay" : "mock";

    const supabase = await createClient();
    let targetUserId: string | null = null;

    // ──────────────── Stripe Events ────────────────
    if (provider === "stripe" || eventType.startsWith("customer.subscription.") || eventType.startsWith("checkout.")) {
      switch (eventType) {
        case "checkout.session.completed": {
          const session = eventPayload.data?.object;
          targetUserId = session?.client_reference_id || session?.metadata?.userId;
          const planId = session?.metadata?.planId || "pro";

          if (targetUserId) {
            await supabase
              .from("user_profiles")
              .update({
                target_level: planId === "pro_plus" ? "c1" : "b1",
              })
              .eq("id", targetUserId);
          }
          break;
        }

        case "customer.subscription.updated": {
          const sub = eventPayload.data?.object;
          targetUserId = sub?.metadata?.userId || null;
          break;
        }

        case "customer.subscription.deleted": {
          const sub = eventPayload.data?.object;
          targetUserId = sub?.metadata?.userId || null;
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = eventPayload.data?.object;
          targetUserId = invoice?.metadata?.userId || null;
          break;
        }
      }
    }

    // ──────────────── Razorpay Events ────────────────
    if (provider === "razorpay" || eventType.startsWith("subscription.")) {
      switch (eventType) {
        case "subscription.charged": {
          const subEntity = eventPayload.payload?.subscription?.entity;
          targetUserId = subEntity?.notes?.userId || null;
          break;
        }

        case "subscription.paused":
        case "subscription.cancelled": {
          const subEntity = eventPayload.payload?.subscription?.entity;
          targetUserId = subEntity?.notes?.userId || null;
          break;
        }
      }
    }

    // 3. Cryptographic Tamper-Evident Audit Logging
    await recordBillingAuditLog({
      userId: targetUserId,
      provider,
      eventType,
      providerEventId: (eventPayload.id as string) || null,
      payload: eventPayload,
      ipAddress: clientIp,
    });

    return NextResponse.json(
      {
        received: true,
        eventType,
        provider,
        timestamp: new Date().toISOString(),
      },
      { headers: rateLimit.headers }
    );
  } catch (error: any) {
    console.error("[BILLING_WEBHOOK_ERROR]:", error);
    return NextResponse.json(
      { error: "WEBHOOK_FAILED", message: error.message },
      { status: 500 }
    );
  }
}
