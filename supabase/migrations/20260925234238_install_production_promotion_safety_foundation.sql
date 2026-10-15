
create table if not exists public.dd_production_automation_policy (
 policy_key text primary key,
 enabled boolean not null default false check(enabled=false),
 kill_switch boolean not null default true check(kill_switch=true),
 execution_environment text not null default 'PRODUCTION' check(execution_environment='PRODUCTION'),
 allowed_actions jsonb not null default '["observe","record_evidence","evaluate_promotion_readiness","surface_owner_approval","record_release_verification"]'::jsonb,
 prohibited_actions jsonb not null default '["autonomous_code_change","autonomous_schema_change","merge_pull_request","deploy_production","expand_permissions","weaken_rls","create_or_rotate_secrets","move_money","authorize_provider","publish_pricing","publish_service","send_customer_message","send_provider_message","delete_business_data","change_owner_approval_rules"]'::jsonb,
 production_direct_write_allowed boolean not null default false check(production_direct_write_allowed=false),
 auto_merge_allowed boolean not null default false check(auto_merge_allowed=false),
 permission_expansion_allowed boolean not null default false check(permission_expansion_allowed=false),
 money_action_allowed boolean not null default false check(money_action_allowed=false),
 external_contact_allowed boolean not null default false check(external_contact_allowed=false),
 updated_at timestamptz not null default now()
);
alter table public.dd_production_automation_policy enable row level security;
revoke all on public.dd_production_automation_policy from public,anon,authenticated;
grant select,insert,update,delete on public.dd_production_automation_policy to service_role;

insert into public.dd_production_automation_policy(policy_key)
values ('DANI_PRODUCTION_AUTOMATION_BOUNDARY')
on conflict(policy_key) do nothing;

create table if not exists public.dd_promotion_candidates (
 id uuid primary key default gen_random_uuid(),
 candidate_key text not null unique,
 component_domain text not null,
 component_name text not null,
 source_environment text not null default 'TESTER' check(source_environment='TESTER'),
 target_environment text not null default 'PRODUCTION' check(target_environment='PRODUCTION'),
 source_reference text,
 classification text not null default 'PROMOTE_AFTER_FIX'
   check (classification in ('PROMOTE_NOW','PROMOTE_AFTER_FIX','TESTER_ONLY','RESEARCH_ONLY','OBSOLETE_SUPERSEDED')),
 proof_status text not null default 'UNPROVEN'
   check (proof_status in ('UNPROVEN','PARTIAL','PASSED','FAILED','STALE')),
 dependency_status text not null default 'UNCHECKED'
   check (dependency_status in ('UNCHECKED','PASSED','BLOCKED')),
 security_status text not null default 'UNCHECKED'
   check (security_status in ('UNCHECKED','PASSED','BLOCKED')),
 production_diff_status text not null default 'UNCHECKED'
   check (production_diff_status in ('UNCHECKED','CLEAN','DRIFTED','BLOCKED')),
 rollback_status text not null default 'UNDEFINED'
   check (rollback_status in ('UNDEFINED','DEFINED','VERIFIED')),
 owner_approval_status text not null default 'NOT_REQUESTED'
   check (owner_approval_status in ('NOT_REQUESTED','REQUESTED','APPROVED','DECLINED')),
 production_verification_status text not null default 'NOT_RUN'
   check (production_verification_status in ('NOT_RUN','PASSED','FAILED')),
 blocking_reason text,
 evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_promotion_candidates enable row level security;
revoke all on public.dd_promotion_candidates from public,anon,authenticated;
grant select,insert,update,delete on public.dd_promotion_candidates to service_role;

create or replace view public.dd_promotion_gate_v1
with (security_invoker=true)
as
select p.*,
 (
   p.classification='PROMOTE_NOW'
   and p.proof_status='PASSED'
   and p.dependency_status='PASSED'
   and p.security_status='PASSED'
   and p.production_diff_status='CLEAN'
   and p.rollback_status in ('DEFINED','VERIFIED')
   and p.owner_approval_status='APPROVED'
 ) as promotion_authorized,
 case
  when p.classification <> 'PROMOTE_NOW' then 'CLASSIFICATION_BLOCK'
  when p.proof_status <> 'PASSED' then 'PROOF_BLOCK'
  when p.dependency_status <> 'PASSED' then 'DEPENDENCY_BLOCK'
  when p.security_status <> 'PASSED' then 'SECURITY_BLOCK'
  when p.production_diff_status <> 'CLEAN' then 'PRODUCTION_DIFF_BLOCK'
  when p.rollback_status not in ('DEFINED','VERIFIED') then 'ROLLBACK_BLOCK'
  when p.owner_approval_status <> 'APPROVED' then 'OWNER_APPROVAL_BLOCK'
  else 'AUTHORIZED'
 end as gate_state
from public.dd_promotion_candidates p;
revoke all on public.dd_promotion_gate_v1 from public,anon,authenticated;
grant select on public.dd_promotion_gate_v1 to service_role;

create or replace function public.dd_surface_ready_promotion_approvals()
returns jsonb language plpgsql security invoker set search_path='public' as $$
declare n integer;
begin
 insert into public.dd_owner_attention_queue(domain,source_table,source_record_id,reason,priority,status,recommended_action,metadata)
 select 'PRODUCTION_PROMOTION','dd_promotion_candidates',p.candidate_key,
        'Tester component passed technical promotion gates and is waiting for explicit owner approval',
        'P1','OPEN',
        'Review proof, dependency, security, live production diff, and rollback evidence. Approval is required before any release action.',
        jsonb_build_object('candidate_id',p.id,'component',p.component_name,'gate_state',g.gate_state,'release_executed',false)
 from public.dd_promotion_candidates p
 join public.dd_promotion_gate_v1 g on g.id=p.id
 where p.classification='PROMOTE_NOW'
   and p.proof_status='PASSED'
   and p.dependency_status='PASSED'
   and p.security_status='PASSED'
   and p.production_diff_status='CLEAN'
   and p.rollback_status in ('DEFINED','VERIFIED')
   and p.owner_approval_status in ('NOT_REQUESTED','REQUESTED')
   and not exists(select 1 from public.dd_owner_attention_queue q where q.source_table='dd_promotion_candidates' and q.source_record_id=p.candidate_key and q.status='OPEN');
 get diagnostics n=row_count;
 return jsonb_build_object('owner_attention_created',n,'release_executed',false,'production_code_changed',false);
end $$;
revoke all on function public.dd_surface_ready_promotion_approvals() from public,anon,authenticated;
grant execute on function public.dd_surface_ready_promotion_approvals() to service_role;
