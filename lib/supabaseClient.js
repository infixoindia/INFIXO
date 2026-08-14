import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyplrbzyqershqngrjwo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cGxyYnp5cWVyc2hxbmdyandvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5Nzg1NjEsImV4cCI6MjA5ODU1NDU2MX0.Li8SKGWV45f3iJTx73pQqthwL1zzcS3aA7LLzjUg9Qg';

// Ensures build time safety if environment variable is an empty string
const validUrl = supabaseUrl && supabaseUrl.startsWith('http') 
  ? supabaseUrl 
  : 'https://xyplrbzyqershqngrjwo.supabase.co';

// IMPORTANT: Next.js patches the global `fetch` in Server Components and
// caches GET requests by default (its "Data Cache"). Supabase-js uses
// fetch internally, so without this override, worker data fetched on the
// server (e.g. on /w/[slug] pages) can get stuck showing stale/old data
// even after Supabase itself has fresh data. Forcing `cache: "no-store"`
// on every Supabase request guarantees the public profile and admin
// panel always reflect the latest saved data.
export const supabase = createClient(validUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => fetch(url, { ...options, cache: "no-store" }),
  },
});
