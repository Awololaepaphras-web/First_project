-- ===============================================================
-- SQUADS (GROUPS) DATABASE SETUP
-- ===============================================================

-- 1. Squads Table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_monetized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Squad Members Table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- 3. Update Messages Table for Squads and Advanced Features
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='group_id') THEN
        ALTER TABLE public.messages ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='reply_to') THEN
        ALTER TABLE public.messages ADD COLUMN reply_to UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='reply_to_content') THEN
        ALTER TABLE public.messages ADD COLUMN reply_to_content TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='is_seen') THEN
        ALTER TABLE public.messages ADD COLUMN is_seen BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='seen_at') THEN
        ALTER TABLE public.messages ADD COLUMN seen_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. Revenue Distribution Logic for Monetized Squads
CREATE OR REPLACE FUNCTION public.distribute_group_revenue(p_amount NUMERIC)
RETURNS BOOLEAN AS $$
BEGIN
    -- Distribute to premium users based on their tier
    UPDATE public.users SET points = COALESCE(points, 0) + floor(p_amount * 0.30) WHERE premium_tier = 'alpha_premium';
    UPDATE public.users SET points = COALESCE(points, 0) + floor(p_amount * 0.15) WHERE premium_tier = 'premium_plus';
    UPDATE public.users SET points = COALESCE(points, 0) + floor(p_amount * 0.10) WHERE premium_tier = 'premium';
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable Real-time
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'groups') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'group_members') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
    END IF;
    
    -- Ensure messages is already in publication (from master-setup)
END $$;

-- 6. RLS Policies
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Everyone can view groups
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'groups' AND policyname = 'Public Groups View') THEN
        CREATE POLICY "Public Groups View" ON public.groups FOR SELECT USING (true);
    END IF;
END $$;

-- Authenticated users can create groups
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'groups' AND policyname = 'Auth Group Creation') THEN
        CREATE POLICY "Auth Group Creation" ON public.groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Group members view
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Member View') THEN
        CREATE POLICY "Member View" ON public.group_members FOR SELECT USING (true);
    END IF;
END $$;

-- Join group
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'group_members' AND policyname = 'Member Join') THEN
        CREATE POLICY "Member Join" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
