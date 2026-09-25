do $$
declare d text;
begin
 select pg_get_functiondef(p.oid) into d
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname='dd_run_safe_execution_recipes' and p.prokind='f';
 d:=replace(d,'select sum(p.total_amount) from dd_provider_payables p where p.job_id=j.id','select sum(p.total_final_payable) from dd_accounts_payable_ledger p where p.work_order_id=j.work_order_id');
 d:=replace(d,'exists(select 1 from dd_provider_payables p where p.job_id=j.id)','exists(select 1 from dd_accounts_payable_ledger p where p.work_order_id=j.work_order_id)');
 execute d;
end $$;