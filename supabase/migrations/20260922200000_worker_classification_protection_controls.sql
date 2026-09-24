-- DANI DECLARES worker-classification and worker-protection controls.
-- Build-phase policy layer; does not make a legal classification automatically.
create table if not exists public.dd_worker_classification_policies (
  id uuid primary key default gen_random_uuid(),
  worker_type text not null check (worker_type in ('1099_INDEPENDENT_CONTRACTOR','W2_EMPLOYEE')),
  policy_code text not null,
  category text not null,
  rule_text text not null,
  required_control boolean not null default true,
  source_authority text,
  effective_date date not null default current_date,
  review_date date,
  status text not null default 'ACTIVE',
  metadata jsonb not null default '{}'::jsonb,
  unique(worker_type,policy_code)
);
insert into public.dd_worker_classification_policies
(worker_type,policy_code,category,rule_text,required_control,source_authority,review_date,metadata)
values
('1099_INDEPENDENT_CONTRACTOR','METHOD_CONTROL','CLASSIFICATION','DANI governs contracted outcomes and deliverables without retaining an unnecessary right to control detailed methods, sequence, training, or manner of performance.',true,'IRS Publication 15-A 2026; DOL FLSA classification guidance',date '2027-09-22','{"actual_relationship_controls":true}'::jsonb),
('1099_INDEPENDENT_CONTRACTOR','SCHEDULE_AUTONOMY','CLASSIFICATION','DANI may set customer deadlines and access windows, but classification review must consider whether DANI retains a right to direct day-to-day when, where, and how performance occurs.',true,'IRS Publication 15-A 2026; DOL FLSA classification guidance',date '2027-09-22','{"not_absolute":true}'::jsonb),
('1099_INDEPENDENT_CONTRACTOR','TOOLS_FINANCIAL_CONTROL','CLASSIFICATION','Contractor tools, vehicle, supplies, and business expenses should ordinarily remain part of the contractor business where consistent with the actual relationship; use of company equipment is a classification factor, not an automatic status test.',true,'IRS Publication 15-A 2026',date '2027-09-22','{"financial_control_factor":true}'::jsonb),
('1099_INDEPENDENT_CONTRACTOR','MULTI_CLIENT_INDEPENDENCE','CLASSIFICATION','Do not structure independent providers as exclusive employees in disguise. Lawful confidentiality, conflict, client-protection, and narrowly tailored non-solicitation terms may protect DANI without blanket exclusivity.',true,'IRS Publication 15-A 2026',date '2027-09-22','{"no_blanket_exclusivity":true}'::jsonb),
('1099_INDEPENDENT_CONTRACTOR','NO_UNAUTHORIZED_DELEGATION','CONTRACT_CONTROL','A provider may not hand a DANI assignment to another person without written DANI authorization under the governing agreement, protecting client safety, credentials, access, and insurance controls.',true,'DANI Provider Network Operating Framework',date '2027-09-22','{"written_approval_required":true}'::jsonb),
('1099_INDEPENDENT_CONTRACTOR','PAYMENT_SUPPORT','PAYMENT','Provider payment requires an approved invoice, work statement, milestone record, or other governed payment-support record plus required job/evidence/QA gates.',true,'DANI payout architecture; IRS 1099-NEC guidance',date '2027-09-22','{"2026_1099_nec_threshold":2000}'::jsonb),
('W2_EMPLOYEE','MINIMUM_WAGE','PAYROLL','Covered nonexempt employees must receive at least the applicable minimum wage. Current federal minimum wage is $7.25; Georgia and South Carolina have no higher state rate in the current DOL table.',true,'U.S. Department of Labor',date '2027-09-22','{"current_federal_rate":7.25}'::jsonb),
('W2_EMPLOYEE','OVERTIME','PAYROLL','Covered nonexempt employees must receive at least 1.5 times the regular rate for hours worked over 40 in a workweek, subject to exemptions.',true,'Fair Labor Standards Act / U.S. Department of Labor',date '2027-09-22','{"weekly_threshold":40,"multiplier":1.5}'::jsonb),
('W2_EMPLOYEE','TIME_RECORDS','PAYROLL','DANI must capture hours worked and payroll-support records for covered employees, including compensable rework/time worked.',true,'U.S. Department of Labor',date '2027-09-22','{"start_end_time":true}'::jsonb),
('W2_EMPLOYEE','PAYDAY_AND_DEDUCTIONS','PAYROLL','Employee base wages must be processed through the established payroll process and cannot be frozen to resolve a customer dispute; deductions require an applicable lawful basis.',true,'U.S. Department of Labor and applicable state wage law',date '2027-09-22','{"customer_dispute_cannot_freeze_base_pay":true}'::jsonb),
('W2_EMPLOYEE','PPE_AND_HAZCOM','SAFETY','For covered employee work, implement applicable hazard controls, PPE, chemical labels/SDS access, and hazard-communication training for hazardous chemicals.',true,'OSHA 29 CFR 1910.1200 and 1910.132',date '2027-09-22','{"high_risk_families":["cleaning","dtf_heat","field_operations"]}'::jsonb),
('W2_EMPLOYEE','HEAT_SAFETY','SAFETY','For heat-exposed employee work, use feasible heat-risk controls such as training, rest, shade, and fluids consistent with applicable OSHA requirements/guidance.',true,'OSHA Heat standards/guidance',date '2027-09-22','{"controls":["training","rest","shade","fluids"]}'::jsonb),
('W2_EMPLOYEE','WORKERS_COMP_GEORGIA','STATE','Georgia generally requires workers compensation coverage for employers regularly employing three or more persons, including regular part-time workers; LLC members/officers count toward the threshold.',true,'Georgia State Board of Workers Compensation',date '2027-09-22','{"threshold":3}'::jsonb),
('W2_EMPLOYEE','WORKERS_COMP_SOUTH_CAROLINA','STATE','South Carolina generally requires workers compensation coverage for businesses regularly employing four or more employees, subject to statutory exemptions.',true,'South Carolina Workers Compensation Commission',date '2027-09-22','{"threshold":4}'::jsonb),
('W2_EMPLOYEE','SC_WAGE_NOTICE','STATE','South Carolina hiring documentation must state normal hours and wages, time/place of payment, and deductions, with written notice of changes as required by state law.',true,'South Carolina Payment of Wages Act',date '2027-09-22','{"hire_notice_required":true}'::jsonb)
on conflict(worker_type,policy_code) do update
set rule_text=excluded.rule_text,source_authority=excluded.source_authority,review_date=excluded.review_date,
metadata=excluded.metadata,status='ACTIVE';

