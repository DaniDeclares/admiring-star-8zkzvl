
alter view public.vw_catalog_readiness_reconciler set (security_invoker = true);
alter view public.vw_legacy_price_reconciliation set (security_invoker = true);
alter view public.vw_owner_compliance_crosswalk set (security_invoker = true);
alter view public.vw_compliance_readiness_staging_2026 set (security_invoker = true);
alter view public.vw_sprint2b_economic_evaluation set (security_invoker = true);
alter view public.vw_div01_quote_reconstruction set (security_invoker = true);
alter view public.dd_service_release_contract_legacy_v1 set (security_invoker = true);
alter view public.dd_provider_assignment_readiness_v1 set (security_invoker = true);
alter view public.dd_worker_assignment_classification_guard_v1 set (security_invoker = true);
alter function public.dd_prevent_snapshot_mutation() set search_path = public, pg_temp;
alter function public.dd_enqueue_external_action(uuid,text,text,text,text,text,jsonb,text,integer) set search_path = public, pg_temp;
alter function public.dd_claim_external_actions(text,integer) set search_path = public, pg_temp;
