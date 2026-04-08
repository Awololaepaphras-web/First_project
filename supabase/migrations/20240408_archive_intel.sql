
-- Student Past Questions Table
CREATE TABLE IF NOT EXISTS public.student_past_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id TEXT NOT NULL,
    course_code TEXT NOT NULL,
    course_title TEXT NOT NULL,
    year INTEGER,
    semester TEXT,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    intel_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Archived Past Questions Table
CREATE TABLE IF NOT EXISTS public.archived_past_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_id UUID,
    university_id TEXT,
    course_code TEXT,
    course_title TEXT,
    year INTEGER,
    semester TEXT,
    file_url TEXT,
    uploaded_by UUID,
    archived_by UUID REFERENCES public.users(id),
    archive_reason TEXT,
    intel_summary JSONB,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Archive Intel Table
CREATE TABLE IF NOT EXISTS public.archive_intel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID,
    action TEXT, -- 'archived', 'restored', 'viewed_archive'
    performed_by UUID REFERENCES public.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to handle archiving
CREATE OR REPLACE FUNCTION public.archive_past_question()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'archived' AND OLD.status != 'archived') THEN
        INSERT INTO public.archived_past_questions (
            original_id, university_id, course_code, course_title, year, semester, file_url, uploaded_by, archive_reason, intel_summary
        ) VALUES (
            OLD.id, OLD.university_id, OLD.course_code, OLD.course_title, OLD.year, OLD.semester, OLD.file_url, OLD.uploaded_by, 'Status changed to archived', OLD.intel_data
        );
        
        INSERT INTO public.archive_intel (question_id, action, performed_by, metadata)
        VALUES (OLD.id, 'archived', auth.uid(), jsonb_build_object('original_status', OLD.status));
        
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_past_question_archived ON public.student_past_questions;
CREATE TRIGGER on_past_question_archived
    AFTER UPDATE ON public.student_past_questions
    FOR EACH ROW EXECUTE FUNCTION public.archive_past_question();

-- Enable Realtime for new tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
    
    ALTER PUBLICATION supabase_realtime ADD TABLE public.student_past_questions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.archived_past_questions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.archive_intel;
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- RLS Policies
ALTER TABLE public.student_past_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_past_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_intel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone" ON public.student_past_questions FOR SELECT USING (true);
CREATE POLICY "Users can upload questions" ON public.student_past_questions FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Admins can manage questions" ON public.student_past_questions FOR ALL USING (is_admin());

CREATE POLICY "Archive is viewable by admins" ON public.archived_past_questions FOR SELECT USING (is_admin());
CREATE POLICY "Intel is viewable by admins" ON public.archive_intel FOR SELECT USING (is_admin());
