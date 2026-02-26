// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_CALENDAR_SUPABASE_URL || 'https://yygjaphftialpvwocnzi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_CALENDAR_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Z2phcGhmdGlhbHB2d29jbnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDM1NzMsImV4cCI6MjA3MjQ3OTU3M30.cel7Z-iC50ESr9QpRLbxMXhbmzBYaCdKv_3e21K4Q_g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);