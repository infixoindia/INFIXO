-- INFIXO: production SIGMA legacy table and media storage permission hardening.
-- Applied to SIGMA on 2026-10-15 as migration 20261015111335.
-- Keep legacy data and the worker-media bucket intact; no DROP TABLE, DELETE or TRUNCATE.
-- Do NOT re-run supabase/schema.sql, which contains obsolete temporary public-write policies.
-- The protected /api/admin/storage route uses a server-only service_role client for uploads/deletes.
-- The current public worker UI reads public.public_worker_profiles based on public.workers.
BEGIN;

ALTER TABLE public.work_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profile ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.work_photos,
  public.work_videos,
  public.worker_profile
FROM PUBLIC, anon, authenticated;

-- Retain the existing public SELECT policy and all existing worker-media objects.
-- Remove obsolete unrestricted write access.
DROP POLICY IF EXISTS "Anyone can upload worker-media (temp)" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update worker-media (temp)" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete worker-media (temp)" ON storage.objects;

COMMIT;
