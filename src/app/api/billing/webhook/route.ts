import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

    // Detect provider signature header
    const stripeSignature = headers.get("stripe-signature");
    const razorpaySignature = headers.get("x-razorpay-signature");

    let eventType = "unknown";
    let eventPayload: any = null;

    try {
      eventPayload = JSON.parse(rawBody);
      eventType = eventPayload.event || eventPayload.type || "unknown";
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const supabase = await createClient();

    // ──────────────── Stripe Events ────────────────
    if (stripeSignature || eventType.startsWith("customer.subscription.") || eventType.startsWith("checkout.")) {
      switch (eventType) {
        case "checkout.session.completed": {
          const session = eventPayload.data?.object;
          const userId = session?.client_reference_id || session?.metadata?.userId;
          const planId = session?.metadata?.planId || "pro";

          if (userId) {
            await supabase.from("user_profiles").update({
              target_level: planId === "pro_plus" ? "c1" : "b1",
            }).eq("id", userId);
          }
          break;
        }

        case "customer.subscription.updated": {
          const sub = eventPayload.data?.object;
          const status = sub?.status; // active, trialing, past_due, canceled
          // Sync active status
          break;
        }

        case "customer.subscription.deleted": {
          const sub = eventPayload.data?.object;
          // Revert user to free plan
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = eventPayload.data?.object;
          // Record paid invoice in subscription_invoices table if table exists
          break;
        }
      }
    }

    // ──────────────── Razorpay Events (India) ────────────────
    if (razorpaySignature || eventType.startsWith("subscription.")) {
      switch (eventType) {
        case "subscription.charged": {
          const subEntity = eventPayload.payload?.subscription?.entity;
          // Update renewal period end
          break;
        }

        case "subscription.paused":
        case "subscription.cancelled": {
          // Sync pause / cancel
          break;
        }
      }
    }

    return NextResponse.json({
      received: true,
      eventType,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Webhook processing failed", message: error.message },
      { status: 500 }
    );
  }
}
