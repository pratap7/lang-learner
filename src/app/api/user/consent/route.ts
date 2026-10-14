import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserConsentSchema } from "@/lib/validations/apiSchemas";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      consentEssential: true,
      consentAnalytics: false,
      consentVoiceRetention: false,
      isAnonymous: true,
    });
  }

  const { data } = await supabase
    .from("user_consents")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    consentEssential: true,
    consentAnalytics: data?.consent_analytics ?? false,
    consentVoiceRetention: data?.consent_voice_retention ?? false,
    updatedAt: data?.updated_at || null,
    isAnonymous: false,
  });
}

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`consent-update:${clientIp}`, 20, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", message: "Too many consent updates" },
      { status: 429, headers: rateLimit.headers }
    );
  }

  try {
    const body = await req.json();
    const validation = UserConsentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", issues: validation.error.issues },
        { status: 422, headers: rateLimit.headers }
      );
    }

    const { consentAnalytics, consentVoiceRetention } = validation.data;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("user_consents").upsert({
        user_id: user.id,
        consent_essential: true,
        consent_analytics: consentAnalytics,
        consent_voice_retention: consentVoiceRetention,
        ip_hash: clientIp,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        consent: {
          consentEssential: true,
          consentAnalytics,
          consentVoiceRetention,
        },
      },
      { headers: rateLimit.headers }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
  }
}
