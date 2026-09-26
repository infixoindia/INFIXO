-- INFIXO SAFE DATABASE SETUP
-- Purpose:
-- 1) Keep public worker profiles readable through a controlled view only.
-- 2) Keep the base workers table inaccessible to the browser/anon role.
-- 3) Keep admin CRUD server-side (the code patch uses Supabase service role server-side).
-- 4) Do not delete existing worker data.

-- Remove any old broad public read policies on the base/private tables.
DROP POLICY IF EXISTS "public_read_workers" ON public.workers;
DROP POLICY IF EXISTS "public_read_worker_professional" ON public.worker_professional;
DROP POLICY IF EXISTS "public_read_worker_skills" ON public.worker_skills;
DROP POLICY IF EXISTS "public_read_worker_verification" ON public.worker_verification;
DROP POLICY IF EXISTS "public_read_worker_evidence" ON public.worker_evidence;
DROP POLICY IF EXISTS "public_read_worker_service_areas" ON public.worker_service_areas;
DROP POLICY IF EXISTS "public_read_worker_availability" ON public.worker_availability;

-- Browser roles must not directly read the base worker table.
REVOKE ALL ON TABLE public.workers FROM anon, authenticated;
REVOKE ALL ON TABLE public.worker_professional FROM anon, authenticated;
REVOKE ALL ON TABLE public.worker_skills FROM anon, authenticated;
REVOKE ALL ON TABLE public.worker_verification FROM anon, authenticated;
REVOKE ALL ON TABLE public.worker_evidence FROM anon, authenticated;
REVOKE ALL ON TABLE public.worker_service_areas FROM anon, authenticated;
REVOKE ALL ON TABLE public.worker_availability FROM anon, authenticated;
REVOKE ALL ON TABLE public.verification_documents FROM anon, authenticated;

-- Controlled public surface. Only fields required by the current public UI are exposed.
DROP VIEW IF EXISTS public.public_worker_profiles;

CREATE VIEW public.public_worker_profiles
WITH (security_barrier = true)
AS
SELECT
  w.id,
  w.slug,
  w.ipuc,
  w.worker_id,
  w.full_name,
  w.profession,
  w.experience,
  w.service_area,
  w.hero_slides,
  w.phone,
  w.primary_skill,
  w.services,
  w.working_hours,
  w.working_shift,
  w.why_choose_me,
  w.gender,
  w.age,
  w.address,
  w.languages,
  w.about,
  w.photos,
  w.videos,
  jsonb_build_object(
    'identityVerified', CASE WHEN lower(COALESCE(w.verifications->>'identityVerified', 'false')) = 'true' THEN true ELSE false END,
    'workVerified', CASE WHEN lower(COALESCE(w.verifications->>'workVerified', 'false')) = 'true' THEN true ELSE false END,
    'addressVerified', CASE WHEN lower(COALESCE(w.verifications->>'addressVerified', 'false')) = 'true' THEN true ELSE false END
  ) AS verifications
FROM public.workers AS w;

GRANT SELECT ON public.public_worker_profiles TO anon, authenticated;

-- Keep public master-data tables readable if the app needs them later.
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.cips TO anon, authenticated;

-- Published reviews may remain public; unpublished reviews are filtered by RLS.
GRANT SELECT ON public.reviews TO anon, authenticated;

-- IMPORTANT: no policy is created here that lets anon/authenticated INSERT,
-- UPDATE or DELETE workers. Admin CRUD is done by the server-side API in the patch.

-- Browser must not upload/update/delete Storage objects directly.
-- Public read of already-published worker-media files can remain enabled.
REVOKE INSERT, UPDATE, DELETE ON TABLE storage.objects FROM anon, authenticated;
