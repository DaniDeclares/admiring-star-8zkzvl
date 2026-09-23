-- Closes Supabase security-advisor finding rls_disabled_in_public (ERROR level)
-- for 11 tables created in recent migrations without RLS ever being turned on:
--   dd_provider_earnings_ledger, dd_provider_payout_runs,
--   dd_provider_stripe_connect_accounts, dd_worker_classification_policies,
--   dd_worker_safety_profiles, dd_service_subscriptions,
--   dd_fulfillment_work_packages, dd_work_package_requirements,
--   dd_work_package_provider_slots, dd_accounting_exception_queue,
--   dd_plugin_capability_registry
--
-- All 11 currently grant full SELECT/INSERT/UPDATE/DELETE to anon and
-- authenticated (the PostgREST roles reachable with the public anon key)
-- with RLS off, so every row is directly readable and writable by anyone,
-- unauthenticated, via the REST API. dd_worker_classification_policies (15
-- rows) and dd_worker_safety_profiles (6 rows) hold live data today; the
-- other 9 are currently empty but are the provider-payout / Stripe Connect /
-- subscription tables this project is about to start writing real records
-- into.
--
-- No application code reads or writes any of these 11 tables via the
-- anon/authenticated PostgREST path. The one table with a live write path
-- (dd_service_subscriptions, from api/create-checkout-session.js and
-- api/stripe-webhook.js) goes through Prisma over DATABASE_URL, which
-- connects as the Postgres role, not through PostgREST -- RLS does not
-- apply to that connection. This matches the pattern already used
-- throughout this repo's other RLS migrations (e.g.
-- 20260828005156_enable_rls_provider_sensitive_tables.sql): enable RLS,
-- grant service_role a full-access policy, add no policy for
-- anon/authenticated so PostgREST access is a hard default-deny.
--
-- Reversal: `alter table public.<table> disable row level security;` for
-- each table listed below restores the pre-migration (exposed) state; the
-- service_role policies can be left in place harmlessly or dropped with
-- `drop policy <table>_service_role on public.<table>;`.

begin;

do $$
declare
  target_tables text[] := array[
    'dd_provider_earnings_ledger','dd_provider_payout_runs','dd_provider_stripe_connect_accounts',
    'dd_worker_classification_policies','dd_worker_safety_profiles','dd_service_subscriptions',
    'dd_fulfillment_work_packages','dd_work_package_requirements','dd_work_package_provider_slots',
    'dd_accounting_exception_queue','dd_plugin_capability_registry'
  ];
  missing text;
  already_on text;
begin
  select string_agg(t, ', ') into missing
  from unnest(target_tables) as t
  where not exists (
    select 1 from pg_tables where schemaname = 'public' and tablename = t
  );

  if missing is not null then
    raise exception
      'Migration aborted: expected table(s) missing from public schema: %. Live schema has drifted since this migration was written -- re-check before re-running.',
      missing;
  end if;

  select string_agg(t, ', ') into already_on
  from unnest(target_tables) as t
  where exists (
    select 1
    from pg_tables pt
    join pg_class c on c.relname = pt.tablename
    join pg_namespace n on n.oid = c.relnamespace and n.nspname = pt.schemaname
    where pt.schemaname = 'public' and pt.tablename = t and c.relrowsecurity = true
  );

  if already_on is not null then
    raise exception
      'Migration aborted: RLS is already enabled on: %. This fix may already be applied -- verify current state before re-running.',
      already_on;
  end if;
end $$;

alter table public.dd_provider_earnings_ledger enable row level security;
alter table public.dd_provider_payout_runs enable row level security;
alter table public.dd_provider_stripe_connect_accounts enable row level security;
alter table public.dd_worker_classification_policies enable row level security;
alter table public.dd_worker_safety_profiles enable row level security;
alter table public.dd_service_subscriptions enable row level security;
alter table public.dd_fulfillment_work_packages enable row level security;
alter table public.dd_work_package_requirements enable row level security;
alter table public.dd_work_package_provider_slots enable row level security;
alter table public.dd_accounting_exception_queue enable row level security;
alter table public.dd_plugin_capability_registry enable row level security;

create policy dd_provider_earnings_ledger_service_role on public.dd_provider_earnings_ledger for all to service_role using (true) with check (true);
create policy dd_provider_payout_runs_service_role on public.dd_provider_payout_runs for all to service_role using (true) with check (true);
create policy dd_provider_stripe_connect_accounts_service_role on public.dd_provider_stripe_connect_accounts for all to service_role using (true) with check (true);
create policy dd_worker_classification_policies_service_role on public.dd_worker_classification_policies for all to service_role using (true) with check (true);
create policy dd_worker_safety_profiles_service_role on public.dd_worker_safety_profiles for all to service_role using (true) with check (true);
create policy dd_service_subscriptions_service_role on public.dd_service_subscriptions for all to service_role using (true) with check (true);
create policy dd_fulfillment_work_packages_service_role on public.dd_fulfillment_work_packages for all to service_role using (true) with check (true);
create policy dd_work_package_requirements_service_role on public.dd_work_package_requirements for all to service_role using (true) with check (true);
create policy dd_work_package_provider_slots_service_role on public.dd_work_package_provider_slots for all to service_role using (true) with check (true);
create policy dd_accounting_exception_queue_service_role on public.dd_accounting_exception_queue for all to service_role using (true) with check (true);
create policy dd_plugin_capability_registry_service_role on public.dd_plugin_capability_registry for all to service_role using (true) with check (true);

commit;
