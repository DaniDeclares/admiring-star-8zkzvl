-- Security: internal controller/queue-mutating functions were callable by
-- anon and authenticated in production, despite at least one (
-- dd_compute_job_cash_risk) already having an explicit revoke-from-public
-- in an earlier migration -- a later CREATE OR REPLACE reset it back to the
-- Postgres default (PUBLIC EXECUTE on new functions). This migration is the
-- authoritative, idempotent fix: run last, touches grants only, no function
-- bodies changed.
--
-- Scope is deliberately narrow to the internal controllers named in the
-- audit. Confirmed NOT touching legitimate self-service portal RPCs
-- (dd_get_my_portal_roles, dd_get_my_provider_financials,
-- dd_get_my_provider_notifications, dd_respond_to_my_offer, dd_start_job,
-- dd_complete_job) -- those already correctly restrict to `authenticated`
-- only and are left untouched.

revoke execute on function public.dd_compute_job_cash_risk(integer) from public, anon, authenticated;
grant execute on function public.dd_compute_job_cash_risk(integer) to service_role;

revoke execute on function public.dd_generate_company_morning_brief() from public, anon, authenticated;
grant execute on function public.dd_generate_company_morning_brief() to service_role;

revoke execute on function public.dd_refresh_company_domain_state() from public, anon, authenticated;
grant execute on function public.dd_refresh_company_domain_state() to service_role;

revoke execute on function public.dd_run_commercial_reconciliation() from public, anon, authenticated;
grant execute on function public.dd_run_commercial_reconciliation() to service_role;

revoke execute on function public.dd_run_company_controller() from public, anon, authenticated;
grant execute on function public.dd_run_company_controller() to service_role;

revoke execute on function public.dd_run_provider_network_watch() from public, anon, authenticated;
grant execute on function public.dd_run_provider_network_watch() to service_role;

revoke execute on function public.dd_run_safe_automation_recipes() from public, anon, authenticated;
grant execute on function public.dd_run_safe_automation_recipes() to service_role;

revoke execute on function public.dd_run_service_discovery_controller() from public, anon, authenticated;
grant execute on function public.dd_run_service_discovery_controller() to service_role;

revoke execute on function public.dd_triage_support_case(uuid) from public, anon, authenticated;
grant execute on function public.dd_triage_support_case(uuid) to service_role;

revoke execute on function private.dd_expire_stale_intake_staging() from public, anon, authenticated;
grant execute on function private.dd_expire_stale_intake_staging() to service_role;
