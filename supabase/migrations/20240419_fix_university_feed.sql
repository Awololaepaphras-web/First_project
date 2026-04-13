-- Migration: Update deduct_points_secure to return new balance
-- Description: Modifies the RPC to return the updated points and daily_points.

CREATE OR REPLACE FUNCTION public.deduct_points_secure(p_amount DECIMAL)
RETURNS JSONB AS $$
DECLARE
    v_daily_points INTEGER;
    v_points DECIMAL;
    v_last_reset TIMESTAMP WITH TIME ZONE;
    v_user_id UUID := auth.uid();
    v_tier TEXT;
    v_daily_allowance INTEGER;
    v_config JSONB;
    v_final_points DECIMAL;
    v_final_daily INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    SELECT daily_points, points, last_points_reset, premium_tier 
    INTO v_daily_points, v_points, v_last_reset, v_tier 
    FROM public.users WHERE id = v_user_id;
    
    -- Auto-reset daily points if 24 hours have passed
    IF v_last_reset IS NULL OR v_last_reset < (timezone('utc'::text, now()) - interval '24 hours') THEN
        SELECT config INTO v_config FROM public.system_config WHERE id = 'default';
        
        CASE v_tier
            WHEN 'premium' THEN v_daily_allowance := COALESCE((v_config->'premiumBenefits'->'premium'->>'dailyCoins')::INTEGER, 1000);
            WHEN 'premium_plus' THEN v_daily_allowance := COALESCE((v_config->'premiumBenefits'->'premiumPlus'->>'dailyCoins')::INTEGER, 5000);
            WHEN 'alpha_premium' THEN v_daily_allowance := COALESCE((v_config->'premiumBenefits'->'alphaPremium'->>'dailyCoins')::INTEGER, 10000);
            ELSE v_daily_allowance := 500;
        END CASE;
        
        UPDATE public.users 
        SET daily_points = v_daily_allowance,
            last_points_reset = timezone('utc'::text, now())
        WHERE id = v_user_id;
        
        v_daily_points := v_daily_allowance;
    END IF;

    v_daily_points := COALESCE(v_daily_points, 0);
    v_points := COALESCE(v_points, 0);

    IF (v_daily_points + v_points) < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
    END IF;

    IF v_daily_points >= p_amount THEN
        UPDATE public.users SET daily_points = daily_points - p_amount::INTEGER WHERE id = v_user_id
        RETURNING points, daily_points INTO v_final_points, v_final_daily;
    ELSE
        UPDATE public.users 
        SET daily_points = 0,
            points = points - (p_amount - v_daily_points)
        WHERE id = v_user_id
        RETURNING points, daily_points INTO v_final_points, v_final_daily;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'new_points', v_final_points, 
        'new_daily_points', v_final_daily,
        'total_balance', (v_final_points + v_final_daily)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update handle_post_reply to set the university column
CREATE OR REPLACE FUNCTION public.handle_post_reply(
    p_post_id UUID,
    p_reply_content TEXT,
    p_media_url TEXT DEFAULT NULL,
    p_media_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_post_author_id UUID;
    v_replier_id UUID;
    v_reply_cost INT := 30;
    v_author_reward INT := 20;
    v_admin_cut INT := 10;
    v_already_replied BOOLEAN;
    v_replier_points NUMERIC;
    v_new_post_id UUID;
    v_admin_id UUID;
    v_replier_university TEXT;
BEGIN
    v_replier_id := auth.uid();
    IF v_replier_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Get post author
    SELECT user_id INTO v_post_author_id FROM posts WHERE id = p_post_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Post not found');
    END IF;

    -- Get replier info
    SELECT university INTO v_replier_university FROM users WHERE id = v_replier_id;

    -- Check if replier is the author
    IF v_replier_id = v_post_author_id THEN
        v_reply_cost := 0;
        v_author_reward := 0;
        v_admin_cut := 0;
    ELSE
        -- Check if already replied (to avoid double charging)
        SELECT EXISTS (
            SELECT 1 FROM posts 
            WHERE parent_id = p_post_id 
            AND user_id = v_replier_id
        ) INTO v_already_replied;

        IF v_already_replied THEN
            v_reply_cost := 0;
            v_author_reward := 0;
            v_admin_cut := 0;
        END IF;
    END IF;

    -- Check points if cost > 0
    IF v_reply_cost > 0 THEN
        -- Use the secure deduction function
        IF NOT (SELECT (public.deduct_points_secure(v_reply_cost)) ->> 'success')::BOOLEAN THEN
            RETURN jsonb_build_object('success', false, 'message', 'Insufficient Prophy Coins');
        END IF;

        -- Reward author
        UPDATE users SET points = points + v_author_reward WHERE id = v_post_author_id;

        -- Send to superadmin (first admin found)
        SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;
        IF v_admin_id IS NOT NULL THEN
            UPDATE users SET points = points + v_admin_cut WHERE id = v_admin_id;
        END IF;
    END IF;

    -- Create the reply post
    INSERT INTO posts (
        user_id,
        user_name,
        user_nickname,
        user_university,
        university, -- Set the university column
        content,
        media_url,
        media_type,
        parent_id,
        visibility,
        created_at
    ) 
    SELECT 
        v_replier_id,
        name,
        nickname,
        university,
        university, -- Set the university column
        p_reply_content,
        p_media_url,
        p_media_type,
        p_post_id,
        'public',
        (extract(epoch from now()) * 1000)::bigint
    FROM users WHERE id = v_replier_id
    RETURNING id INTO v_new_post_id;

    RETURN jsonb_build_object(
        'success', true, 
        'post_id', v_new_post_id, 
        'cost_deducted', v_reply_cost
    );
END;
$$;
