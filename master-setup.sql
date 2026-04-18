-- ===============================================================
-- PROPH APP: MASTER DATABASE SETUP (CONSOLIDATED)
-- ===============================================================
-- This script sets up the entire database schema, including:
-- 1. Extensions & Helper Functions
-- 2. Core Tables (Users, Posts, Messages, etc.)
-- 3. RPC Functions (Feeds, Polls, Admin, Transfers)
-- 4. Real-time Enabling & Replica Identity
-- 5. RLS Policies
-- ===============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS
-- Function to generate a 17-character alphanumeric Proph ID
CREATE OR REPLACE FUNCTION public.generate_proph_id() 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..17 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 3. TABLES

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    university TEXT NOT NULL,
    level TEXT,
    points INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_premium BOOLEAN DEFAULT false,
    premium_until TIMESTAMP WITH TIME ZONE,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES public.users(id),
    theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light')),
    is_sug_verified BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verification_code TEXT,
    followers UUID[] DEFAULT '{}',
    following UUID[] DEFAULT '{}',
    bank_details JSONB DEFAULT '{}',
    referral_stats JSONB DEFAULT '{"clicks": 0, "signups": 0, "withdrawals": 0, "loginStreaks": 0}',
    engagement_stats JSONB DEFAULT '{"totalLikesGiven": 0, "totalRepliesGiven": 0, "totalRepostsGiven": 0, "totalLinkClicks": 0, "totalProfileClicks": 0, "totalMediaViews": 0}',
    gladiator_earnings JSONB DEFAULT '{"total": 0, "arena": 0, "vault": 0, "referrals": 0}',
    staff_permissions TEXT[] DEFAULT '{}',
    blocked_users UUID[] DEFAULT '{}',
    has_seen_onboarding BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    referral_count INTEGER DEFAULT 0,
    ai_app_unlocked_until TIMESTAMP WITH TIME ZONE,
    engagement_score INTEGER DEFAULT 0,
    registration_ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts Table (Updated with Poll and Status)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_name TEXT,
    user_nickname TEXT,
    user_avatar TEXT,
    user_university TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    likes UUID[] DEFAULT '{}',
    reposts UUID[] DEFAULT '{}',
    comments JSONB DEFAULT '[]',
    parent_id UUID REFERENCES public.posts(id),
    tags TEXT[] DEFAULT '{}',
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'node_only', 'private')),
    is_edited BOOLEAN DEFAULT false,
    ad_id UUID,
    poll JSONB, -- Added for Polls
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'active')), -- Added for Moderation
    stats JSONB DEFAULT '{"linkClicks": 0, "profileClicks": 0, "mediaViews": 0, "detailsExpanded": 0, "impressions": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL, -- Changed to TIMESTAMPTZ
    university TEXT -- For university feed filtering
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    university TEXT, -- Added for university-specific filtering
    content TEXT,
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'voice')),
    group_id UUID, 
    reply_to UUID,
    reply_to_content TEXT,
    is_seen BOOLEAN DEFAULT false,
    seen_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    university_id TEXT NOT NULL,
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    year INTEGER,
    semester TEXT,
    faculty TEXT,
    department TEXT,
    level TEXT,
    description TEXT,
    type TEXT,
    file_url TEXT NOT NULL,
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Statuses Table (Stories)
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_nickname TEXT NOT NULL,
    university TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'gif')),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    renewed_count INTEGER DEFAULT 0,
    last_renewed_at TIMESTAMP WITH TIME ZONE
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user1_id, user2_id)
);

-- 4. RPC FUNCTIONS

