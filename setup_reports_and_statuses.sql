
-- 1. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id),
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL, -- 'post', 'user', 'comment'
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Statuses Table (Stories)
CREATE TABLE IF NOT EXISTS public.statuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    user_avatar TEXT,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL, -- 'image', 'video', 'gif'
    caption TEXT,
    renewed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;

-- Policies for Reports
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view reports" ON public.reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff'))
);
CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff'))
);

-- Policies for Statuses
CREATE POLICY "Anyone can view active statuses" ON public.statuses FOR SELECT USING (expires_at > now());
CREATE POLICY "Users can create statuses" ON public.statuses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own statuses" ON public.statuses FOR DELETE USING (auth.uid() = user_id);

-- 3. Secure Reply & Point Transfer Logic
-- This function handles the 30/20/10 split and the "charge once" logic
CREATE OR REPLACE FUNCTION handle_post_reply(
    p_post_id UUID,
    p_reply_content TEXT,
    p_media_url TEXT DEFAULT NULL,
    p_media_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_post_author_id UUID;
    v_replier_id UUID;
    v_reply_cost INT := 30;
    v_author_reward INT := 20;
    v_admin_cut INT := 10;
    v_already_replied BOOLEAN;
    v_replier_points NUMERIC;
    v_new_post_id UUID;
    v_admin_id UUID;
BEGIN
    v_replier_id := auth.uid();
    IF v_replier_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Get post author
    SELECT user_id INTO v_post_author_id FROM posts WHERE id = p_post_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Post not found');
    END IF;

    -- Check if replier is the author
    IF v_replier_id = v_post_author_id THEN
        v_reply_cost := 0;
        v_author_reward := 0;
        v_admin_cut := 0;
    ELSE
        -- Check if already replied (to avoid double charging)
        SELECT EXISTS (
            SELECT 1 FROM posts 
            WHERE parent_id = p_post_id 
            AND user_id = v_replier_id
        ) INTO v_already_replied;

        IF v_already_replied THEN
            v_reply_cost := 0;
            v_author_reward := 0;
            v_admin_cut := 0;
        END IF;
    END IF;

    -- Check points if cost > 0
    IF v_reply_cost > 0 THEN
        SELECT points INTO v_replier_points FROM users WHERE id = v_replier_id;
        IF v_replier_points < v_reply_cost THEN
            RETURN jsonb_build_object('success', false, 'message', 'Insufficient Prophy Coins');
        END IF;

        -- Deduct from replier
        UPDATE users SET points = points - v_reply_cost WHERE id = v_replier_id;

        -- Reward author
        UPDATE users SET points = points + v_author_reward WHERE id = v_post_author_id;

        -- Send to superadmin (first admin found)
        SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;
        IF v_admin_id IS NOT NULL THEN
            UPDATE users SET points = points + v_admin_cut WHERE id = v_admin_id;
        END IF;
    END IF;

    -- Create the reply post
    INSERT INTO posts (
        id,
        user_id,
        content,
        media_url,
        media_type,
        parent_id,
        visibility,
        status,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_replier_id,
        p_reply_content,
        p_media_url,
        p_media_type,
        p_post_id,
        'public',
        'approved',
        now()
    ) RETURNING id INTO v_new_post_id;

    RETURN jsonb_build_object(
        'success', true, 
        'post_id', v_new_post_id, 
        'cost_deducted', v_reply_cost
    );
END;
$$;
