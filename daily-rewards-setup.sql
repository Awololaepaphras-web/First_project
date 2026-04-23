-- ===============================================================
-- 1. ONE-TIME GRANT: Give everyone 500 coins NOW
-- ===============================================================
UPDATE public.users 
SET daily_points = COALESCE(daily_points, 0) + 500 
WHERE id IS NOT NULL;

-- ===============================================================
-- 2. DAILY REWARD RPC: A dedicated way for the frontend to "Get" coins
-- ===============================================================
CREATE OR REPLACE FUNCTION public.claim_daily_allowance()
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_allowance INTEGER;
    v_user_is_premium BOOLEAN;
    v_user_premium_tier TEXT;
    v_last_reset TIMESTAMP WITH TIME ZONE;
    v_current_points INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Get user data
    SELECT is_premium, premium_tier, last_points_reset, coins INTO v_user_is_premium, v_user_premium_tier, v_last_reset, v_current_points
    FROM public.users WHERE id = v_user_id;

    -- If coins column doesn't exist, use points
    IF v_current_points IS NULL THEN
        SELECT points INTO v_current_points FROM public.users WHERE id = v_user_id;
    END IF;

    -- Check if already claimed recently (last 24 hours)
    IF v_last_reset IS NOT NULL AND v_last_reset > (now() - INTERVAL '24 hours') THEN
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'You have already claimed your reward for today. Check back later!'
        );
    END IF;

    -- Calculate based on Tiers
    IF v_user_premium_tier ILIKE '%alpha%' THEN v_allowance := 10000;
    ELSIF v_user_premium_tier ILIKE '%plus%' OR v_user_premium_tier = 'premium_plus' THEN v_allowance := 5000;
    ELSIF v_user_is_premium = TRUE OR v_user_premium_tier ILIKE '%premium%' THEN v_allowance := 1000;
    ELSE v_allowance := 500;
    END IF;

    -- Update user (both daily_points for allowance and last_reset for tracking)
    UPDATE public.users 
    SET 
        daily_points = v_allowance,
        last_points_reset = now()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true, 
        'amount', v_allowance,
        'message', 'Successfully claimed ' || v_allowance || ' coins!'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
