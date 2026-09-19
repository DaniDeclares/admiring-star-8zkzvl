do $$
declare
  t text;
  tables text[] := array[
    'dd_catalog_source_artifacts','dd_ch01_resident_subchannels','dd_commercial_artifact_register',
    'dd_dispatch_origins','dd_division_reconciliation_register','dd_document_governance',
    'dd_geographic_service_compliance','dd_geographies','dd_market_provider_economics',
    'dd_market_service_commercial_rules','dd_master_service_universe','dd_operating_matrix_registry',
    'dd_provider_service_reconciliation','dd_reconciliation_checkpoints','dd_service_customer_routing',
    'dd_service_market_pricing_rules','dd_service_markets','dd_service_normalization_register',
    'dd_system_of_record_registry'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists deny_anon_all on public.%I', t);
    execute format('drop policy if exists deny_authenticated_all on public.%I', t);
    execute format('create policy deny_anon_all on public.%I as restrictive for all to anon using (false) with check (false)', t);
    execute format('create policy deny_authenticated_all on public.%I as restrictive for all to authenticated using (false) with check (false)', t);
  end loop;
end $$;