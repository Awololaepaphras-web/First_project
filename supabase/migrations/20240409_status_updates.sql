
-- Update statuses table to match exact requirements
ALTER TABLE public.statuses ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.statuses RENAME COLUMN url TO image_url;

-- Ensure expires_at is set to 24 hours from creation if not provided
ALTER TABLE public.statuses ALTER COLUMN expires_at SET DEFAULT (NOW() + INTERVAL '24 hours');

-- Add trigger to handle renewal logic if needed, or handle in app code.
-- The user wants: "can be renewed only once and 1 hour before the time tuns out"
-- We can enforce this in the app code or a function.

CREATE OR REPLACE FUNCTION public.renew_status(status_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    s_record RECORD;
BEGIN
    SELECT * INTO s_record FROM public.statuses WHERE id = status_id;
    
    -- Check if already renewed
    IF s_record.renewal_count >= 1 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if it's within 1 hour of expiry
    IF s_record.expires_at > (NOW() + INTERVAL '1 hour') THEN
        RETURN FALSE;
    END IF;
    
    -- Renew
    UPDATE public.statuses 
    SET expires_at = expires_at + INTERVAL '24 hours',
        renewal_count = renewal_count + 1
    WHERE id = status_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
