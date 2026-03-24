
/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fstrrwcyyjmdqrmycrml.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzdHJyd2N5eWptZHFybXljcm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTI1MjEsImV4cCI6MjA4OTc4ODUyMX0._uIEU9PNCO_2zm6wAUnwtG7BszynNKLopndnnBC0Ezo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
