
create or replace function public.dd_run_security_regression_proof()
returns uuid language plpgsql security definer set search_path to 'public','pg_catalog' as $$
declare rid uuid; total int:=7; pass int:=0; fail int:=0; f jsonb:='[]'::jsonb; n int; claim_oid oid;
begin
 select count(*) into n from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace where ns.nspname='public' and p.prosecdef and has_function_privilege('anon',p.oid,'EXECUTE');
 if n=0 then pass:=pass+1; else fail:=fail+1; f:=f||jsonb_build_array(jsonb_build_object('code','ANON_SECURITY_DEFINER_EXECUTABLE','count',n)); end if;
 select count(*) into n from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace where ns.nspname='public' and p.prosecdef and has_function_privilege('authenticated',p.oid,'EXECUTE') and p.proname in ('dd_compute_job_cash_risk','dd_record_platform_drift','dd_run_code_repair_controller_dry_run','dd_run_core_runtime_health_proof','dd_requeue_expired_external_action_leases','dd_run_security_regression_proof');
 if n=0 then pass:=pass+1; else fail:=fail+1; f:=f||jsonb_build_array(jsonb_build_object('code','INTERNAL_CONTROL_RPC_EXPOSED','count',n)); end if;
 select count(*) into n from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace where ns.nspname='public' and p.proname='dd_provider_meets_work_package_requirements' and has_function_privilege('authenticated',p.oid,'EXECUTE');
 if n=0 then pass:=pass+1; else fail:=fail+1; f:=f||jsonb_build_array('CROSS_PROVIDER_REQUIREMENT_RPC_EXPOSED'); end if;
 select count(*) into n from pg_tables t where t.schemaname='public' and not t.rowsecurity and (t.tablename like 'dd_%' or t.tablename in ('customers','providers','jobs','leads'));
 if n=0 then pass:=pass+1; else fail:=fail+1; f:=f||jsonb_build_array(jsonb_build_object('code','SENSITIVE_TABLE_RLS_DISABLED','count',n)); end if;
 select count(*) into n from information_schema.role_table_grants where table_schema='public' and grantee='anon' and privilege_type in('INSERT','UPDATE','DELETE') and table_name like 'dd_%';
 if n=0 then pass:=pass+1; else fail:=fail+1; f:=f||jsonb_build_array(jsonb_build_object('code','ANON_DD_TABLE_WRITE_GRANTS','count',n)); end if;
 select p.oid into claim_oid from pg_proc p join pg_namespace ns on ns.oid=p.pronamespace where ns.nspname='public' and p.proname='dd_claim_external_actions' order by p.oid limit 1;
 if claim_oid is not null and not has_function_privilege('anon',claim_oid,'EXECUTE') and not has_function_privilege('authenticated',claim_oid,'EXECUTE') then pass:=pass+1; else fail:=fail+1; f:=f||jsonb_build_array('EXTERNAL_ACTION_CLAIM_EXPOSED_OR_MISSING'); end if;
 if not exists(select 1 from information_schema.role_table_grants where table_schema='public' and table_name in('dd_accounts_payable_ledger','dd_provider_earnings_ledger') and grantee in('anon','authenticated') and privilege_type in('INSERT','UPDATE','DELETE')) then pass:=pass+1; else fail:=fail+1; f:=f||jsonb_build_array('MONEY_LEDGER_CLIENT_WRITE_EXPOSED'); end if;
 insert into public.dd_security_regression_runs(status,assertions_total,assertions_passed,assertions_failed,findings)
 values(case when fail=0 then 'PASS' else 'FAIL' end,total,pass,fail,f) returning id into rid;
 return rid;
end $$;
revoke all on function public.dd_run_security_regression_proof() from public,anon,authenticated;
grant execute on function public.dd_run_security_regression_proof() to service_role;
select cron.schedule('dd-security-regression-proof','26,56 * * * *','select public.dd_run_security_regression_proof();')
where not exists(select 1 from cron.job where command='select public.dd_run_security_regression_proof();');
