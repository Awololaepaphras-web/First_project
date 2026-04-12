
-- Function to handle coin deduction for posting
CREATE OR REPLACE FUNCTION handle_post_coins(user_id UUID)
RETURNS BOOLEAN AS $
DECLARE
  current_points INT;
BEGIN
  -- Get current points
  SELECT points INTO current_points FROM users WHERE id = user_id;
  
  -- Check if user has enough points (coins)
  IF current_points < 30 THEN
    RAISE EXCEPTION 'Insufficient coins. You need 30 coins to post.';
  END IF;
  
  -- Deduct 30 coins
  UPDATE users SET points = points - 30 WHERE id = user_id;
  
  RETURN TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle coin deduction for replying and point reward for poster
CREATE OR REPLACE FUNCTION handle_reply_coins(replier_id UUID, poster_id UUID)
RETURNS BOOLEAN AS $
DECLARE
  replier_points INT;
BEGIN
  -- Get replier points
  SELECT points INTO replier_points FROM users WHERE id = replier_id;
  
  -- Check if replier has enough points
  IF replier_points < 30 THEN
    RAISE EXCEPTION 'Insufficient coins. You need 30 coins to reply.';
  END IF;
  
  -- Deduct 30 coins from replier
  UPDATE users SET points = points - 30 WHERE id = replier_id;
  
  -- Give 20 points to the poster
  UPDATE users SET points = points + 20 WHERE id = poster_id;
  
  RETURN TRUE;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comprehensive RPC for creating a post with coin deduction
CREATE OR REPLACE FUNCTION create_post_v2(
  p_content TEXT,
  p_media_url TEXT DEFAULT NULL,
  p_media_type TEXT DEFAULT NULL,
  p_parent_id UUID DEFAULT NULL
)
RETURNS JSONB AS $
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_user_nickname TEXT;
  v_user_avatar TEXT;
  v_user_university TEXT;
  v_poster_id UUID;
  v_new_post_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Fetch user details for the post
  SELECT name, nickname, university INTO v_user_name, v_user_nickname, v_user_university
  FROM users WHERE id = v_user_id;
  
  -- Deduct coins for posting (30 coins)
  IF NOT handle_post_coins(v_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient coins');
  END IF;
  
  -- If it's a reply, handle rewards
  IF p_parent_id IS NOT NULL THEN
    SELECT user_id INTO v_poster_id FROM posts WHERE id = p_parent_id;
    IF v_poster_id IS NOT NULL AND v_poster_id != v_user_id THEN
      -- Give 20 points to poster
      UPDATE users SET points = points + 20 WHERE id = v_poster_id;
    END IF;
  END IF;
  
  -- Insert the post with all required fields
  INSERT INTO posts (
    user_id, 
    user_name, 
    user_nickname, 
    user_university,
    content, 
    media_url, 
    media_type, 
    parent_id,
    created_at
  )
  VALUES (
    v_user_id, 
    v_user_name, 
    v_user_nickname, 
    v_user_university,
    p_content, 
    p_media_url, 
    p_media_type, 
    p_parent_id,
    (extract(epoch from now()) * 1000)::bigint
  )
  RETURNING id INTO v_new_post_id;
  
  RETURN jsonb_build_object('success', true, 'post_id', v_new_post_id);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
