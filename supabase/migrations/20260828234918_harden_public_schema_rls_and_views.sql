begin;

-- Internal/control tables in the exposed public schema: deny anon/authenticated by enabling RLS
alter table public.dd_service_markets enable row level security;
alter table public.dd_service_market_pricing_rules enable row level security;
alter table public.dd_service_customer_routing enable row level security;
alter table public.dd_ch01_resident_subchannels enable row level security;
alter table public.dd_dispatch_origins enable row level security;
alter table public.dd_catalog_source_artifacts enable row level security;
alter table public.dd_geographies enable row level security;
alter table public.dd_market_service_commercial_rules enable row level security;
alter table public.dd_market_provider_economics enable row level security;
alter table public.dd_system_of_record_registry enable row level security;
alter table public.dd_geographic_service_compliance enable row level security;
alter table public.dd_commercial_artifact_register enable row level security;
alter table public.dd_operating_matrix_registry enable row level security;
alter table public.dd_document_governance enable row level security;
alter table public.dd_reconciliation_checkpoints enable row level security;
alter table public.dd_master_service_universe enable row level security;
alter table public.dd_service_normalization_register enable row level security;
alter table public.dd_provider_service_reconciliation enable row level security;
alter table public.dd_division_reconciliation_register enable row level security;

-- These master/control tables already have staff/service-role policy patterns elsewhere;
-- no new permissive public policies are introduced here. Service-role access remains available.

-- Remove direct client access to privileged SECURITY DEFINER reporting views.
revoke all on table public.dd_master_service_customer_routing from anon, authenticated;
revoke all on table public.dd_master_service_capability_channel_matrix from anon, authenticated;

commit;