
create table if not exists public.dd_division_operating_playbook (
  division_id bigint not null references public.divisions(id) on delete cascade,
  playbook_key text not null,
  playbook_name text not null,
  lifecycle_stage text not null default 'ACTIVE',
  required boolean not null default true,
  specification jsonb not null,
  source_basis text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(division_id,playbook_key)
);
alter table public.dd_division_operating_playbook enable row level security;

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,specification,source_basis
)
select d.id,'INQUIRY_RESPONSE','Structured inquiry response',
  jsonb_build_object(
    'capture',jsonb_build_array('SERVICE_NEEDED','LOCATION','WHEN_NEEDED','SCOPE_INPUTS','BEST_CONTACT_METHOD'),
    'result','ENOUGH_CONTEXT_TO_CHECK_AVAILABILITY_AND_QUOTE'
  ),
  'OWNER_SHARED_NOTARY_PATTERN_APPLIED_COMPANY_WIDE_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,playbook_key) do update
set specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,specification,source_basis
)
select d.id,'BOOKING_CONFIRMATION','Booking and confirmation',
  jsonb_build_object(
    'include',jsonb_build_array('TIME','LOCATION_OR_REMOTE_INSTRUCTIONS','TOTAL_OR_QUOTE_STATUS','PAYMENT_METHOD','CLIENT_REQUIREMENTS','NEXT_STEP'),
    'goal','CLEAR_SINGLE_CONFIRMATION'
  ),
  'OWNER_SHARED_NOTARY_PATTERN_APPLIED_COMPANY_WIDE_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,playbook_key) do update
set specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,specification,source_basis
)
select d.id,'PAYMENT_FOLLOWUP','Payment, receipt and follow-up',
  jsonb_build_object(
    'flow',jsonb_build_array('COLLECT_OR_CONFIRM_PAYMENT','ISSUE_RECEIPT','THANK_CLIENT','REQUEST_REVIEW_WHEN_APPROPRIATE','OFFER_REPEAT_OR_CROSS_SELL')
  ),
  'OWNER_SHARED_NOTARY_PATTERN_APPLIED_COMPANY_WIDE_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,playbook_key) do update
set specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,specification,source_basis
)
select d.id,'EVIDENCE_HANDOFF','Evidence and custody handoff',
  jsonb_build_object(
    'rule','Capture handoff evidence when documents, packages, keys, property evidence or physical deliverables leave DANI custody.',
    'examples',jsonb_build_array('CARRIER_RECEIPT','TRACKING','PHOTO','SIGNED_HANDOFF','TIME_AND_LOCATION_STAMP'),
    'closeout','ATTACH_EVIDENCE_TO_COMPLETION_RECORD'
  ),
  'OWNER_SHARED_RECEIPT_PATTERN_APPLIED_COMPANY_WIDE_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,playbook_key) do update
set specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,specification,source_basis
)
select d.id,'NETWORK_FULFILLMENT','Trusted partner and lead-share capacity',
  jsonb_build_object(
    'model',jsonb_build_array('OWNER_FIRST_REFUSAL','TRUSTED_PROVIDER_NETWORK','AUTHORIZED_PARTNER_HANDOFF'),
    'business_rule','Owner does not have to personally perform every job for DANI to serve the client.',
    'controls',jsonb_build_array('QUALIFICATION','RATE_CARD','SCOPE','EVIDENCE','QA','PAYOUT','CLIENT_CONTINUITY'),
    'prohibited',jsonb_build_array('UNVERIFIED_PROVIDER','UNGOVERNED_REVENUE_SHARE','UNAUTHORIZED_SUBCONTRACTING')
  ),
  'OWNER_SHARED_LEAD_SHARE_AND_COURIER_PATTERN_APPLIED_COMPANY_WIDE_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,playbook_key) do update
set specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();

insert into public.dd_division_operating_playbook(
  division_id,playbook_key,playbook_name,specification,source_basis
)
select d.id,'NICHE_EXPANSION','Adjacent niche expansion loop',
  jsonb_build_object(
    'loop',jsonb_build_array('FIND_ADJACENT_DEMAND','VERIFY_AUTHORITY','BUILD_INTAKE','BUILD_PRICING','BUILD_FULFILLMENT','BUILD_MARKETING','PROVE_RUNTIME','SELL'),
    'rule','Each division expands from proven adjacent demand rather than staying limited to its first service set.'
  ),
  'OWNER_DIRECTIVE_APPLY_NOTARY_LEARNING_TO_ALL_DIVISIONS_2026-10-06'
from public.divisions d where d.is_active
on conflict(division_id,playbook_key) do update
set specification=excluded.specification,source_basis=excluded.source_basis,updated_at=now();
