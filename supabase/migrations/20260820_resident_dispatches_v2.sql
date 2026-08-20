-- Resident fulfillment queue v2
-- Security boundary: public users may create a dispatch; only trusted staff roles may read/update it.

create table if not exists public.resident_dispatches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resident_name text not null,
  resident_email text,
  resident_phone text,
  property_name text,
  unit_label text,
  service_type text not null,
  service_items jsonb not null default '[]'::jsonb,
  quoted_total numeric(12,2),
  pricing_channel text not null default 'B2C',
  payment_method text,
  customer_notes text,
  internal_notes text,
  status text not null default 'new' check (status in ('new','confirmed','in_progress','ready','completed','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid,
  completed_at timestamptz
);

create index if not exists resident_dispatches_status_idx on public.resident_dispatches(status, priority, created_at desc);
create index if not exists resident_dispatches_created_idx on public.resident_dispatches(created_at desc);

alter table public.resident_dispatches enable row level security;

-- Public intake is intentionally insert-only. No public select/update/delete policy exists.
drop policy if exists "resident dispatch public insert" on public.resident_dispatches;
create policy "resident dispatch public insert"
on public.resident_dispatches
for insert
to anon, authenticated
with check (
  pricing_channel = 'B2C'
  and length(trim(resident_name)) between 1 and 200
  and length(trim(service_type)) between 1 and 120
);

-- Staff access is based on trusted app_metadata, not user-editable user_metadata.
drop policy if exists "resident dispatch staff read" on public.resident_dispatches;
create policy "resident dispatch staff read"
on public.resident_dispatches
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','owner','staff_admin','staff'));

drop policy if exists "resident dispatch staff update" on public.resident_dispatches;
create policy "resident dispatch staff update"
on public.resident_dispatches
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','owner','staff_admin','staff'))
with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','owner','staff_admin','staff'));

create or replace function public.touch_resident_dispatch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.status = 'completed' and old.status <> 'completed' then
    new.completed_at = coalesce(new.completed_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists resident_dispatches_touch_updated_at on public.resident_dispatches;
create trigger resident_dispatches_touch_updated_at
before update on public.resident_dispatches
for each row execute function public.touch_resident_dispatch_updated_at();

comment on table public.resident_dispatches is 'Resident B2C fulfillment queue. Public insert only; staff reads/updates require trusted app_metadata roles.';
