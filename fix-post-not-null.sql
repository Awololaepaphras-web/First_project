
-- ===============================================================
-- FIX: Robust Post Creation & Not-Null Constraint Resolution
-- ===============================================================

-- 1. Relax constraints on posts and statuses tables to prevent hard failures
-- Fallbacks in functions will handle the data population, but this adds a safety layer.
ALTER TABLE public.posts ALTER COLUMN user_nickname DROP NOT NULL;
ALTER TABLE public.posts ALTER COLUMN user_name DROP NOT NULL;
ALTER TABLE public.statuses ALTER COLUMN user_nickname DROP NOT NULL;
ALTER TABLE public.statuses ALTER COLUMN user_name DROP NOT NULL;

-- 2. Update create_post_v2 (Core Posting)
CREATE OR REPLACE FUNCTION public.create_post_v2(
    p_content TEXT, 
    p_media_url TEXT DEFAULT NULL, 
    p_media_type TEXT DEFAULT NULL, 
    p_parent_id UUID DEFAULT NULL,
    p_is_parallel BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_name TEXT;
    v_user_nickname TEXT;
    v_user_avatar TEXT;
    v_user_uni TEXT;
    v_post_id UUID;
    v_deduction_result JSONB;
    v_target_uni TEXT;
    v_time_now BIGINT := (extract(epoch from now()) * 1000)::bigint;
BEGIN
    -- Security Check
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    -- 1. Get user info with fallbacks
    SELECT name, nickname, profile_picture, university 
    INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- HARDENING: Ensure we have values for mandatory columns
    v_user_name := COALESCE(v_user_name, 'Proph User');
    v_user_nickname := COALESCE(v_user_nickname, 'user_' || substr(v_user_id::text, 1, 8));

    -- 2. Deduct points (30 for post)
    v_deduction_result := public.deduct_points_secure(30);
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- 3. Determine target university isolation
    IF p_is_parallel THEN
        v_target_uni := NULL;
    ELSE
        v_target_uni := COALESCE(v_user_uni, 'General'); 
    END IF;

    -- 4. Create post
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university, university,
        content, media_url, media_type, parent_id, status, visibility, created_at
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni, v_target_uni,
        p_content, p_media_url, p_media_type, p_parent_id, 'approved', 'public', v_time_now
    ) RETURNING id INTO v_post_id;

    RETURN jsonb_build_object('success', true, 'post_id', v_post_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update handle_post_reply (Replies)
CREATE OR REPLACE FUNCTION public.handle_post_reply(
    p_post_id UUID,
    p_reply_content TEXT,
    p_media_url TEXT DEFAULT NULL,
    p_media_type TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_name TEXT;
    v_user_nickname TEXT;
    v_user_avatar TEXT;
    v_user_uni TEXT;
    v_deduction_result JSONB;
    v_time_now BIGINT := (extract(epoch from now()) * 1000)::bigint;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    -- 1. Get user info
    SELECT name, nickname, profile_picture, university 
    INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- HARDENING
    v_user_name := COALESCE(v_user_name, 'Proph User');
    v_user_nickname := COALESCE(v_user_nickname, 'user_' || substr(v_user_id::text, 1, 8));

    -- 2. Deduct points (30 for reply)
    v_deduction_result := public.deduct_points_secure(30);
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- 3. Create reply (parent_id = p_post_id)
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university, university,
        content, media_url, media_type, parent_id, status, visibility, created_at
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni, v_user_uni,
        p_reply_content, p_media_url, p_media_type, p_post_id, 'approved', 'public', v_time_now
    );

    -- 4. Update engagement on the parent post (Optional but good for stats)
    -- This logic is usually in handle_engagement_secure but we ensure reply works first

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Update handle_status_update (Stories)
CREATE OR REPLACE FUNCTION public.handle_status_update(
    p_url TEXT,
    p_media_type TEXT DEFAULT 'image',
    p_caption TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_name TEXT;
    v_user_nickname TEXT;
    v_user_avatar TEXT;
    v_user_uni TEXT;
    v_cost INTEGER;
    v_deduction_result JSONB;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
    END IF;

    -- Get user info
    SELECT name, nickname, profile_picture, university 
    INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- HARDENING
    v_user_name := COALESCE(v_user_name, 'Proph User');
    v_user_nickname := COALESCE(v_user_nickname, 'user_' || substr(v_user_id::text, 1, 8));

    -- Get cost (default 50)
    SELECT (config->>'statusCost')::INTEGER INTO v_cost FROM public.system_config WHERE id = 'default';
    v_cost := COALESCE(v_cost, 50);

    -- Deduct points
    v_deduction_result := public.deduct_points_secure(v_cost);
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- Create status
    INSERT INTO public.statuses (
        user_id, user_name, user_nickname, university, user_avatar, media_url, media_type, caption, expires_at, renewed_count, view_count
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_uni, v_user_avatar, p_url, p_media_type, p_caption, now() + interval '24 hours', 0, 0
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
