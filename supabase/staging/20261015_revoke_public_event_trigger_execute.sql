-- INFIXO-STAGING ONLY. Event-trigger function must not be callable via public RPC.
-- Keep the database event trigger installed/functional; adjust only EXECUTE grants.
BEGIN;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
COMMIT;
