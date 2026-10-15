const { stagingEnabled, assertStagingConfig } = require('./lib/stagingSafety.cjs');
const staging = stagingEnabled(process.env);
if (staging) assertStagingConfig(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
module.exports = {
  env: { NEXT_PUBLIC_INFIXO_STAGING: staging ? '1' : '0' },
};
