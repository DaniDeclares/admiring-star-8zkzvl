-- Narrow internal Brain/world/market workers to server-side execution.
-- These functions are SECURITY DEFINER and are not portal/user RPC surfaces.
-- Preserve postgres/service_role execution; remove browser-role execution.

revoke execute on function public.dd_brain_ingest_signal(text,text,text,text,text,jsonb,numeric) from public, anon, authenticated;
revoke execute on function public.dd_bridge_confirmed_research_evidence_to_observations(integer) from public, anon, authenticated;
revoke execute on function public.dd_bridge_market_source_snapshots(integer) from public, anon, authenticated;
revoke execute on function public.dd_refresh_soul_body_bridge_intelligence_traces() from public, anon, authenticated;
revoke execute on function public.dd_run_market_period_comparison_worker(integer) from public, anon, authenticated;
revoke execute on function public.dd_run_shadow_sol_brain_cycle() from public, anon, authenticated;
revoke execute on function public.dd_ss_builder_cycle() from public, anon, authenticated;
revoke execute on function public.dd_ss_seed_brain_builder() from public, anon, authenticated;
revoke execute on function public.dd_world_advance_builds() from public, anon, authenticated;
revoke execute on function public.dd_world_build_from_signals() from public, anon, authenticated;
revoke execute on function public.dd_world_daily_cycle() from public, anon, authenticated;
revoke execute on function public.dd_world_evolution_cycle() from public, anon, authenticated;
revoke execute on function public.dd_world_generate_civic_day(date) from public, anon, authenticated;
revoke execute on function public.dd_world_generate_day(date) from public, anon, authenticated;
revoke execute on function public.dd_world_generate_fan_network(date) from public, anon, authenticated;
revoke execute on function public.dd_world_generate_provider_candidates(date) from public, anon, authenticated;
revoke execute on function public.dd_world_generate_work_relationships(date) from public, anon, authenticated;
revoke execute on function public.dd_world_ingest_regional_research() from public, anon, authenticated;
revoke execute on function public.dd_world_owner_reconciliation_cycle() from public, anon, authenticated;
revoke execute on function public.dd_world_route_operator_focus() from public, anon, authenticated;
revoke execute on function public.dd_world_seed_career_system() from public, anon, authenticated;
revoke execute on function public.dd_world_walkaway_check() from public, anon, authenticated;

grant execute on function public.dd_brain_ingest_signal(text,text,text,text,text,jsonb,numeric) to service_role;
grant execute on function public.dd_bridge_confirmed_research_evidence_to_observations(integer) to service_role;
grant execute on function public.dd_bridge_market_source_snapshots(integer) to service_role;
grant execute on function public.dd_refresh_soul_body_bridge_intelligence_traces() to service_role;
grant execute on function public.dd_run_market_period_comparison_worker(integer) to service_role;
grant execute on function public.dd_run_shadow_sol_brain_cycle() to service_role;
grant execute on function public.dd_ss_builder_cycle() to service_role;
grant execute on function public.dd_ss_seed_brain_builder() to service_role;
grant execute on function public.dd_world_advance_builds() to service_role;
grant execute on function public.dd_world_build_from_signals() to service_role;
grant execute on function public.dd_world_daily_cycle() to service_role;
grant execute on function public.dd_world_evolution_cycle() to service_role;
grant execute on function public.dd_world_generate_civic_day(date) to service_role;
grant execute on function public.dd_world_generate_day(date) to service_role;
grant execute on function public.dd_world_generate_fan_network(date) to service_role;
grant execute on function public.dd_world_generate_provider_candidates(date) to service_role;
grant execute on function public.dd_world_generate_work_relationships(date) to service_role;
grant execute on function public.dd_world_ingest_regional_research() to service_role;
grant execute on function public.dd_world_owner_reconciliation_cycle() to service_role;
grant execute on function public.dd_world_route_operator_focus() to service_role;
grant execute on function public.dd_world_seed_career_system() to service_role;
grant execute on function public.dd_world_walkaway_check() to service_role;


-- Trigger functions execute through their attached database triggers, not as
-- authenticated browser RPCs. Remove direct browser-role EXECUTE while leaving
-- trigger behavior and service-role maintenance access intact.
revoke execute on function public.dd_emit_assignment_accepted_confirmations() from public, anon, authenticated;
revoke execute on function public.dd_link_provider_portal_identity() from public, anon, authenticated;
grant execute on function public.dd_emit_assignment_accepted_confirmations() to service_role;
grant execute on function public.dd_link_provider_portal_identity() to service_role;
