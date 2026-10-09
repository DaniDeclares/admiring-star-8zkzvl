-- Build With Me participation interest v1.
-- Extends the existing dd_partner_inquiries table (no new registry) so the public
-- interest-only entry point can record participation type, what the person brings,
-- campaign attribution and explicit contact consent. Creates the table only where it is
-- missing (Tester drift). Additive and idempotent. Service-role access only (RLS on, no
-- public policies): the API handler writes; Owner HQ reads through server endpoints.

create table if not exists public.dd_partner_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  interest_area text,
  message text,
  status text not null default 'NEW',
  source text not null default 'WEBSITE_PARTNER_NETWORK',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dd_partner_inquiries enable row level security;

alter table public.dd_partner_inquiries
  add column if not exists participation_interest text,
  add column if not exists interest_areas text[] not null default '{}',
  add column if not exists skills_and_equipment text,
  add column if not exists location_area text,
  add column if not exists campaign_code text,
  add column if not exists utm jsonb not null default '{}'::jsonb,
  add column if not exists landing_path text,
  add column if not exists contact_consent boolean not null default false,
  add column if not exists consent_at timestamptz,
  add column if not exists consent_text text,
  add column if not exists linked_provider_application_id uuid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'dd_partner_inquiries_participation_interest_check') then
    alter table public.dd_partner_inquiries add constraint dd_partner_inquiries_participation_interest_check
      check (participation_interest is null or participation_interest in
        ('SERVICE_PROVIDER','MAKER_CREATOR','BUSINESS_PARTNER','COMMUNITY_CONTRIBUTOR','SKILL_BUILDER'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'dd_partner_inquiries_consent_check') then
    -- A row that claims consent must say when and to what.
    alter table public.dd_partner_inquiries add constraint dd_partner_inquiries_consent_check
      check (not contact_consent or (consent_at is not null and consent_text is not null));
  end if;
end $$;

create index if not exists dd_partner_inquiries_email_created_idx on public.dd_partner_inquiries (email, created_at desc);
create index if not exists dd_partner_inquiries_campaign_idx on public.dd_partner_inquiries (campaign_code, created_at desc);

comment on table public.dd_partner_inquiries is
  'Participation interest (partner network / Build With Me). Interest only: never a verified provider, capability, buyer or job. Service providers continue into dd_provider_applications.';
