
create or replace view public.dd_provider_remediation_queue_v1
with (security_invoker=true) as
select
 provider_id,provider_code,legal_name,application_id,application_status,
 canonical_next_blocker,
 case canonical_next_blocker
  when 'APPLICATION_RECORD_REQUIRED' then 10
  when 'APPLICATION_APPROVAL_REQUIRED' then 20
  when 'W9_REQUIRED' then 30
  when 'AGREEMENT_REQUIRED' then 40
  when 'IDENTITY_REQUIRED' then 50
  when 'COMPLIANCE_REVIEW_REQUIRED' then 60
  when 'INSURANCE_EXPIRED' then 70
  when 'W9_COMPLIANCE_REQUIRED' then 80
  when 'AGREEMENT_COMPLIANCE_REQUIRED' then 90
  when 'COI_COMPLIANCE_REQUIRED' then 100
  when 'REGISTRATION_COMPLIANCE_REQUIRED' then 110
  when 'RATE_CARD_REQUIRED' then 120
  when 'SERVICE_MENU_REQUIRED' then 130
  when 'PAYOUT_RAIL_REQUIRED' then 140
  when 'READY' then 999
  else 500 end as blocker_order,
 case canonical_next_blocker
  when 'APPLICATION_RECORD_REQUIRED' then 'Reconcile provider directory record to a real provider application before dispatch.'
  when 'APPLICATION_APPROVAL_REQUIRED' then 'Complete application evidence gates; approve only through governed provider-application approval.'
  when 'W9_REQUIRED' then 'Collect and verify W-9.'
  when 'AGREEMENT_REQUIRED' then 'Collect and execute provider agreement.'
  when 'IDENTITY_REQUIRED' then 'Complete identity verification.'
  when 'COMPLIANCE_REVIEW_REQUIRED' then 'Complete compliance review.'
  when 'INSURANCE_EXPIRED' then 'Collect current insurance evidence or record governed not-required status.'
  when 'RATE_CARD_REQUIRED' then 'Complete governed provider rate card.'
  when 'SERVICE_MENU_REQUIRED' then 'Authorize provider service menu/capabilities.'
  when 'PAYOUT_RAIL_REQUIRED' then 'Resolve owner-approved canonical payout policy and provider payout destination; do not auto-pay before authorization.'
  when 'READY' then 'No remediation required.'
  else 'Reconcile provider readiness evidence.' end as next_action,
 operational_ready,fully_dispatch_ready,payout_rail_ready
from public.dd_provider_readiness_layers_v1
where is_active and not fully_dispatch_ready;

create or replace view public.dd_morning_provider_readiness_v1
with (security_invoker=true) as
select m.*,
 s.active_provider_records,
 s.approved_active_providers,
 s.operational_ready_providers,
 s.fully_dispatch_ready_providers,
 s.payout_ready_providers,
 s.missing_application_records,
 s.awaiting_application_approval,
 s.awaiting_w9,
 s.awaiting_agreement,
 s.awaiting_identity,
 s.awaiting_compliance,
 s.awaiting_payout_rail
from public.dd_morning_clockin_readiness_v1 m
cross join public.dd_provider_readiness_summary_v1 s;
