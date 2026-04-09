
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
  v_poster_id UUID;
  v_new_post_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Deduct coins for posting (30 coins)
  IF NOT handle_post_coins(v_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient coins');
  END IF;
  
  -- If it's a reply, handle rewards
  IF p_parent_id IS NOT NULL THEN
    SELECT user_id INTO v_poster_id FROM posts WHERE id = p_parent_id;
    IF v_poster_id IS NOT NULL AND v_poster_id != v_user_id THEN
      -- Deduct 30 from replier (already done by handle_post_coins above, but wait, the logic is different)
      -- Actually, the user said:
      -- "post 30 coin is deducted"
      -- "reply 30 coin is deducted from replier and 20 point given to poster"
      -- So both post and reply cost 30.
      
      -- Give 20 points to poster
      UPDATE users SET points = points + 20 WHERE id = v_poster_id;
    END IF;
  END IF;
  
  -- Insert the post
  INSERT INTO posts (user_id, content, media_url, media_type, parent_id)
  VALUES (v_user_id, p_content, p_media_url, p_media_type, p_parent_id)
  RETURNING id INTO v_new_post_id;
  
  RETURN jsonb_build_object('success', true, 'post_id', v_new_post_id);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
