-- INFIXO — RETIRED LEGACY BOOTSTRAP SCRIPT (2026-10-15)
--
-- DO NOT EXECUTE. This original one-shot seed/setup file was superseded by
-- versioned migrations, modern server-side Admin APIs, and controlled public
-- worker-profile views. Its historical version included:
--   * public/anonymous writes to workers
--   * public upload/update/delete to worker-media Storage
--   * a dummy worker insert
--   * CREATE OR REPLACE functions without a fixed search_path
-- Re-running that source could REOPEN critical permissions or break production.
-- The prior contents remain accessible in Git history for investigation.
-- Use versioned files in supabase/migrations, after checking the target DB.
-- Production SIGMA already has additional safety migrations applied.
-- Do not run the whole migrations folder against a blank staging database;
-- INFIXO-STAGING has an approved acquisition-only bootstrap migration.
--
-- This intentional error stops accidental execution, with zero DB changes.
DO $$
BEGIN
  RAISE EXCEPTION 'INFIXO: supabase/schema.sql is RETIRED and unsafe to run. Use reviewed migrations and verify target project.';
END;
$$;
