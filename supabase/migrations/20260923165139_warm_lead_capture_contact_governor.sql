
alter table public.dd_sales_queue
  add column if not exists intent_score integer,
  add column if not exists intent_tier text,
  add column if not exists capture_offer_code text,
  add column if not exists capture_page text,
  add column if not exists preferred_contact_channel text,
  add column if not exists consent_email boolean,
  add column if not exists consent_sms boolean,
  add column if not exists consent_phone boolean,
  add column if not exists consent_marketing boolean,
  add column if not exists consent_captured_at timestamptz,
  add column if not exists next_permitted_contact_at timestamptz,
  add column if not exists contact_pressure_state text not null default 'NORMAL';

alter table public.dd_sales_queue
  drop constraint if exists dd_sales_queue_intent_score_check;
alter table public.dd_sales_queue
  add constraint dd_sales_queue_intent_score_check
  check (intent_score is null or intent_score between 0 and 100);

alter table public.dd_sales_queue
  drop constraint if exists dd_sales_queue_intent_tier_check;
alter table public.dd_sales_queue
  add constraint dd_sales_queue_intent_tier_check
  check (intent_tier is null or intent_tier in ('LOW','MEDIUM','HIGH','TRANSACTION'));

alter table public.dd_sales_queue
  drop constraint if exists dd_sales_queue_contact_pressure_state_check;
alter table public.dd_sales_queue
  add constraint dd_sales_queue_contact_pressure_state_check
  check (contact_pressure_state in ('NORMAL','COOLDOWN','PAUSED','DO_NOT_CONTACT'));

create table if not exists public.dd_lead_contact_events (
  id uuid primary key default gen_random_uuid(),
  sales_queue_id uuid not null references public.dd_sales_queue(id) on delete cascade,
  event_type text not null,
  channel text,
  direction text,
  outcome text,
  occurred_at timestamptz not null default now(),
  consent_basis text,
  campaign_name text,
  external_system text,
  external_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.dd_lead_contact_events enable row level security;

create index if not exists dd_lead_contact_events_sales_queue_occurred_idx
  on public.dd_lead_contact_events (sales_queue_id, occurred_at desc);

create table if not exists public.dd_warm_lead_policy (
  policy_key text primary key,
  version integer not null,
  status text not null check (status in ('DRAFT','ACTIVE','RETIRED')),
  policy_document jsonb not null,
  effective_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_warm_lead_policy enable row level security;

insert into public.dd_warm_lead_policy(policy_key,version,status,policy_document,effective_at)
values (
 'warm_lead_contact_governor',
 1,
 'ACTIVE',
 jsonb_build_object(
   'principle','capture early; respond fast; match pressure to intent; make disengagement easy',
   'authority','dd_sales_queue',
   'progressive_profile',true,
   'consent_rule','unknown consent is never treated as granted',
   'channel_rule','preferred channel guides outreach; channel-specific consent and applicable law control permission',
   'dedupe_rule','all outbound helpers must inspect canonical lead and recent contact events before outreach',
   'intent_tiers',jsonb_build_object(
      'LOW','newsletter, resource, save-service or passive capture',
      'MEDIUM','offer, detailed pricing, vendor packet or capabilities inquiry',
      'HIGH','estimate, consultation, explicit callback or scoped service inquiry',
      'TRANSACTION','booking, checkout, service request or abandoned high-intent transaction'
   ),
   'pressure_rules',jsonb_build_object(
      'rapid_multichannel_barrage',false,
      'explicit_callback','prompt call permitted when consented',
      'do_not_contact','hard stop',
      'cooldown','respect next_permitted_contact_at',
      'cross_system_coordination','Gmail, Resend, HubSpot, agents and human outreach share the same contact history'
   ),
   'incentive_rule','No blanket first-service discount is authorized by this policy. Incentives require economics approval and governed pricing eligibility.',
   'measurement',jsonb_build_array('capture_to_lead','lead_to_request','lead_to_quote','lead_to_paid','gross_margin_by_capture_offer','unsubscribe_or_optout_rate')
 ),
 now()
)
on conflict (policy_key) do update
set version=excluded.version,status=excluded.status,policy_document=excluded.policy_document,effective_at=excluded.effective_at,updated_at=now();

insert into public.dd_business_decision_register
(decision_code,decision_name,category,decision_status,decided_by,decided_at,implementation_status,implementation_evidence,description,source_reference)
values (
 'DD-2026-WARM-LEAD-005',
 'Warm Lead Capture and Contact Pressure Governance',
 'SALES_MARKETING',
 'APPROVED',
 'OWNER',
 now(),
 'IMPLEMENTED',
 'Supabase dd_sales_queue extended with intent/capture/consent/contact-pressure fields; dd_lead_contact_events and dd_warm_lead_policy created.',
 'DANI captures pre-purchase intent progressively, routes warm leads into dd_sales_queue, coordinates outreach across systems, respects channel consent/preferences and contact cooldowns, and requires accounting/economics approval before promotional discounts become commercial rules.',
 'Owner discussion 2026-09-23'
)
on conflict (decision_code) do update
set decision_name=excluded.decision_name,
    category=excluded.category,
    decision_status=excluded.decision_status,
    decided_by=excluded.decided_by,
    decided_at=excluded.decided_at,
    implementation_status=excluded.implementation_status,
    implementation_evidence=excluded.implementation_evidence,
    description=excluded.description,
    source_reference=excluded.source_reference,
    updated_at=now();
