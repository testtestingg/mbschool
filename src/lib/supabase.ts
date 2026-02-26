// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The "export" here is required so ArchiveBac can use it!
export const supabase = createClient(supabaseUrl, supabaseKey);