create table if not exists public.dd_worker_safety_profiles (
  id uuid primary key default gen_random_uuid(),
  worker_type text not null check(worker_type in ('1099_INDEPENDENT_CONTRACTOR','W2_EMPLOYEE')),
  risk_family text not null, trigger_code text not null, required_control text not null,
  evidence_required jsonb not null default '[]'::jsonb, status text not null default 'ACTIVE',
  unique(worker_type,risk_family,trigger_code)
);
insert into public.dd_worker_safety_profiles(worker_type,risk_family,trigger_code,required_control,evidence_required)
values
('W2_EMPLOYEE','CLEANING','HAZARDOUS_CHEMICAL_EXPOSURE','OSHA hazard communication program, labels, SDS availability, and employee training for covered hazardous chemicals.','["chemical_inventory","sds_access","training_acknowledgment","label_check"]'::jsonb),
('W2_EMPLOYEE','CLEANING','PPE_REQUIRED','Provide and maintain applicable PPE and ensure adequacy for identified hazards.','["hazard_assessment","ppe_assignment","ppe_check"]'::jsonb),
('W2_EMPLOYEE','FIELD_OPERATIONS','HEAT_EXPOSURE','Apply heat-risk controls appropriate to conditions and work activity.','["heat_training","rest_shade_fluids_plan"]'::jsonb),
('W2_EMPLOYEE','DTF_HEAT','HOT_EQUIPMENT','Document equipment-specific safe-use procedures, guarding/controls, and incident response.','["equipment_sop","training_acknowledgment","inspection_log"]'::jsonb),
('1099_INDEPENDENT_CONTRACTOR','CLEANING','CHEMICAL_EXPOSURE','Provider business remains responsible for applicable safe-work practices; DANI identifies known site hazards/access restrictions without unnecessary method control.','["provider_acknowledgment","service_hazard_disclosure"]'::jsonb),
('1099_INDEPENDENT_CONTRACTOR','FIELD_OPERATIONS','PROPERTY_ACCESS','Verify authorization, identity, service-area fit, required credentials, and insurance before independent property access.','["identity","insurance","service_area","credentials"]'::jsonb)
on conflict(worker_type,risk_family,trigger_code) do update
set required_control=excluded.required_control,evidence_required=excluded.evidence_required,status='ACTIVE';

create or replace view public.dd_worker_assignment_classification_guard_v1 with (security_invoker = true) as
select a.id application_id,a.provider_id,a.applicant_type,a.application_status,a.legal_name,
a.tax_form_status,a.identity_status,a.agreement_status,a.compliance_status,a.insurance_status,
case when a.applicant_type='INDIVIDUAL' then '1099_INDEPENDENT_CONTRACTOR_REVIEW'
     when a.applicant_type in ('BUSINESS','ORGANIZATION','COMPANY') then 'B2B_VENDOR_REVIEW'
     else 'CLASSIFICATION_REVIEW_REQUIRED' end classification_workflow,
case when a.applicant_type='INDIVIDUAL' and a.tax_form_status not in ('VERIFIED','APPROVED') then 'W9_REQUIRED'
     when a.agreement_status not in ('EXECUTED','APPROVED') then 'AGREEMENT_REQUIRED'
     when a.identity_status not in ('VERIFIED','APPROVED') then 'IDENTITY_REQUIRED'
     when a.compliance_status not in ('APPROVED','VERIFIED','CURRENT') then 'COMPLIANCE_REVIEW'
     else 'READY_FOR_CLASSIFICATION_DECISION' end next_classification_gate
from public.dd_provider_applications a;
alter table public.dd_worker_classification_policies enable row level security;
alter table public.dd_worker_safety_profiles enable row level security;
revoke all on public.dd_worker_classification_policies from anon, authenticated;
revoke all on public.dd_worker_safety_profiles from anon, authenticated;
