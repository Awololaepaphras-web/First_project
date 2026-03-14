
/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bbiicdibegslljckntjf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWljZGliZWdzbGxqY2tudGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNTgyMzAsImV4cCI6MjA4ODgzNDIzMH0.3yka3_2AcgXYbHpYZD3Al3yk6Tdc3BKdYrPNY_A5ODM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
