-- ===============================================================
-- PROPH APP: PARALLEL UNIVERSE (GLOBAL) ISOLATION ENGINE
-- ===============================================================

-- 1. STRICT PARALLEL UNIVERSE FETCH: Strictly gets posts that are NOT university-specific
CREATE OR REPLACE FUNCTION public.fetch_parallel_universe_feed(
    limit_count INTEGER, 
    offset_count INTEGER
)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.posts
    WHERE university IS NULL  -- This identifies a Parallel Universe (Global) post
    AND status = 'approved'
    AND visibility = 'public'
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. UPDATED CREATE_POST_V2: Support Parallel Universe Posting
CREATE OR REPLACE FUNCTION public.create_post_v2(
    p_content TEXT, 
    p_media_url TEXT DEFAULT NULL, 
    p_media_type TEXT DEFAULT NULL, 
    p_parent_id UUID DEFAULT NULL,
    p_is_parallel BOOLEAN DEFAULT FALSE -- New flag: If true, it goes to Parallel Universe
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

    -- 3. Determine target university
    -- If p_is_parallel is true, university is NULL (Parallel Universe)
    -- Otherwise, it defaults to the user's university node
    IF p_is_parallel THEN
        v_target_uni := NULL;
    ELSE
        v_target_uni := v_user_uni;
    END IF;

    -- 4. Create post
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university, university,
        content, media_url, media_type, parent_id, status, visibility
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni, v_target_uni,
        p_content, p_media_url, p_media_type, p_parent_id, 'approved', 'public'
    ) RETURNING id INTO v_post_id;

    RETURN jsonb_build_object('success', true, 'post_id', v_post_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. UPDATED SELECT RLS: Strictly isolate Parallel Universe from Node Feeds
DROP POLICY IF EXISTS "Strict Exclusive University Isolation" ON public.posts;
DROP POLICY IF EXISTS "Parallel Universe Visibility" ON public.posts;

CREATE POLICY "Parallel Universe Visibility" ON public.posts
FOR SELECT
USING (
    -- Case 1: Post is in the Parallel Universe (Global)
    (university IS NULL AND visibility = 'public')
    OR
    -- Case 2: Post is in a Student Node (Isolated)
    (university IS NOT NULL AND (university = (SELECT u.university FROM public.users u WHERE u.id = auth.uid())))
    OR
    -- Admin override
    (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);

-- 4. UPDATE REAL-TIME PUBLICATIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
