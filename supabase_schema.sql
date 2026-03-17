-- Supabase Schema for Proph Study Hub
-- This script sets up all necessary tables and enables real-time subscriptions.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  nickname TEXT UNIQUE,
  avatar TEXT,
  bio TEXT,
  location TEXT,
  university TEXT,
  college TEXT,
  department TEXT,
  level TEXT,
  points INTEGER DEFAULT 0,
  balance DECIMAL DEFAULT 0,
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  premium_until BIGINT,
  is_admin BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user',
  engagement_stats JSONB DEFAULT '{}',
  monetization JSONB DEFAULT '{}',
  theme_preference TEXT DEFAULT 'light',
  is_sug_verified BOOLEAN DEFAULT false,
  staff_permissions TEXT[] DEFAULT '{}',
  referral_code TEXT UNIQUE,
  referral_stats JSONB DEFAULT '{}',
  bank_details JSONB DEFAULT '{}',
  gladiator_earnings DECIMAL DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  referred_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_nickname TEXT,
  user_avatar TEXT,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  likes TEXT[] DEFAULT '{}',
  reposts TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{"likes": 0, "replies": 0, "reposts": 0, "linkClicks": 0, "profileClicks": 0, "mediaViews": 0}',
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT,
  media_url TEXT,
  media_type TEXT,
  timestamp BIGINT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Verifications
CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  amount DECIMAL,
  type TEXT,
  reference TEXT UNIQUE,
  proof_url TEXT,
  status TEXT DEFAULT 'pending',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gladiator Vault
CREATE TABLE IF NOT EXISTS gladiator_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  description TEXT,
  price INTEGER,
  rarity TEXT,
  type TEXT,
  image TEXT,
  stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advertisements
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT,
  media_url TEXT,
  media_type TEXT,
  ad_type TEXT,
  placement TEXT,
  link TEXT,
  duration INTEGER,
  target_location TEXT,
  campaign_duration INTEGER,
  campaign_unit TEXT,
  times_per_day INTEGER,
  target_reach TEXT,
  time_frames JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  analytics JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawal Requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  points INTEGER,
  amount DECIMAL,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  link TEXT,
  points INTEGER,
  question TEXT,
  completed_by TEXT[] DEFAULT '{}',
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Universities
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  acronym TEXT UNIQUE,
  location TEXT,
  logo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Config
CREATE TABLE IF NOT EXISTS system_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  config JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config
INSERT INTO system_config (id, config) VALUES
('default', '{
  "is_ai_enabled": true,
  "is_upload_enabled": true,
  "is_withdrawal_enabled": true,
  "is_maintenance_mode": false,
  "is_community_enabled": true,
  "is_ads_enabled": true,
  "is_user_ads_enabled": true,
  "naira_per_point": 10,
  "ad_pricing": {
    "banner": 5000,
    "popup": 10000,
    "native": 7500
  },
  "premium_tiers": {
    "monthly": 2000,
    "yearly": 15000
  },
  "payment_account": {
    "bankName": "Proph Bank",
    "accountNumber": "0123456789",
    "accountName": "Proph Academic Node"
  }
}')
ON CONFLICT (id) DO NOTHING;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents (Past Questions)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  course_code TEXT,
  course_title TEXT,
  year INTEGER,
  semester TEXT,
  faculty TEXT,
  department TEXT,
  level TEXT,
  description TEXT,
  file_url TEXT,
  type TEXT,
  status TEXT DEFAULT 'pending',
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviews JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for all tables
-- Note: You must also enable this in the Supabase Dashboard under Database -> Replication
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE advertisements;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE withdrawal_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE gladiator_vault;
ALTER PUBLICATION supabase_realtime ADD TABLE universities;
ALTER PUBLICATION supabase_realtime ADD TABLE system_config;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

-- Basic RLS Policies (Optional but recommended)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
-- CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
