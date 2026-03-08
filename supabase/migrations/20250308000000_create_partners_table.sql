-- Create partners table
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  location text not null,
  primary_email text,
  primary_contact text,
  secondary_email text,
  secondary_contact text,
  designation text,
  description text,
  created_at timestamptz default now()
);

-- Require either primary_email or primary_contact (at least one non-empty)
alter table public.partners
  add constraint partners_primary_contact_check
  check (
    (coalesce(trim(primary_email), '') != '')
    or (coalesce(trim(primary_contact), '') != '')
  );

-- Enable RLS (optional; adjust policies as needed for your auth)
alter table public.partners enable row level security;

-- Allow read/write for anon and authenticated
create policy "Allow partner access" on public.partners
  for all
  to anon, authenticated
  using (true)
  with check (true);
