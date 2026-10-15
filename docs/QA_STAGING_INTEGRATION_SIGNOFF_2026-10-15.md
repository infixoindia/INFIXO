# INFIXO — Staging Integration QA Sign-Off
Date: 2026-10-15

## Environment boundaries

- GitHub: `infixoindia/INFIXO`
- Feature branch: `feat/diwali-integration-staging`
- Draft PR: #1, **unmerged**
- Testing DB: INFIXO-STAGING / `vemezdbssynachculphi`
- Production DB: SIGMA / `xyplrbzyqershqngrjwo`

## Completed checks

1. User manually opened Vercel Preview on Android Chrome. Reported
   `/admin/workers`, `/admin/map`, and `/admin/leads`
   working correctly on the earlier staging deployment.
2. Assistant deployed staging commit `b83e7d761240a5f48c503bb52fc294eb7c21fb65`
   to a READY Vercel Preview. User registered a QA Painter through `/join`.
3. User successfully saw the matching profile selector and saved
   the test lead at status `Contacted`.
4. Read-only DB inspection verified **one** synthetic worker,
   **one** matching synthetic lead with the correct linked worker UUID,
   `Contacted` status, and `approved_at IS NULL`.
5. Using an exact, guarded, transactional migration on INFIXO-STAGING,
   removed only those **two synthetic QA records**.
   Follow-up independent DB queries verified
   `workers=0`, `acquisition_leads=0`,
   `acquisition_followups=0`, `public_worker_profiles=0`, and
   worker-media files `=0`.
6. SIGMA remained **one existing worker**, **one public active profile**,
   and **21 existing worker-media objects**; no production worker/media
   records were touched.
7. Database-level synthetic onboarding tests (BEGIN/ROLLBACK) previously
   verified the `Approved / Onboarded` count requires an active linked
   profile. Plan media caps and inactive worker exclusion passed.
8. Admin list copy now distinguishes saved Worker Profiles from
   acquisition Pending Leads / Completed Onboarding.
   List API errors are shown as errors, never mistaken for 0 workers.
9. Admin Leads text clarifies real-worker manual approval and payments.

## Important product semantics

- **Worker List**: displays saved worker profile records. It is not a
  synonym for lead/registrant count. A real legacy worker must remain visible
  even if not associated with the new acquisition campaign.
- **Pending Leads**: registrations not approved and linked to an active real
  worker profile; the list can also show previously approved leads that
  have lost their active worker link.
- **Completed Onboarding**: only `Approved / Onboarded` registration records
  correctly linked to active, valid profiles; human verification is mandatory.
- Test/dummy profiles are **not** real workers. Don't mark them approved.

## Outstanding before final go-live

- Run newest Preview build after the list/lead UI text changes; confirm
  mobile Workers page (currently expected 0), Map, Leads, login, Join.
- Record production deployment secrets only in Vercel (never repository).
  Production `INFIXO_ADMIN_PASSWORD` and `INFIXO_ADMIN_SECRET` were
  rotated in Vercel but will not affect current Production until a **new
  Production build/redeploy** occurs.
- Confirm Vercel Production environment variables target SIGMA; Preview
  must remain pinned exclusively to INFIXO-STAGING.
- Production SIGMA `acquisition_leads` schema has **not** been installed;
  migration `20261011183634_worker_acquisition.sql` only passed a
  BEGIN/ROLLBACK dry-run against SIGMA.
- Need explicit go-live approval, safe rollback plan, schema migration,
  promotion/merge, production smoke tests. Keep Draft PR #1 unmerged.