-- A. Admin Check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR (
      auth.jwt() ->> 'email' = 'awololaeo.22@student.funaab.edu.ng' AND
      (auth.jwt() ->> 'email_verified')::boolean = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Global Feed RPC
DROP FUNCTION IF EXISTS public.fetch_secure_feed(INTEGER, INTEGER);
-- Function to fetch a secure, personalized feed
CREATE OR REPLACE FUNCTION public.fetch_secure_feed(limit_count INTEGER, offset_count INTEGER)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.posts
    WHERE visibility = 'public'
    AND university IS NULL -- EXCLUDE university-specific posts from global feed
    AND status IN ('approved', 'active')
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. University Feed RPC
DROP FUNCTION IF EXISTS public.fetch_university_feed(TEXT, INTEGER, INTEGER);
CREATE OR REPLACE FUNCTION public.fetch_university_feed(p_university TEXT, limit_count INTEGER, offset_count INTEGER)
RETURNS SETOF public.posts AS $$
DECLARE
    user_uni TEXT;
BEGIN
    -- Get caller's university safely
    SELECT u.university INTO user_uni FROM public.users u WHERE u.id = auth.uid();
    
    -- Strict isolation check: caller must belong to the university they are requesting
    IF user_uni != p_university AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: You do not belong to this university node.';
    END IF;

    RETURN QUERY
    SELECT *
    FROM public.posts
    WHERE (university = p_university OR user_university = p_university)
    AND (visibility = 'public' OR visibility = 'node_only')
    AND status IN ('approved', 'active')
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Secure Poll Voting RPC
DROP FUNCTION IF EXISTS public.vote_on_poll(UUID, TEXT, UUID);
CREATE OR REPLACE FUNCTION public.vote_on_poll(p_post_id UUID, p_option_id TEXT, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_poll JSONB;
    v_options JSONB;
    v_option JSONB;
    v_new_options JSONB := '[]'::jsonb;
    v_has_voted BOOLEAN := false;
    v_updated_poll JSONB;
BEGIN
    -- 1. Get current poll data
    SELECT poll INTO v_poll FROM public.posts WHERE id = p_post_id;
    
    IF v_poll IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Poll not found');
    END IF;

    -- 2. Check if poll has expired
    IF (v_poll->>'expiresAt')::BIGINT < (extract(epoch from now()) * 1000)::BIGINT THEN
        RETURN jsonb_build_object('success', false, 'error', 'Poll has expired');
    END IF;

    -- 3. Check if user already voted
    v_options := v_poll->'options';
    FOR v_option IN SELECT jsonb_array_elements(v_options) LOOP
        IF v_option->'votes' @> jsonb_build_array(p_user_id) THEN
            v_has_voted := true;
            EXIT;
        END IF;
    END LOOP;

    IF v_has_voted THEN
        RETURN jsonb_build_object('success', false, 'error', 'User has already voted');
    END IF;

    -- 4. Update the specific option with the new vote
    FOR v_option IN SELECT jsonb_array_elements(v_options) LOOP
        IF v_option->>'id' = p_option_id THEN
            v_option := jsonb_set(v_option, '{votes}', (v_option->'votes') || jsonb_build_array(p_user_id));
        END IF;
        v_new_options := v_new_options || v_option;
    END LOOP;

    -- 5. Save updated poll
    v_updated_poll := jsonb_set(v_poll, '{options}', v_new_options);
    UPDATE public.posts SET poll = v_updated_poll WHERE id = p_post_id;

    RETURN jsonb_build_object('success', true, 'poll', v_updated_poll);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- E. Point Transfer RPC
CREATE OR REPLACE FUNCTION public.transfer_points(receiver_proph_id TEXT, transfer_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  sender_id UUID := auth.uid();
  receiver_id UUID;
BEGIN
  IF sender_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF transfer_amount < 5000 THEN RAISE EXCEPTION 'Minimum transfer is 5000 points'; END IF;
  
  SELECT id INTO receiver_id FROM public.users WHERE referral_code = receiver_proph_id;
  IF receiver_id IS NULL THEN RAISE EXCEPTION 'Receiver node not found'; END IF;
  IF sender_id = receiver_id THEN RAISE EXCEPTION 'Cannot transfer to self'; END IF;
  
  IF (SELECT points FROM public.users WHERE id = sender_id) < transfer_amount THEN
    RAISE EXCEPTION 'Insufficient points in vault';
  END IF;

  UPDATE public.users SET points = points - transfer_amount WHERE id = sender_id;
  UPDATE public.users SET points = points + transfer_amount WHERE id = receiver_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. REAL-TIME ENABLING
DO $$
BEGIN
    -- Enable Realtime for core tables
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'posts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'statuses') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.statuses;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'documents') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'conversations') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
    END IF;

    -- Ensure full row data (including poll column) is sent on updates
    ALTER TABLE public.posts REPLICA IDENTITY FULL;
END $$;

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_university_status ON public.posts(university, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_status ON public.posts(visibility, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_statuses_user_expiry ON public.statuses(user_id, expires_at);
