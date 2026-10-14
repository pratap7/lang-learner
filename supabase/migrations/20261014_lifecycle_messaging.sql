-- ==============================================================================
-- Migration: 20261014_lifecycle_messaging.sql
-- Notification Preferences, Quiet Hours, and Dispatch Audit Logging
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    weekly_progress BOOLEAN NOT NULL DEFAULT TRUE,
    streak_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    milestone_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    product_updates BOOLEAN NOT NULL DEFAULT TRUE,
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    quiet_hours_start INTEGER NOT NULL DEFAULT 22 CHECK (quiet_hours_start >= 0 AND quiet_hours_start <= 23),
    quiet_hours_end INTEGER NOT NULL DEFAULT 8 CHECK (quiet_hours_end >= 0 AND quiet_hours_end <= 23),
    quiet_hours_timezone TEXT NOT NULL DEFAULT 'Europe/Berlin',
    unsubscribed_all BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "User can view own notification preferences" ON public.user_notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can update own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "User can update own notification preferences" ON public.user_notification_preferences
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can insert own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "User can insert own notification preferences" ON public.user_notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Notification Dispatch Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS public.notification_dispatch_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    template_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent', 'deferred_quiet_hours', 'suppressed_opt_out', 'error')),
    provider_message_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.notification_dispatch_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own notification history" ON public.notification_dispatch_logs;
CREATE POLICY "User can view own notification history" ON public.notification_dispatch_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.user_notification_preferences TO authenticated;
GRANT SELECT ON public.notification_dispatch_logs TO authenticated;
