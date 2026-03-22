
-- ===============================================================
-- PROPH APP: SECURE SUPABASE SETUP
-- ===============================================================
-- This script sets up the database schema with robust security,
-- Row Level Security (RLS) policies, and automated triggers.
-- ===============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS
-- Function to generate a 17-character alphanumeric Proph ID
CREATE OR REPLACE FUNCTION public.generate_proph_id() 
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..17 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 3. TABLES

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    university TEXT NOT NULL,
    level TEXT,
    points INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_premium BOOLEAN DEFAULT false,
    premium_until BIGINT,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES public.users(id),
    theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light')),
    is_sug_verified BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verification_code TEXT,
    followers UUID[] DEFAULT '{}',
    following UUID[] DEFAULT '{}',
    bank_details JSONB DEFAULT '{}',
    referral_stats JSONB DEFAULT '{"clicks": 0, "signups": 0, "withdrawals": 0, "loginStreaks": 0}',
    engagement_stats JSONB DEFAULT '{"totalLikesGiven": 0, "totalRepliesGiven": 0, "totalRepostsGiven": 0, "totalLinkClicks": 0, "totalProfileClicks": 0, "totalMediaViews": 0}',
    gladiator_earnings JSONB DEFAULT '{"total": 0, "arena": 0, "vault": 0, "referrals": 0}',
    staff_permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_nickname TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    likes UUID[] DEFAULT '{}',
    reposts UUID[] DEFAULT '{}',
    comments JSONB DEFAULT '[]',
    parent_id UUID REFERENCES public.posts(id),
    stats JSONB DEFAULT '{"linkClicks": 0, "profileClicks": 0, "mediaViews": 0, "detailsExpanded": 0, "impressions": 0}',
    created_at BIGINT NOT NULL
);

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    university_id TEXT NOT NULL,
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    year INTEGER,
    semester TEXT,
    faculty TEXT,
    department TEXT,
    level TEXT,
    description TEXT,
    type TEXT,
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    uploaded_by UUID REFERENCES public.users(id),
    created_at BIGINT NOT NULL
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Advertisements Table
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    media_url TEXT,
    media_type TEXT,
    ad_type TEXT,
    placement TEXT,
    link TEXT,
    duration INTEGER,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'rejected')),
    target_location TEXT,
    campaign_duration INTEGER,
    campaign_unit TEXT,
    times_per_day INTEGER,
    target_reach INTEGER,
    time_frames TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    type TEXT,
    link TEXT,
    completed_by UUID[] DEFAULT '{}',
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 5000),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    bank_name TEXT,
    account_number TEXT,
    account_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- System Config Table
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    config JSONB NOT NULL
);

-- Payment Verifications Table
CREATE TABLE IF NOT EXISTS public.payment_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    proof_url TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Universities Table
CREATE TABLE IF NOT EXISTS public.universities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    logo TEXT,
    description TEXT,
    stats JSONB DEFAULT '{"students": 0, "questions": 0, "rating": 0}'
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gladiator Vault Table
CREATE TABLE IF NOT EXISTS public.gladiator_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    vault_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    arena_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SECURITY FUNCTIONS

-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR (
      auth.jwt() ->> 'email' = 'awololaeo.22@student.funaab.edu.ng' AND
      (auth.jwt() ->> 'email_verified')::boolean = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gladiator_vault ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (
    is_admin() OR (
      -- Ensure sensitive fields are not modified by the user
      role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
      points = (SELECT points FROM public.users WHERE id = auth.uid()) AND
      is_premium = (SELECT is_premium FROM public.users WHERE id = auth.uid()) AND
      is_verified = (SELECT is_verified FROM public.users WHERE id = auth.uid())
    )
  )
);
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL USING (is_admin());

