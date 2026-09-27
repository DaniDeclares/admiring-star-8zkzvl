-- DANI security control plane V1: access contracts, findings, and fail-closed audit.
create table if not exists public.dd_security_access_contracts(
  object_schema text not null default 'public', object_name text not null,
  object_type text not null default 'TABLE',
  access_class text not null check(access_class in('PUBLIC_READ','PUBLIC_INTAKE','AUTHENTICATED_SCOPED','OWNER_STAFF','SERVICE_ROLE_INTERNAL')),
  rationale text not null, owner_approval_required boolean not null default false,
  status text not null default 'ACTIVE', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), primary key(object_schema,object_name,object_type)
);
alter table public.dd_security_access_contracts enable row level security;
revoke all on public.dd_security_access_contracts from public,anon,authenticated;
grant select,insert,update,delete on public.dd_security_access_contracts to postgres,service_role;

create table if not exists public.dd_security_findings(
  finding_key text primary key, severity text not null check(severity in('INFO','LOW','MEDIUM','HIGH','CRITICAL')),
  finding_type text not null, object_schema text not null default 'public', object_name text not null,
  statement text not null, evidence jsonb not null default '{}'::jsonb, status text not null default 'OPEN',
  first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), resolved_at timestamptz
);
alter table public.dd_security_findings enable row level security;
revoke all on public.dd_security_findings from public,anon,authenticated;
grant select,insert,update,delete on public.dd_security_findings to postgres,service_role;

insert into public.dd_security_access_contracts(object_name,access_class,rationale) values
('dd_integration_webhook_credentials','SERVICE_ROLE_INTERNAL','Webhook credentials are secret-bearing integration control data.'),
('dd_provider_stripe_connect_accounts','SERVICE_ROLE_INTERNAL','Provider payment-account linkage is sensitive financial integration data.'),
('dd_provider_payout_runs','SERVICE_ROLE_INTERNAL','Provider payout execution records are internal financial operations.'),
('dd_provider_earnings_ledger','SERVICE_ROLE_INTERNAL','Provider earnings ledger is sensitive financial data.'),
('dd_accounting_exception_queue','SERVICE_ROLE_INTERNAL','Accounting exception queue is internal financial operations.'),
('dd_acquisition_spend_guard','SERVICE_ROLE_INTERNAL','Acquisition spend controls are internal decision/financial controls.'),
('dd_acquisition_spend_recommendations','SERVICE_ROLE_INTERNAL','Acquisition spend recommendations are internal financial decision data.'),
('dd_research_work_queue','SERVICE_ROLE_INTERNAL','Research execution queue is an internal autonomous-control surface.'),
('dd_research_sources','SERVICE_ROLE_INTERNAL','Research source configuration controls autonomous research behavior.'),
('dd_research_source_snapshots','SERVICE_ROLE_INTERNAL','Research source snapshots are internal evidence infrastructure.'),
('dd_research_evidence','SERVICE_ROLE_INTERNAL','Research evidence store feeds autonomous decisions and is not a public write surface.'),
('dd_research_programs','SERVICE_ROLE_INTERNAL','Research program configuration is an internal control surface.'),
('dd_worker_classification_policies','SERVICE_ROLE_INTERNAL','Worker classification policy is sensitive internal compliance control data.'),
('dd_worker_safety_profiles','SERVICE_ROLE_INTERNAL','Worker safety profile data is sensitive provider/worker data.')
on conflict(object_schema,object_name,object_type) do update set access_class=excluded.access_class,rationale=excluded.rationale,updated_at=now();

revoke all on public.dd_integration_webhook_credentials,public.dd_provider_stripe_connect_accounts,
public.dd_provider_payout_runs,public.dd_provider_earnings_ledger,public.dd_accounting_exception_queue,
public.dd_acquisition_spend_guard,public.dd_acquisition_spend_recommendations,public.dd_research_work_queue,
public.dd_research_sources,public.dd_research_source_snapshots,public.dd_research_evidence,public.dd_research_programs,
public.dd_worker_classification_policies,public.dd_worker_safety_profiles from anon,authenticated;

