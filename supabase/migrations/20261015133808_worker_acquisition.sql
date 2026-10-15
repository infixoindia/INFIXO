begin;
create table public.acquisition_leads (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 2 and 100),
 phone text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
 profession text not null check (profession in ('Painter','Plumber','Electrician','Technician','Pandit')),
 area text not null check (char_length(area) between 2 and 120),
 selected_plan text not null check (selected_plan in ('FREE','PRO','Not Decided')),
 working_model text not null check (working_model in ('Main Khud Kaam Karta Hoon','Main Helpers Ke Saath Kaam Karta Hoon','Main Sirf Team Manage Karta Hoon')),
 reason text not null check (reason in ('Mujhe INFIXO Profile Banwani Hai','Mujhe Profile Ke Baare Mein Jaanna Hai','Mera Koi Sawal Hai')),
 question text not null default '' check (char_length(question) <= 1000),
 consent boolean not null check (consent),
 consent_at timestamptz not null default now(),
 consent_version text not null,
 attribution jsonb not null default '{}' check (jsonb_typeof(attribution) = 'object' and octet_length(attribution::text) <= 2000),
 campaign text not null,
 offered_price integer check (offered_price in (0,199)),
 status text not null default 'New Leads' check (status in ('New Leads','Contacted','Interested','Verification Pending','Profile Creation','Approved / Onboarded','Not Interested','Duplicate / Rejected')),
 worker_id uuid unique references public.workers(id) on delete set null,
 hex_id text references public.infixo_worker_hexes(worker_hex_id),
 approved_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint approval_requires_profile check (status <> 'Approved / Onboarded' or (approved_at is not null and selected_plan <> 'Not Decided'))
);
create index acquisition_leads_filters on public.acquisition_leads(status, profession, created_at desc);
create index acquisition_leads_source on public.acquisition_leads((attribution->>'utm_source'));
alter table public.acquisition_leads enable row level security;
revoke all on public.acquisition_leads from public, anon, authenticated;
grant select, insert, update, delete on public.acquisition_leads to service_role;

create table public.acquisition_followups (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.acquisition_leads(id) on delete cascade,
 reason text not null check (char_length(reason) <= 100),
 question text not null check (char_length(question) between 1 and 1000),
 created_at timestamptz not null default now()
);
create unique index acquisition_followups_dedup on public.acquisition_followups(lead_id, md5(question));
alter table public.acquisition_followups enable row level security;
revoke all on public.acquisition_followups from public, anon, authenticated;
grant select, insert, delete on public.acquisition_followups to service_role;

create table public.acquisition_rate_buckets (
 key text primary key,
 started_at timestamptz not null default now(),
 hits integer not null default 1
);
create index acquisition_rate_expiry on public.acquisition_rate_buckets(started_at);
alter table public.acquisition_rate_buckets enable row level security;
revoke all on public.acquisition_rate_buckets from public, anon, authenticated;
grant select, insert, update, delete on public.acquisition_rate_buckets to service_role;
-- Atomic durable limiter, invoked only by the trusted server. No SECURITY DEFINER.
create function public.acquisition_rate_limit(p_key text) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare current_hits integer;
begin
 if length(p_key) <> 64 then return false; end if;
 delete from public.acquisition_rate_buckets where started_at < now() - interval '2 days';
 insert into public.acquisition_rate_buckets(key) values(p_key)
 on conflict(key) do update set
 hits = case when acquisition_rate_buckets.started_at < now() - interval '1 hour' then 1 else acquisition_rate_buckets.hits + 1 end,
 started_at = case when acquisition_rate_buckets.started_at < now() - interval '1 hour' then now() else acquisition_rate_buckets.started_at end
 returning hits into current_hits;
 return current_hits <= 8;
end;
$$;
revoke all on function public.acquisition_rate_limit(text) from public, anon, authenticated;
grant execute on function public.acquisition_rate_limit(text) to service_role;
-- Only explicitly approved acquisition records, linked to a currently active profile.
create function public.acquisition_progress() returns table(profession text, completed bigint)
language sql stable security invoker set search_path = '' as $$
 select l.profession, count(*) from public.acquisition_leads l
 join public.workers w on w.id = l.worker_id
 where l.status = 'Approved / Onboarded' and w.is_active = true
 group by l.profession;
$$;
revoke all on function public.acquisition_progress() from public, anon, authenticated;
grant execute on function public.acquisition_progress() to service_role;
-- Limits apply only to profiles explicitly linked to this acquisition feature.
-- Existing, unlinked profiles remain unaffected. Essential text/contact corrections remain possible.
create function public.acquisition_check_media() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare plan text; profile public.workers%rowtype; max_identity integer; max_photos integer; max_videos integer;
begin
 if tg_table_name = 'workers' then
   profile := new;
   select selected_plan into plan from public.acquisition_leads where worker_id = new.id;
 else
   if new.worker_id is null then return new; end if;
   plan := new.selected_plan;
   select * into profile from public.workers where id = new.worker_id for update;
 end if;
 if plan is null then return new; end if;
 if plan not in ('FREE','PRO') then raise exception 'Confirm FREE or PRO before linking a profile'; end if;
 max_identity := case when plan = 'FREE' then 1 else 2 end;
 max_photos := case when plan = 'FREE' then 2 else 6 end;
 max_videos := case when plan = 'FREE' then 0 else 4 end;
 if jsonb_typeof(coalesce(profile.hero_slides,'[]'::jsonb)) <> 'array'
 or jsonb_typeof(coalesce(profile.photos,'[]'::jsonb)) <> 'array'
 or jsonb_typeof(coalesce(profile.videos,'[]'::jsonb)) <> 'array' then
   raise exception 'Profile media must be arrays';
 end if;
 if jsonb_array_length(coalesce(profile.hero_slides,'[]'::jsonb)) > max_identity
 or jsonb_array_length(coalesce(profile.photos,'[]'::jsonb)) > max_photos
 or jsonb_array_length(coalesce(profile.videos,'[]'::jsonb)) > max_videos then
   raise exception 'Acquisition plan media limit exceeded';
 end if;
 return new;
end;
$$;
revoke all on function public.acquisition_check_media() from public, anon, authenticated;
grant execute on function public.acquisition_check_media() to service_role;
create trigger acquisition_worker_media_limits before update of hero_slides, photos, videos on public.workers
for each row execute function public.acquisition_check_media();
create trigger acquisition_lead_media_limits before insert or update of worker_id, selected_plan on public.acquisition_leads
for each row execute function public.acquisition_check_media();
commit;
