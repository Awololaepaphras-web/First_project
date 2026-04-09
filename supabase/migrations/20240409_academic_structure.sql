
-- 1. Create University Colleges Table
CREATE TABLE IF NOT EXISTS public.university_colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id TEXT NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(university_id, name)
);

-- 2. Create College Departments Table
CREATE TABLE IF NOT EXISTS public.college_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.university_colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(college_id, name)
);

-- 3. Enable RLS
ALTER TABLE public.university_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_departments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Colleges are viewable by everyone" ON public.university_colleges FOR SELECT USING (true);
CREATE POLICY "Admins can manage colleges" ON public.university_colleges FOR ALL USING (is_admin());

CREATE POLICY "Departments are viewable by everyone" ON public.college_departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON public.college_departments FOR ALL USING (is_admin());

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.university_colleges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.college_departments;

-- 6. Initial Data (Seed from constants)
-- FUNAAB Colleges
INSERT INTO public.university_colleges (university_id, name) VALUES 
('funaab', 'COLAMATS'),
('funaab', 'COLANIM'),
('funaab', 'COLPLANT'),
('funaab', 'COLERM'),
('funaab', 'COLVET'),
('funaab', 'COLFHEC'),
('funaab', 'COLPHYS'),
('funaab', 'COLBIOS'),
('funaab', 'COLENG'),
('funaab', 'COLMAS')
ON CONFLICT DO NOTHING;

-- UI Colleges
INSERT INTO public.university_colleges (university_id, name) VALUES 
('ui', 'Arts'),
('ui', 'Science'),
('ui', 'Basic Medical Sciences'),
('ui', 'Clinical Sciences'),
('ui', 'Public Health'),
('ui', 'Pharmacy'),
('ui', 'Law'),
('ui', 'Agriculture'),
('ui', 'The Social Sciences'),
('ui', 'Education'),
('ui', 'Technology'),
('ui', 'Veterinary Medicine')
ON CONFLICT DO NOTHING;

-- UNILAG Colleges
INSERT INTO public.university_colleges (university_id, name) VALUES 
('unilag', 'Arts'),
('unilag', 'Social Sciences'),
('unilag', 'Business Administration'),
('unilag', 'Law'),
('unilag', 'Science'),
('unilag', 'Engineering'),
('unilag', 'Environmental Sciences'),
('unilag', 'Education'),
('unilag', 'College of Medicine')
ON CONFLICT DO NOTHING;

-- OAU Colleges
INSERT INTO public.university_colleges (university_id, name) VALUES 
('oau', 'Agriculture'),
('oau', 'Arts'),
('oau', 'Education'),
('oau', 'Engineering'),
('oau', 'Environmental Design and Management'),
('oau', 'Law'),
('oau', 'Pharmacy'),
('oau', 'Health Sciences'),
('oau', 'Science'),
('oau', 'Social Sciences'),
('oau', 'Technology')
ON CONFLICT DO NOTHING;

-- Seed Departments for FUNAAB COLPHYS
DO $$
DECLARE
    v_college_id UUID;
BEGIN
    SELECT id INTO v_college_id FROM public.university_colleges WHERE university_id = 'funaab' AND name = 'COLPHYS';
    IF v_college_id IS NOT NULL THEN
        INSERT INTO public.college_departments (college_id, name) VALUES 
        (v_college_id, 'Chemistry'),
        (v_college_id, 'Mathematics'),
        (v_college_id, 'Physics'),
        (v_college_id, 'Statistics'),
        (v_college_id, 'Computer Science')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
