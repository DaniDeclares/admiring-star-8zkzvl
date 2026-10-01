create table if not exists public.dd_demand_capture_staging (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_url text,
  source_signal_id text,
  channel_code text not null,
  service_hint text,
  market text,
  need_summary text,
  urgency text,
  contact_name text,
  contact_email text,
  contact_phone text,
  contact_permission text not null default 'UNKNOWN',
  verification_status text not null default 'UNVERIFIED',
  promotion_status text not null default 'RAW',
  promoted_sales_queue_id uuid,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_demand_capture_staging enable row level security;

create index if not exists dd_demand_capture_staging_route_idx
on public.dd_demand_capture_staging(channel_code, promotion_status, observed_at desc);

create unique index if not exists dd_demand_capture_staging_dedupe_idx
on public.dd_demand_capture_staging(source_type, source_signal_id, source_url);

revoke all on public.dd_demand_capture_staging from anon;
revoke all on public.dd_demand_capture_staging from public;
