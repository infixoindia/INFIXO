# INFIXO — production rollout gates (2026-10-15)

**STATUS: NOT APPROVED FOR PRODUCTION DEPLOYMENT OR MERGE**

Repository: `infixoindia/INFIXO`
Draft PR: #1, feature branch `feat/diwali-integration-staging`
Production: Vercel `infixo`, Supabase SIGMA (`xyplrbzyqershqngrjwo`).
Isolated preview: Supabase INFIXO-STAGING (`vemezdbssynachculphi`).

## Verified as of 2026-10-15

- SIGMA security: legacy public-write RLS and Storage permissions hardened;
  two **empty** legacy metadata tables removed; legacy `worker_profile` preserved;
  published worker view now security-invoker, backed by a narrow helper.
- SIGMA still has its real `workers` data and original `worker-media` files.
- `public.public_worker_profiles` returns published workers while raw `workers`
  remains inaccessible to anonymous callers.
- Database function search-path advisories were remediated.
- INFIXO-STAGING has a production-compatible **worker profile schema** (without
  copying real worker data), Admin Map support, private/public worker view,
  and a media bucket. Its setup SQL is at
  `supabase/staging/20261015_worker_profile_compatibility.sql`.
- The above staging-only SQL is **not** in `supabase/migrations`. **NEVER run it
  on SIGMA**; it has a guard that refuses production's full worker schema.
- Synthetic staging worker + lead + approval + completed progress + media cap
  + inactive-worker exclusion + service-role paths tested within ROLLBACK
  transactions, leaving the database clean.
- The acquisition migration
  `supabase/migrations/20261011183634_worker_acquisition.sql` was executed
  against SIGMA as a **BEGIN/ROLLBACK dry run** and completed successfully.
  **The acquisition migration has NOT been applied to SIGMA permanently.**
- `supabase/schema.sql` and `supabase/SAFE_SETUP.sql` were retired so they
  cannot accidentally restore older insecure policies.

## Stop-ship gates — must complete BEFORE merge and production deploy

1. **Credential rotation:** `.env.local` containing the old
   `INFIXO_ADMIN_PASSWORD` and `INFIXO_ADMIN_SECRET` remains in `main`
   and repository history; the feature branch removes it. Treat both old
   production values as compromised. Rotate both in Vercel **Production**
   environment, invalidate old sessions, and verify correct new login.
   Never print, commit, paste or include secret values in reports.
   Verify exposed secrets across history before deciding if further
   rotation is needed. Rotating credentials alone does not erase Git history.
2. **Vercel access:** Current connected Vercel integration returned 403 for
   `sigmaoo7`. Authorized owner needs to re-authorize that scope, or manually
   verify the environment configuration and deployments. No team access
   should be assumed.
3. **Production environment keys:** Server-only `SUPABASE_SERVICE_ROLE_KEY`,
   `INFIXO_ADMIN_PASSWORD`, `INFIXO_ADMIN_SECRET`,
   `INFIXO_LEAD_SIGNING_SECRET` (strong independently generated value).
   Public `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` must point to **SIGMA**. Production must
   **NOT** set `INFIXO_STAGING=1` nor
   `NEXT_PUBLIC_INFIXO_STAGING=1`. Preview branch variables must remain
   pinned to INFIXO-STAGING, never SIGMA.
4. **Preview browser regression:** Reconfirm Workers List (now staging
   workers should be empty, not 500/error), Add Worker, Profile Editor,
   admin Map, Join Page, Admin Leads Pending/Completed, and protected login.
   On staging only, create **synthetic** data and clean it afterward.
   Confirm public profile's `/w/[slug]` and uploaded media work.
   Never reuse production phone numbers or copy live PII.
5. **Production migration plan:** Verify the existing SIGMA worker schema
   again, ensure a safe restore/rollback route, then apply the **acquisition
   migration only**, exactly once, through the database migration interface.
   Do not run the entire migrations folder or staging bootstrap.
   Verify acquisition tables/functions/triggers exist, with no lead rows,
   while all real worker profiles remain unchanged.
6. **Separate go-live approval:** Only after #1–5 and an explicit final
   approval, merge Draft PR #1 into `main` and deploy the production build.
   Do not create an automatic deploy from an unchecked build.
7. **Hosted production smoke test:** Admin sign-in, Workers List, Map,
   existing public worker profile/media; `/join` form; new lead appears in
   `/admin/leads`; privacy/status/plan behavior. Use authorized synthetic
   entries and remove them. Monitor error logs and prepare fast rollback.

## Why the original worker wasn't in Preview

SIGMA has the original worker(s). INFIXO-STAGING intentionally has **no
copied production worker data**. Database separation is deliberate, not a
UI merge failure. The staged Admin List already links to Admin Map and
Worker Acquisition Leads. Once separately approved acquisition SQL, PR merge,
and production config are complete, the original `/admin/workers` route
will lead to a unified Admin experience against SIGMA.

## Unresolved caveats

- The Supabase advisor's remaining `rls_enabled_no_policy` entries are INFO
  (private tables intentionally lack public policies). Review if an API
  dependency demands a narrow policy; do not add `USING (true)` to make
  linter INFO go away.
- Staging DB SQL tests passing do not replace hosted browser tests.
- The connected Vercel scope is unauthorized at audit time; no Preview/Production
  environment values or deployment SHAs were freshly verified by connector.
