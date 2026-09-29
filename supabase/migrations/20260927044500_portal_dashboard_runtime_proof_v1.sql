create table if not exists public.dd_portal_runtime_proof_runs(
 id uuid primary key default gen_random_uuid(),
 run_key text not null unique,
 environment text not null default 'PRODUCTION',
 status text not null check(status in('PASS','REVIEW_REQUIRED','FAIL')),
 checks jsonb not null default '[]'::jsonb,
 summary jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.dd_portal_runtime_proof_runs enable row level security;
revoke all on public.dd_portal_runtime_proof_runs from public,anon,authenticated;
grant select,insert,update,delete on public.dd_portal_runtime_proof_runs to postgres,service_role;

create or replace function public.dd_run_portal_runtime_contract_audit()
returns jsonb language plpgsql security invoker set search_path='public' as $$
declare v_checks jsonb; v_fail int; v_review int; v_status text; v_key text; v_result jsonb; v_run_id uuid:=gen_random_uuid(); v_provider_state jsonb:='{}'::jsonb; v_non_provider jsonb:='{}'::jsonb; v_owner_counts jsonb:='{}'::jsonb;
begin
 with required(kind,name) as (values
 ('TABLE','dd_portal_identities'),('TABLE','dd_portal_user_roles'),('TABLE','dd_provider_applications'),('TABLE','dd_providers'),
 ('TABLE','dd_jobs'),('TABLE','dd_estimates'),('TABLE','dd_owner_attention_queue'),('TABLE','dd_owner_booking_requests'),
 ('TABLE','dd_sales_engine_v1'),('TABLE','dd_partners'),('TABLE','dd_job_assignments'),('TABLE','dd_job_appointments'),
 ('TABLE','dd_job_tasks'),('TABLE','dd_job_evidence'),('TABLE','dd_provider_payouts'),('TABLE','dd_messages'),
 ('FUNCTION','dd_get_my_portal_roles()'),('FUNCTION','dd_reconcile_provider_portal_handoff(uuid)'),('FUNCTION','dd_audit_provider_portal_handoffs()')
 ), checks as (
 select kind,name,case when kind='TABLE' then to_regclass('public.'||name) is not null
 else to_regprocedure('public.'||name) is not null end ok from required
 )
 select jsonb_build_object(
  'required_objects',coalesce((select jsonb_agg(jsonb_build_object('kind',kind,'name',name,'ok',ok) order by kind,name) from checks),'[]'::jsonb),
  'provider_handoffs',v_provider_state,
  'non_provider_identity_counts',v_non_provider,
  'owner_live_counts',v_owner_counts
 ) into v_checks;
 select count(*) into v_fail from jsonb_array_elements(v_checks->'required_objects') x where not (x->>'ok')::boolean;
 if to_regprocedure('public.dd_audit_provider_portal_handoffs()') is not null then execute 'select coalesce(jsonb_object_agg(handoff_state,n),''{}''::jsonb) from (select handoff_state,count(*) n from public.dd_audit_provider_portal_handoffs() group by handoff_state)s' into v_provider_state; end if;
 if to_regclass('public.dd_portal_identities') is not null then execute 'select coalesce(jsonb_object_agg(portal_role,n),''{}''::jsonb) from (select portal_role,count(*) n from public.dd_portal_identities where portal_role<>''provider'' group by portal_role)x' into v_non_provider; end if;
 if to_regclass('public.dd_owner_attention_queue') is not null and to_regclass('public.dd_jobs') is not null and to_regclass('public.dd_estimates') is not null and to_regclass('public.dd_partners') is not null and to_regclass('public.dd_owner_booking_requests') is not null then execute 'select jsonb_build_object(''attention_open'',(select count(*) from public.dd_owner_attention_queue where status=''OPEN''),''jobs'',(select count(*) from public.dd_jobs),''estimates'',(select count(*) from public.dd_estimates),''partners'',(select count(*) from public.dd_partners),''booking_requests'',(select count(*) from public.dd_owner_booking_requests))' into v_owner_counts; end if;
 v_checks:=jsonb_set(jsonb_set(jsonb_set(v_checks,'{provider_handoffs}',v_provider_state),'{non_provider_identity_counts}',v_non_provider),'{owner_live_counts}',v_owner_counts);
 select coalesce((v_checks->'provider_handoffs'->>'ROLE_DRIFT')::int,0) into v_review;
 v_status:=case when v_fail>0 then 'FAIL' when v_review>0 then 'REVIEW_REQUIRED' else 'PASS' end;
 v_key:='PORTAL_RUNTIME:'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS')||':'||v_run_id::text;
 v_result:=jsonb_build_object('status',v_status,'missing_required_objects',v_fail,'provider_role_drift',v_review,'checks',v_checks,'production_mutation_authority',false,'permission_expansion_authority',false);
 insert into dd_portal_runtime_proof_runs(run_key,status,checks,summary) values(v_key,v_status,v_checks,v_result);
 return v_result;
end $$;
revoke execute on function public.dd_run_portal_runtime_contract_audit() from public,anon,authenticated;
grant execute on function public.dd_run_portal_runtime_contract_audit() to postgres,service_role;
