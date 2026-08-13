-- DANI DECLARES LLC — Resident Concierge Fulfillment Queue
-- Apply this migration in the connected Supabase project before using /portal/resident-fulfillment.

create extension if not exists pgcrypto;

create table if not exists public.resident_dispatches (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique,
  resident_name text not null,
  unit text,
  community text,
  phone text,
  email text,
  payment_method text,
  source text not null default 'resident-concierge',
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'new' check (status in ('new','confirmed','scheduled','in_progress','ready','completed','cancelled')),
  items jsonb not null default '[]'::jsonb,
  modifiers jsonb not null default '[]'::jsonb,
  totals jsonb not null default '{}'::jsonb,
  resident_note text,
  internal_notes text,
  assigned_to text,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resident_dispatches_status_idx on public.resident_dispatches(status, created_at desc);
create index if not exists resident_dispatches_priority_idx on public.resident_dispatches(priority, created_at desc);
create index if not exists resident_dispatches_unit_idx on public.resident_dispatches(unit);

create or replace function public.set_resident_dispatch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resident_dispatches_updated_at on public.resident_dispatches;
create trigger resident_dispatches_updated_at
before update on public.resident_dispatches
for each row execute function public.set_resident_dispatch_updated_at();

alter table public.resident_dispatches enable row level security;

drop policy if exists "Public Anonymous Insert Resident Dispatches" on public.resident_dispatches;
create policy "Public Anonymous Insert Resident Dispatches"
on public.resident_dispatches for insert to anon
with check (source = 'resident-concierge');

drop policy if exists "Authenticated Read Resident Dispatches" on public.resident_dispatches;
create policy "Authenticated Read Resident Dispatches"
on public.resident_dispatches for select to authenticated
using (true);

drop policy if exists "Authenticated Update Resident Dispatches" on public.resident_dispatches;
create policy "Authenticated Update Resident Dispatches"
on public.resident_dispatches for update to authenticated
using (true)
with check (true);

grant insert on public.resident_dispatches to anon;
grant select, update on public.resident_dispatches to authenticated;
grant all on public.resident_dispatches to service_role;
