-- INFIXO-STAGING ONLY. Never execute against SIGMA production.
-- Makes the isolated acquisition-only staging schema compatible with the
-- existing Admin Workers, Map, public worker profiles, and worker-media APIs.
-- No production workers, personal data, passwords, or secrets are copied.
-- IMPORTANT: Stored at supabase/staging/ (NOT supabase/migrations/).
BEGIN;
DO $guard$
BEGIN
  IF to_regclass('public.acquisition_leads') IS NULL
    OR to_regclass('public.workers') IS NULL
    OR EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name='workers' AND column_name='slug')
  THEN RAISE EXCEPTION 'ABORT: expected isolated INFIXO-STAGING minimal worker schema, not production'; END IF;
  IF (SELECT count(*) FROM public.workers) <> 0
    OR (SELECT count(*) FROM public.acquisition_leads) <> 0
  THEN RAISE EXCEPTION 'ABORT: staging worker and leads data must be empty before compatibility upgrade'; END IF;
END $guard$;

CREATE FUNCTION public.generate_ipuc()
RETURNS text LANGUAGE plpgsql SET search_path = pg_catalog AS $fn$
BEGIN
 RETURN 'IPUC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''),1,8));
END $fn$;

CREATE FUNCTION public.generate_worker_id()
RETURNS text LANGUAGE plpgsql SET search_path = pg_catalog AS $fn$
DECLARE alphabet text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 candidate text; i integer;
BEGIN
 LOOP
  candidate:='';
  FOR i IN 1..6 LOOP candidate:= candidate || substr(alphabet, floor(random()*length(alphabet)+1)::integer,1); END LOOP;
  EXIT WHEN NOT EXISTS (SELECT 1 FROM public.workers WHERE worker_id=candidate);
 END LOOP;
 RETURN candidate;
END $fn$;

ALTER TABLE public.workers
 ADD COLUMN slug text,
 ADD COLUMN worker_id text NOT NULL DEFAULT public.generate_worker_id(),
 ADD COLUMN ipuc text NOT NULL DEFAULT public.generate_ipuc(),
 ADD COLUMN full_name text,
 ADD COLUMN experience text,
 ADD COLUMN service_area jsonb,
 ADD COLUMN gender text,
 ADD COLUMN age text,
 ADD COLUMN address text,
 ADD COLUMN primary_skill text,
 ADD COLUMN services jsonb,
 ADD COLUMN working_hours text,
 ADD COLUMN working_shift jsonb,
 ADD COLUMN why_choose_me jsonb,
 ADD COLUMN languages jsonb,
 ADD COLUMN about jsonb,
 ADD COLUMN verifications jsonb,
 ADD COLUMN created_at timestamptz NOT NULL DEFAULT now(),
 ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX workers_slug_unique ON public.workers(slug);
CREATE UNIQUE INDEX workers_worker_id_unique ON public.workers(worker_id);
CREATE UNIQUE INDEX workers_ipuc_unique ON public.workers(ipuc);
ALTER TABLE public.workers ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.workers FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.workers TO service_role;

CREATE FUNCTION public.update_workers_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $fn$
BEGIN NEW.updated_at = now(); RETURN NEW; END $fn$;
CREATE TRIGGER workers_updated_at_trigger BEFORE UPDATE ON public.workers
FOR EACH ROW EXECUTE FUNCTION public.update_workers_updated_at();

CREATE TABLE public.worker_service_areas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 worker_id uuid NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
 city text, locality text,
 latitude numeric, longitude numeric, radius_km numeric,
 created_at timestamptz DEFAULT now(), full_address text, pincode text
);
CREATE TABLE public.worker_availability (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 worker_id uuid NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
 is_available boolean, created_at timestamptz DEFAULT now()
);
CREATE TABLE public.infixo_worker_hex_memberships (
 worker_id uuid PRIMARY KEY REFERENCES public.workers(id) ON DELETE CASCADE,
 worker_hex_id text NOT NULL REFERENCES public.infixo_worker_hexes(worker_hex_id) ON DELETE RESTRICT,
 assigned_latitude numeric, assigned_longitude numeric,
 updated_at timestamptz NOT NULL DEFAULT now()
);
-- The current Worker DELETE API also expects these child table names.
-- Staging placeholders contain no production data.
CREATE TABLE public.verification_documents(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE);
CREATE TABLE public.worker_evidence(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE);
CREATE TABLE public.reviews(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE);
CREATE TABLE public.worker_professional(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE);
CREATE TABLE public.worker_skills(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE);
CREATE TABLE public.worker_verification(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),worker_id uuid REFERENCES public.workers(id) ON DELETE CASCADE);

DO $rls$ DECLARE rel text;
BEGIN
 FOREACH rel IN ARRAY ARRAY['worker_service_areas','worker_availability','infixo_worker_hex_memberships','verification_documents','worker_evidence','reviews','worker_professional','worker_skills','worker_verification']
 LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',rel);
  EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',rel);
  EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO service_role',rel);
 END LOOP;
END $rls$;

CREATE SCHEMA infixo_private;
REVOKE ALL ON SCHEMA infixo_private FROM PUBLIC;
GRANT USAGE ON SCHEMA infixo_private TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA infixo_private REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
CREATE FUNCTION infixo_private.published_worker_profiles()
RETURNS TABLE (
 id uuid, slug text, ipuc text, worker_id text, full_name text,
 profession text, experience text, service_area jsonb, hero_slides jsonb,
 phone text, primary_skill text, services jsonb, working_hours text,
 working_shift jsonb, why_choose_me jsonb, gender text, age text, address text,
 languages jsonb, about jsonb, photos jsonb, videos jsonb, verifications jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog
AS $fn$
SELECT w.id, w.slug, w.ipuc, w.worker_id, w.full_name, w.profession,
 w.experience, w.service_area,w.hero_slides,w.phone,w.primary_skill,
 w.services,w.working_hours,w.working_shift,w.why_choose_me,w.gender,
 w.age,w.address,w.languages,w.about,w.photos,w.videos,
 jsonb_build_object(
  'identityVerified', CASE WHEN lower(coalesce(w.verifications->>'identityVerified','false'))='true' THEN true ELSE false END,
  'workVerified', CASE WHEN lower(coalesce(w.verifications->>'workVerified','false'))='true' THEN true ELSE false END,
  'addressVerified', CASE WHEN lower(coalesce(w.verifications->>'addressVerified','false'))='true' THEN true ELSE false END
 ) AS verifications
FROM public.workers w WHERE coalesce(w.is_active,true)=true
$fn$;
REVOKE ALL ON FUNCTION infixo_private.published_worker_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION infixo_private.published_worker_profiles() TO anon,authenticated,service_role;
CREATE VIEW public.public_worker_profiles WITH (security_barrier=true,security_invoker=true)
AS SELECT * FROM infixo_private.published_worker_profiles();
GRANT SELECT ON public.public_worker_profiles TO anon,authenticated,service_role;

INSERT INTO storage.buckets (id,name,public) VALUES ('worker-media','worker-media',true);
-- Only public READ of published assets; no anonymous write/delete policy.
CREATE POLICY "Public read worker-media" ON storage.objects FOR SELECT TO public
USING (bucket_id='worker-media');
COMMIT;
