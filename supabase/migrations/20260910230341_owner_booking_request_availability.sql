create extension if not exists btree_gist;

create table if not exists public.dd_owner_booking_requests (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid references public.service_requests(id) on delete set null,
  service_id text,
  service_name text,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  location_address text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/New_York',
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 720),
  status text not null default 'HOLD' check (status in ('HOLD','CONFIRMED','DECLINED','CANCELLED','EXPIRED')),
  hold_expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_owner_booking_requests_range_valid check (ends_at > starts_at)
);

create index if not exists idx_dd_owner_booking_requests_time on public.dd_owner_booking_requests(starts_at, ends_at);
create index if not exists idx_dd_owner_booking_requests_request on public.dd_owner_booking_requests(service_request_id);
create index if not exists idx_dd_owner_booking_requests_status on public.dd_owner_booking_requests(status);

alter table public.dd_owner_booking_requests drop constraint if exists dd_owner_booking_requests_no_overlap;
alter table public.dd_owner_booking_requests add constraint dd_owner_booking_requests_no_overlap exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&) where (status in ('HOLD','CONFIRMED'));

alter table public.dd_owner_booking_requests enable row level security;
create policy "owner booking requests staff read" on public.dd_owner_booking_requests for select to authenticated using (exists (select 1 from public.dd_portal_user_roles r where r.user_id = auth.uid() and r.role = 'OWNER_OPERATOR' and r.is_active = true));
create policy "owner booking requests staff write" on public.dd_owner_booking_requests for all to authenticated using (exists (select 1 from public.dd_portal_user_roles r where r.user_id = auth.uid() and r.role = 'OWNER_OPERATOR' and r.is_active = true)) with check (exists (select 1 from public.dd_portal_user_roles r where r.user_id = auth.uid() and r.role = 'OWNER_OPERATOR' and r.is_active = true));