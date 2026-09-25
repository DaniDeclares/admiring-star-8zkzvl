create or replace function public.dd_prove_pass10_money_payable_authority()
returns uuid
language plpgsql
security definer
set search_path='public'
as $function$
declare
 rid uuid:=gen_random_uuid();
 total int:=0; passed int:=0; failed int:=0;
 v_ap_table int; v_earnings_table int; v_assignment_comp int; v_legacy_refs int; v_multi_identity int;
 v_travel_authority int; v_change_order_authority int; v_policy_hold int;
 ev jsonb;
begin
 select count(*) into v_ap_table from information_schema.tables where table_schema='public' and table_name='dd_accounts_payable_ledger';
 total:=total+1; if v_ap_table=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_earnings_table from information_schema.tables where table_schema='public' and table_name='dd_provider_earnings_ledger';
 total:=total+1; if v_earnings_table=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_assignment_comp from information_schema.columns where table_schema='public' and table_name='dd_job_assignments' and column_name in ('frozen_provider_compensation','authorized_provider_pay_amount','authorized_provider_compensation','provider_compensation_snapshot_id');
 total:=total+1; if v_assignment_comp>=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_legacy_refs from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='dd_run_safe_execution_recipes' and pg_get_functiondef(p.oid) ilike '%dd_provider_payables%';
 total:=total+1; if v_legacy_refs=0 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_multi_identity from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_namespace n on n.oid=t.relnamespace where n.nspname='public' and t.relname='dd_accounts_payable_ledger' and c.contype='u' and pg_get_constraintdef(c.oid) ilike '%assignment%';
 total:=total+1; if v_multi_identity>=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_travel_authority from information_schema.columns where table_schema='public' and table_name='dd_job_assignments' and column_name='travel_allowance_snapshot';
 total:=total+1; if v_travel_authority=1 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_change_order_authority from information_schema.columns where table_schema='public' and table_name='dd_change_orders' and column_name in ('assignment_id','provider_pay_delta');
 total:=total+1; if v_change_order_authority=2 then passed:=passed+1; else failed:=failed+1; end if;
 select count(*) into v_policy_hold from public.dd_provider_payout_clearance_policy where policy_key='DEFAULT' and clearance_mode='UNRESOLVED' and owner_approved=false and external_payout_authorized=false;
 total:=total+1; if v_policy_hold=1 then passed:=passed+1; else failed:=failed+1; end if;
 ev:=jsonb_build_object('canonical_ap_table',v_ap_table,'earnings_projection_table',v_earnings_table,'assignment_compensation_authority_columns',v_assignment_comp,'safe_execution_legacy_payables_references',v_legacy_refs,'assignment_aware_ap_unique_constraints',v_multi_identity,'assignment_travel_authority_columns',v_travel_authority,'change_order_assignment_pay_authority_columns',v_change_order_authority,'payout_policy_safe_hold',v_policy_hold,'external_payout_authorized',false,'authoritative_pass_advanced',false);
 insert into public.dd_audit_proof_receipts(id,work_key,proof_key,status,assertions_total,assertions_passed,assertions_failed,evidence)
 values(rid,'PASS-10-MONEY','PASS10_MONEY_PAYABLE_AUTHORITY',case when failed=0 then 'PASS' else 'FAIL' end,total,passed,failed,ev);
 return rid;
end
$function$;