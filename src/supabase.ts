// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This ensures we only create ONE client for the whole app
export const supabase = createClient(supabaseUrl, supabaseKey);