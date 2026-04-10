-- ===============================================================
-- PROPH APP: MISSING TABLES & SCHEMA UPDATES
-- ===============================================================
-- This script adds the missing tables and updates existing ones
-- to support the latest features (Groups, Invites, Wallets, etc.)
-- ===============================================================

-- 1. UPDATES TO EXISTING TABLES
-- Add earnings and premium_tier to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS earnings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS premium_tier TEXT DEFAULT 'none' CHECK (premium_tier IN ('none', 'premium', 'premium_plus', 'alpha_premium'));

-- 2. NEW TABLES

-- Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Group Members Table
CREATE TABLE IF NOT EXISTS public.group_members (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (group_id, user_id)
);

-- Chat Invites Table (For mutual agreement logic)
CREATE TABLE IF NOT EXISTS public.chat_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    third_party_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    agreement_sender BOOLEAN DEFAULT false,
    agreement_receiver BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wallets Table (For detailed transaction tracking)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_withdrawn INTEGER DEFAULT 0,
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Archive Intel Table (Analytics for past questions)
CREATE TABLE IF NOT EXISTS public.archive_intel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT CHECK (action IN ('view', 'download', 'share')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SECURITY (RLS)

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_intel ENABLE ROW LEVEL SECURITY;

-- Groups Policies
CREATE POLICY "Groups are viewable by members" ON public.groups FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid()) OR is_admin());
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Group Members Policies
CREATE POLICY "Members can view other members" ON public.group_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_members.group_id AND user_id = auth.uid()) OR is_admin());
CREATE POLICY "Admins can manage members" ON public.group_members FOR ALL USING (is_admin());

-- Chat Invites Policies
CREATE POLICY "Users can view their own invites" ON public.chat_invites FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR auth.uid() = third_party_id OR is_admin());
CREATE POLICY "Users can create invites" ON public.chat_invites FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their own agreement" ON public.chat_invites FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR is_admin());

-- Wallets Policies
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id OR is_admin());
-- Wallet updates should mostly happen via secure RPC/Triggers, but for now:
CREATE POLICY "Admins can manage all wallets" ON public.wallets FOR ALL USING (is_admin());

-- Archive Intel Policies
CREATE POLICY "Admins can view all intel" ON public.archive_intel FOR SELECT USING (is_admin());
CREATE POLICY "Users can log their own intel" ON public.archive_intel FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4. REAL-TIME

-- Add to publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.archive_intel;

-- 5. AUTOMATION

-- Function to initialize wallet on user creation
CREATE OR REPLACE FUNCTION public.initialize_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for wallet initialization
DROP TRIGGER IF EXISTS on_user_created_wallet ON public.users;
CREATE TRIGGER on_user_created_wallet
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.initialize_wallet();

-- ===============================================================
-- SCHEMA UPDATE COMPLETE
-- ===============================================================
