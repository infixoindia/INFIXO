-- Applied to SIGMA on 2026-10-15 as migration harden_worker_function_search_paths.
-- Five SECURITY INVOKER functions retain their original bodies.
-- 'extensions' must remain visible: generate_ipuc calls extensions.gen_random_bytes.
-- Verified with a transaction/ROLLBACK dry run, plus live read-only ID generation checks.
BEGIN;
ALTER FUNCTION public.set_updated_at() SET search_path = pg_catalog, extensions;
ALTER FUNCTION public.generate_ipuc() SET search_path = pg_catalog, extensions;
ALTER FUNCTION public.generate_worker_id() SET search_path = pg_catalog, extensions;
ALTER FUNCTION public.update_workers_updated_at() SET search_path = pg_catalog, extensions;
ALTER FUNCTION public.update_worker_professional_updated_at() SET search_path = pg_catalog, extensions;
COMMIT;
