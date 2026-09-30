-- Standing owner approval for externally claimable GitHub paid work.
-- This authorizes DANI-side decisioning only; external maintainer/platform approval remains mandatory.
create table if not exists public.dd_github_work_owner_policy (
 policy_key text primary key,
 is_active boolean not null default false,
 owner_approved_at timestamptz,
 owner_approved_by text,
 require_external_claim_confirmation boolean not null default true,
 require_verified_compensation boolean not null default true,
 require_acceptance_criteria boolean not null default true,
 require_capability_match boolean not null default true,
 require_no_unapproved_spend boolean not null default true,
 require_no_unapproved_secret_access boolean not null default true,
 require_payout_path_verification boolean not null default true,
 policy jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.dd_github_work_owner_policy enable row level security;
grant select on public.dd_github_work_owner_policy to authenticated,service_role;

insert into public.dd_github_work_owner_policy(
 policy_key,is_active,owner_approved_at,owner_approved_by,policy
) values(
 'OWNER_STANDING_APPROVAL_EXECUTABLE_PAID_GITHUB_WORK_V1',true,now(),'DANI_OWNER',
 jsonb_build_object(
  'scope','Paid GitHub work DANI can establish is executable before claim',
  'auto_owner_decision',true,
  'external_claim_confirmation_required',true,
  'external_terms_remain_authoritative',true,
  'scope_expansion',false,
  'unapproved_spend',false,
  'unapproved_secret_access',false,
  'unknown_legal_or_identity_commitments',false,
  'payment_collection_after_verified_acceptance',true
 )
)
on conflict(policy_key) do update set
 is_active=true,owner_approved_at=excluded.owner_approved_at,owner_approved_by=excluded.owner_approved_by,
 policy=excluded.policy,updated_at=now();

create or replace function public.dd_github_owner_policy_precheck(
 p_repository_full_name text,p_issue_number bigint,p_compensation_usd numeric,
 p_acceptance_criteria jsonb,p_capability_match boolean,p_external_claim_confirmed boolean,
 p_payout_path_verified boolean,p_requires_spend boolean default false,
 p_requires_secret_access boolean default false
) returns jsonb language plpgsql security definer set search_path='' as $$
declare pol public.dd_github_work_owner_policy%rowtype;
begin
 select * into pol from public.dd_github_work_owner_policy
 where policy_key='OWNER_STANDING_APPROVAL_EXECUTABLE_PAID_GITHUB_WORK_V1' and is_active=true;
 if not found then raise exception 'OWNER_STANDING_APPROVAL_INACTIVE'; end if;
 if coalesce(p_compensation_usd,0)<=0 then raise exception 'VERIFIED_COMPENSATION_REQUIRED'; end if;
 if p_acceptance_criteria is null or p_acceptance_criteria='[]'::jsonb or p_acceptance_criteria='{}'::jsonb then raise exception 'ACCEPTANCE_CRITERIA_REQUIRED'; end if;
 if not coalesce(p_capability_match,false) then raise exception 'CAPABILITY_MATCH_REQUIRED'; end if;
 if pol.require_external_claim_confirmation and not coalesce(p_external_claim_confirmed,false) then
   return jsonb_build_object('status','WAITING_EXTERNAL_CLAIM_CONFIRMATION','owner_approval','STANDING_APPROVED','may_start_work',false);
 end if;
 if pol.require_payout_path_verification and not coalesce(p_payout_path_verified,false) then
   return jsonb_build_object('status','WAITING_PAYOUT_PATH_VERIFICATION','owner_approval','STANDING_APPROVED','may_start_work',false);
 end if;
 if coalesce(p_requires_spend,false) then raise exception 'UNAPPROVED_SPEND_NOT_ALLOWED'; end if;
 if coalesce(p_requires_secret_access,false) then raise exception 'UNAPPROVED_SECRET_ACCESS_NOT_ALLOWED'; end if;
 return jsonb_build_object('status','OWNER_APPROVED_FOR_GOVERNED_EXECUTION','owner_approval','STANDING_APPROVED',
  'repository_full_name',p_repository_full_name,'issue_number',p_issue_number,'may_start_work',true);
end $$;
revoke all on function public.dd_github_owner_policy_precheck(text,bigint,numeric,jsonb,boolean,boolean,boolean,boolean,boolean) from public,anon,authenticated;
grant execute on function public.dd_github_owner_policy_precheck(text,bigint,numeric,jsonb,boolean,boolean,boolean,boolean,boolean) to service_role;
