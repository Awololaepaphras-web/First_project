-- 1. Algorithm Settings Table
CREATE TABLE IF NOT EXISTS algorithm_settings (
  id TEXT PRIMARY KEY,
  weights JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default weights
INSERT INTO algorithm_settings (id, weights)
VALUES ('post_ranking', '{
  "author_reply": 75.0,
  "reply": 13.5,
  "bookmark": 10.0,
  "share": 5.0,
  "like": 0.5,
  "gravity": 1.5,
  "time_offset": 2.0
}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO algorithm_settings (id, weights)
VALUES ('ad_delivery', '{
  "bid_weight": 1.0,
  "quality_weight": 1.0
}')
ON CONFLICT (id) DO NOTHING;

-- 2. Post Ranking Function
CREATE OR REPLACE FUNCTION get_ranked_posts(limit_count INT DEFAULT 50, offset_count INT DEFAULT 0)
RETURNS TABLE (
  id UUID,
  author_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  likes_count INT,
  shares_count INT,
  bookmarks_count INT,
  replies_count INT,
  author_replies_count INT,
  hot_score FLOAT
) AS $$
DECLARE
  w JSONB;
BEGIN
  SELECT weights INTO w FROM algorithm_settings WHERE id = 'post_ranking';
  
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    p.content,
    p.created_at,
    p.likes_count,
    p.shares_count,
    p.bookmarks_count,
    p.replies_count,
    p.author_replies_count,
    (
      (p.author_replies_count * (w->>'author_reply')::FLOAT) + 
      (p.replies_count * (w->>'reply')::FLOAT) + 
      (p.bookmarks_count * (w->>'bookmark')::FLOAT) + 
      (p.shares_count * (w->>'share')::FLOAT) + 
      (p.likes_count * (w->>'like')::FLOAT)
    ) / POWER(
      EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + (w->>'time_offset')::FLOAT, 
      (w->>'gravity')::FLOAT
    ) AS hot_score
  FROM posts p
  ORDER BY hot_score DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Ad Delivery Function (Simplified Relevance without pgvector for compatibility, but structure is ready)
CREATE OR REPLACE FUNCTION ad_delivery(user_interests_vector FLOAT8[] DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title TEXT,
  bid FLOAT,
  ctr FLOAT,
  quality_score FLOAT
) AS $$
DECLARE
  w JSONB;
BEGIN
  SELECT weights INTO w FROM algorithm_settings WHERE id = 'ad_delivery';

  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.bid,
    a.ctr,
    (a.bid * (w->>'bid_weight')::FLOAT) * (a.ctr * (w->>'quality_weight')::FLOAT) as quality_score
  FROM advertisements a
  WHERE a.status = 'active'
  ORDER BY quality_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 4. Real-time Leaderboard (Materialized View)
CREATE MATERIALIZED VIEW IF NOT EXISTS top_20_users AS
SELECT 
  u.id,
  u.name,
  u.nickname,
  COUNT(p.id) as post_count,
  SUM(p.likes_count + p.shares_count + p.bookmarks_count + p.replies_count) as total_engagement
FROM users u
JOIN posts p ON u.id = p.author_id
WHERE p.created_at > NOW() - INTERVAL '24 hours'
GROUP BY u.id
ORDER BY total_engagement DESC
LIMIT 20;

CREATE UNIQUE INDEX IF NOT EXISTS top_20_users_id_idx ON top_20_users (id);

-- 5. Trigger to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_top_20_users()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY top_20_users;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on high-value interactions
CREATE TRIGGER refresh_leaderboard_on_interaction
AFTER UPDATE OF shares_count, bookmarks_count ON posts
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_top_20_users();

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'user', 'comment')),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Scaling: Indices
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_status ON advertisements (status);

ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_users UUID[] DEFAULT '{}';

-- 7. RLS Policies
ALTER TABLE algorithm_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage algorithm settings" ON algorithm_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Public can read algorithm settings" ON algorithm_settings
  FOR SELECT USING (true);

-- Enable Realtime for specific tables/columns
-- Note: This is usually done via Supabase Dashboard or SQL
-- ALTER PUBLICATION supabase_realtime ADD TABLE posts;
