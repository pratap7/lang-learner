import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { NotificationPreferencesSchema } from "@/lib/validations/apiSchemas";
import { getDefaultNotificationPreferences } from "@/lib/email/preferencesService";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return default anonymous preferences
    return NextResponse.json(getDefaultNotificationPreferences("anonymous", "learner@example.com"));
  }

  const { data } = (await (supabase as any)
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()) as { data: any };

  if (!data) {
    return NextResponse.json(getDefaultNotificationPreferences(user.id, user.email || ""));
  }

  return NextResponse.json({
    userId: user.id,
    email: user.email || "",
    transactional: true,
    weeklyProgress: data.weekly_progress ?? true,
    streakReminders: data.streak_reminders ?? true,
    milestoneAlerts: data.milestone_alerts ?? true,
    productUpdates: data.product_updates ?? true,
    quietHours: {
      enabled: data.quiet_hours_enabled ?? true,
      startHour: data.quiet_hours_start ?? 22,
      endHour: data.quiet_hours_end ?? 8,
      timezone: data.quiet_hours_timezone || "Europe/Berlin",
    },
    unsubscribedAllMarketing: data.unsubscribed_all ?? false,
    updatedAt: data.updated_at || new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(`notif-pref:${clientIp}`, 30, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please wait." },
      { status: 429, headers: rateLimit.headers }
    );
  }

  try {
    const body = await req.json();
    const validation = NotificationPreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", issues: validation.error.issues },
        { status: 422, headers: rateLimit.headers }
      );
    }

    const {
      weeklyProgress,
      streakReminders,
      milestoneAlerts,
      productUpdates,
      quietHours,
      unsubscribedAllMarketing,
    } = validation.data;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user ? user.id : "anonymous";
    const userEmail = user ? user.email || "" : "learner@example.com";

    if (user) {
      await supabase.from("user_notification_preferences" as any).upsert({
        user_id: user.id,
        email: user.email,
        weekly_progress: weeklyProgress,
        streak_reminders: streakReminders,
        milestone_alerts: milestoneAlerts,
        product_updates: productUpdates,
        quiet_hours_enabled: quietHours.enabled,
        quiet_hours_start: quietHours.startHour,
        quiet_hours_end: quietHours.endHour,
        quiet_hours_timezone: quietHours.timezone,
        unsubscribed_all: unsubscribedAllMarketing,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: true,
        preferences: {
          userId,
          email: userEmail,
          transactional: true,
          weeklyProgress,
          streakReminders,
          milestoneAlerts,
          productUpdates,
          quietHours,
          unsubscribedAllMarketing,
          updatedAt: new Date().toISOString(),
        },
      },
      { headers: rateLimit.headers }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
  }
}
