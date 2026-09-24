
revoke execute on function public.dd_apply_default_estimate_deposit() from public, anon, authenticated;
revoke execute on function public.dd_provider_application_route_defaults() from public, anon, authenticated;

revoke execute on function public.dd_get_sales_dashboard_leads(integer) from public, anon;
grant execute on function public.dd_get_sales_dashboard_leads(integer) to authenticated;

revoke execute on function public.dd_provider_meets_work_package_requirements(uuid,uuid) from public, anon;
grant execute on function public.dd_provider_meets_work_package_requirements(uuid,uuid) to authenticated;
