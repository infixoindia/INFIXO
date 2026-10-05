INFIXO internal worker location patch

Apply over the current repo. This patch adds private exact location fields in Worker Details and saves them to worker_service_areas, then assigns the worker to the existing Worker Hex using the existing geometry.

Database migration required:
supabase/migrations/20261006_worker_internal_location.sql

No public profile UI or hex geometry is changed.
