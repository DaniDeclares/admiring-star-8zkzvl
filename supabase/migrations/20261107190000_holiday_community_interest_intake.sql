-- DANI DECLARES Holiday 2026 private non-commercial interest.
-- Separate from leads/service_requests, partner referrals and provider applicants.
-- Deploy only alongside /api/holiday-community-interest; no public row reads.
begin;
create table if not exists public.dd_holiday_community_interests (
  id uuid primary key default gen_random_uuid(),
  role text not null check(role in ('FAMILY_SUPPORT','COMMUNITY_ORG','SPONSOR','VOLUNTEER')),
  name text not null,
  email text not null,
  phone text,
  city text not null,
  area text not null check(area in ('HOUSING_TRANSITION','HOUSEHOLD_ITEMS','MOVING_LOGISTICS','SERVICES','REFERRALS','OTHER')),
  note text,
  status text not null default 'NEW' check(status in ('NEW','IN_REVIEW','FOLLOWUP','CLOSED')),
  source text not null default 'WEBSITE_HOLIDAY_2026',
  attribution jsonb not null default '{}'::jsonb,
  contact_consent boolean not null check(contact_consent = true),
  consent_at timestamptz not null,
  consent_text text not null,
  created_at timestamptz not null default now()
);
create index if not exists dd_holiday_interests_email_role_created
  on public.dd_holiday_community_interests(email,role,created_at desc);
alter table public.dd_holiday_community_interests enable row level security;
revoke all on public.dd_holiday_community_interests from anon, authenticated;
grant select,insert,update on public.dd_holiday_community_interests to service_role;
comment on table public.dd_holiday_community_interests is 'Sensitive community interest, not an approved benefits program or commercial customer lead. Server-only access via service role. No client Data API grants.';
commit;
