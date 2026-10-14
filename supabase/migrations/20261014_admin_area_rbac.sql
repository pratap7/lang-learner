-- ==============================================================================
-- Migration: 20261014_admin_area_rbac.sql
-- DeutschPfad Secure Admin Area: RBAC, Content Review Workflow, Support Inbox,
-- Feature Flags, and Immutable Admin Action Audit Logging
-- ==============================================================================

-- 1. ADMIN USERS & ROLES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE public.admin_role AS ENUM (
            'super_admin',
            'admin',
            'curator',
            'support_agent'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.admin_role NOT NULL DEFAULT 'support_agent',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin team members" ON public.admin_users;
CREATE POLICY "Admins can view admin team members" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );

DROP POLICY IF EXISTS "Super admins can manage admin team" ON public.admin_users;
CREATE POLICY "Super admins can manage admin team" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.role = 'super_admin' AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );


-- 2. CONTENT MANAGEMENT SYSTEM (CMS) & REVIEW WORKFLOW
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_review_status') THEN
        CREATE TYPE public.content_review_status AS ENUM (
            'draft',
            'needs_review',
            'approved',
            'published'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_entity_type') THEN
        CREATE TYPE public.content_entity_type AS ENUM (
            'unit',
            'lesson',
            'exercise',
            'graded_text'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_content_items (
    id TEXT PRIMARY KEY,
    entity_type public.content_entity_type NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'all')),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    title_de TEXT NOT NULL,
    review_status public.content_review_status NOT NULL DEFAULT 'draft',
    parent_id TEXT, -- e.g. unit_id for lessons, lesson_id for exercises
    order_index INTEGER NOT NULL DEFAULT 0,
    content_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by TEXT NOT NULL,
    last_modified_by TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_admin_content_type_status ON public.admin_content_items (entity_type, review_status);
CREATE INDEX IF NOT EXISTS idx_admin_content_level ON public.admin_content_items (level);

ALTER TABLE public.admin_content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published content" ON public.admin_content_items;
CREATE POLICY "Public can view published content" ON public.admin_content_items
    FOR SELECT USING (review_status = 'published');

DROP POLICY IF EXISTS "Admins and Curators can view all content" ON public.admin_content_items;
CREATE POLICY "Admins and Curators can view all content" ON public.admin_content_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );

DROP POLICY IF EXISTS "Curators and Admins can edit content" ON public.admin_content_items;
CREATE POLICY "Curators and Admins can edit content" ON public.admin_content_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'admin', 'curator') 
            AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );


-- 3. CONTENT REVIEWER NOTES & FEEDBACK THREADS
CREATE TABLE IF NOT EXISTS public.content_reviewer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id TEXT NOT NULL REFERENCES public.admin_content_items(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role public.admin_role NOT NULL,
    note TEXT NOT NULL,
    status_tag public.content_review_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_reviewer_notes_content ON public.content_reviewer_notes (content_id);
ALTER TABLE public.content_reviewer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin staff can view and create reviewer notes" ON public.content_reviewer_notes;
CREATE POLICY "Admin staff can view and create reviewer notes" ON public.content_reviewer_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );


-- 4. FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_feature_flags (
    id TEXT PRIMARY KEY, -- e.g. 'ai_speaking_eval', 'regional_pricing_in'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_audiences JSONB NOT NULL DEFAULT '["all"]'::jsonb,
    is_killswitch BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.admin_feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active feature flags" ON public.admin_feature_flags;
CREATE POLICY "Public can view active feature flags" ON public.admin_feature_flags
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage feature flags" ON public.admin_feature_flags;
CREATE POLICY "Admins can manage feature flags" ON public.admin_feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'admin') 
            AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );


-- 5. SUPPORT INBOX & TICKETS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_ticket_status') THEN
        CREATE TYPE public.support_ticket_status AS ENUM (
            'open',
            'in_progress',
            'pending_customer',
            'resolved',
            'closed'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_ticket_priority') THEN
        CREATE TYPE public.support_ticket_priority AS ENUM (
            'low',
            'normal',
            'high',
            'urgent'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'support_ticket_category') THEN
        CREATE TYPE public.support_ticket_category AS ENUM (
            'billing',
            'content_feedback',
            'technical_bug',
            'account_access',
            'feature_request'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL, -- e.g. 'DP-2026-1042'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    category public.support_ticket_category NOT NULL DEFAULT 'content_feedback',
    priority public.support_ticket_priority NOT NULL DEFAULT 'normal',
    status public.support_ticket_status NOT NULL DEFAULT 'open',
    assigned_to TEXT, -- admin email or name
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system_event', 'internal_note')),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    body TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets (status, priority);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket ON public.support_ticket_messages (ticket_id);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view and manage support tickets" ON public.support_tickets;
CREATE POLICY "Admins can view and manage support tickets" ON public.support_tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );

DROP POLICY IF EXISTS "Admins can manage support messages" ON public.support_ticket_messages;
CREATE POLICY "Admins can manage support messages" ON public.support_ticket_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );


-- 6. IMMUTABLE ADMIN ACTION AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    admin_role public.admin_role NOT NULL,
    action TEXT NOT NULL, -- e.g. 'content.publish', 'subscription.manual_plan_change', 'refund.issued', 'feature_flag.update'
    target_entity_type TEXT NOT NULL, -- e.g. 'content_item', 'user_subscription', 'support_ticket', 'feature_flag'
    target_entity_id TEXT NOT NULL,
    description TEXT NOT NULL,
    changes_diff JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_entity ON public.admin_audit_logs (target_entity_type, target_entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin ON public.admin_audit_logs (admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs (created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs are strictly append-only: no updates or deletes permitted
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'admin') 
            AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );

DROP POLICY IF EXISTS "Staff can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Staff can insert audit logs" ON public.admin_audit_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.user_id = auth.uid() AND au.is_active = TRUE
        ) OR auth.jwt() ->> 'role' = 'service_role'
    );
