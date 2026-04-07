
-- Migration to create the requested statuses table structure
-- This follows the specific requirements for the 'Retention-Focused' logic

CREATE TABLE IF NOT EXISTS statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  renewal_count INT DEFAULT 0,
  view_count INT DEFAULT 0
);

-- Add missing columns if table already exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='statuses' AND column_name='url') THEN
        ALTER TABLE statuses ADD COLUMN url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='statuses' AND column_name='renewal_count') THEN
        ALTER TABLE statuses ADD COLUMN renewal_count INT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='statuses' AND column_name='view_count') THEN
        ALTER TABLE statuses ADD COLUMN view_count INT DEFAULT 0;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Statuses are viewable by everyone' AND tablename = 'statuses') THEN
        CREATE POLICY "Statuses are viewable by everyone" ON statuses
          FOR SELECT USING (expires_at > NOW() OR created_at > NOW() - INTERVAL '48 hours'); -- Allow viewing recently expired for 'The Hook'
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own statuses' AND tablename = 'statuses') THEN
        CREATE POLICY "Users can insert their own statuses" ON statuses
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own statuses' AND tablename = 'statuses') THEN
        CREATE POLICY "Users can update their own statuses" ON statuses
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_status_view_count(status_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE statuses
  SET view_count = view_count + 1
  WHERE id = status_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
