INFIXO SAFE WORKER DATABASE + ADMIN SETUP

1) In Supabase SQL Editor, run: supabase/SAFE_SETUP.sql
2) Add these SERVER-ONLY variables in Vercel Project Settings > Environment Variables:
   SUPABASE_SERVICE_ROLE_KEY = your Supabase service_role key
   INFIXO_ADMIN_PASSWORD = a strong password you choose
   INFIXO_ADMIN_SECRET = a long random secret you choose
   Keep NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as they already are.
3) Deploy this patched repo.
4) Open /admin/login and log in with INFIXO_ADMIN_PASSWORD.
5) Public /w/... profiles use the controlled public_worker_profiles view.
6) Admin worker CRUD and worker-media upload/delete use server-side APIs.

IMPORTANT: Never put SUPABASE_SERVICE_ROLE_KEY in any NEXT_PUBLIC_* variable and never paste it into chat.
