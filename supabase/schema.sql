-- ============================================================
-- INFIXO — Worker Table + Storage Setup
-- Run this once in Supabase SQL Editor
-- ============================================================

-- 1. WORKERS TABLE (single source of truth for all worker data)
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,

  -- Identity
  full_name text default '',
  profession text default '',
  experience integer default 0,
  service_area jsonb default '[]'::jsonb,   -- e.g. ["Indore","Dewas"]
  hero_slides jsonb default '[]'::jsonb,    -- e.g. [{"image":"https://..."}]

  -- Work Details
  primary_skill text default '',
  services jsonb default '[]'::jsonb,        -- ["Putty Work","Texture Finish"]
  working_hours text default '9:00 AM – 7:00 PM',
  working_shift jsonb default '{"day":true,"night":false}'::jsonb,
  why_choose_me jsonb default '[]'::jsonb,   -- ["Clean & Professional Work", ...]

  -- Worker Details
  gender text default 'Male',
  age text default '',
  address text default '',
  languages jsonb default '["Hindi"]'::jsonb,
  about jsonb default '[]'::jsonb,           -- paragraphs array

  -- Verification
  verifications jsonb default '{"identityVerified":true,"workVerified":true,"addressVerified":true}'::jsonb,

  -- Media
  photos jsonb default '[]'::jsonb,          -- ["https://.../work1.png", ...]
  videos jsonb default '[]'::jsonb,          -- [{"video":"https://...","thumbnail":"https://...","duration":"00:10"}]

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_workers_updated_at on public.workers;
create trigger trg_workers_updated_at
before update on public.workers
for each row execute procedure public.set_updated_at();

-- 2. RLS — public can read, only authenticated/admin can write
-- (Tighten write policy later once you add real admin auth.)
alter table public.workers enable row level security;

drop policy if exists "Public read workers" on public.workers;
create policy "Public read workers"
  on public.workers for select
  using (true);

drop policy if exists "Anyone can write workers (temp)" on public.workers;
create policy "Anyone can write workers (temp)"
  on public.workers for all
  using (true)
  with check (true);

-- 3. STORAGE BUCKETS for photos/videos/slider images
insert into storage.buckets (id, name, public)
values ('worker-media', 'worker-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read worker-media" on storage.objects;
create policy "Public read worker-media"
  on storage.objects for select
  using (bucket_id = 'worker-media');

drop policy if exists "Anyone can upload worker-media (temp)" on storage.objects;
create policy "Anyone can upload worker-media (temp)"
  on storage.objects for insert
  with check (bucket_id = 'worker-media');

drop policy if exists "Anyone can update worker-media (temp)" on storage.objects;
create policy "Anyone can update worker-media (temp)"
  on storage.objects for update
  using (bucket_id = 'worker-media');

drop policy if exists "Anyone can delete worker-media (temp)" on storage.objects;
create policy "Anyone can delete worker-media (temp)"
  on storage.objects for delete
  using (bucket_id = 'worker-media');

-- 4. Seed the existing dummy worker (Rahul Sharma) so the public URL keeps working
insert into public.workers (
  slug, full_name, profession, experience, service_area, hero_slides,
  primary_skill, services, working_hours, working_shift, why_choose_me,
  gender, age, address, languages, about, verifications, photos, videos
) values (
  'rahul-sharma', 'Rahul Sharma', 'Electrician', 8,
  '["Indore"]'::jsonb,
  '[{"image":"/images/worker-1.avif"},{"image":"/images/worker-2.avif"},{"image":"/images/worker-3.avif"}]'::jsonb,
  'Painter',
  '["Putty Work","Texture Finish","Waterproofing","Interior Paints"]'::jsonb,
  '9:00 AM – 7:00 PM',
  '{"day":true,"night":true}'::jsonb,
  '["Clean & Professional Work","Premium Paint Finish","On Time Work","Reasonable Pricing","8+ Years Trusted Experience","Customer Satisfaction"]'::jsonb,
  'Male', '28 Years', 'Indore, Madhya Pradesh', '["Hindi","English"]'::jsonb,
  '["Rahul Sharma is a dedicated and reliable professional known for delivering clean and high-quality painting work.","He pays close attention to every detail and ensures every project is completed with care and a premium finish.","His goal is to provide a smooth experience through honest communication, timely service, and customer satisfaction."]'::jsonb,
  '{"identityVerified":true,"workVerified":true,"addressVerified":true}'::jsonb,
  '["/images/work1.png","/images/work2.png","/images/work3.png","/images/work4.png","/images/work5.png","/images/work6.png"]'::jsonb,
  '[{"video":"/videos/work1.mp4","thumbnail":"/images/video-thumb-1.jpg","duration":"00:10"},{"video":"/videos/work2.mp4","thumbnail":"/images/video-thumb-2.jpg","duration":"00:10"},{"video":"/videos/work3.mp4","thumbnail":"/images/video-thumb-3.jpg","duration":"00:10"},{"video":"/videos/work4.mp4","thumbnail":"/images/video-thumb-4.jpg","duration":"00:10"}]'::jsonb
)
on conflict (slug) do nothing;
