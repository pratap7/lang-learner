-- ==============================================================================
-- Migration: 20261014_security_and_privacy_hardening.sql
-- Security & Privacy Hardening: RLS, Billing Audit Logging, Voice Retention, and GDPR
-- ==============================================================================

-- 1. WRITING SUBMISSIONS TABLE & RLS
CREATE TABLE IF NOT EXISTS public.writing_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    original_text TEXT NOT NULL,
    corrected_text TEXT,
    total_score INTEGER CHECK (total_score >= 0 AND total_score <= 20),
    percentage INTEGER CHECK (percentage >= 0 AND percentage <= 100),
    cefr_rating TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    rubric_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own writing submissions" ON public.writing_submissions;
CREATE POLICY "User can view own writing submissions" ON public.writing_submissions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can insert own writing submissions" ON public.writing_submissions;
CREATE POLICY "User can insert own writing submissions" ON public.writing_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can delete own writing submissions" ON public.writing_submissions;
CREATE POLICY "User can delete own writing submissions" ON public.writing_submissions
    FOR DELETE USING (auth.uid() = user_id);


-- 2. BILLING SUBSCRIPTIONS & AUDIT LOGGING (TAMPER-EVIDENT)
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'razorpay', 'paddle', 'mock')),
    provider_customer_id TEXT,
    provider_subscription_id TEXT UNIQUE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('free', 'pro', 'pro_plus')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
    status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'paused', 'canceled')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own subscription" ON public.billing_subscriptions;
CREATE POLICY "User can view own subscription" ON public.billing_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Tamper-Evident Billing Audit Logs (Insert/Update only by Service Role)
CREATE TABLE IF NOT EXISTS public.billing_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    event_type TEXT NOT NULL,
    provider_event_id TEXT,
    amount_cents INTEGER,
    currency TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own billing audit logs" ON public.billing_audit_logs;
CREATE POLICY "User can view own billing audit logs" ON public.billing_audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Only backend service role can insert or modify audit logs
DROP POLICY IF EXISTS "Service role manages billing audit logs" ON public.billing_audit_logs;
CREATE POLICY "Service role manages billing audit logs" ON public.billing_audit_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');


-- 3. VOICE RECORDINGS (STRICT PRIVACY RETENTION: PURGE UNLESS OPT-IN)
CREATE TABLE IF NOT EXISTS public.voice_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_id TEXT NOT NULL,
    duration_seconds NUMERIC(5, 2) NOT NULL,
    mime_type TEXT NOT NULL CHECK (mime_type IN ('audio/webm', 'audio/wav', 'audio/ogg', 'audio/mp4')),
    storage_path TEXT,
    transcript_text TEXT,
    accent_feedback JSONB DEFAULT '{}'::jsonb,
    opted_in_for_storage BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own voice recordings" ON public.voice_recordings;
CREATE POLICY "User can view own voice recordings" ON public.voice_recordings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can delete own voice recordings" ON public.voice_recordings;
CREATE POLICY "User can delete own voice recordings" ON public.voice_recordings
    FOR DELETE USING (auth.uid() = user_id);


-- 4. GDPR CONSENT MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL, -- Anonymous identifier if not authenticated
    essential_cookies BOOLEAN DEFAULT TRUE,
    analytics_cookies BOOLEAN DEFAULT FALSE,
    voice_retention_opt_in BOOLEAN DEFAULT FALSE,
    ip_hash TEXT,
    consent_version TEXT NOT NULL DEFAULT '2026.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can manage own consents" ON public.user_consents;
CREATE POLICY "User can manage own consents" ON public.user_consents
    FOR ALL USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
        (auth.uid() IS NULL AND client_id IS NOT NULL)
    );


-- 5. GDPR DATA EXPORT AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.user_data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('requested', 'completed', 'downloaded', 'purged')),
    export_format TEXT NOT NULL DEFAULT 'json',
    file_size_bytes INTEGER,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.user_data_exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User can view own export history" ON public.user_data_exports;
CREATE POLICY "User can view own export history" ON public.user_data_exports
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "User can request own export" ON public.user_data_exports;
CREATE POLICY "User can request own export" ON public.user_data_exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 6. GDPR RIGHT TO ERASURE (ARTICLE 17) COMPLETE CASCADE FUNCTION
CREATE OR REPLACE FUNCTION public.gdpr_delete_user_account(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Verify executing user is deleting their own account or service role
    IF auth.uid() <> target_user_id AND auth.jwt() ->> 'role' <> 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized account deletion request.';
    END IF;

    -- Delete in foreign key order (most cascade automatically)
    DELETE FROM public.voice_recordings WHERE user_id = target_user_id;
    DELETE FROM public.writing_submissions WHERE user_id = target_user_id;
    DELETE FROM public.srs_reviews WHERE user_id = target_user_id;
    DELETE FROM public.mistakes WHERE user_id = target_user_id;
    DELETE FROM public.lesson_progress WHERE user_id = target_user_id;
    DELETE FROM public.user_profiles WHERE id = target_user_id;
    DELETE FROM public.user_consents WHERE user_id = target_user_id;

    -- Anonymize billing audit logs to comply with tax retention laws while clearing PII
    UPDATE public.billing_audit_logs
    SET user_id = NULL,
        ip_address = '0.0.0.0',
        user_agent = 'ANONYMIZED'
    WHERE user_id = target_user_id;

    result := jsonb_build_object(
        'success', TRUE,
        'purged_user_id', target_user_id,
        'timestamp', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
