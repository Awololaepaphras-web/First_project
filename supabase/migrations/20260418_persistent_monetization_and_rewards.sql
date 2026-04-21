
-- ===============================================================
-- PERSISTENT MONETIZATION & REWARD TRACKING
-- ===============================================================

-- 1. Create User Monetization Table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'none';

CREATE TABLE IF NOT EXISTS public.user_monetization (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_earnings_ngn DECIMAL(20, 2) DEFAULT 0,
    pending_balance_ngn DECIMAL(20, 2) DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    total_impressions BIGINT DEFAULT 0,
    last_payout_at TIMESTAMP WITH TIME ZONE,
    is_monetized BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Reward Claims Table (Anti-Cheat for Daily Rewards)
CREATE TABLE IF NOT EXISTS public.reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    claim_date DATE NOT NULL,
    points_awarded INTEGER NOT NULL,
    tier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, claim_date)
);

-- 3. Optimization for Ad Ranking
CREATE INDEX IF NOT EXISTS idx_ads_status_expiry ON public.advertisements(status, expiry_date);
-- Add a composite index for ranking (simulated weights)
-- Note: PostgreSQL doesn't support computed indexes with volatile functions, but we can index common filter fields

-- 4. SECURE FUNCTIONS

-- A. Atomic Daily Reward Processing
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
    
    INSERT INTO public.reward_claims (user_id, claim_date, points_awarded, tier)
    VALUES (auth.uid(), today, reward_amount, COALESCE(u_record.role, 'premium'));

    -- 5. Notify user
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (auth.uid(), 'Daily Reward Credited', 'Your ' || reward_amount || ' Prophy points have been added to your vault.', 'success');

    RETURN jsonb_build_object('success', true, 'reward', reward_amount, 'total_points', u_record.points + reward_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Update Monetization Stats (From Server)
-- This function allows the server (using Service Role) to update a user's earnings securely
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS POLICIES for Monetization
ALTER TABLE public.user_monetization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own monetization stats" ON public.user_monetization
    FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can view their own reward claims" ON public.reward_claims
    FOR SELECT USING (auth.uid() = user_id OR is_admin());