-- Secure Point Transfer Function (Atomic & Secure)
CREATE OR REPLACE FUNCTION public.transfer_points(receiver_proph_id TEXT, transfer_amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  sender_id UUID := auth.uid();
  receiver_id UUID;
BEGIN
  -- 1. Check authentication
  IF sender_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Validate amount
  IF transfer_amount < 5000 THEN
    RAISE EXCEPTION 'Minimum transfer is 5000 points';
  END IF;

  -- 3. Find receiver by Proph ID
  SELECT id INTO receiver_id FROM public.users WHERE referral_code = receiver_proph_id;
  IF receiver_id IS NULL THEN
    RAISE EXCEPTION 'Receiver node not found';
  END IF;

  -- 4. Prevent self-transfer
  IF sender_id = receiver_id THEN
    RAISE EXCEPTION 'Cannot transfer to self';
  END IF;

  -- 5. Check sender balance (Atomic check)
  IF (SELECT points FROM public.users WHERE id = sender_id) < transfer_amount THEN
    RAISE EXCEPTION 'Insufficient points in vault';
  END IF;

  -- 6. Perform transfer (Atomic updates)
  UPDATE public.users SET points = points - transfer_amount WHERE id = sender_id;
  UPDATE public.users SET points = points + transfer_amount WHERE id = receiver_id;

  -- 7. Log notification for receiver
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (receiver_id, 'Intel Received', 'You received ' || transfer_amount || ' points from another node.', 'info');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Secure Follow User Function
CREATE OR REPLACE FUNCTION public.follow_user(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Check authentication
  IF auth.uid() != follower_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Prevent self-follow
  IF follower_id = following_id THEN
    RAISE EXCEPTION 'Cannot follow self';
  END IF;

  -- 3. Update follower's following list
  UPDATE public.users 
  SET following = array_append(ARRAY(SELECT unnest(following) WHERE unnest != following_id), following_id)
  WHERE id = follower_id;

  -- 4. Update following's followers list
  UPDATE public.users 
  SET followers = array_append(ARRAY(SELECT unnest(followers) WHERE unnest != follower_id), follower_id)
  WHERE id = following_id;

  -- 5. Send notification
  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (following_id, 'New Follower', 'Someone just followed you!', 'info', jsonb_build_object('followerId', follower_id));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Secure Unfollow User Function
CREATE OR REPLACE FUNCTION public.unfollow_user(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 1. Check authentication
  IF auth.uid() != follower_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Update follower's following list
  UPDATE public.users 
  SET following = array_remove(following, following_id)
  WHERE id = follower_id;

  -- 3. Update following's followers list
  UPDATE public.users 
  SET followers = array_remove(followers, follower_id)
  WHERE id = following_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Posts Policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Documents Policies
CREATE POLICY "Approved documents are viewable by everyone" ON public.documents FOR SELECT USING (status = 'approved' OR is_admin());
CREATE POLICY "Authenticated users can upload documents" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (is_admin());

-- Messages Policies
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR is_admin());
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Withdrawal Requests Policies
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create withdrawal requests" ON public.withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage withdrawal requests" ON public.withdrawal_requests FOR ALL USING (is_admin());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Gladiator Vault Policies
CREATE POLICY "Users can view their own vault" ON public.gladiator_vault FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can update their own vault" ON public.gladiator_vault FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Advertisements Policies
CREATE POLICY "Active ads are viewable by everyone" ON public.advertisements FOR SELECT USING (status = 'active' OR auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create ad requests" ON public.advertisements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage all ads" ON public.advertisements FOR ALL USING (is_admin());

-- Tasks Policies
CREATE POLICY "Tasks are viewable by everyone" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (is_admin());

-- Payment Verifications Policies
CREATE POLICY "Users can view their own verifications" ON public.payment_verifications FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Users can create verifications" ON public.payment_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage verifications" ON public.payment_verifications FOR ALL USING (is_admin());

-- Universities Policies
CREATE POLICY "Universities are viewable by everyone" ON public.universities FOR SELECT USING (true);
CREATE POLICY "Admins can manage universities" ON public.universities FOR ALL USING (is_admin());

-- System Config Policies
CREATE POLICY "System config is viewable by everyone" ON public.system_config FOR SELECT USING (true);
CREATE POLICY "Only admins can update system config" ON public.system_config FOR ALL USING (is_admin());

-- 7. INITIAL DATA (SEEDING)

-- Initial Universities
INSERT INTO public.universities (id, name, acronym, location, logo, stats)
VALUES 
    ('ui', 'University of Ibadan', 'UI', 'Ibadan, Oyo', 'https://picsum.photos/seed/ui/200', '{"students": 1200, "questions": 450, "rating": 4.8}'),
    ('unilag', 'University of Lagos', 'UNILAG', 'Akoka, Lagos', 'https://picsum.photos/seed/unilag/200', '{"students": 1500, "questions": 380, "rating": 4.7}'),
    ('oau', 'Obafemi Awolowo University', 'OAU', 'Ile-Ife, Osun', 'https://picsum.photos/seed/oau/200', '{"students": 1100, "questions": 420, "rating": 4.9}'),
    ('unn', 'University of Nigeria, Nsukka', 'UNN', 'Nsukka, Enugu', 'https://picsum.photos/seed/unn/200', '{"students": 950, "questions": 310, "rating": 4.6}'),
    ('abu', 'Ahmadu Bello University', 'ABU', 'Zaria, Kaduna', 'https://picsum.photos/seed/abu/200', '{"students": 1300, "questions": 290, "rating": 4.5}'),
    ('uniben', 'University of Benin', 'UNIBEN', 'Benin, Edo', 'https://picsum.photos/seed/uniben/200', '{"students": 1050, "questions": 340, "rating": 4.7}'),
    ('unilorin', 'University of Ilorin', 'UNILORIN', 'Ilorin, Kwara', 'https://picsum.photos/seed/unilorin/200', '{"students": 1400, "questions": 510, "rating": 4.8}'),
    ('uniport', 'University of Port Harcourt', 'UNIPORT', 'Port Harcourt, Rivers', 'https://picsum.photos/seed/uniport/200', '{"students": 880, "questions": 260, "rating": 4.4}'),
    ('funaab', 'Federal University of Agriculture, Abeokuta', 'FUNAAB', 'Abeokuta, Ogun', 'https://picsum.photos/seed/funaab/200', '{"students": 1150, "questions": 480, "rating": 4.9}')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    acronym = EXCLUDED.acronym,
    location = EXCLUDED.location,
    logo = EXCLUDED.logo,
    stats = EXCLUDED.stats;

-- Initial System Config
INSERT INTO public.system_config (id, config)
VALUES ('default', '{
  "isAiEnabled": true,
  "isUploadEnabled": true,
  "isWithdrawalEnabled": true,
  "isMaintenanceMode": false,
  "isCommunityEnabled": true,
  "isAdsEnabled": true,
  "isUserAdsEnabled": true,
  "feedWeights": { "engagement": 0.4, "recency": 0.3, "relationship": 0.1, "quality": 0.1, "eduRelevance": 0.1 },
  "adWeights": { "budget": 0.5, "relevance": 0.2, "performance": 0.2, "targetMatch": 0.1 },
  "earnRates": { "contribution": 50, "referral": 80, "adClick": 200, "arena": 5 },
  "nairaPerPoint": 0.5,
  "adPricing": { "daily": 1500, "weekly": 8500, "monthly": 30000 },
  "engagementWeights": { "replies": 5.0, "likes": 1.0, "reposts": 2.5 },
  "premiumTiers": { "weekly": 1000, "monthly": 2500, "yearly": 20000 },
  "paymentAccount": { "bankName": "Proph Institutional Bank", "accountNumber": "1020304050", "accountName": "PROPH ACADEMIC SERVICES" },
  "isCardPaymentEnabled": true,
  "paystackPublicKey": "pk_test_proph_academic_node_key"
}')
ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config;

-- Initial Tasks
INSERT INTO public.tasks (title, description, points, type, link)
VALUES 
    ('Follow Proph on X', 'Stay updated with the latest intel.', 500, 'social', 'https://x.com/proph'),
    ('Join Telegram Channel', 'Get instant alerts for new questions.', 300, 'social', 'https://t.me/proph'),
    ('Subscribe to YouTube', 'Watch tutorials and study guides.', 400, 'social', 'https://youtube.com/proph'),
    ('Complete Profile', 'Fill in your university and level details.', 200, 'profile', '/settings')
ON CONFLICT DO NOTHING;

-- Initial Posts (Feed)
-- Note: These are example posts from the system admin
INSERT INTO public.posts (user_id, user_name, user_nickname, content, created_at)
VALUES 
    ('00000000-0000-0000-0000-000000000000', 'Proph System', 'proph_hq', 'Welcome to the Proph Academic Node! 🚀 Start exploring past questions and connecting with scholars across Nigeria.', (extract(epoch from now()) * 1000)::bigint),
    ('00000000-0000-0000-0000-000000000000', 'Proph System', 'proph_hq', 'Need help with a difficult course? Use the Study AI to get instant explanations and summaries.', (extract(epoch from now()) * 1000)::bigint - 3600000)
ON CONFLICT DO NOTHING;

-- Initial Documents (Past Questions)
INSERT INTO public.documents (id, university_id, course_code, course_title, year, semester, faculty, department, level, description, file_url, type, status, created_at)
VALUES 
    ('q1', 'ui', 'GSP 101', 'Use of English', 2023, 'First', 'Arts', 'English', '100', 'General Studies Programme examination paper.', '#', 'document', 'approved', (extract(epoch from now()) * 1000)::bigint),
    ('q2', 'funaab', 'CSC 201', 'Computer Programming I', 2022, 'First', 'COLPHYS', 'Computer Science', '200', 'Introduction to C programming.', '#', 'document', 'approved', (extract(epoch from now()) * 1000)::bigint)
ON CONFLICT (id) DO NOTHING;

-- 8. TRIGGERS & AUTOMATION

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_proph_id TEXT;
BEGIN
  -- Generate unique 17-character Proph ID
  LOOP
    new_proph_id := public.generate_proph_id();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_proph_id);
  END LOOP;

  INSERT INTO public.users (id, email, name, nickname, university, level, referred_by, referral_code, role)
  VALUES (
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
    END
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize Gladiator Vault
  INSERT INTO public.gladiator_vault (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. REALTIME CONFIGURATION
-- Safely enable realtime for all tables
DO $$
BEGIN
  -- Ensure publication exists
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  -- Add tables to publication if not already present
  DECLARE
    tables TEXT[] := ARRAY['posts', 'users', 'documents', 'messages', 'advertisements', 'tasks', 'withdrawal_requests', 'system_config', 'payment_verifications', 'universities', 'notifications', 'gladiator_vault'];
    t TEXT;
  BEGIN
    FOR t IN SELECT unnest(tables) LOOP
      IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = t
        ) THEN
          EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
        END IF;
      END IF;
    END LOOP;
  END;
END $$;

-- ===============================================================
-- SETUP COMPLETE
-- ===============================================================
