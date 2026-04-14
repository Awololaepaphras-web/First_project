-- ===============================================================
-- PROPH APP: FEEDS & POLLS SETUP
-- ===============================================================
-- This script provides the RPC functions for global and university
-- feeds, as well as the secure voting logic for polls.
-- ===============================================================

-- 0. CLEANUP (Avoids parameter name mismatch errors)
DROP FUNCTION IF EXISTS public.fetch_secure_feed(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.fetch_university_feed(TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.vote_on_poll(UUID, TEXT, UUID);

-- 1. Global Feed RPC
-- Fetches public, approved posts ordered by recency.
CREATE OR REPLACE FUNCTION public.fetch_secure_feed(limit_count INTEGER, offset_count INTEGER)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.posts
    WHERE visibility = 'public'
    AND status = 'approved'
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. University Feed RPC
-- Fetches posts for a specific university (public or node_only).
CREATE OR REPLACE FUNCTION public.fetch_university_feed(p_university TEXT, limit_count INTEGER, offset_count INTEGER)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.posts
    WHERE (university = p_university OR user_university = p_university)
    AND (visibility = 'public' OR visibility = 'node_only')
    AND status = 'approved'
    ORDER BY created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Secure Poll Voting RPC
-- Handles atomic voting on polls within posts.
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

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_posts_university_status ON public.posts(university, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_status ON public.posts(visibility, status, created_at DESC);

-- ===============================================================
-- SETUP COMPLETE
-- ===============================================================
