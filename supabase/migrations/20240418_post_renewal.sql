-- Add renewed_count to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS renewed_count INTEGER DEFAULT 0;

-- Function to renew a post (bump to top)
CREATE OR REPLACE FUNCTION public.renew_post(p_post_id UUID, p_cost INTEGER)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_current_points INTEGER;
    v_daily_points INTEGER;
BEGIN
    -- Get the post owner
    SELECT user_id INTO v_user_id FROM public.posts WHERE id = p_post_id;
    
    -- Check if the caller is the owner
    IF v_user_id != auth.uid() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- Get user points
    SELECT points, daily_points INTO v_current_points, v_daily_points FROM public.users WHERE id = v_user_id;

    -- Check if user has enough points
    IF (v_current_points + v_daily_points) < p_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient Prophy Coins');
    END IF;

    -- Deduct points (prioritize daily points)
    IF v_daily_points >= p_cost THEN
        UPDATE public.users SET daily_points = daily_points - p_cost WHERE id = v_user_id;
    ELSE
        UPDATE public.users SET 
            points = points - (p_cost - daily_points),
            daily_points = 0
        WHERE id = v_user_id;
    END IF;

    -- Update post timestamp and renewal count
    UPDATE public.posts 
    SET 
        created_at = (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
        renewed_count = renewed_count + 1
    WHERE id = p_post_id;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
