-- Migration: Daily Prophy Coin Renewal
-- Description: Adds daily points allowance that resets every 24 hours.

-- 1. Add columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_points INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_points_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Function to reset daily points based on tier
CREATE OR REPLACE FUNCTION public.reset_daily_points(u_id UUID)
RETURNS VOID AS $$
DECLARE
    v_tier TEXT;
    v_daily_allowance INTEGER;
BEGIN
    SELECT premium_tier INTO v_tier FROM public.users WHERE id = u_id;
    
    CASE v_tier
        WHEN 'premium' THEN v_daily_allowance := 1000;
        WHEN 'premium_plus' THEN v_daily_allowance := 5000;
        WHEN 'alpha_premium' THEN v_daily_allowance := 10000;
        ELSE v_daily_allowance := 500; -- Default for free users
    END CASE;
    
    UPDATE public.users 
    SET daily_points = v_daily_allowance,
        last_points_reset = timezone('utc'::text, now())
    WHERE id = u_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update handle_post_coins to use daily_points first
CREATE OR REPLACE FUNCTION public.handle_post_coins(u_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_daily_points INTEGER;
    v_points INTEGER;
    v_cost INTEGER := 30;
BEGIN
    SELECT daily_points, points INTO v_daily_points, v_points FROM public.users WHERE id = u_id;
    
    -- Ensure we have values (handle NULLs)
    v_daily_points := COALESCE(v_daily_points, 0);
    v_points := COALESCE(v_points, 0);
    
    IF (v_daily_points + v_points) < v_cost THEN
        RAISE EXCEPTION 'Insufficient coins. You need 30 coins to post.';
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

-- 4. Update handle_reply_coins to use daily_points first
CREATE OR REPLACE FUNCTION public.handle_reply_coins(replier_id UUID, poster_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_daily_points INTEGER;
    v_points INTEGER;
    v_cost INTEGER := 30;
BEGIN
    SELECT daily_points, points INTO v_daily_points, v_points FROM public.users WHERE id = replier_id;
    
    -- Ensure we have values (handle NULLs)
    v_daily_points := COALESCE(v_daily_points, 0);
    v_points := COALESCE(v_points, 0);
    
    IF (v_daily_points + v_points) < v_cost THEN
        RAISE EXCEPTION 'Insufficient coins. You need 30 coins to reply.';
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

-- 5. Update get_my_wallet to include daily_points
CREATE OR REPLACE FUNCTION public.get_my_wallet()
RETURNS TABLE(points INTEGER, daily_points INTEGER, gladiator_earnings JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT u.points, u.daily_points, u.gladiator_earnings
    FROM public.users u
    WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
