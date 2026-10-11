-- Harden security_invoker on views that exist in this environment.
-- Several vw_* readiness/compliance views are referenced here but have no
-- CREATE VIEW in the recovered migration ledger. Production may still hold
-- them. Fail-closed: apply security_invoker only when present. Do not invent
-- catalog readiness definitions solely to pass CI.

do $$
declare
  v text;
  views text[] := array[
    'vw_catalog_readiness_reconciler',
    'vw_legacy_price_reconciliation',
    'vw_owner_compliance_crosswalk',
    'vw_compliance_readiness_staging_2026',
    'vw_sprint2b_economic_evaluation',
    'vw_div01_quote_reconstruction',
    'dd_service_release_contract_legacy_v1',
    'dd_provider_assignment_readiness_v1',
    'dd_worker_assignment_classification_guard_v1'
  ];
begin
  foreach v in array views loop
    if to_regclass('public.' || v) is not null then
      execute format('alter view public.%I set (security_invoker = true)', v);
    end if;
  end loop;
end $$;

do $$
begin
  if to_regprocedure('public.dd_prevent_snapshot_mutation()') is not null then
    execute 'alter function public.dd_prevent_snapshot_mutation() set search_path = public, pg_temp';
  end if;
  if to_regprocedure('public.dd_enqueue_external_action(uuid,text,text,text,text,text,jsonb,text,integer)') is not null then
    execute 'alter function public.dd_enqueue_external_action(uuid,text,text,text,text,text,jsonb,text,integer) set search_path = public, pg_temp';
  end if;
  if to_regprocedure('public.dd_claim_external_actions(text,integer)') is not null then
    execute 'alter function public.dd_claim_external_actions(text,integer) set search_path = public, pg_temp';
  end if;
end $$;
