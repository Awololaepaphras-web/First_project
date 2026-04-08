
-- Add reply_to and reply_to_content to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_content TEXT;

-- Add engagement tracking to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;

-- Trigger to update conversation engagement
CREATE OR REPLACE FUNCTION update_conversation_engagement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    message_count = message_count + 1,
    engagement_score = engagement_score + 10,
    last_message = COALESCE(NEW.content, 'Sent a ' || NEW.media_type),
    last_message_at = NEW.created_at
  WHERE id = (
    SELECT id FROM conversations 
    WHERE (user1_id = NEW.sender_id AND user2_id = NEW.receiver_id)
       OR (user1_id = NEW.receiver_id AND user2_id = NEW.sender_id)
    LIMIT 1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_engagement ON messages;
CREATE TRIGGER on_message_engagement
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_engagement();
