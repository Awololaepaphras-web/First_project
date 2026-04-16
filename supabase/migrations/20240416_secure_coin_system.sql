-- Migration: Secure Coin Management System
-- Description: Moves all coin additions and deductions to server-side RPCs.
-- Prevents users from manipulating their coins via browser tools.

-- 1. Helper: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Secure RPC: Handle Engagement Rewards
-- This function is called by the server to reward users for likes, reposts, etc.
CREATE OR REPLACE FUNCTION public.reward_engagement_secure(
    p_author_id UUID,
    p_engagement_type TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_points_to_add DECIMAL;
    v_config JSONB;
    v_rates JSONB;
BEGIN
    -- Get config
    SELECT config INTO v_config FROM public.system_config WHERE id = 'default';
    v_rates := v_config->'earnRates';

    -- Determine points based on type
    CASE p_engagement_type
        WHEN 'like' THEN v_points_to_add := COALESCE((v_rates->>'likeReward')::DECIMAL, 0.1);
        WHEN 'comment' THEN v_points_to_add := 20; -- Fixed reward for author when someone replies
        WHEN 'repost' THEN v_points_to_add := COALESCE((v_rates->>'repostReward')::DECIMAL, 1.0);
        WHEN 'link' THEN v_points_to_add := 0.05;
        WHEN 'profile' THEN v_points_to_add := 0.05;
        WHEN 'media' THEN v_points_to_add := 0.05;
        WHEN 'ad_click' THEN v_points_to_add := COALESCE((v_rates->>'adClick')::DECIMAL, 200) / 100.0;
        ELSE v_points_to_add := 0;
    END CASE;

    IF v_points_to_add > 0 THEN
        UPDATE public.users 
        SET points = COALESCE(points, 0) + v_points_to_add
        WHERE id = p_author_id;
        
        RETURN jsonb_build_object('success', true, 'points_added', v_points_to_add);
    END IF;

    RETURN jsonb_build_object('success', false, 'message', 'No points added');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Secure RPC: Deduct Points
-- This function handles all coin deductions (posts, replies, etc.)
CREATE OR REPLACE FUNCTION public.deduct_points_secure(
    p_amount DECIMAL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_daily_points DECIMAL;
    v_points DECIMAL;
    v_remaining_cost DECIMAL;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    SELECT daily_points, points INTO v_daily_points, v_points 
    FROM public.users WHERE id = v_user_id;

    IF (COALESCE(v_daily_points, 0) + COALESCE(v_points, 0)) < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient Prophy Points');
    END IF;

    IF v_daily_points >= p_amount THEN
        UPDATE public.users SET daily_points = daily_points - p_amount WHERE id = v_user_id;
    ELSE
        v_remaining_cost := p_amount - v_daily_points;
        UPDATE public.users SET daily_points = 0, points = points - v_remaining_cost WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Secure RPC: Create Post V2 (with deduction)
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
    v_cost INTEGER;
    v_deduction_result JSONB;
    v_post_id UUID;
BEGIN
    -- Get user info
    SELECT name, nickname, profile_picture, university INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- Get cost
    SELECT (config->>'postCost')::INTEGER INTO v_cost FROM public.system_config WHERE id = 'default';
    v_cost := COALESCE(v_cost, 30);

    -- Deduct points
    v_deduction_result := public.deduct_points_secure(v_cost);
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- Create post
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university,
        content, media_url, media_type, parent_id, status, visibility
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni,
        p_content, p_media_url, p_media_type, p_parent_id, 'approved', 'public'
    ) RETURNING id INTO v_post_id;

    RETURN jsonb_build_object('success', true, 'post_id', v_post_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Secure RPC: Handle Post Reply (with deduction)
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
    v_cost INTEGER;
    v_deduction_result JSONB;
    v_comment JSONB;
BEGIN
    -- Get user info
    SELECT name INTO v_user_name FROM public.users WHERE id = v_user_id;

    -- Get cost
    SELECT (config->>'replyCost')::INTEGER INTO v_cost FROM public.system_config WHERE id = 'default';
    v_cost := COALESCE(v_cost, 30);

    -- Deduct points
    v_deduction_result := public.deduct_points_secure(v_cost);
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- Create comment object
    v_comment := jsonb_build_object(
        'id', encode(gen_random_bytes(6), 'hex'),
        'userId', v_user_id,
        'userName', v_user_name,
        'text', p_reply_content,
        'createdAt', extract(epoch from now()) * 1000,
        'likes', '[]'::jsonb
    );

    -- Update post comments
    UPDATE public.posts 
    SET comments = COALESCE(comments, '[]'::jsonb) || v_comment
    WHERE id = p_post_id;

    -- Reward author of original post
    PERFORM public.reward_engagement_secure(
        (SELECT user_id FROM public.posts WHERE id = p_post_id),
        'comment'
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Secure RPC: Create Withdrawal Request
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
    p_amount DECIMAL,
    p_bank_name TEXT,
    p_account_number TEXT,
    p_account_name TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_name TEXT;
    v_deduction_result JSONB;
BEGIN
    -- Get user info
    SELECT name INTO v_user_name FROM public.users WHERE id = v_user_id;

    -- Deduct points (this verifies balance)
    v_deduction_result := public.deduct_points_secure(p_amount);
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- Create request
    INSERT INTO public.withdrawal_requests (
        user_id, user_name, amount, bank_name, account_number, account_name, status
    ) VALUES (
        v_user_id, v_user_name, p_amount, p_bank_name, p_account_number, p_account_name, 'pending'
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Secure RPC: Handle Status Update
CREATE OR REPLACE FUNCTION public.handle_status_update(
    p_media_url TEXT,
    p_media_type TEXT DEFAULT 'image',
    p_caption TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_name TEXT;
    v_user_nickname TEXT;
    v_user_uni TEXT;
    v_cost INTEGER;
    v_deduction_result JSONB;
BEGIN
    -- Get user info
    SELECT name, nickname, university INTO v_user_name, v_user_nickname, v_user_uni
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
        user_id, user_name, user_nickname, university, media_url, media_type, caption, expires_at, renewed_count
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_uni, p_media_url, p_media_type, p_caption, now() + interval '24 hours', 0
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Secure RPC: Handle Referral Reward
-- This function is called when a referral is verified
CREATE OR REPLACE FUNCTION public.reward_referral_secure(
    p_referrer_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_reward INTEGER;
    v_config JSONB;
BEGIN
    SELECT config INTO v_config FROM public.system_config WHERE id = 'default';
    v_reward := COALESCE((v_config->'earnRates'->>'referral')::INTEGER, 80);

    UPDATE public.users 
    SET points = COALESCE(points, 0) + v_reward
    WHERE id = p_referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update handle_new_user to give starting coins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_proph_id TEXT;
  v_starting_points INTEGER := 500;
BEGIN
  -- Generate unique 17-character Proph ID
  LOOP
    new_proph_id := public.generate_proph_id();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_proph_id);
  END LOOP;

  INSERT INTO public.users (
    id, email, name, nickname, university, level, referred_by, referral_code, role, registration_ip, points, daily_points
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Scholar'),
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'university', 'Federal University'),
    COALESCE(NEW.raw_user_meta_data->>'level', '100'),
    (CASE WHEN NEW.raw_user_meta_data->>'referredBy' IS NOT NULL AND NEW.raw_user_meta_data->>'referredBy' != '' THEN (NEW.raw_user_meta_data->>'referredBy')::UUID ELSE NULL END),
    new_proph_id,
    CASE 
      WHEN NEW.email = 'awololaeo.22@student.funaab.edu.ng' THEN 'admin'
      ELSE 'user'
    END,
    NEW.raw_user_meta_data->>'registrationIp',
    v_starting_points,
    500 -- Initial daily points
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize Gladiator Vault
  INSERT INTO public.gladiator_vault (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Update handle_referral to give rewards
CREATE OR REPLACE FUNCTION public.handle_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_ip TEXT;
BEGIN
  IF NEW.referred_by IS NOT NULL THEN
    -- Get referrer's IP
    SELECT registration_ip INTO referrer_ip FROM public.users WHERE id = NEW.referred_by;

    -- Only count if IPs are different
    IF NEW.registration_ip IS DISTINCT FROM referrer_ip THEN
      -- Increment referral count
      UPDATE public.users 
      SET referral_count = referral_count + 1 
      WHERE id = NEW.referred_by;

      -- Give reward coins
      PERFORM public.reward_referral_secure(NEW.referred_by);

      -- Unlock AI App for 2 weeks if they have 3 referrals
      IF (SELECT referral_count FROM public.users WHERE id = NEW.referred_by) >= 3 THEN
        UPDATE public.users 
        SET ai_app_unlocked_until = timezone('utc'::text, now()) + interval '2 weeks'
        WHERE id = NEW.referred_by;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Strict RLS: Lock down points columns
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    is_admin() OR (
      -- These fields can NEVER be updated directly by the user via the client
      role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
      points = (SELECT points FROM public.users WHERE id = auth.uid()) AND
      daily_points = (SELECT daily_points FROM public.users WHERE id = auth.uid()) AND
      is_premium = (SELECT is_premium FROM public.users WHERE id = auth.uid()) AND
      is_verified = (SELECT is_verified FROM public.users WHERE id = auth.uid()) AND
      referral_count = (SELECT referral_count FROM public.users WHERE id = auth.uid())
    )
  )
);
