
-- 1. Conversations Table for WhatsApp-like Sidebar
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY, -- [user1_id]:[user2_id] sorted
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure Messages Table has necessary columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='media_url') THEN
        ALTER TABLE messages ADD COLUMN media_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='media_type') THEN
        ALTER TABLE messages ADD COLUMN media_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='expires_at') THEN
        ALTER TABLE messages ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Conversations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own conversations' AND tablename = 'conversations') THEN
        CREATE POLICY "Users can view their own conversations" ON conversations
          FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upsert their own conversations' AND tablename = 'conversations') THEN
        CREATE POLICY "Users can upsert their own conversations" ON conversations
          FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    END IF;
END $$;

-- 5. Enable Realtime
-- Note: These commands might fail if not run as superuser, but we include them for completeness
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
