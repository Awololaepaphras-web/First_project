-- 1. Private Schema Setup
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Move/Create Sensitive Tables in Private Schema
-- Move algorithm_settings if it exists in public
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'algorithm_settings') THEN
        ALTER TABLE public.algorithm_settings SET SCHEMA private;
    ELSE
        CREATE TABLE private.algorithm_settings (
            id TEXT PRIMARY KEY,
            weights JSONB NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- Create user_wallets in private schema
CREATE TABLE IF NOT EXISTS private.user_wallets (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    prophy_points BIGINT DEFAULT 1000 CHECK (prophy_points >= 0),
    total_earned BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_logs in private schema
CREATE TABLE IF NOT EXISTS private.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Public Activity Stream Table
CREATE TABLE IF NOT EXISTS public.app_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'signup', 'viral_post', 'upload', 'weight_change'
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rate Limiting Logic
CREATE TABLE IF NOT EXISTS private.rate_limits (
    user_id UUID PRIMARY KEY,
    request_count INT DEFAULT 0,
    last_request_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Secure Algorithm (The Black Box)
CREATE OR REPLACE FUNCTION public.fetch_secure_feed(limit_count INT DEFAULT 20, offset_count INT DEFAULT 0)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMPTZ,
    likes_count INT,
    shares_count INT,
    replies_count INT,
    rank_score FLOAT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    w JSONB;
    current_user_id UUID;
    rate_limit_record RECORD;
BEGIN
    -- Get current user ID securely
    current_user_id := auth.uid();
    
    -- Rate Limiting Check (100 requests per minute)
    SELECT * INTO rate_limit_record FROM private.rate_limits WHERE user_id = current_user_id;
    
    IF rate_limit_record IS NULL THEN
        INSERT INTO private.rate_limits (user_id, request_count, last_request_at)
        VALUES (current_user_id, 1, NOW());
    ELSIF rate_limit_record.last_request_at < NOW() - INTERVAL '1 minute' THEN
        UPDATE private.rate_limits 
        SET request_count = 1, last_request_at = NOW() 
        WHERE user_id = current_user_id;
    ELSIF rate_limit_record.request_count >= 100 THEN
        RAISE EXCEPTION '429 Too Many Requests' USING ERRCODE = 'P0001';
    ELSE
        UPDATE private.rate_limits 
        SET request_count = request_count + 1, last_request_at = NOW() 
        WHERE user_id = current_user_id;
    END IF;

    -- Fetch weights from private schema
    SELECT weights INTO w FROM private.algorithm_settings WHERE id = 'post_ranking';
    
    RETURN QUERY
    SELECT 
        p.id,
        p.author_id,
        p.content,
        p.media_url,
        p.created_at,
        p.likes_count,
        p.shares_count,
        p.replies_count,
        (
            (p.replies_count * (w->>'reply')::FLOAT) + 
            (p.shares_count * (w->>'share')::FLOAT) + 
            (p.likes_count * (w->>'like')::FLOAT)
        ) / POWER(
            EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + (w->>'time_offset')::FLOAT, 
            (w->>'gravity')::FLOAT
        ) AS rank_score
    FROM public.posts p
    WHERE p.visibility = 'public' AND p.status = 'approved'
    ORDER BY rank_score DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- 6. Admin Control: Update Weights
CREATE OR REPLACE FUNCTION public.update_algorithm_weights(new_weights JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    UPDATE private.algorithm_settings 
    SET weights = new_weights, updated_at = NOW() 
    WHERE id = 'post_ranking';

    -- Log the action
    INSERT INTO private.admin_logs (admin_id, action, details)
    VALUES (auth.uid(), 'update_weights', new_weights);

    -- Broadcast event
    INSERT INTO public.app_events (event_type, payload)
    VALUES ('weight_change', jsonb_build_object('admin_id', auth.uid(), 'new_weights', new_weights));
END;
$$;

-- 10. Wallet Access RPC
CREATE OR REPLACE FUNCTION public.get_my_wallet()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    wallet_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'prophy_points', prophy_points,
        'total_earned', total_earned,
        'updated_at', updated_at
    ) INTO wallet_data
    FROM private.user_wallets
    WHERE user_id = auth.uid();
    
    RETURN wallet_data;
END;
$$;

-- 7. Post Cost Logic (50 Prophy Points)
CREATE OR REPLACE FUNCTION public.deduct_post_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE private.user_wallets
    SET prophy_points = prophy_points - 50
    WHERE user_id = NEW.author_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient Prophy Points';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_deduct_post_points
BEFORE INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.deduct_post_points();

-- 8. Real-time Enablers
-- Note: Replication must be enabled for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- 9. Hardened RLS Policies (Deny by Default)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

-- Posts Policies
DROP POLICY IF EXISTS "Public read posts" ON public.posts;
CREATE POLICY "Public read posts" ON public.posts
FOR SELECT USING (
    visibility = 'public' AND status = 'approved'
);

DROP POLICY IF EXISTS "Users can manage own posts" ON public.posts;
CREATE POLICY "Users can manage own posts" ON public.posts
FOR ALL USING (
    author_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "Admins manage all posts" ON public.posts;
CREATE POLICY "Admins manage all posts" ON public.posts
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

-- Users Policies
DROP POLICY IF EXISTS "Public read profiles" ON public.users;
CREATE POLICY "Public read profiles" ON public.users
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.users;
CREATE POLICY "Users update own profile" ON public.users
FOR UPDATE USING (
    id = (SELECT auth.uid())
);

-- App Events Policies
DROP POLICY IF EXISTS "Admins read events" ON public.app_events;
CREATE POLICY "Admins read events" ON public.app_events
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND role = 'admin')
);

-- 10. Sync Wallets on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO private.user_wallets (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.app_events (event_type, payload)
    VALUES ('signup', jsonb_build_object('user_id', NEW.id, 'name', NEW.name));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
