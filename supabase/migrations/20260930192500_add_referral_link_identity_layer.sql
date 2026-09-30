-- Reusable referral-link identity layer.
-- Reuses dd_incentive_programs, dd_referrals, and dd_referral_rewards.
-- Customer referrals earn the already-approved $25 account credit only after
-- the referred customer completes a qualifying paid service.
-- Provider customer-referral links are attribution-only until provider reward
-- economics are separately governed.

create table if not exists public.dd_referral_identities (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null unique,
  referrer_type text not null check (referrer_type in ('CLIENT','PROVIDER')),
  program_id uuid not null references public.dd_incentive_programs(id),
  referrer_provider_id uuid null references public.dd_providers(id),
  referrer_user_id uuid null,
  referrer_email text null,
  display_name text null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PAUSED','REVOKED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dd_referral_identities_subject_ck check (
    (referrer_type='PROVIDER' and referrer_provider_id is not null)
    or
    (referrer_type='CLIENT' and (referrer_user_id is not null or nullif(trim(referrer_email),'') is not null))
  )
);

alter table public.dd_referral_identities enable row level security;
revoke all on public.dd_referral_identities from anon, authenticated;
grant select, insert, update, delete on public.dd_referral_identities to service_role;

create index if not exists dd_referral_identities_provider_idx
  on public.dd_referral_identities(referrer_provider_id)
  where referrer_provider_id is not null;

create index if not exists dd_referral_identities_user_idx
  on public.dd_referral_identities(referrer_user_id)
  where referrer_user_id is not null;

create index if not exists dd_referral_identities_email_idx
  on public.dd_referral_identities(lower(referrer_email))
  where referrer_email is not null;

insert into public.dd_incentive_programs
(program_key,audience_type,program_name,program_status,reward_type,reward_value,reward_unit,qualification_event,terms_summary,effective_from,owner_approved,metadata)
values
('CUSTOMER_REFERRAL_CREDIT_2026','CLIENT','Customer Referral Credit','ACTIVE','ACCOUNT_CREDIT',25,'USD','REFERRED_CUSTOMER_COMPLETES_FIRST_PAID_SERVICE',
 '$25 customer account credit is earned only after the referred customer completes a qualifying paid DANI DECLARES service. No credit for self-referrals, duplicates, canceled/refunded work, or uncompleted requests.',
 now(),true,'{"link_enabled":true,"customer_facing":true,"credit_after_completion":true}'::jsonb)
on conflict (program_key) do update set
 program_status='ACTIVE',
 reward_type='ACCOUNT_CREDIT',
 reward_value=25,
 reward_unit='USD',
 qualification_event='REFERRED_CUSTOMER_COMPLETES_FIRST_PAID_SERVICE',
 terms_summary=excluded.terms_summary,
 owner_approved=true,
 metadata=excluded.metadata,
 updated_at=now();

insert into public.dd_incentive_programs
(program_key,audience_type,program_name,program_status,reward_type,reward_value,reward_unit,qualification_event,terms_summary,effective_from,owner_approved,metadata)
values
('PROVIDER_CUSTOMER_REFERRAL_ATTRIBUTION_2026','PROVIDER','Provider Customer Referral Attribution','ACTIVE','NON_CASH_PERK',null,null,'REFERRED_CUSTOMER_COMPLETES_FIRST_PAID_SERVICE',
 'Provider referral links attribute referred customers to the provider. This program does not promise a cash reward; provider reward economics remain separately governed and unapproved until explicitly authorized.',
 now(),true,'{"link_enabled":true,"customer_facing":false,"provider_reward_status":"UNRESOLVED","attribution_only":true}'::jsonb)
on conflict (program_key) do update set
 program_status='ACTIVE',
 reward_type='NON_CASH_PERK',
 reward_value=null,
 reward_unit=null,
 qualification_event='REFERRED_CUSTOMER_COMPLETES_FIRST_PAID_SERVICE',
 terms_summary=excluded.terms_summary,
 owner_approved=true,
 metadata=excluded.metadata,
 updated_at=now();
