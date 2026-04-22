
-- ===============================================================
-- CHAT & ENGAGEMENT ENHANCEMENTS
-- ===============================================================

-- 1. Correct Engagement Logic: Prevent self-reply engagement
CREATE OR REPLACE FUNCTION public.handle_post_reply(
    p_post_id UUID,
    p_reply_content TEXT,
    p_media_url TEXT DEFAULT NULL,
    p_media_type TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_post_author_id UUID;
    v_user_name TEXT;
    v_user_nickname TEXT;
    v_user_avatar TEXT;
    v_user_uni TEXT;
    v_deduction_result JSONB;
BEGIN
    -- 1. Get info about the original post and the replying user
    SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = p_post_id;
    
    SELECT name, nickname, profile_picture, university 
    INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- 2. Deduct points (30 for reply)
    v_deduction_result := public.deduct_points_secure(30);
    
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- 3. Create reply
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university, university,
        content, media_url, media_type, parent_id, status, visibility
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni, v_user_uni,
        p_reply_content, p_media_url, p_media_type, p_post_id, 'approved', 'public'
    );

    -- 4. Reward author of original post (ONLY IF NOT SELF-REPLY)
    IF v_user_id != v_post_author_id THEN
        -- Increase engagement count or score here if you have a specific column
        -- Otherwise it's already counted in the view because we inserted a new post with parent_id
        
        -- Logic to specifically reward author coins for engagement
        PERFORM public.reward_engagement_secure(v_post_author_id, 'comment');
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Ensure Groups Table Structure
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_monetized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- 3. Ensure Messages Table has group_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='group_id') THEN
        ALTER TABLE public.messages ADD COLUMN group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Secure Group Creation RPC (Force creator to be a member)
CREATE OR REPLACE FUNCTION public.create_squad_secure(
    p_name TEXT,
    p_description TEXT,
    p_is_monetized BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_group_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Create group
    INSERT INTO public.groups (name, description, creator_id, is_monetized)
    VALUES (p_name, p_description, v_user_id, p_is_monetized)
    RETURNING id INTO v_group_id;

    -- Add creator as admin member
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (v_group_id, v_user_id, 'admin');

    RETURN jsonb_build_object('success', true, 'group_id', v_group_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Real-time Enabling
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'groups') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'group_members') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
    END IF;
END $$;

-- 6. RLS Policies
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Groups View" ON public.groups;
CREATE POLICY "Public Groups View" ON public.groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth Group Creation" ON public.groups;
CREATE POLICY "Auth Group Creation" ON public.groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Member View" ON public.group_members;
CREATE POLICY "Member View" ON public.group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Member Join" ON public.group_members;
CREATE POLICY "Member Join" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
