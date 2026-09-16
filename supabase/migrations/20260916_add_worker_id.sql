-- INFIXO Worker ID
-- Human-friendly public/admin identity, separate from UUID and IPUC.

create or replace function public.generate_worker_id()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i integer;
begin
  loop
    candidate := '';
    for i in 1..6 loop
      candidate := candidate || substr(alphabet, floor(random() * length(alphabet) + 1)::integer, 1);
    end loop;

    exit when not exists (
      select 1 from public.workers where worker_id = candidate
    );
  end loop;

  return candidate;
end;
$$;

alter table public.workers
  add column if not exists worker_id text;

update public.workers
set worker_id = public.generate_worker_id()
where worker_id is null or btrim(worker_id) = '';

create unique index if not exists workers_worker_id_key
  on public.workers(worker_id);

alter table public.workers
  alter column worker_id set default public.generate_worker_id();

alter table public.workers
  alter column worker_id set not null;
