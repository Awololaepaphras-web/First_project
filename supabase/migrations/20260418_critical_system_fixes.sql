
-- ===============================================================
-- PROPH APP: CRITICAL SYSTEM FIXES
-- ===============================================================
-- This script fixes the feed posting issues, status failures,
-- and enhances database robustness.
-- ===============================================================

-- 1. FIX POSTS TABLE (Missing Status Column)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='status') THEN
        ALTER TABLE public.posts ADD COLUMN status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'active', 'suspended'));
    END IF;
END $$;

-- Update existing posts to 'approved' if they are null
UPDATE public.posts SET status = 'approved' WHERE status IS NULL;

-- 2. FIX STATUSES TABLE (Missing View Count Column)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='statuses' AND column_name='view_count') THEN
        ALTER TABLE public.statuses ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. FIX IS_ADMIN FUNCTION (More robust)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR (
      -- Emergency fallback for specific owner
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'awololaeo.22@student.funaab.edu.ng'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. FIX HANDLE_STATUS_UPDATE RPC (Naming Mismatch with TS)
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
    -- Get user info
    SELECT name, nickname, profile_picture, university INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- Get cost from config
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

-- 5. FIX CREATE_POST_V2 (Ensure university column is set)
CREATE OR REPLACE FUNCTION public.create_post_v2(
    p_content TEXT,
    p_media_url TEXT DEFAULT NULL,
    p_media_type TEXT DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL
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
BEGIN
    -- 1. Get user info
    SELECT name, nickname, profile_picture, university 
    INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- 2. Deduct points (30 for post/reply)
    v_deduction_result := public.deduct_points_secure(30);
    
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- 3. Create post (Setting both user_university and university for feed compatibility)
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university, university,
        content, media_url, media_type, parent_id, status, visibility
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni, v_user_uni,
        p_content, p_media_url, p_media_type, p_parent_id, 'approved', 'public'
    ) RETURNING id INTO v_post_id;

    RETURN jsonb_build_object('success', true, 'post_id', v_post_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. FIX HANDLE_POST_REPLY
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
BEGIN
    -- 1. Get user info
    SELECT name, nickname, profile_picture, university 
    INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- 2. Deduct points (30 for reply)
    v_deduction_result := public.deduct_points_secure(30);
    
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- 3. Create reply
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university, university,
        content, media_url, media_type, parent_id, status, visibility
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni, v_user_uni,
        p_reply_content, p_media_url, p_media_type, p_post_id, 'approved', 'public'
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. REFRESH FEEDS
 (Remove dependency on missing status if legacy, but we added status above)
-- Ensuring visibility is handled correctly.
CREATE OR REPLACE FUNCTION public.fetch_university_feed(p_university TEXT, limit_count INTEGER, offset_count INTEGER)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.posts
    WHERE (university = p_university OR user_university = p_university OR university IS NULL) -- Allow global and specific
    AND (visibility = 'public' OR visibility = 'node_only')
    AND (status = 'approved' OR status = 'active' OR status IS NULL) -- Robust status check
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. INCREMENT VIEW COUNT RPC
CREATE OR REPLACE FUNCTION public.increment_status_view_count(status_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.statuses 
    SET view_count = COALESCE(view_count, 0) + 1 
    WHERE id = status_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================================
