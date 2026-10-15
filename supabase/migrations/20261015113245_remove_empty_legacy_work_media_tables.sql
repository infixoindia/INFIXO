-- INFIXO: remove ONLY two verified empty deprecated legacy media metadata tables.
-- Current worker media lives in public.workers.photos/videos/hero_slides JSONB,
-- and actual uploaded files remain in Supabase Storage bucket 'worker-media'.
-- Do NOT delete public.worker_profile (contains 1 legacy row), public.workers,
-- public.public_worker_profiles, or any storage bucket/media objects.
-- DDL recovery: supabase/recovery/restore_deprecated_empty_work_media_tables.sql
-- RESTRICT stops this migration if another DB object now depends on these tables.
BEGIN;
DO $$
DECLARE table_name text; present regclass; has_rows boolean;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['work_photos','work_videos'] LOOP
    present := to_regclass(format('public.%I', table_name));
    IF present IS NOT NULL THEN
      EXECUTE format('LOCK TABLE public.%I IN ACCESS EXCLUSIVE MODE', table_name);
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM public.%I LIMIT 1)', table_name) INTO has_rows;
      IF has_rows THEN
        RAISE EXCEPTION 'Refusing to drop %. It is no longer empty.', table_name;
      END IF;
    END IF;
  END LOOP;
END $$;
DROP TABLE IF EXISTS public.work_photos RESTRICT;
DROP TABLE IF EXISTS public.work_videos RESTRICT;
COMMIT;
