import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

/**
 * Sanitizes the 'next' redirect URL parameter to strictly prevent Open Redirect attacks.
 * Disallows protocol-relative URLs (//evil.com), scheme injection (javascript:, https:),
 * and backslash path tricks.
 */
function sanitizeRedirectPath(path: string | null): string {
  if (!path) return "/onboarding";

  // Must begin with a single slash, not double slash or backslash
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return "/onboarding";
  }

  // Must not contain colon before any query or fragment (prevents javascript: or protocol smuggling)
  const pathWithoutQuery = path.split("?")[0].split("#")[0];
  if (pathWithoutQuery.includes(":")) {
    return "/onboarding";
  }

  return path;
}

export async function GET(request: Request) {
  const clientIp = getClientIp(request);

  // Rate limit auth callback requests (10 req/min per IP to prevent brute forcing auth codes)
  const rateLimit = checkRateLimit(`auth-callback:${clientIp}`, 10, 60);
  if (!rateLimit.allowed) {
    return new NextResponse("Too many authentication attempts. Please try again later.", {
      status: 429,
      headers: rateLimit.headers,
    });
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const safeNext = sanitizeRedirectPath(rawNext);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has already completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/profile`);
        }
      }

      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Return user to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
