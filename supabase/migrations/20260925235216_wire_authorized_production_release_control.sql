
create table if not exists public.dd_production_release_receipts (
 id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null references public.dd_promotion_candidates(id) on delete restrict,
 candidate_key text not null,
 release_state text not null default 'REGISTERED'
   check(release_state in ('REGISTERED','VERIFIED','FAILED','ROLLED_BACK')),
 gate_snapshot jsonb not null,
 release_scope jsonb not null default '{}'::jsonb,
 release_executed boolean not null default false check(release_executed=false),
 autonomous_execution boolean not null default false check(autonomous_execution=false),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 unique(candidate_key)
);
alter table public.dd_production_release_receipts enable row level security;
revoke all on public.dd_production_release_receipts from public,anon,authenticated;
grant select,insert,update,delete on public.dd_production_release_receipts to service_role;

create or replace function public.dd_register_authorized_production_release(p_candidate_key text)
returns jsonb
language plpgsql security invoker set search_path='public'
as $$
declare c record; rid uuid;
begin
 select * into c from public.dd_promotion_gate_v1 where candidate_key=p_candidate_key;
 if not found then raise exception 'PROMOTION_CANDIDATE_NOT_FOUND'; end if;
 if not c.promotion_authorized then raise exception 'PROMOTION_GATE_NOT_AUTHORIZED:%',c.gate_state; end if;
 if c.production_verification_status <> 'PASSED' then raise exception 'PRODUCTION_VERIFICATION_NOT_PASSED'; end if;

 insert into public.dd_production_release_receipts(candidate_id,candidate_key,release_state,gate_snapshot,release_scope,release_executed,autonomous_execution,verified_at)
 values(c.id,c.candidate_key,'VERIFIED',
   jsonb_build_object('classification',c.classification,'proof',c.proof_status,'dependencies',c.dependency_status,'security',c.security_status,'production_diff',c.production_diff_status,'rollback',c.rollback_status,'owner_approval',c.owner_approval_status,'gate_state',c.gate_state),
   jsonb_build_object('mode','CONTROL_SAFETY_FOUNDATION','production_autobuilder',false),
   false,false,now())
 on conflict(candidate_key) do update set
   release_state='VERIFIED',gate_snapshot=excluded.gate_snapshot,verified_at=now()
 returning id into rid;

 return jsonb_build_object('receipt_id',rid,'candidate_key',p_candidate_key,'registered',true,'release_executed',false,'autonomous_execution',false);
end $$;
revoke all on function public.dd_register_authorized_production_release(text) from public,anon,authenticated;
grant execute on function public.dd_register_authorized_production_release(text) to service_role;

create or replace view public.dd_production_release_control_v1
with (security_invoker=true) as
select p.candidate_key,p.component_domain,p.component_name,p.gate_state,p.promotion_authorized,
       p.production_verification_status,r.release_state,r.verified_at,
       a.enabled as production_automation_enabled,a.kill_switch,
       a.production_direct_write_allowed,a.auto_merge_allowed,a.permission_expansion_allowed,
       a.money_action_allowed,a.external_contact_allowed
from public.dd_promotion_gate_v1 p
left join public.dd_production_release_receipts r on r.candidate_key=p.candidate_key
cross join public.dd_production_automation_policy a
where a.policy_key='DANI_PRODUCTION_AUTOMATION_BOUNDARY';
revoke all on public.dd_production_release_control_v1 from public,anon,authenticated;
grant select on public.dd_production_release_control_v1 to service_role;
