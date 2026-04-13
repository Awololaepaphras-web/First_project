-- Migration: Security Hardening & Centralized Config
-- Description: Fixes PII leak, secures coin manipulation, and centralizes action costs.

-- 1. Update System Config with postCost
UPDATE public.system_config 
SET config = config || '{"postCost": 30}'::jsonb 
WHERE id = 'default';

-- 2. Secure User Update Policy (Prevent daily_points manipulation)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    is_admin() OR (
      -- Ensure sensitive fields are not modified by the user
      role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
      points = (SELECT points FROM public.users WHERE id = auth.uid()) AND
      daily_points = (SELECT daily_points FROM public.users WHERE id = auth.uid()) AND
      is_premium = (SELECT is_premium FROM public.users WHERE id = auth.uid()) AND
      is_verified = (SELECT is_verified FROM public.users WHERE id = auth.uid())
    )
  )
);

-- 3. Fix PII Leak: Create a public profiles view
-- This allows users to see each other's public info without exposing emails or IPs.
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
    id, 
    name, 
    nickname, 
    university, 
    level, 
    profile_picture, 
    role, 
    is_premium, 
    is_verified, 
    followers, 
    following, 
    engagement_stats,
    premium_tier,
    created_at
FROM public.users;

-- Grant access to the view
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 4. Update handle_post_coins to use centralized config
CREATE OR REPLACE FUNCTION public.handle_post_coins(u_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_daily_points INTEGER;
    v_points INTEGER;
    v_cost INTEGER;
BEGIN
    -- Fetch cost from centralized config
    SELECT (config->>'postCost')::INTEGER INTO v_cost FROM public.system_config WHERE id = 'default';
    v_cost := COALESCE(v_cost, 30);

    SELECT daily_points, points INTO v_daily_points, v_points FROM public.users WHERE id = u_id;
    
    v_daily_points := COALESCE(v_daily_points, 0);
    v_points := COALESCE(v_points, 0);
    
    IF (v_daily_points + v_points) < v_cost THEN
        RAISE EXCEPTION 'Insufficient coins. You need % coins to post.', v_cost;
    END IF;
    
    IF v_daily_points >= v_cost THEN
        UPDATE public.users SET daily_points = daily_points - v_cost WHERE id = u_id;
    ELSE
        UPDATE public.users 
        SET daily_points = 0,
            points = points - (v_cost - v_daily_points)
        WHERE id = u_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update handle_reply_coins to use centralized config
CREATE OR REPLACE FUNCTION public.handle_reply_coins(replier_id UUID, poster_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_daily_points INTEGER;
    v_points INTEGER;
    v_cost INTEGER;
BEGIN
    -- Fetch cost from centralized config
    SELECT (config->>'replyCost')::INTEGER INTO v_cost FROM public.system_config WHERE id = 'default';
    v_cost := COALESCE(v_cost, 30);

    SELECT daily_points, points INTO v_daily_points, v_points FROM public.users WHERE id = replier_id;
    
    v_daily_points := COALESCE(v_daily_points, 0);
    v_points := COALESCE(v_points, 0);
    
    IF (v_daily_points + v_points) < v_cost THEN
        RAISE EXCEPTION 'Insufficient coins. You need % coins to reply.', v_cost;
    END IF;
    
    IF v_daily_points >= v_cost THEN
        UPDATE public.users SET daily_points = daily_points - v_cost WHERE id = replier_id;
    ELSE
        UPDATE public.users 
        SET daily_points = 0,
            points = points - (v_cost - v_daily_points)
        WHERE id = replier_id;
    END IF;
    
    -- Give 20 points to the poster (this goes to their "earned" balance)
    UPDATE public.users SET points = COALESCE(points, 0) + 20 WHERE id = poster_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
