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
