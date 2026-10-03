
revoke execute on function public.dd_provider_meets_work_package_requirements(uuid,uuid) from public,anon,authenticated;
grant execute on function public.dd_provider_meets_work_package_requirements(uuid,uuid) to service_role;
revoke insert,update,delete,truncate on table public.dd_accounts_payable_ledger from anon,authenticated;
revoke insert,update,delete,truncate on table public.dd_provider_earnings_ledger from anon,authenticated;
