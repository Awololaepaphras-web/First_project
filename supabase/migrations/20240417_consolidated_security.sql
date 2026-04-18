-- Migration: Fix Missing Columns and Consolidate Secure Coin System
-- Description: Adds daily_points, sets up system_config, and implements secure RPCs.

-- 1. Ensure columns exist in users table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='users' AND column_name='daily_points') THEN
        ALTER TABLE public.users ADD COLUMN daily_points INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='users' AND column_name='last_points_reset') THEN
        ALTER TABLE public.users ADD COLUMN last_points_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- 2. Ensure system_config table exists
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY,
    config JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Insert/Update default configuration
INSERT INTO public.system_config (id, config)
VALUES ('default', '{
  "isAiEnabled": true,
  "isUploadEnabled": true,
  "isWithdrawalEnabled": true,
  "isMaintenanceMode": false,
  "isCommunityEnabled": true,
  "isAdsEnabled": true,
  "isUserAdsEnabled": true,
  "isPastQuestionContributionEnabled": true,
  "isSplashScreenEnabled": true,
  "isMessagingEnabled": true,
  "feedWeights": { "engagement": 0.4, "recency": 0.3, "relationship": 0.1, "quality": 0.1, "eduRelevance": 0.1 },
  "adWeights": { "budget": 0.5, "relevance": 0.2, "performance": 0.2, "targetMatch": 0.1 },
  "earnRates": {
    "contribution": 50,
    "referral": 80,
    "adClick": 200,
    "arena": 5,
    "likeReward": 0.1,
    "replyReward": 0.5,
    "repostReward": 1.0
  },
  "nairaPerPoint": 0.5,
  "adPricing": { "daily": 1500, "weekly": 8500, "monthly": 30000 },
  "engagementWeights": {
    "replies": 5.0,
    "likes": 1.0,
    "reposts": 2.5
  },
  "postCost": 30,
  "replyCost": 30,
  "statusCost": 50,
  "premiumTiers": {
    "weekly": 500,
    "monthly": 1500,
    "yearly": 2000
  },
  "premiumBenefits": {
    "premium": { "dailyCoins": 1000, "noAds": true, "groupRevenueShare": 0.10, "price": 500 },
    "premiumPlus": { "dailyCoins": 5000, "noAds": true, "groupRevenueShare": 0.15, "price": 1500 },
    "alphaPremium": { "dailyCoins": 10000, "noAds": true, "groupRevenueShare": 0.30, "price": 2000 }
  },
  "paymentAccount": {
    "bankName": "Proph Institutional Bank",
    "accountNumber": "1020304050",
    "accountName": "PROPH ACADEMIC SERVICES"
  }
}'::jsonb)
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;

-- 4. Secure Coin Functions
-- Function to deduct points securely (checks daily_points first and auto-resets)
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
        UPDATE public.users SET daily_points = daily_points - p_amount::INTEGER WHERE id = v_user_id;
    ELSE
        UPDATE public.users 
        SET daily_points = 0,
            points = points - (p_amount - v_daily_points)
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reward engagement securely
CREATE OR REPLACE FUNCTION public.reward_engagement_secure(p_author_id UUID, p_engagement_type TEXT)
RETURNS JSONB AS $$
DECLARE
    v_points_to_add DECIMAL;
    v_rates JSONB;
BEGIN
    SELECT config->'earnRates' INTO v_rates FROM public.system_config WHERE id = 'default';
    
    CASE p_engagement_type
        WHEN 'like' THEN v_points_to_add := COALESCE((v_rates->>'likeReward')::DECIMAL, 0.1);
        WHEN 'comment' THEN v_points_to_add := 20; -- Fixed reward for comments/replies
        WHEN 'repost' THEN v_points_to_add := COALESCE((v_rates->>'repostReward')::DECIMAL, 1.0);
        WHEN 'ad_click' THEN v_points_to_add := COALESCE((v_rates->>'adClick')::DECIMAL, 200) / 100.0;
        ELSE v_points_to_add := 0.05;
    END CASE;

    UPDATE public.users SET points = COALESCE(points, 0) + v_points_to_add WHERE id = p_author_id;
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle status update with coin deduction
CREATE OR REPLACE FUNCTION public.handle_status_update(
    p_media_url TEXT, 
    p_media_type TEXT DEFAULT 'image', 
    p_caption TEXT DEFAULT NULL, 
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_cost INTEGER;
    v_config JSONB;
    v_user_name TEXT;
    v_user_nickname TEXT;
    v_user_uni TEXT;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT config INTO v_config FROM public.system_config WHERE id = 'default';
    v_cost := COALESCE((v_config->>'statusCost')::INTEGER, 50);

    -- Deduct points
    IF NOT (SELECT (public.deduct_points_secure(v_cost)) ->> 'success')::BOOLEAN THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient coins to post status');
    END IF;

    -- Get user info
    SELECT name, nickname, university INTO v_user_name, v_user_nickname, v_user_uni 
    FROM public.users WHERE id = auth.uid();

    v_expires_at := COALESCE(p_expires_at, now() + interval '24 hours');

    -- Insert status
    INSERT INTO public.statuses (user_id, user_name, user_nickname, university, media_url, media_type, caption, expires_at)
    VALUES (auth.uid(), v_user_name, v_user_nickname, v_user_uni, p_media_url, p_media_type, p_caption, v_expires_at);

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create withdrawal request securely
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(p_amount DECIMAL, p_bank_name TEXT, p_account_number TEXT, p_account_name TEXT)
RETURNS JSONB AS $$
DECLARE
    v_user_name TEXT;
BEGIN
    -- Deduct points first
    IF NOT (SELECT (public.deduct_points_secure(p_amount)) ->> 'success')::BOOLEAN THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance for withdrawal');
    END IF;

    SELECT name INTO v_user_name FROM public.users WHERE id = auth.uid();

    INSERT INTO public.withdrawal_requests (user_id, user_name, amount, bank_name, account_number, account_name, status)
    VALUES (auth.uid(), v_user_name, p_amount, p_bank_name, p_account_number, p_account_name, 'pending');

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update handle_new_user to include daily_points
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

-- 6. Update handle_referral to give rewards
CREATE OR REPLACE FUNCTION public.handle_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_ip TEXT;
  v_reward INTEGER;
  v_config JSONB;
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
      SELECT config INTO v_config FROM public.system_config WHERE id = 'default';
      v_reward := COALESCE((v_config->'earnRates'->>'referral')::INTEGER, 80);

      UPDATE public.users 
      SET points = COALESCE(points, 0) + v_reward
      WHERE id = NEW.referred_by;

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

-- 7. Strict RLS: Lock down points columns
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND (
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
