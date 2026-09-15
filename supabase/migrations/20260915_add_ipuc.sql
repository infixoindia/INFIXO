-- INFIXO IPUC migration
-- Run this once in the Supabase SQL Editor for an existing project.

create or replace function public.generate_ipuc()
returns text as $$
begin
  return 'IPUC-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
end;
$$ language plpgsql;

alter table public.workers
  add column if not exists ipuc text;

-- Backfill existing workers. The loop avoids collisions with already assigned codes.
do $$
declare
  r record;
  candidate text;
  exists_count integer;
begin
  for r in select id from public.workers where ipuc is null loop
    loop
      candidate := public.generate_ipuc();
      select count(*) into exists_count from public.workers where ipuc = candidate;
      exit when exists_count = 0;
    end loop;
    update public.workers set ipuc = candidate where id = r.id;
  end loop;
end $$;

alter table public.workers
  alter column ipuc set default public.generate_ipuc(),
  alter column ipuc set not null;

create unique index if not exists workers_ipuc_key on public.workers(ipuc);
