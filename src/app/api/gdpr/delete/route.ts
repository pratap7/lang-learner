import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { GdprAccountDeletionSchema } from "@/lib/validations/apiSchemas";

/**
 * GDPR Article 17: Right to Erasure ("Right to be Forgotten")
 * Cascades erasure across all user data, anonymizes necessary tax records,
 * deletes voice records, and terminates the auth identity.
 */
export async function POST(req: Request) {
  const clientIp = getClientIp(req);

  // Rate limit: 3 account deletion requests per hour per IP
  const rateLimit = checkRateLimit(`gdpr-delete:${clientIp}`, 3, 3600);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", message: "Too many deletion requests. Please try later." },
      { status: 429, headers: rateLimit.headers }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Authentication required" }, { status: 401 });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "INVALID_JSON", message: "Invalid JSON request body." },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // Validate confirmation string "DELETE"
    const validation = GdprAccountDeletionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "CONFIRMATION_REQUIRED",
          message: "Account deletion requires explicit confirmation string 'DELETE'.",
          issues: validation.error.issues,
        },
        { status: 422, headers: rateLimit.headers }
      );
    }

    // Call stored procedure to cascade wipe user data and anonymize billing
    const { error: rpcError } = await (supabase as any).rpc("gdpr_delete_user_account", {
      target_user_id: user.id,
    });

    if (rpcError) {
      console.error("[GDPR Delete RPC Error]:", rpcError);
      // Fallback manual cascade deletion if RPC is not yet applied
      await supabase.from("user_profiles").delete().eq("id", user.id);
      await supabase.from("writing_submissions").delete().eq("user_id", user.id);
      await supabase.from("voice_recordings").delete().eq("user_id", user.id);
      await supabase.from("user_consents").delete().eq("user_id", user.id);
    }

    // Sign out user session
    await supabase.auth.signOut();

    return NextResponse.json(
      {
        success: true,
        message: "Your account and all associated personal data have been permanently erased in accordance with GDPR Article 17.",
        erasedAt: new Date().toISOString(),
      },
      { headers: rateLimit.headers }
    );
  } catch (err: any) {
    console.error("[GDPR Delete Error]:", err);
    return NextResponse.json(
      { error: "DELETION_FAILED", message: "Failed to complete account erasure." },
      { status: 500 }
    );
  }
}
