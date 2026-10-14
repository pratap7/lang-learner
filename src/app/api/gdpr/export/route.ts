import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

/**
 * GDPR Article 20: Right to Data Portability
 * Exports all personal data associated with the authenticated user in portable JSON format.
 */
export async function GET(req: Request) {
  const clientIp = getClientIp(req);

  // Rate limit: 5 export requests per hour per IP/user
  const rateLimit = checkRateLimit(`gdpr-export:${clientIp}`, 5, 3600);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", message: "Data export rate limit reached. Please wait." },
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
    // 1. Fetch user profile
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).single();

    // 2. Fetch learning progress
    const { data: lessonProgress } = await supabase.from("lesson_progress").select("*").eq("user_id", user.id);
    const { data: exerciseAttempts } = await supabase.from("exercise_attempts").select("*").eq("user_id", user.id);
    const { data: flashcards } = await supabase.from("flashcards").select("*").eq("user_id", user.id);
    const { data: srsReviews } = await supabase.from("srs_reviews").select("*").eq("user_id", user.id);
    const { data: mistakes } = await supabase.from("mistakes").select("*").eq("user_id", user.id);

    // 3. Fetch achievements & streaks
    const { data: streaks } = await supabase.from("streaks").select("*").eq("user_id", user.id);
    const { data: xpEvents } = await supabase.from("xp_events").select("*").eq("user_id", user.id);
    const { data: userBadges } = await supabase.from("user_badges").select("*, badges(*)").eq("user_id", user.id);

    // 4. Fetch writing submissions
    const { data: writingSubmissions } = await supabase
      .from("writing_submissions")
      .select("*")
      .eq("user_id", user.id);

    // 5. Fetch consents
    const { data: consents } = await supabase.from("user_consents").select("*").eq("user_id", user.id);

    // 6. Record export event in user_data_exports audit table
    await supabase.from("user_data_exports").insert({
      user_id: user.id,
      export_type: "full_archive",
      status: "completed",
    });

    const exportPayload = {
      exportMetadata: {
        platform: "Deutsch Pfad (https://deutschpfad.com)",
        generatedAt: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        gdprArticle: "Article 20 (Right to Data Portability)",
      },
      profile: profile || {},
      learningData: {
        lessonProgress: lessonProgress || [],
        exerciseAttempts: exerciseAttempts || [],
        flashcards: flashcards || [],
        srsReviews: srsReviews || [],
        mistakes: mistakes || [],
      },
      gamification: {
        streaks: streaks || [],
        xpEvents: xpEvents || [],
        badges: userBadges || [],
      },
      writingSubmissions: writingSubmissions || [],
      consents: consents || [],
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="deutsch-pfad-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
        ...rateLimit.headers,
      },
    });
  } catch (err: any) {
    console.error("[GDPR Export Error]:", err);
    return NextResponse.json(
      { error: "EXPORT_FAILED", message: "Failed to generate GDPR data export." },
      { status: 500 }
    );
  }
}
