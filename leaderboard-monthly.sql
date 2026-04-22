
-- ===============================================================
-- MONTHLY LEADERBOARD SYSTEM
-- ===============================================================

-- 1. Add monthly tracking columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS monthly_points DECIMAL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_monthly_points_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Function to handle monthly point synchronization and lazy reset
CREATE OR REPLACE FUNCTION public.sync_monthly_points(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
DECLARE
    v_last_reset TIMESTAMP WITH TIME ZONE;
    v_current_month TIMESTAMP WITH TIME ZONE := date_trunc('month', timezone('utc'::text, now()));
BEGIN
    -- Get last reset date
    SELECT last_monthly_points_reset INTO v_last_reset FROM public.users WHERE id = p_user_id;

    -- If last reset was in a previous month, reset current month points first
    IF date_trunc('month', v_last_reset) < v_current_month THEN
        UPDATE public.users 
        SET monthly_points = p_amount,
            last_monthly_points_reset = timezone('utc'::text, now())
        WHERE id = p_user_id;
    ELSE
        -- Same month, just accumulate
        UPDATE public.users 
        SET monthly_points = monthly_points + p_amount
        WHERE id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Engagement Reward RPC to track monthly points
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
        WHEN 'comment' THEN v_points_to_add := 20; -- Fixed reward
        WHEN 'repost' THEN v_points_to_add := COALESCE((v_rates->>'repostReward')::DECIMAL, 1.0);
        WHEN 'link' THEN v_points_to_add := 0.05;
        WHEN 'profile' THEN v_points_to_add := 0.05;
        WHEN 'media' THEN v_points_to_add := 0.05;
        WHEN 'ad_click' THEN v_points_to_add := COALESCE((v_rates->>'adClick')::DECIMAL, 200) / 100.0;
        ELSE v_points_to_add := 0;
    END CASE;

    IF v_points_to_add > 0 THEN
        -- Update total points
        UPDATE public.users SET points = COALESCE(points, 0) + v_points_to_add WHERE id = p_author_id;
        
        -- Update monthly accumulation
        PERFORM public.sync_monthly_points(p_author_id, v_points_to_add);
        
        RETURN jsonb_build_object('success', true, 'points_added', v_points_to_add);
    END IF;

    RETURN jsonb_build_object('success', false, 'message', 'No points added');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update Premium Reward RPC to track monthly points
CREATE OR REPLACE FUNCTION public.claim_daily_premium_reward()
RETURNS JSONB AS $$
DECLARE
    u_record RECORD;
    reward_amount INTEGER;
    today DATE := CURRENT_DATE;
BEGIN
    -- 1. Get user and verify premium status
    SELECT * INTO u_record FROM public.users WHERE id = auth.uid();
    
    IF u_record IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    IF u_record.is_premium = false OR u_record.premium_until < (extract(epoch from now()))::bigint THEN
        RETURN jsonb_build_object('success', false, 'error', 'Premium status inactive');
    END IF;

    -- 2. Determine reward based on tier
    reward_amount := 0;
    IF u_record.premium_tier = 'premium' THEN reward_amount := 1000;
    ELSIF u_record.premium_tier = 'premium_plus' THEN reward_amount := 5000;
    ELSIF u_record.premium_tier = 'alpha_premium' THEN reward_amount := 15000;
    END IF;

    IF reward_amount = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'No reward tier assigned');
    END IF;

    -- 3. Check for existing claim today
    IF EXISTS (SELECT 1 FROM public.reward_claims WHERE user_id = auth.uid() AND claim_date = today) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Daily reward already claimed');
    END IF;

    -- 4. Execute atomic updates
    UPDATE public.users SET points = points + reward_amount WHERE id = auth.uid();
    
    -- Update monthly accumulation
    PERFORM public.sync_monthly_points(auth.uid(), reward_amount);
    
    INSERT INTO public.reward_claims (user_id, claim_date, points_awarded, tier)
    VALUES (auth.uid(), today, reward_amount, COALESCE(u_record.role, 'premium'));

    -- 5. Notify user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (auth.uid(), 'Daily Reward Credited', 'Your ' || reward_amount || ' Prophy points have been added to your vault.', 'success');

    RETURN jsonb_build_object('success', true, 'reward', reward_amount, 'total_points', u_record.points + reward_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update Referral Reward RPC
CREATE OR REPLACE FUNCTION public.reward_referral_secure(p_referrer_id UUID)
RETURNS VOID AS $$
DECLARE
    v_reward INTEGER;
    v_config JSONB;
BEGIN
    SELECT config INTO v_config FROM public.system_config WHERE id = 'default';
    v_reward := COALESCE((v_config->'earnRates'->>'referral')::INTEGER, 80);

    UPDATE public.users SET points = COALESCE(points, 0) + v_reward WHERE id = p_referrer_id;
    
    -- Update monthly accumulation
    PERFORM public.sync_monthly_points(p_referrer_id, v_reward);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. REDEFINE Materialized View for Monthly Leaderboard
-- We drop and recreate it because we are changing the ranking logic from 24h engagement to monthly points accumulation
DROP MATERIALIZED VIEW IF EXISTS public.top_20_users CASCADE;

CREATE MATERIALIZED VIEW public.top_20_users AS
SELECT 
  u.id,
  u.name,
  u.nickname,
  u.profile_picture as user_avatar,
  u.monthly_points as total_points,
  COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id -- Use user_id column from posts
GROUP BY u.id, u.name, u.nickname, u.profile_picture, u.monthly_points
ORDER BY u.monthly_points DESC
LIMIT 20;

CREATE UNIQUE INDEX top_20_users_id_idx ON public.top_20_users (id);

-- 7. Update Refresh Trigger Function
CREATE OR REPLACE FUNCTION refresh_top_20_users()
RETURNS TRIGGER AS $$
BEGIN
  -- We refresh concurrently so the view remains readable
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.top_20_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. Add triggers to users table to refresh leaderboard when points change
DROP TRIGGER IF EXISTS refresh_leaderboard_on_point_change ON public.users;
CREATE TRIGGER refresh_leaderboard_on_point_change
AFTER UPDATE OF monthly_points ON public.users
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_top_20_users();

-- 9. Update handle_new_user to give starting coins and track monthly
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
    id, email, name, nickname, university, level, referred_by, referral_code, role, registration_ip, points, daily_points, monthly_points, last_monthly_points_reset
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
    500, -- Initial daily points
    v_starting_points, -- Count starting points as monthly accumulation
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize Gladiator Vault
  INSERT INTO public.gladiator_vault (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Update Monetization Earnings to track monthly
CREATE OR REPLACE FUNCTION public.update_monetization_earnings(
    p_user_id UUID, 
    p_impressions BIGINT, 
    p_earnings_ngn DECIMAL, 
    p_points_earned INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_monetization (user_id, total_earnings_ngn, pending_balance_ngn, points_earned, total_impressions)
    VALUES (p_user_id, p_earnings_ngn, p_earnings_ngn, p_points_earned, p_impressions)
    ON CONFLICT (user_id) DO UPDATE SET
        total_earnings_ngn = public.user_monetization.total_earnings_ngn + p_earnings_ngn,
        pending_balance_ngn = public.user_monetization.pending_balance_ngn + p_earnings_ngn,
        points_earned = public.user_monetization.points_earned + p_points_earned,
        total_impressions = public.user_monetization.total_impressions + p_impressions,
        updated_at = now();

    -- Track points specifically in monthly leaderboard too
    IF p_points_earned > 0 THEN
        UPDATE public.users SET points = COALESCE(points, 0) + p_points_earned WHERE id = p_user_id;
        PERFORM public.sync_monthly_points(p_user_id, p_points_earned);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
