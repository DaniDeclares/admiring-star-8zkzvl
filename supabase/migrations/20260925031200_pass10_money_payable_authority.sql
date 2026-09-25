insert into public.dd_audit_subproof_requirements(proof_key,pass_number,lifecycle_stage,description,executor_function,metadata)
values('PASS10_MONEY_PAYABLE_AUTHORITY',10,'ACCOUNTING','Provider compensation must be frozen before payable creation; payable identity must support multiple accepted assignments/providers per job; legacy provider_payables cannot be the economics authority.','dd_prove_pass10_money_payable_authority',jsonb_build_object('non_destructive',true,'external_side_effects',false,'production_authority',false))
on conflict(proof_key) do update set description=excluded.description,executor_function=excluded.executor_function,metadata=excluded.metadata,updated_at=now();

create or replace function public.dd_prove_pass10_money_payable_authority()
returns uuid language plpgsql security definer set search_path='public' as $$
declare rid uuid:=gen_random_uuid(); total int:=0; passed int:=0; failed int:=0;
 v_ap_table int; v_earnings_table int; v_assignment_comp int; v_legacy_refs int; v_multi_identity int; ev jsonb;
begin
 select count(*) into v_ap_table from information_schema.tables where table_schema='public' and table_name='dd_accounts_payable_ledger';
 total:=total+1; if v_ap_table=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_earnings_table from information_schema.tables where table_schema='public' and table_name='dd_provider_earnings_ledger';
 total:=total+1; if v_earnings_table=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_assignment_comp from information_schema.columns where table_schema='public' and table_name='dd_job_assignments'
   and column_name in ('frozen_provider_compensation','authorized_provider_pay_amount','authorized_provider_compensation','provider_compensation_snapshot_id');
 total:=total+1; if v_assignment_comp>=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_legacy_refs from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname='dd_run_safe_execution_recipes' and pg_get_functiondef(p.oid) ilike '%dd_provider_payables%';
 total:=total+1; if v_legacy_refs=0 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_multi_identity from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace
 where n.nspname='public' and t.relname='dd_accounts_payable_ledger' and c.contype='u' and pg_get_constraintdef(c.oid) ilike '%assignment%';
 total:=total+1; if v_multi_identity>=1 then passed:=passed+1; else failed:=failed+1; end if;
 ev:=jsonb_build_object('canonical_ap_table',v_ap_table,'earnings_projection_table',v_earnings_table,'assignment_compensation_authority_columns',v_assignment_comp,'safe_execution_legacy_payables_references',v_legacy_refs,'assignment_aware_ap_unique_constraints',v_multi_identity,'external_payout_authorized',false,'authoritative_pass_advanced',false);
 insert into public.dd_audit_proof_receipts(id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(rid,'PASS-10-MONEY','PASS10_MONEY_PAYABLE_AUTHORITY',case when failed=0 then 'PASS' else 'FAIL' end,total,passed,failed,ev);
 return rid;
end $$;
revoke all on function public.dd_prove_pass10_money_payable_authority() from public,anon,authenticated;
grant execute on function public.dd_prove_pass10_money_payable_authority() to service_role;