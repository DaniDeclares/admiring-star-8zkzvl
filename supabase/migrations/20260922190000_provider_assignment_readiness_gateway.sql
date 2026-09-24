-- Provider assignment readiness gateway.
-- Read-only authority view combining application, W-9, agreements, compliance,
-- insurance expiration, Stripe Connect status and payout eligibility.
-- Does not create/update applicant records or initiate Stripe actions.
create or replace view public.dd_provider_assignment_readiness_v1 with (security_invoker = true) as
with req as (
  select provider_org_id,
    bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='W9') as w9_compliance_ready,
    bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='AGREEMENT') as agreement_compliance_ready,
    bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='COI') as coi_compliance_ready,
    bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='BUSINESS_REGISTRATION') as registration_compliance_ready,
    bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='RATE_CARD') as rate_card_ready,
    bool_and(not required or status in ('VERIFIED','APPROVED','CURRENT','WAIVED')) filter(where requirement_code='SERVICE_MENU') as service_menu_ready
  from public.dd_provider_compliance_items
  group by provider_org_id
),
app as (
 select distinct on (provider_id)
   provider_id,id application_id,application_status,applicant_type,legal_name,dba_name,
   tax_form_status,insurance_status,identity_status,agreement_status,background_check_status,
   compliance_status,network_access_level,service_area,service_radius_miles,service_zip_codes,
   submitted_at,reviewed_at
 from public.dd_provider_applications
 where provider_id is not null
 order by provider_id,updated_at desc
),
w9 as (
 select distinct on (provider_org_id)
   provider_org_id,status w9_status,classification,tin_type,tin_last_four,signed_at,verified_at
 from public.dd_provider_w9_submissions
 order by provider_org_id,created_at desc
),
stripe as (
 select provider_id,stripe_account_id,connect_api_model,onboarding_mode,onboarding_status,
   transfers_status,tax_reporting_status,payout_destination_status,payouts_enabled,
   requirements_due,last_sync_at,last_error
 from public.dd_provider_stripe_connect_accounts
),
org as (
 select id provider_org_id,legal_name,insurance_expiry
 from public.dd_provider_organizations
)
select
 p.id provider_id,p.provider_code,p.is_active,p.org_id,
 a.application_id,a.application_status,a.applicant_type,a.legal_name,a.dba_name,
 a.tax_form_status,a.insurance_status,a.identity_status,a.agreement_status,
 a.background_check_status,a.compliance_status,a.network_access_level,
 a.service_area,a.service_radius_miles,a.service_zip_codes,
 w.w9_status,w.classification,w.tin_type,w.tin_last_four,
 o.insurance_expiry,
 s.stripe_account_id,s.connect_api_model,s.onboarding_mode,s.onboarding_status,
 s.transfers_status,s.tax_reporting_status,s.payout_destination_status,s.payouts_enabled,
 s.requirements_due,s.last_sync_at,s.last_error,
 coalesce(req.w9_compliance_ready,true) w9_compliance_ready,
 coalesce(req.agreement_compliance_ready,true) agreement_compliance_ready,
 coalesce(req.coi_compliance_ready,true) coi_compliance_ready,
 coalesce(req.registration_compliance_ready,true) registration_compliance_ready,
 coalesce(req.rate_card_ready,true) rate_card_ready,
 coalesce(req.service_menu_ready,true) service_menu_ready,
 case
   when not p.is_active then 'INACTIVE_PROVIDER'
   when a.application_status is null or a.application_status not in ('SUBMITTED','IN_REVIEW','APPROVED','ACTIVE') then 'APPLICATION_NOT_APPROVED'
   when a.applicant_type='INDIVIDUAL' and coalesce(w.w9_status,'PENDING') not in ('VERIFIED','APPROVED') then 'W9_REQUIRED'
   when a.agreement_status not in ('EXECUTED','APPROVED') then 'AGREEMENT_REQUIRED'
   when a.identity_status not in ('VERIFIED','APPROVED') then 'IDENTITY_REQUIRED'
   when a.compliance_status not in ('APPROVED','VERIFIED','CURRENT') then 'COMPLIANCE_REVIEW'
   when o.insurance_expiry is not null and o.insurance_expiry < current_date then 'INSURANCE_EXPIRED'
   when s.stripe_account_id is null then 'STRIPE_CONNECT_ONBOARDING_REQUIRED'
   when not coalesce(s.payouts_enabled,false) or s.onboarding_status not in ('COMPLETE','COMPLETED','VERIFIED') then 'STRIPE_PAYOUT_SETUP_REQUIRED'
   when coalesce(s.requirements_due,'[]'::jsonb) <> '[]'::jsonb then 'STRIPE_REQUIREMENTS_DUE'
   else 'READY'
 end onboarding_next_action,
 (
   p.is_active
   and a.application_status in ('APPROVED','ACTIVE')
   and (a.applicant_type <> 'INDIVIDUAL' or coalesce(w.w9_status,'PENDING') in ('VERIFIED','APPROVED'))
   and a.agreement_status in ('EXECUTED','APPROVED')
   and a.identity_status in ('VERIFIED','APPROVED')
   and a.compliance_status in ('APPROVED','VERIFIED','CURRENT')
   and (o.insurance_expiry is null or o.insurance_expiry >= current_date)
   and s.stripe_account_id is not null
   and coalesce(s.payouts_enabled,false)
   and s.onboarding_status in ('COMPLETE','COMPLETED','VERIFIED')
   and coalesce(s.requirements_due,'[]'::jsonb) = '[]'::jsonb
 ) assignment_ready,
 (
   s.stripe_account_id is not null
   and coalesce(s.payouts_enabled,false)
   and s.onboarding_status in ('COMPLETE','COMPLETED','VERIFIED')
   and coalesce(s.requirements_due,'[]'::jsonb) = '[]'::jsonb
 ) payout_rail_ready
from public.dd_providers p
left join app a on a.provider_id=p.id
left join w9 w on w.provider_org_id=p.org_id
left join org o on o.provider_org_id=p.org_id
left join stripe s on s.provider_id=p.id
left join req on req.provider_org_id=p.org_id;
revoke all on public.dd_provider_assignment_readiness_v1 from anon, authenticated;
grant select on public.dd_provider_assignment_readiness_v1 to service_role;