create or replace function public.dd_run_security_access_audit() returns jsonb
language plpgsql security invoker set search_path='public' as $$
declare v_client_grants int:=0; v_internal_violations int:=0; v_unclassified int:=0;
begin
 insert into public.dd_security_findings(finding_key,severity,finding_type,object_name,statement,evidence,status,last_seen_at,resolved_at)
 select 'RLS_NO_POLICY_PUBLIC_GRANT:'||c.relname,
   case when a.access_class='SERVICE_ROLE_INTERNAL' then 'HIGH' else 'MEDIUM' end,
   'RLS_NO_POLICY_WITH_CLIENT_GRANT',c.relname,
   'RLS is enabled with no policy while anon/authenticated retain table privileges; classify and reconcile the access contract.',
   jsonb_build_object('access_class',a.access_class,'anon_select',has_table_privilege('anon',c.oid,'SELECT'),
   'anon_insert',has_table_privilege('anon',c.oid,'INSERT'),'anon_update',has_table_privilege('anon',c.oid,'UPDATE'),
   'anon_delete',has_table_privilege('anon',c.oid,'DELETE'),'authenticated_select',has_table_privilege('authenticated',c.oid,'SELECT'),
   'authenticated_insert',has_table_privilege('authenticated',c.oid,'INSERT'),'authenticated_update',has_table_privilege('authenticated',c.oid,'UPDATE'),
   'authenticated_delete',has_table_privilege('authenticated',c.oid,'DELETE')),'OPEN',now(),null
 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 left join public.dd_security_access_contracts a on a.object_schema=n.nspname and a.object_name=c.relname and a.object_type='TABLE'
 where n.nspname='public' and c.relkind='r' and c.relrowsecurity and not exists(select 1 from pg_policy p where p.polrelid=c.oid)
 and (has_table_privilege('anon',c.oid,'SELECT') or has_table_privilege('anon',c.oid,'INSERT') or has_table_privilege('anon',c.oid,'UPDATE') or has_table_privilege('anon',c.oid,'DELETE')
 or has_table_privilege('authenticated',c.oid,'SELECT') or has_table_privilege('authenticated',c.oid,'INSERT') or has_table_privilege('authenticated',c.oid,'UPDATE') or has_table_privilege('authenticated',c.oid,'DELETE'))
 on conflict(finding_key) do update set severity=excluded.severity,evidence=excluded.evidence,status='OPEN',last_seen_at=now(),resolved_at=null;

 update public.dd_security_findings f set status='RESOLVED',resolved_at=now(),last_seen_at=now()
 where finding_type='RLS_NO_POLICY_WITH_CLIENT_GRANT' and status='OPEN' and not exists(
 select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname=f.object_schema and c.relname=f.object_name
 and c.relkind='r' and c.relrowsecurity and not exists(select 1 from pg_policy p where p.polrelid=c.oid)
 and (has_table_privilege('anon',c.oid,'SELECT') or has_table_privilege('anon',c.oid,'INSERT') or has_table_privilege('anon',c.oid,'UPDATE') or has_table_privilege('anon',c.oid,'DELETE')
 or has_table_privilege('authenticated',c.oid,'SELECT') or has_table_privilege('authenticated',c.oid,'INSERT') or has_table_privilege('authenticated',c.oid,'UPDATE') or has_table_privilege('authenticated',c.oid,'DELETE')));

 select count(*) into v_client_grants from public.dd_security_findings where finding_type='RLS_NO_POLICY_WITH_CLIENT_GRANT' and status='OPEN';
 select count(*) into v_internal_violations from public.dd_security_findings where finding_type='RLS_NO_POLICY_WITH_CLIENT_GRANT' and status='OPEN' and severity in('HIGH','CRITICAL');
 select count(*) into v_unclassified from public.dd_security_findings f where finding_type='RLS_NO_POLICY_WITH_CLIENT_GRANT' and status='OPEN'
 and not exists(select 1 from public.dd_security_access_contracts a where a.object_schema=f.object_schema and a.object_name=f.object_name and a.object_type='TABLE');
 return jsonb_build_object('status',case when v_internal_violations>0 then 'FAIL' when v_client_grants>0 then 'REVIEW_REQUIRED' else 'PASS' end,
 'open_client_grant_findings',v_client_grants,'high_or_critical',v_internal_violations,'unclassified',v_unclassified,
 'production_mutation_authority',false,'money_action_authority',false);
end $$;
revoke execute on function public.dd_run_security_access_audit() from public,anon,authenticated;
grant execute on function public.dd_run_security_access_audit() to postgres,service_role;
