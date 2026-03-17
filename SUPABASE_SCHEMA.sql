-- Supabase Schema for Proph Study Hub

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  profile_picture TEXT,
  university TEXT,
  level TEXT,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active',
  points INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expiry BIGINT,
  referral_code TEXT UNIQUE,
  followers TEXT[] DEFAULT '{}',
  following TEXT[] DEFAULT '{}',
  completed_tasks TEXT[] DEFAULT '{}',
  arena_history TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  referred_by TEXT,
  referral_stats JSONB DEFAULT '{"clicks": 0, "signups": 0, "withdrawals": 0, "login_streaks": 0}',
  phone TEXT,
  lifetime_minutes INTEGER DEFAULT 0,
  lifetime_navigations INTEGER DEFAULT 0,
  engagement_stats JSONB DEFAULT '{"totalLikesGiven": 0, "totalRepliesGiven": 0, "totalRepostsGiven": 0, "totalLinkClicks": 0, "totalProfileClicks": 0, "totalMediaViews": 0}',
  bank_details JSONB,
  gladiator_earnings DECIMAL DEFAULT 0,
  monetization JSONB DEFAULT '{"isMonetized": false, "isEligibleForPoints": true, "totalEarningsNGN": 0, "pendingBalanceNGN": 0, "impressionsLast3Months": 0, "pointsEarned": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_nickname TEXT,
  user_university TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT,
  likes TEXT[] DEFAULT '{}',
  reposts TEXT[] DEFAULT '{}',
  parent_id UUID,
  created_at BIGINT,
  stats JSONB DEFAULT '{"linkClicks": 0, "profileClicks": 0, "mediaViews": 0, "detailsExpanded": 0, "impressions": 0}',
  comments JSONB DEFAULT '[]'
);

-- Documents Table (Past Questions)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id TEXT,
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
  uploaded_by TEXT,
  created_at BIGINT,
  reviews JSONB DEFAULT '[]'
);

-- Advertisements Table
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT, -- image, video
  ad_type TEXT, -- banner, popup, native
  placement TEXT, -- timeline, search, post, profile, replies
  media_url TEXT NOT NULL,
  duration INTEGER,
  link TEXT,
  target_location TEXT,
  campaign_duration INTEGER,
  campaign_unit TEXT,
  times_per_day INTEGER,
  target_reach TEXT,
  time_frames TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  analytics JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Verifications Table
CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  type TEXT, -- premium, ad, other
  amount DECIMAL NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  details JSONB,
  created_at BIGINT
);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT,
  points INTEGER,
  amount DECIMAL,
  bank_details JSONB,
  status TEXT DEFAULT 'pending',
  created_at BIGINT
);

-- System Config Table
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_ai_enabled BOOLEAN DEFAULT TRUE,
  is_upload_enabled BOOLEAN DEFAULT TRUE,
  is_withdrawal_enabled BOOLEAN DEFAULT TRUE,
  is_maintenance_mode BOOLEAN DEFAULT FALSE,
  is_community_enabled BOOLEAN DEFAULT TRUE,
  is_ads_enabled BOOLEAN DEFAULT TRUE,
  is_user_ads_enabled BOOLEAN DEFAULT TRUE,
  feed_weights JSONB,
  ad_weights JSONB,
  earn_rates JSONB,
  naira_per_point DECIMAL,
  ad_pricing JSONB,
  premium_tiers JSONB,
  payment_account JSONB,
  is_card_payment_enabled BOOLEAN DEFAULT TRUE,
  paystack_public_key TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table for Real-Time Communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for Messages
CREATE POLICY "Users can view their own messages" 
ON messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
ON messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- IMPORTANT: To enable real-time communication across devices:
-- 1. Go to your Supabase Dashboard.
-- 2. Navigate to Database -> Replication.
-- 3. Click on '1 table' (or '0 tables') in the 'supabase_realtime' publication.
-- 4. Toggle the 'messages' table to ON.
-- This allows Supabase to broadcast new messages to all connected clients instantly.

-- Row Level Security (RLS) - Basic Setup
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Policies (Example: Users can read all posts, but only update their own)
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);

-- Add similar policies for other tables as needed.
