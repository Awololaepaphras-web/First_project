-- ===============================================================
-- PROPH APP: FINAL SCHEMA UPDATES
-- ===============================================================
-- This script adds missing columns and tables to ensure the app
-- functions correctly with the latest features.
-- ===============================================================

-- 1. USERS TABLE UPDATES
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS premium_until BIGINT,
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'none' CHECK (premium_tier IN ('none', 'premium', 'premium_plus', 'alpha_premium')),
ADD COLUMN IF NOT EXISTS daily_points DECIMAL DEFAULT 500,
ADD COLUMN IF NOT EXISTS last_points_reset TIMESTAMP WITH TIME ZONE;

-- 2. POSTS TABLE UPDATES
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS poll JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
ADD COLUMN IF NOT EXISTS renewed_count INTEGER DEFAULT 0;

-- 3. STATUSES (STORIES) TABLE UPDATES
-- Ensure consistency with the RPCs
ALTER TABLE public.statuses 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS renewal_count INTEGER DEFAULT 0;

-- 4. MISSING TABLES (If not already created)

-- Admin Logs Table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON public.posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_poll ON public.posts USING gin (poll);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);

-- 6. REAL-TIME ENABLING
-- Ensure all relevant tables are in the realtime publication
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'posts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'users') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END $$;

-- ===============================================================
-- SCHEMA UPDATE COMPLETE
-- ===============================================================
