-- Harden internal automation RPC execution boundaries discovered by the
-- 2026-10-01 Tester authorization audit.
--
-- These functions are cron/service automation entrypoints, not browser/user
-- RPCs. PostgreSQL grants EXECUTE on new functions to PUBLIC by default, so
-- SECURITY DEFINER alone does not make them private. Preserve the existing
-- service-role/cron architecture while removing anon/authenticated access.
--
-- Deliberately excludes actor-facing RPCs (portal roles, provider identity,
-- resident invites, application documents, etc.) pending journey-specific
-- authorization proof.

do $$
declare
  fn regprocedure;
  fn_names text[] := array[
    'dd_assert_runtime_authority_v1',
    'dd_capture_verified_vendor_routes_v1',
    'dd_learning_closure_audit_v1',
    'dd_promote_verified_research_lead',
    'dd_quote_economic_gate',
    'dd_record_brain_lesson_v1',
    'dd_run_brain_learning_governance_v1',
    'dd_run_dani_social_visual_pipeline_v1',
    'dd_social_expand_service_visual_gaps_v1',
    'dd_social_plan_content_v1',
    'dd_social_queue_asset_review_to_brain_v1',
    'dd_social_queue_learning_to_brain_v1',
    'dd_social_seed_visual_system_v1',
    'dd_social_sync_visual_sources_v1'
  ];
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = any(fn_names)
      and p.prosecdef
  loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end
$$;

-- Fail the migration if any targeted internal function remains callable by a
-- browser-facing role. This makes future replay deterministic and auditable.
do $$
declare
  exposed text;
  fn_names text[] := array[
    'dd_assert_runtime_authority_v1',
    'dd_capture_verified_vendor_routes_v1',
    'dd_learning_closure_audit_v1',
    'dd_promote_verified_research_lead',
    'dd_quote_economic_gate',
    'dd_record_brain_lesson_v1',
    'dd_run_brain_learning_governance_v1',
    'dd_run_dani_social_visual_pipeline_v1',
    'dd_social_expand_service_visual_gaps_v1',
    'dd_social_plan_content_v1',
    'dd_social_queue_asset_review_to_brain_v1',
    'dd_social_queue_learning_to_brain_v1',
    'dd_social_seed_visual_system_v1',
    'dd_social_sync_visual_sources_v1'
  ];
begin
  select string_agg(p.oid::regprocedure::text, ', ' order by p.proname)
  into exposed
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = any(fn_names)
    and p.prosecdef
    and (
      has_function_privilege('anon', p.oid, 'EXECUTE')
      or has_function_privilege('authenticated', p.oid, 'EXECUTE')
    );

  if exposed is not null then
    raise exception 'INTERNAL_RPC_EXECUTE_BOUNDARY_FAILED: %', exposed;
  end if;
end
$$;


-- The same audit found recent internal governance/vendor tables created in
-- public without RLS. They are service/cron state, not browser data.
do $$
declare
  tbl text;
  internal_tables text[] := array[
    'dd_brain_learning_ledger',
    'dd_brain_learning_rules',
    'dd_brain_learning_governance_runs',
    'dd_brain_learning_replays',
    'dd_runtime_authority_registry',
    'dd_vendor_submission_packets_v1'
  ];
begin
  foreach tbl in array internal_tables loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I enable row level security', tbl);
      execute format('revoke all on table public.%I from public, anon, authenticated', tbl);
      execute format('grant all on table public.%I to service_role', tbl);
    end if;
  end loop;
end
$$;

-- Fail closed if any targeted table is still missing RLS.
do $$
declare
  exposed text;
begin
  select string_agg(c.relname, ', ' order by c.relname)
  into exposed
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = any(array[
      'dd_brain_learning_ledger',
      'dd_brain_learning_rules',
      'dd_brain_learning_governance_runs',
      'dd_brain_learning_replays',
      'dd_runtime_authority_registry',
      'dd_vendor_submission_packets_v1'
    ])
    and c.relkind = 'r'
    and not c.relrowsecurity;

  if exposed is not null then
    raise exception 'INTERNAL_TABLE_RLS_BOUNDARY_FAILED: %', exposed;
  end if;
end
$$;


-- Internal operational views must use caller privileges and must not be
-- readable from browser roles. Their consumers are service/cron governance.
do $$
declare
  v text;
  internal_views text[] := array[
    'dd_production_approval_readiness_v1',
    'dd_validated_market_peers_v1',
    'dd_external_intelligence_queue_health_v1',
    'dd_research_executable_backlog_v1'
  ];
begin
  foreach v in array internal_views loop
    if to_regclass('public.' || v) is not null then
      execute format('alter view public.%I set (security_invoker = true)', v);
      execute format('revoke all on table public.%I from public, anon, authenticated', v);
      execute format('grant select on table public.%I to service_role', v);
    end if;
  end loop;
end
$$;
