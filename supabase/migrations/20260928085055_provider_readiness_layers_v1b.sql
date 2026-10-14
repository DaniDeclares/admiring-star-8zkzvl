
create or replace view public.dd_provider_readiness_layers_v1
with (security_invoker=true) as
select r.*,
 (r.is_active and r.application_status in ('APPROVED','ACTIVE')
  and (r.applicant_type <> 'INDIVIDUAL' or coalesce(r.w9_status,'PENDING') in ('VERIFIED','APPROVED'))
  and r.agreement_status in ('EXECUTED','APPROVED')
  and r.identity_status in ('VERIFIED','APPROVED')
  and r.compliance_status in ('APPROVED','VERIFIED','CURRENT')
  and (r.insurance_expiry is null or r.insurance_expiry >= current_date)
  and r.w9_compliance_ready and r.agreement_compliance_ready and r.coi_compliance_ready
  and r.registration_compliance_ready and r.rate_card_ready and r.service_menu_ready) as operational_ready,
 (r.is_active and r.application_status in ('APPROVED','ACTIVE')
  and (r.applicant_type <> 'INDIVIDUAL' or coalesce(r.w9_status,'PENDING') in ('VERIFIED','APPROVED'))
  and r.agreement_status in ('EXECUTED','APPROVED')
  and r.identity_status in ('VERIFIED','APPROVED')
  and r.compliance_status in ('APPROVED','VERIFIED','CURRENT')
  and (r.insurance_expiry is null or r.insurance_expiry >= current_date)
  and r.w9_compliance_ready and r.agreement_compliance_ready and r.coi_compliance_ready
  and r.registration_compliance_ready and r.rate_card_ready and r.service_menu_ready
  and r.payout_rail_ready) as fully_dispatch_ready,
 case
  when not r.is_active then 'INACTIVE_PROVIDER'
  when r.application_status is null then 'APPLICATION_RECORD_REQUIRED'
  when r.application_status not in ('APPROVED','ACTIVE') then 'APPLICATION_APPROVAL_REQUIRED'
  when r.applicant_type='INDIVIDUAL' and coalesce(r.w9_status,'PENDING') not in ('VERIFIED','APPROVED') then 'W9_REQUIRED'
  when r.agreement_status not in ('EXECUTED','APPROVED') then 'AGREEMENT_REQUIRED'
  when r.identity_status not in ('VERIFIED','APPROVED') then 'IDENTITY_REQUIRED'
  when r.compliance_status not in ('APPROVED','VERIFIED','CURRENT') then 'COMPLIANCE_REVIEW_REQUIRED'
  when r.insurance_expiry is not null and r.insurance_expiry < current_date then 'INSURANCE_EXPIRED'
  when not r.w9_compliance_ready then 'W9_COMPLIANCE_REQUIRED'
  when not r.agreement_compliance_ready then 'AGREEMENT_COMPLIANCE_REQUIRED'
  when not r.coi_compliance_ready then 'COI_COMPLIANCE_REQUIRED'
  when not r.registration_compliance_ready then 'REGISTRATION_COMPLIANCE_REQUIRED'
  when not r.rate_card_ready then 'RATE_CARD_REQUIRED'
  when not r.service_menu_ready then 'SERVICE_MENU_REQUIRED'
  when not r.payout_rail_ready then 'PAYOUT_RAIL_REQUIRED'
  else 'READY' end as canonical_next_blocker
from public.dd_provider_assignment_readiness_v1 r;

create or replace view public.dd_provider_readiness_summary_v1
with (security_invoker=true) as
select now() observed_at,
 count(*) filter(where is_active) active_provider_records,
 count(*) filter(where is_active and application_status in ('APPROVED','ACTIVE')) approved_active_providers,
 count(*) filter(where is_active and operational_ready) operational_ready_providers,
 count(*) filter(where is_active and fully_dispatch_ready) fully_dispatch_ready_providers,
 count(*) filter(where is_active and payout_rail_ready) payout_ready_providers,
 count(*) filter(where is_active and canonical_next_blocker='APPLICATION_RECORD_REQUIRED') missing_application_records,
 count(*) filter(where is_active and canonical_next_blocker='APPLICATION_APPROVAL_REQUIRED') awaiting_application_approval,
 count(*) filter(where is_active and canonical_next_blocker='W9_REQUIRED') awaiting_w9,
 count(*) filter(where is_active and canonical_next_blocker='AGREEMENT_REQUIRED') awaiting_agreement,
 count(*) filter(where is_active and canonical_next_blocker='IDENTITY_REQUIRED') awaiting_identity,
 count(*) filter(where is_active and canonical_next_blocker='COMPLIANCE_REVIEW_REQUIRED') awaiting_compliance,
 count(*) filter(where is_active and canonical_next_blocker='PAYOUT_RAIL_REQUIRED') awaiting_payout_rail
from public.dd_provider_readiness_layers_v1;
