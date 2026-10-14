# INFIXO Diwali worker acquisition — review and installation

Base: `infixoindia/INFIXO`, commit `c93b469b607679c753e32519e471f5712d68983b`.
Local branch: `feat/diwali-worker-acquisition`.
Prepared 12 October 2026 (IST). No production changes, database writes, real-worker messages, paid services or deployments were made.

## What is implemented

- `/join`: official existing logo, Hindi/Hinglish mobile-first design, existing WorkerIdentityCard preview, clearly fictional demo modal, plans, benefits, steps, FAQ and sticky mobile CTA.
- Plan-first form: FREE, PRO, Not Decided; required fields, consent, optional questions, honeypot, signed short-lived form token, double-click lock, server validation.
- Price: FREE ₹0; PRO ₹199 one-time. PRO includes four edit requests each month, without a fixed 12-month expiry or monthly editing fee. Essential privacy/contact corrections remain possible for both.
- No invented ₹99/₹499 reference prices. No payment, job/lead/income promise, live AI/discovery or availability tool.
- Fixed end: `2026-11-09T00:00:00+05:30` exclusive, equivalent to `2026-11-08T18:30:00Z`. The entire November 8 day is included. Countdown uses server time. After expiry the offer and ₹199 plan CTA are replaced by an information request; the server rejects new PRO campaign submissions. FREE remains available. Configuration: `lib/acquisition/config.mjs`.
- Five category goals 89 / 89 / 89 / 87 / 77. Public section deliberately shows goals, not unverified zero/live counts. `TargetProgress` accepts genuine numeric counts later. No public total counter.
- New lead, follow-up and rate-limit tables; RLS enabled, no anonymous/authenticated grants or policies. Server service-role access only. Raw lead information never returned by public endpoints.
- Durable, atomic limit: eight submissions/hour per keyed network hash. Raw IP is not stored. Vercel's trusted forwarding header is used; other environments share a preview bucket and must configure trusted ingress before serving public traffic. This is basic anti-spam, not bot-proof CAPTCHA or phone ownership verification.
- Unique normalized phone; duplicates get the same success response to prevent enumeration and never overwrite a lead. New questions on duplicate submissions are preserved as private follow-ups; identical repeated questions are deduplicated. Staff must verify the requester before taking privacy actions.
- `/admin/leads`: existing admin session plus handler authorization, all requested statuses, category/plan/area/source/status/date filters, pagination, optimistic conflict detection and genuine onboarding counts.
- Approval requires explicit founder confirmation and an active linked worker UUID. Counts exclude inactive/deleted profiles and unapproved leads. One worker can link to only one lead. No automatic profile creation, approval, payment or customer launch.
- Media limits checked at approval and by SQL triggers for linked acquisition profiles, including later media updates and plan downgrades. Existing unlinked profiles remain unaffected. Editing-request quotas are an operational entitlement, not an automated monthly billing or request-ticket system in this release.
- Optional hex_id FK is prepared; no guessed location assignment or unvalidated public hex input.
- `/join/privacy`: working acquisition-specific policy. Contact/correction requests can be submitted through the question path, including duplicate-phone follow-ups.
- Admin worker list has one added navigation link. Public worker pages/components, homepage, shared styling and middleware were not edited.

## Integration status — 12 October 2026

The original ZIP payload was verified against all 17 manifest hashes. Current GitHub main matched its baseline commit; no newer-file conflicts were found. The implementation exists on a local feature branch. GitHub writes failed with an integration-permission error; no remote feature branch or pull request was created.

Two review-only changes were added beyond the ZIP: tracked `.env.local` is removed from this branch (no environment values are included), and `vercel.json` disables automatic deployment for `feat/diwali-worker-acquisition`. The existing `.gitignore` already ignores environment files. Production settings, active credentials and Git history are untouched. The branch must not be merged until the deployment/security prerequisites below are completed.

A read-only check found no isolated hosted Supabase database: only the production project/main branch was available. The migration was tested locally in isolated PGlite, not applied to hosted production. Vercel environment/deployment inspection was blocked by team-scope authorization; browser fallback reached sign-in and no CLI session was available. Therefore no Vercel preview was deployed and no phone/browser QA is claimed. A separate private static visual review was prepared with the existing UI and a local-only form adapter; it does not connect to Supabase or test hosted lead storage.

Before enabling the branch preview, configure a genuinely isolated database and preview-only secrets, verify all environment targets, and remove this branch's deployment-disable rule only after that verification. Existing production security remediation needs founder approval and is documented privately in the implementation handoff; do not rotate credentials or alter existing production RLS as part of installing this feature.

Public profile reads use the existing `public_worker_profiles` view; the feature does not alter that view or the profile UI.

## Safe apply in Codespaces

