-- ===============================================================
-- PROPH APP: ROBUST FEED ISOLATION & AD_ID INTEGRATION
-- ===============================================================

-- 1. ADD ad_id TO posts TABLE (Robust Check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='posts' AND column_name='ad_id') THEN
        ALTER TABLE public.posts ADD COLUMN ad_id UUID REFERENCES public.advertisements(id);
    END IF;
END $$;

-- 2. SECURE PARALLEL UNIVERSE FETCH (Optimized RPC)
-- This returns 'Global' posts intended for the Infinite Stream
CREATE OR REPLACE FUNCTION public.fetch_parallel_universe_feed(
    limit_count INTEGER DEFAULT 20, 
    offset_count INTEGER DEFAULT 0
)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.posts p
    WHERE (p.university IS NULL OR p.university = 'Global')
    AND p.status = 'approved'
    AND p.visibility = 'public'
    AND (
        p.user_id = auth.uid() -- Author
        OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = p.user_id AND auth.uid() = ANY(u.followers)
        ) -- Follower
        OR
        public.is_admin() -- Admin (using existing utility)
    )
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. SECURE UNIVERSITY FEED FETCH (Optimized RPC)
-- This returns campus-specific nodes
CREATE OR REPLACE FUNCTION public.fetch_university_exclusive_feed(
    p_university TEXT,
    limit_count INTEGER DEFAULT 20, 
    offset_count INTEGER DEFAULT 0
)
RETURNS SETOF public.posts AS $$
BEGIN
    RETURN QUERY
    SELECT p.*
    FROM public.posts p
    WHERE (p.university = p_university OR p.user_university = p_university)
    AND p.university IS NOT NULL
    AND p.university != 'Global'
    AND p.status = 'approved'
    AND (p.visibility = 'public' OR p.visibility = 'node_only')
    -- University posts are visible to everyone in the same node
    -- unless specified otherwise by future privacy settings
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. CONSOLIDATED RLS POLICY (High Performance)
-- Drops legacy policies and implements a single, clear visibility gate
DROP POLICY IF EXISTS "Strict Exclusive University Isolation" ON public.posts;
DROP POLICY IF EXISTS "Parallel Universe Visibility" ON public.posts;
DROP POLICY IF EXISTS "Combined Feed Isolation Policy" ON public.posts;

CREATE POLICY "Combined Feed Isolation Policy" ON public.posts
FOR SELECT
USING (
    -- Access Type 1: Administrative Override
    public.is_admin()
    OR
    -- Access Type 2: University Parallel Universe (Campus Node)
    (
        university IS NOT NULL 
        AND university != 'Global' 
        AND (university = (SELECT u.university FROM public.users u WHERE u.id = auth.uid()))
    )
    OR
    -- Access Type 3: Parallel Universe (Global/Follower-Based)
    (
        (university IS NULL OR university = 'Global')
        AND (
            user_id = auth.uid() 
            OR 
            EXISTS (
                SELECT 1 FROM public.users u 
                WHERE u.id = posts.user_id AND auth.uid() = ANY(u.followers)
            )
        )
    )
);
