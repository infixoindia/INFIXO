-- INFIXO SIGMA: convert public_worker_profiles into a SECURITY INVOKER view
-- backed by an intentionally narrow, schema-qualified, SECURITY DEFINER
-- function that returns ONLY already-published worker profile fields.
-- It retains the exact existing 23-column view contract and is_active filter.
-- It NEVER grants anon/authenticated SELECT on the private public.workers table.
-- Tested against a synthetic staging database and production BEGIN/ROLLBACK,
-- including an anon direct-base-table denial and old/new public-row equivalence.
-- The infixo_private schema must not be in PostgREST exposed schemas.
BEGIN;
CREATE SCHEMA infixo_private;
REVOKE ALL ON SCHEMA infixo_private FROM PUBLIC;
GRANT USAGE ON SCHEMA infixo_private TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA infixo_private REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
CREATE FUNCTION infixo_private.published_worker_profiles()
RETURNS TABLE (
  id uuid,
  slug text,
  ipuc text,
  worker_id text,
  full_name text,
  profession text,
  experience text,
  service_area jsonb,
  hero_slides jsonb,
  phone text,
  primary_skill text,
  services jsonb,
  working_hours text,
  working_shift jsonb,
  why_choose_me jsonb,
  gender text,
  age text,
  address text,
  languages jsonb,
  about jsonb,
  photos jsonb,
  videos jsonb,
  verifications jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog
AS $fn$
  SELECT w.id,
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
       'identityVerified', CASE WHEN lower(COALESCE(w.verifications->>'identityVerified','false'))='true' THEN true ELSE false END,
       'workVerified', CASE WHEN lower(COALESCE(w.verifications->>'workVerified','false'))='true' THEN true ELSE false END,
       'addressVerified', CASE WHEN lower(COALESCE(w.verifications->>'addressVerified','false'))='true' THEN true ELSE false END
    ) AS verifications
  FROM public.workers AS w
  WHERE COALESCE(w.is_active,true)=true
$fn$;
REVOKE ALL ON FUNCTION infixo_private.published_worker_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION infixo_private.published_worker_profiles() TO anon,authenticated,service_role;
CREATE OR REPLACE VIEW public.public_worker_profiles
WITH (security_barrier=true,security_invoker=true)
AS SELECT * FROM infixo_private.published_worker_profiles();
GRANT SELECT ON public.public_worker_profiles TO anon,authenticated,service_role;
COMMIT;
