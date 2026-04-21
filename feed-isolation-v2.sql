-- ===============================================================
-- PROPH APP: ADVANCED FEED ISOLATION & AD_ID INTEGRATION
-- ===============================================================

-- 1. ADD ad_id TO posts TABLE (IF NOT EXISTS)
-- Refers to advertisements table. Used for tracking attribution.
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS ad_id UUID REFERENCES public.advertisements(id);

-- 2. SECURE PARALLEL UNIVERSE FETCH: Strictly seen by followers ONLY
-- This impacts the Global Stream (Infinite Stream) component
CREATE OR REPLACE FUNCTION public.fetch_parallel_universe_feed(
    limit_count INTEGER, 
    offset_count INTEGER
)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.posts p
    JOIN public.users u ON p.user_id = u.id
    WHERE p.university IS NULL  -- Identify Parallel Universe posts
    AND p.status = 'approved'
    AND p.visibility = 'public'
    AND (
        p.user_id = auth.uid() -- Can always see own posts
        OR
        auth.uid() = ANY(u.followers) -- Only seen by followers
        OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') -- Admin access
    )
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. SECURE UNIVERSITY FEED FETCH: Strictly Node-specific
CREATE OR REPLACE FUNCTION public.fetch_university_exclusive_feed(
    p_university TEXT,
    limit_count INTEGER, 
    offset_count INTEGER
)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.posts p
    WHERE p.university = p_university -- MUST MATCH university
    AND p.status = 'approved'
    AND (p.visibility = 'public' OR p.visibility = 'node_only')
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. UPDATE RLS: Enforce strict "Follower-Only" visibility for Parallel Universe
-- And "Node-Only" for University Parallel Universe
DROP POLICY IF EXISTS "Strict Exclusive University Isolation" ON public.posts;
DROP POLICY IF EXISTS "Parallel Universe Visibility" ON public.posts;
DROP POLICY IF EXISTS "Combined Feed Isolation Policy" ON public.posts;

CREATE POLICY "Combined Feed Isolation Policy" ON public.posts
FOR SELECT
USING (
    -- Case 1: University Parallel Universe (Campus Node)
    (university IS NOT NULL AND university = (SELECT u.university FROM public.users u WHERE u.id = auth.uid()))
    OR
    -- Case 2: Parallel Universe (Global/Social)
    (university IS NULL AND (
        user_id = auth.uid() 
        OR 
        auth.uid() = ANY((SELECT followers FROM public.users WHERE id = posts.user_id))
    ))
    OR
    -- Admin override
    (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
);
