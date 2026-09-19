create table if not exists public.dd_provider_capability_discovery (
  id uuid primary key default gen_random_uuid(),
  capability_key text not null unique,
  capability_name text not null,
  capability_family text not null,
  discovery_type text not null default 'CAPABILITY',
  relevant_channels text[] not null default '{}',
  potential_service_status text not null default 'DISCOVERY',
  compliance_sensitivity text not null default 'STANDARD',
  recruitment_priority text not null default 'NORMAL',
  evidence_basis text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_provider_capability_discovery enable row level security;
revoke all on public.dd_provider_capability_discovery from anon, authenticated;
create index if not exists idx_dd_provider_capability_discovery_family on public.dd_provider_capability_discovery(capability_family);
create index if not exists idx_dd_provider_capability_discovery_status on public.dd_provider_capability_discovery(potential_service_status);
