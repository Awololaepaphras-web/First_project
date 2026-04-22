-- ===============================================================
-- CHAT STREAM & POST SECURITY INTEGRATION
-- ===============================================================

-- 1. Ensure user_id column exists and references the profiles (public.users) table.
-- Note: In this project, 'public.users' contains the profile intel (id, nickname, etc.)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='posts' AND column_name='user_id') THEN
        ALTER TABLE public.posts ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Create Database View: chat_stream
-- Joins posts and users so we can fetch content and sender nickname in one request.
CREATE OR REPLACE VIEW public.chat_stream AS
SELECT 
    p.id as post_id,
    p.content,
    p.created_at,
    p.university,
    u.id as user_id,
    u.nickname as sender_nickname
FROM public.posts p
JOIN public.users u ON p.user_id = u.id;

-- 3. Add RLS policy for Insertion
-- Ensures only authenticated users can insert posts using their own auth.uid().
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
CREATE POLICY "Authenticated users can insert posts" ON public.posts 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);
