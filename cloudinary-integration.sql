-- ===============================================================
-- CLOUDINARY IMAGE INTEGRATION
-- ===============================================================

-- 1. Add image_url column to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Update create_post_v2 function to support the new column
-- This ensures points are deducted correctly even when uploading via Cloudinary
CREATE OR REPLACE FUNCTION public.create_post_v2(
    p_content TEXT, 
    p_media_url TEXT DEFAULT NULL, 
    p_media_type TEXT DEFAULT NULL, 
    p_image_url TEXT DEFAULT NULL, -- New field for Cloudinary integration
    p_parent_id UUID DEFAULT NULL,
    p_is_parallel BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_user_name TEXT;
    v_user_nickname TEXT;
    v_user_avatar TEXT;
    v_user_uni TEXT;
    v_post_id UUID;
    v_deduction_result JSONB;
    v_target_uni TEXT;
BEGIN
    -- 1. Get user info
    SELECT name, nickname, profile_picture, university 
    INTO v_user_name, v_user_nickname, v_user_avatar, v_user_uni
    FROM public.users WHERE id = v_user_id;

    -- 2. Deduct points (30 for post/reply)
    v_deduction_result := public.deduct_points_secure(30);
    
    IF NOT (v_deduction_result->>'success')::BOOLEAN THEN
        RETURN v_deduction_result;
    END IF;

    -- 3. Determine target university
    IF p_is_parallel THEN
        v_target_uni := NULL;
    ELSE
        v_target_uni := v_user_uni;
    END IF;

    -- 4. Create post
    INSERT INTO public.posts (
        user_id, user_name, user_nickname, user_avatar, user_university, university,
        content, media_url, media_type, image_url, parent_id, status, visibility, created_at
    ) VALUES (
        v_user_id, v_user_name, v_user_nickname, v_user_avatar, v_user_uni, v_target_uni,
        p_content, p_media_url, p_media_type, p_image_url, p_parent_id, 'approved', 'public', (extract(epoch from now()) * 1000)::bigint
    ) RETURNING id INTO v_post_id;

    RETURN jsonb_build_object('success', true, 'post_id', v_post_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
