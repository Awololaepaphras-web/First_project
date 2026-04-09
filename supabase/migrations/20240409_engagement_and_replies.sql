
-- Update fetch_secure_feed to include comments and filter out replies from main feed
CREATE OR REPLACE FUNCTION public.fetch_secure_feed(limit_count INT DEFAULT 20, offset_count INT DEFAULT 0)
RETURNS TABLE (
    id UUID,
    author_id UUID,
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMPTZ,
    likes_count INT,
    shares_count INT,
    replies_count INT,
    rank_score FLOAT,
    comments JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    w JSONB;
    current_user_id UUID;
BEGIN
    -- Fetch weights from private schema
    SELECT weights INTO w FROM private.algorithm_settings WHERE id = 'post_ranking';
    
    RETURN QUERY
    SELECT 
        p.id,
        p.author_id,
        p.content,
        p.media_url,
        p.created_at,
        p.likes_count,
        p.shares_count,
        p.replies_count,
        (
            (p.replies_count * (w->>'reply')::FLOAT) + 
            (p.shares_count * (w->>'share')::FLOAT) + 
            (p.likes_count * (w->>'like')::FLOAT)
        ) / POWER(
            EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0 + (w->>'time_offset')::FLOAT, 
            (w->>'gravity')::FLOAT
        ) AS rank_score,
        COALESCE(
            (
                SELECT jsonb_agg(jsonb_build_object(
                    'id', r.id,
                    'user_id', r.author_id,
                    'content', r.content,
                    'created_at', r.created_at,
                    'likes', r.likes_count,
                    'users', jsonb_build_object('name', u.name, 'nickname', u.nickname)
                ))
                FROM public.posts r
                JOIN public.users u ON r.author_id = u.id
                WHERE r.parent_id = p.id AND r.status = 'approved'
            ),
            '[]'::jsonb
        ) as comments
    FROM public.posts p
    WHERE p.visibility = 'public' AND p.status = 'approved' AND p.parent_id IS NULL
    ORDER BY rank_score DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Create get_top_engaged_chats RPC
CREATE OR REPLACE FUNCTION public.get_top_engaged_chats()
RETURNS TABLE (
    id UUID,
    user1_id UUID,
    user2_id UUID,
    last_message TEXT,
    last_message_time TIMESTAMPTZ,
    engagement_score INT,
    message_count INT,
    user1 JSONB,
    user2 JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH chat_stats AS (
        SELECT 
            LEAST(m.sender_id, m.receiver_id) as u1,
            GREATEST(m.sender_id, m.receiver_id) as u2,
            COUNT(*) as msg_count,
            COUNT(*) * 10 as score
        FROM public.messages m
        WHERE m.receiver_id IS NOT NULL
        GROUP BY u1, u2
    )
    SELECT 
        c.id,
        c.user1_id,
        c.user2_id,
        c.last_message,
        c.last_message_time,
        cs.score as engagement_score,
        cs.msg_count as message_count,
        jsonb_build_object('nickname', u1.nickname, 'avatar', u1.profile_picture) as user1,
        jsonb_build_object('nickname', u2.nickname, 'avatar', u2.profile_picture) as user2
    FROM public.conversations c
    JOIN chat_stats cs ON c.user1_id = cs.u1 AND c.user2_id = cs.u2
    JOIN public.users u1 ON c.user1_id = u1.id
    JOIN public.users u2 ON c.user2_id = u2.id
    ORDER BY cs.score DESC
    LIMIT 10;
END;
$$;
