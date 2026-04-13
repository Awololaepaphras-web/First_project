-- Migration: Ensure System Config exists and update costs
-- This script safely creates the table if it's missing before performing updates.

-- 1. Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    config JSONB NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_config' AND policyname = 'System config is viewable by everyone') THEN
        CREATE POLICY "System config is viewable by everyone" ON public.system_config FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_config' AND policyname = 'Only admins can update system config') THEN
        CREATE POLICY "Only admins can update system config" ON public.system_config FOR ALL USING (
            EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );
    END IF;
END $$;

-- 4. Seed default config if empty
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
  "splashScreenUrl": "",
  "feedWeights": { "engagement": 0.4, "recency": 0.3, "relationship": 0.1, "quality": 0.1, "eduRelevance": 0.1 },
  "adWeights": { "budget": 0.5, "relevance": 0.2, "performance": 0.2, "targetMatch": 0.1 },
  "earnRates": { "contribution": 50, "referral": 80, "adClick": 200, "arena": 5 },
  "nairaPerPoint": 0.5,
  "adPricing": { "daily": 1500, "weekly": 8500, "monthly": 30000 },
  "engagementWeights": { "replies": 5.0, "likes": 1.0, "reposts": 2.5 },
  "premiumTiers": { "weekly": 1000, "monthly": 2500, "yearly": 20000 },
  "paymentAccount": { "bankName": "Proph Institutional Bank", "accountNumber": "1020304050", "accountName": "PROPH ACADEMIC SERVICES" },
  "isCardPaymentEnabled": false,
  "replyCost": 30,
  "postCost": 30,
  "statusCost": 50
}')
ON CONFLICT (id) DO NOTHING;

-- 5. Specifically ensure postCost, replyCost, and statusCost are in the JSONB
UPDATE public.system_config 
SET config = config || '{"postCost": 30, "replyCost": 30, "statusCost": 50}'::jsonb 
WHERE id = 'default';