The download includes changed/new files only, an installer with baseline hash checks and a change manifest. It contains no `.env`, node_modules or worker/customer data.

From the repository root, upload the ZIP and run:

```bash
git status --short
git switch -c feat/diwali-worker-acquisition
unzip INFIXO_Diwali_Join_Implementation.zip -d /tmp/infixo-join
python /tmp/infixo-join/INFIXO_Diwali_Join/APPLY.py --repo "$PWD"
git diff --stat
git diff -- app/admin/workers/page.js
git status --short
npm ci
node --test tests/acquisition.test.mjs
npm run build
```

Start with a clean worktree. If the branch already exists, use another new name. The installer refuses to overwrite changed baseline files. It also refuses to overwrite different contents at new paths. Resolve such conflicts by reviewing the diff against your current repository; do not force-copy blindly.

The ZIP itself is not source code: remove it from the repository after successful extraction/apply and before committing. Use `git add` with the paths below; never stage `.env.local`.

```bash
git add app/join app/admin/leads app/admin/workers/page.js app/api/join app/api/admin/leads lib/acquisition supabase/migrations/20261011183634_worker_acquisition.sql tests/acquisition.test.mjs tests/acquisition-db.mjs tests/acquisition-api.mjs docs/DIWALI_JOIN_REVIEW.md
git commit -m "Add isolated Diwali worker acquisition flow"
```

Review repository deployment settings before pushing a branch: Vercel may build branch previews. Do not merge or promote to production until explicitly approved. This branch is prepared locally; upstream GitHub write authorization is still required. Automatic deployment is deliberately disabled until preview resource isolation is verified.

## Database and environment — isolated preview first

Do not run all historical migrations blindly: the live schema differs from the old SQL snapshots.

