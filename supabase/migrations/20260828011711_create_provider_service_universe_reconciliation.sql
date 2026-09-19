create table if not exists public.dd_provider_service_universe (
 id uuid primary key default gen_random_uuid(),
 provider_id uuid not null,
 provider_code text not null,
 provider_name text not null,
 capability_evidence text,
 service_evidence text,
 service_cluster text,
 network_role text,
 permission_status text,
 qualification_status text,
 compliance_tier text,
 source_reference text,
 operating_rule text,
 reconciliation_status text not null default 'PENDING_RECONCILIATION',
 matched_division text,
 matched_service_family text,
 matched_service_name text,
 matched_sku text,
 channel_mapping_status text not null default 'PENDING',
 fulfillment_method text,
 geographic_limitations text,
 required_credentials text,
 required_equipment text,
 provider_economics_status text not null default 'NOT_RECONCILED',
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists uq_dd_provider_service_universe_provider_service on public.dd_provider_service_universe(provider_code, service_evidence);
create index if not exists idx_dd_provider_service_universe_status on public.dd_provider_service_universe(reconciliation_status, channel_mapping_status);
alter table public.dd_provider_service_universe enable row level security;
create policy dd_provider_service_universe_service_role on public.dd_provider_service_universe for all to service_role using (true) with check (true);