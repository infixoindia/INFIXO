alter table public.worker_service_areas
  add column if not exists full_address text,
  add column if not exists pincode text;