1. Use an existing isolated Supabase test project/database with the inspected base schema. A new paid branch is not required or activated by this delivery.
2. Review and apply **only** `supabase/migrations/20261011183634_worker_acquisition.sql` there.
3. Set these **server** environment variables for preview:
   - `NEXT_PUBLIC_SUPABASE_URL`: preview database URL (the existing public client also uses it).
   - `SUPABASE_SERVICE_ROLE_KEY`: preview service-role key; never a NEXT_PUBLIC variable.
   - `INFIXO_ADMIN_SECRET`: a fresh private admin secret.
   - `INFIXO_LEAD_SIGNING_SECRET`: new random secret of at least 32 characters; e.g. generate using a password manager. Never commit it.
   Existing public worker features also use the preview `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run the app locally in Codespaces or an explicitly approved preview environment.
5. Test only synthetic workers. Apply the production migration/environment and deploy only after founder approval.

If configuration/migration is missing, submission fails with a retry message; it never shows a fake successful lead. Missing public progress is not converted into a fabricated live count.

Rollback before collecting real leads: revert the feature commit. The new private tables can remain inaccessible to public roles. A destructive database rollback is deliberately not auto-run. Dropping the new functions/tables requires dropping the two media triggers first; preserve/export any real lead records before removing storage.

## Test results and limits

Passed:

- Next.js production build; routes compile. Existing middleware deprecation warning is unchanged.
- 8 unit-test groups: category values; IST boundary; every plan; post-expiry behavior; Indian phone normalization; required fields/consent/enums; UTM/referral sanitation; profile media limits.
- 8 isolated PostgreSQL test groups (PGlite): migration execution; private grants/RLS; lead insert and duplicates; Hindi follow-up storage; atomic rate limits; linked media enforcement and contact corrections; PRO/downgrade/progress/deletion behavior; all private-table RLS flags.
- 6 API-handler test groups with mocked Supabase transport: actual handlers and crypto validation, bad origin/token/honeypot/body/consent/phone, all plan submissions and attribution, duplicate privacy, 429/503, admin access/read/update/conflicts, server-side expiry.
- Public regression scope: no files under `app/w`, `app/components`, `app/styles`, homepage or existing profile API routes modified. Build includes all existing public routes.

Not verified here:

- Browser/mobile visual inspection, actual Android touch behavior, all UI clicks, screenshots and end-to-end browser → hosted Supabase. Supported browser QA was unavailable in this environment, so these are not claimed as passed.
- No production migration or synthetic production onboarding records were created.

For repeatable database/API tests, temporary development-only dependencies (not app dependencies):

```bash
npm install --prefix /tmp/infixo-acquisition-tests --no-package-lock @electric-sql/pglite@0.3.14 esbuild@0.25.12
node tests/acquisition-db.mjs
node tests/acquisition-api.mjs
```

Preview acceptance checklist: 360px/390px/768px/desktop; all three plan selections and change-plan path; required fields and consent; success/error/retry; double-click and duplicate phone; duplicate question in admin; all filters/pagination/status changes; anonymous admin denial; plan limits; worker profile regression; expiration with controlled test clock. Delete synthetic preview data afterward.

## Referral entry points later

Working join URLs now:

- `/join?utm_source=whatsapp&utm_medium=manual&utm_campaign=diwali_2026&ref=WORKER_CODE`
- `/join?utm_source=worker_profile&utm_medium=referral&utm_campaign=diwali_2026&ref=WORKER_CODE`
- `/join?utm_source=facebook&utm_medium=paid_social&utm_campaign=diwali_2026`

The referral code is attribution only, not validated identity or reward eligibility. Current URL attribution takes precedence; it persists through the form and same-tab navigation with sessionStorage. No extra personal data is stored in browser storage.

After separate approval, add a small “Apni INFIXO profile banwayein” link in an existing worker sharing/QR surface, carrying that worker's referral code. No worker-profile referral entry point was added now. No automatic customer launch is tied to target completion. February 2027 remains a future readiness/founder decision, not a current product promise.

## Hindi mobile redesign — 12 October 2026

The existing feature now uses a compact hero, offer, native mobile plan carousel, Hindi form, category goals and three essential FAQs. The oversized benefit/how-it-works sections were removed. The form hides the bottom CTA while visible. Its displayed Hindi options map to the unchanged stored enum values; acquisition/admin contracts remain compatible. The question field appears for the question reason. Public error strings are Hindi, and transport failures never expose technical details.

The demo uses an original SVG illustration created for INFIXO, explicitly labeled fictional. No existing public worker-profile components or routes were changed.

Reference-price claims remain disabled in the real feature until documented evidence is supplied through the verified reference-price configuration. The owner-private preview shows ₹99 and ₹499 crossed out with the visible label “प्रस्तावित संदर्भ मूल्य — पुष्टि बाकी है”. These are review proposals, not asserted historical sales prices. Both crossed-out prices disappear after expiry. The same fixed IST deadline is retained.

The private Site keeps its existing identity and receives the same source plus a preview-only transport adapter. Its local form result explicitly says nothing was saved or sent. It contains no Supabase connection or admin backend. It is not a production lead-storage test.

Verification: 10 acquisition unit tests; component interaction tests for all plan paths, Hindi validation, conditional question, attribution and truthful preview success; API and isolated PGlite regressions; Next.js production build. Native horizontal scroll-snap and equal-height CSS were checked structurally. Actual Android rendering/swiping was not exercised: the required control-browser capability is unavailable in this managed environment. Review the published private Site on a phone before approval.

## V3 completion — 12 October 2026

- One centralized English/Hinglish/Hindi dictionary; default Hinglish. Language changes immediately, retains controlled form fields/consent/plan, and is remembered in localStorage and the current URL. URL language is carried into demo and privacy links.
- Main CTAs go directly to #apply. The form always renders. Plan radio cards live inside it, default to Not Decided, and preserve existing enum IDs. Pricing cards are comparison-only, with mobile scroll-snap.
- Validated preferred_language is stored under the existing attribution JSON object; no migration changes are required. The admin displays this metadata and separates the contractor working-model value for manual eligibility review. Helpers-based workers remain a separate hands-on category.
- /demo/worker and four detail routes reuse the approved profile component source and original CSS through reproducible demo-only localized adapters. Run scripts/generate-demo-components.py to regenerate. Original component hashes are recorded and tested; public components/routes are byte-for-byte unchanged. The demo has two identity images, six original portfolio illustrations and two original silent H.264 sample clips. No real worker or phone number is used; contact testing only shows a message.
- Existing countdown, targets, plan/media limits, consent, UTM/referral handling and private lead APIs remain. Unverified reference prices are still labeled proposals in the owner-private review and disabled publicly.

Executed verification: 11 unit tests; V3 React component interactions covering three languages, reload preference, preserved inputs, direct CTAs, all plan radios, question enquiry, helpers model, identity slide selection/swipe/full-view, photo viewer, video viewer/source, safe contact feedback and back links; API regression suite; isolated PGlite database suite; Next.js production build; static review build and route/media isolation checks; ffprobe verifies both 6-second H.264 files. Original /w routes, worker components/styles, homepage and workerService diff against baseline is empty. React test-renderer emits a deprecation warning; tests still pass. Existing Next middleware deprecation warning remains.

Limit: these are component/handler and file tests. Actual Android viewport rendering, native scroll/swipe and in-browser video playback were not run because the managed control-browser capability is unavailable. The user's recording was inspected, but it depicts V2, not a V3 browser test. No hosted database migration, production deployment, main merge or paid-resource action occurred. Preview submissions remain local-only and explicitly say they were not saved or sent.
