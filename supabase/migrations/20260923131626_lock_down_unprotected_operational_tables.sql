-- Lock down operational tables when present in the reconstructed ledger.
-- Several listed relations are referenced by later worker/provider code but
-- have no CREATE TABLE in the recovered migration set; Production may still
-- hold them. Fail-closed security: enable RLS only when the relation exists.
-- Do not invent schemas solely to satisfy this migration.

do $$
declare
  t text;
  tables text[] := array[
    'dd_provider_stripe_connect_accounts',
    'dd_provider_earnings_ledger',
    'dd_provider_payout_runs',
    'dd_worker_classification_policies',
    'dd_worker_safety_profiles',
    'dd_service_subscriptions',
    'dd_fulfillment_work_packages',
    'dd_work_package_requirements',
    'dd_work_package_provider_slots',
    'dd_accounting_exception_queue',
    'dd_plugin_capability_registry'
  ];
begin
  foreach t in array tables loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;
