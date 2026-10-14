import { createClient as sdkCreateClient } from '@supabase/supabase-js';
import safety from './stagingSafety.cjs';
export function createClient(url, key, options) {
  const staging = process.env.NEXT_PUBLIC_INFIXO_STAGING === '1' || safety.stagingEnabled({
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
    INFIXO_STAGING: process.env.INFIXO_STAGING,
  });
  if (staging) {
    // Validate the raw configuration too: legacy URL fallbacks must never rescue it.
    const kind = options?.auth?.persistSession === false ? 'server' : 'public';
    safety.assertStagingConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, key, kind);
    safety.assertStagingConfig(url, key, kind);
  }
  return sdkCreateClient(url, key, options);
}
