
-- ===============================================================
-- FOLLOWER NOTIFICATIONS
-- ===============================================================

-- Function to notify followers when a user posts
CREATE OR REPLACE FUNCTION public.notify_followers_on_post()
RETURNS TRIGGER AS $$
DECLARE
  author_name TEXT;
BEGIN
  -- Get author name
  SELECT name INTO author_name FROM public.users WHERE id = NEW.user_id;

  -- Insert notifications for all followers
  -- We use a subquery to get the followers array and unnest it
  INSERT INTO public.notifications (user_id, title, message, type, data)
  SELECT 
    f_id,
    'New Intel from ' || author_name,
    CASE 
      WHEN NEW.parent_id IS NULL THEN author_name || ' just posted new intel.'
      ELSE author_name || ' just replied to a node.'
    END,
    'info',
    jsonb_build_object(
      'postId', NEW.id,
      'authorId', NEW.user_id,
      'type', CASE WHEN NEW.parent_id IS NULL THEN 'new_post' ELSE 'new_reply' END
    )
  FROM unnest((SELECT followers FROM public.users WHERE id = NEW.user_id)) AS f_id
  WHERE f_id IS NOT NULL AND f_id != NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on posts table
DROP TRIGGER IF EXISTS on_post_created_notification ON public.posts;
CREATE TRIGGER on_post_created_notification
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.notify_followers_on_post();
