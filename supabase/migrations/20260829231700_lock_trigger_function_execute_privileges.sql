revoke execute on function public.dd_guard_provider_assignment() from public, anon, authenticated;
revoke execute on function public.dd_guard_job_completion() from public, anon, authenticated;
grant execute on function public.dd_guard_provider_assignment() to service_role;
grant execute on function public.dd_guard_job_completion() to service_role;