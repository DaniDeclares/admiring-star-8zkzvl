create table if not exists public.dd_incentive_programs(
 id uuid primary key default gen_random_uuid(), program_key text not null unique, audience_type text not null,
 program_name text not null, program_status text not null default 'DRAFT',
 reward_type text not null, reward_value numeric null, reward_unit text null,
 qualification_event text not null, terms_summary text not null, effective_from timestamptz null, effective_until timestamptz null,
 owner_approved boolean not null default false, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(audience_type in('PROVIDER','CLIENT','PARTNER')), check(program_status in('DRAFT','ACTIVE','PAUSED','EXPIRED')),
 check(reward_type in('PERCENT','FIXED_AMOUNT','ACCOUNT_CREDIT','SERVICE_CREDIT','NON_CASH_PERK'))
);
create table if not exists public.dd_referrals(
 id uuid primary key default gen_random_uuid(), program_id uuid not null references public.dd_incentive_programs(id),
 referrer_provider_id uuid null references public.dd_providers(id), referrer_user_id uuid null references auth.users(id),
 referred_email text null, referred_phone text null, referred_party_type text not null,
 referral_status text not null default 'REFERRED', source_reference text null, referred_at timestamptz not null default now(),
 qualifying_event_at timestamptz null, qualifying_transaction_reference text null, metadata jsonb not null default '{}'::jsonb,
 check(referred_party_type in('PROVIDER','CLIENT','PARTNER')), check(referral_status in('REFERRED','APPLIED','QUALIFIED','EARNED','DISQUALIFIED','EXPIRED'))
);
create table if not exists public.dd_referral_rewards(
 id uuid primary key default gen_random_uuid(), referral_id uuid not null unique references public.dd_referrals(id),
 program_id uuid not null references public.dd_incentive_programs(id), beneficiary_provider_id uuid null references public.dd_providers(id),
 reward_status text not null default 'PENDING_QUALIFICATION', eligible_amount numeric null, reward_amount numeric null,
 reward_type text not null, approved_at timestamptz null, paid_at timestamptz null, payment_reference text null,
 expires_at timestamptz null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(reward_status in('PENDING_QUALIFICATION','PENDING_APPROVAL','APPROVED','PAID','EXPIRED','DISQUALIFIED'))
);
create unique index if not exists dd_referrals_program_source_unique on public.dd_referrals(program_id,source_reference) where source_reference is not null;
alter table public.dd_incentive_programs enable row level security; alter table public.dd_referrals enable row level security; alter table public.dd_referral_rewards enable row level security;
revoke all on public.dd_incentive_programs,public.dd_referrals,public.dd_referral_rewards from anon,authenticated;
grant all on public.dd_incentive_programs,public.dd_referrals,public.dd_referral_rewards to service_role;
insert into public.dd_incentive_programs(program_key,audience_type,program_name,program_status,reward_type,qualification_event,terms_summary,owner_approved,metadata)
values('PROVIDER_REFERRAL_BASELINE_2026','PROVIDER','Provider Referral Program','DRAFT','FIXED_AMOUNT','REFERRED_PROVIDER_QUALIFIES_AND_COMPLETES_GOVERNED_EVENT',
'Provider referral architecture is approved; reward amount/formula remains unapproved. Applications or unqualified leads do not create payable rewards. Self-referrals and duplicate rewards are prohibited.',false,
'{"architecture_status":"LOCKED","reward_economics_status":"UNRESOLVED","dashboard_visible":true}'::jsonb)
on conflict(program_key) do update set terms_summary=excluded.terms_summary,metadata=excluded.metadata;
create or replace function public.dd_get_my_provider_benefits()
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_uid uuid:=auth.uid(); v_pid uuid; v_programs jsonb; v_rewards jsonb; v_counts jsonb;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
 select public.dd_current_provider_id() into v_pid;
 if v_pid is null then raise exception 'PROVIDER_IDENTITY_REQUIRED'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('programKey',program_key,'name',program_name,'status',program_status,'rewardType',reward_type,'rewardValue',reward_value,'qualificationEvent',qualification_event,'terms',terms_summary,'effectiveFrom',effective_from,'effectiveUntil',effective_until,'claimable',program_status='ACTIVE' and owner_approved and reward_value is not null) order by program_name),'[]'::jsonb)
 into v_programs from public.dd_incentive_programs where audience_type='PROVIDER' and program_status in('DRAFT','ACTIVE','PAUSED');
 select coalesce(jsonb_agg(jsonb_build_object('referralId',r.id,'status',rr.reward_status,'rewardType',rr.reward_type,'rewardAmount',rr.reward_amount,'approvedAt',rr.approved_at,'paidAt',rr.paid_at,'expiresAt',rr.expires_at) order by rr.created_at desc),'[]'::jsonb)
 into v_rewards from public.dd_referral_rewards rr join public.dd_referrals r on r.id=rr.referral_id where rr.beneficiary_provider_id=v_pid;
 select jsonb_build_object('earned',count(*) filter(where reward_status in('APPROVED','PAID')),'pending',count(*) filter(where reward_status like 'PENDING%'),'paid',count(*) filter(where reward_status='PAID'),'expired',count(*) filter(where reward_status='EXPIRED')) into v_counts from public.dd_referral_rewards where beneficiary_provider_id=v_pid;
 return jsonb_build_object('providerId',v_pid,'programs',v_programs,'rewards',v_rewards,'counts',v_counts);
end $$;
revoke all on function public.dd_get_my_provider_benefits() from public,anon;
grant execute on function public.dd_get_my_provider_benefits() to authenticated,service_role;
