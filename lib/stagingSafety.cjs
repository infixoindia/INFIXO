// No credentials here. Shared build/runtime safety for isolated previews.
const STAGING_REF = 'vemezdbssynachculphi';
const STAGING_URL = `https://${STAGING_REF}.supabase.co`;
function stagingEnabled(env) {
  return env.VERCEL_ENV === 'preview' || env.VERCEL_GIT_COMMIT_REF === 'feat/diwali-integration-staging' || env.INFIXO_STAGING === '1' || env.NEXT_PUBLIC_INFIXO_STAGING === '1';
}
function assertStagingConfig(url, key, kind = 'public') {
  const fail = () => { throw new Error('Staging database configuration unavailable'); };
  if (typeof url !== 'string' || ![STAGING_URL, `${STAGING_URL}/`].includes(url)) fail();
  if (typeof key !== 'string' || key !== key.trim() || !key) fail();
  if (key.startsWith('eyJ')) {
    try {
      const claims = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (claims.ref !== STAGING_REF || claims.role !== (kind === 'public' ? 'anon' : 'service_role')) fail();
    } catch { fail(); }
  } else if (!(kind === 'public' ? /^sb_publishable_[A-Za-z0-9_-]+$/ : /^sb_secret_[A-Za-z0-9_-]+$/).test(key)) fail();
  // Opaque keys cannot be bound locally to a project; the pinned endpoint validates them.
}
module.exports = { STAGING_REF, STAGING_URL, stagingEnabled, assertStagingConfig };
