-- INFIXO — RETIRED ONE-TIME SAFE_SETUP (2026-10-15)
--
-- Do not re-run this historical installer. Its earlier CREATE VIEW replaced
-- public.public_worker_profiles WITHOUT the production is_active filter,
-- potentially exposing inactive/unpublished worker profiles.
--
-- The current SIGMA public view filters active workers and is used by the
-- public /w pages; altering it requires staged functional/security tests.
-- Current permissions and database hardening are recorded in reviewed migrations.
-- See supabase/migrations. The previous contents remain in Git history.
--
-- This deliberate exception stops mistaken SQL Editor execution safely.
DO $$
BEGIN
  RAISE EXCEPTION 'INFIXO: SAFE_SETUP.sql is retired. Re-running would replace the active-worker-filtered public profile view.';
END;
$$;
