import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyplrbzyqershqngrjwo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cGxyYnp5cWVyc2hxbmdyandvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Nzg1NjEsImV4cCI6MjA5ODU1NDU2MX0.Li8SKGWV45f3iJTx73pQqthwL1zzcS3aA7LLzjUg9Qg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
