-- INFIXO MAP foundation.
-- Safe: only creates new tables. It does not insert or modify workers.

create table if not exists public.infixo_customer_hexes (
  hex_id text primary key,
  primary_ward text,
  geometry jsonb not null,
  worker_hex_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.infixo_worker_hexes (
  worker_hex_id text primary key,
  geometry jsonb not null,
  customer_hex_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.infixo_worker_hex_memberships (
  worker_id uuid primary key references public.workers(id) on delete cascade,
  worker_hex_id text not null references public.infixo_worker_hexes(worker_hex_id) on delete restrict,
  assigned_latitude numeric,
  assigned_longitude numeric,
  updated_at timestamptz not null default now()
);

create table if not exists public.infixo_customer_demand (
  id uuid primary key default gen_random_uuid(),
  hex_id text not null references public.infixo_customer_hexes(hex_id) on delete cascade,
  category text not null,
  query_count integer not null default 1,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_infixo_customer_demand_hex_category on public.infixo_customer_demand(hex_id, category);
create index if not exists idx_infixo_worker_hex_memberships_hex on public.infixo_worker_hex_memberships(worker_hex_id);

alter table public.infixo_customer_hexes enable row level security;
alter table public.infixo_worker_hexes enable row level security;
alter table public.infixo_worker_hex_memberships enable row level security;
alter table public.infixo_customer_demand enable row level security;

-- No anon/authenticated policies are created. Admin server-side code/service-role can access these tables.
