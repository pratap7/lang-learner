import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyUnsubscribeToken } from "@/lib/email/preferencesService";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

/**
 * RFC 8058 One-Click Unsubscribe Handler
 * Email clients (e.g. Gmail, Apple Mail) invoke this endpoint via HTTP POST
 * to process instant 1-click unsubscriptions without user friction.
 */
export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`unsub:${clientIp}`, 30, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "TOO_MANY_REQUESTS" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "MISSING_TOKEN", message: "Unsubscribe token is required" }, { status: 400 });
  }

  const verification = verifyUnsubscribeToken(token);
  if (!verification.valid || !verification.userId) {
    return NextResponse.json({ error: "INVALID_TOKEN", message: "Token is invalid or expired" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    await supabase.from("user_notification_preferences" as any).upsert({
      user_id: verification.userId,
      email: verification.email,
      weekly_progress: false,
      streak_reminders: false,
      milestone_alerts: false,
      product_updates: false,
      unsubscribed_all: true,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      unsubscribed: true,
      email: verification.email,
      message: "You have been successfully unsubscribed from all Deutsch Pfad marketing and engagement emails.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
  }
}

/**
 * Browser GET handler: validates token and redirects cleanly to the friendly user unsubscribe view
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${origin}/unsubscribe?error=missing_token`);
  }

  const verification = verifyUnsubscribeToken(token);
  if (!verification.valid) {
    return NextResponse.redirect(`${origin}/unsubscribe?error=invalid_token`);
  }

  return NextResponse.redirect(`${origin}/unsubscribe?token=${token}&email=${encodeURIComponent(verification.email || "")}`);
}
