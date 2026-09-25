-- Corrects DD-KRYSTAL-20260924's confirmed schedule/scope and records
-- Shiletha Tucker's provider intake + job-scoped work package/slot.
--
-- Architecture per owner review: NOT dd_owner_fulfillment_authorizations
-- (that table authorizes the owner to fulfill a service/capability; it has
-- no provider or job relationship). This uses the existing
-- job -> fulfillment work package -> provider slot path
-- (dd_fulfillment_work_packages, dd_work_package_provider_slots), which is
-- where a job-scoped provider exception belongs.
--
-- No existing Shiletha record was found by email/phone/name (checked
-- independently twice). This is a genuine intake gap, not a duplicate.
--
-- IMPORTANT -- what this migration does NOT do: it does not insert the
-- dd_job_assignments row. That insert is guarded by
-- dd_guard_provider_assignment(), which requires the provider's
-- ORGANIZATION to be generally qualification_status='QUALIFIED',
-- compliance_status='VERIFIED', agreement_status in ('ACTIVE','EXECUTED'),
-- accepts_new_work=true -- confirmed live by attempting the insert
-- directly and hitting PROVIDER_NOT_QUALIFIED. There is no existing
-- narrow/audited exception path in that trigger. Faking those org-level
-- fields to pass the guard would be indistinguishable from real general
-- clearance to every other query that reads them -- exactly what the
-- owner said not to do. See 20260925000600_provider_assignment_override_exception.sql
-- for the proposed fix (a scoped override table + trigger change); that
-- migration was refused by the session's security-weaken guardrail
-- (modifying a SECURITY DEFINER authorization gate) and needs the owner
-- to apply it or approve another path. Until then this job is scheduled
-- in reality but has no dd_job_assignments row in the system of record.
-- dd_provider_assignment_readiness_v1.assignment_ready for Shiletha is
-- confirmed false (onboarding_next_action = 'W9_REQUIRED').

do $$
declare
  v_job_id uuid := '09c589e5-a7a2-416a-bfe0-46f1ad14818a'; -- DD-KRYSTAL-20260924
  v_org_id uuid := gen_random_uuid();
  v_provider_id uuid := gen_random_uuid();
  v_wp_id uuid := gen_random_uuid();
  v_slot_id uuid := gen_random_uuid();
  v_scheduled_start timestamptz := '2026-09-25 08:30:00-04:00'::timestamptz;
  v_scheduled_end timestamptz := '2026-09-25 10:30:00-04:00'::timestamptz;
begin

  update public.dd_jobs
  set
    scheduled_start = v_scheduled_start,
    scheduled_end = v_scheduled_end,
    scope_summary = 'Two Bathroom Detail & Sanitization (deep clean, showers/tubs/lower areas with built-up grime) plus vacuuming two carpeted bedrooms; optional light dusting. Customer supplies cleaning products.',
    assigned_to = 'Shiletha Tucker (provisional -- assignment record pending owner approval of guard exception)',
    internal_notes = internal_notes || E'\n\n2026-09-24 23:56 UPDATE: Confirmed Sep 25 8:30 AM (was "exact time pending"). Shiletha Tucker accepted the $60 flat external-provider offer via Zelle. Scope corrected to two bedrooms (was one). Provider intake + work package recorded (see dd_fulfillment_work_packages / dd_provider_applications). dd_job_assignments insert is BLOCKED by dd_guard_provider_assignment() (PROVIDER_NOT_QUALIFIED) -- her org is correctly not generally qualified/verified/agreement-executed. Job remains blocked in system-of-record until the owner approves either a governed guard exception or another path; do not confuse "scheduled in reality" with "assigned in DANI".',
    updated_at = now()
  where id = v_job_id;

  insert into public.dd_provider_organizations (
    id, name, vendor_type, is_active, compliance_status, accepts_new_work,
    legal_name, primary_contact_name, contact_email, contact_phone,
    source_reference, operating_rule
  ) values (
    v_org_id, 'Shiletha Tucker', 'INDIVIDUAL', true, 'PENDING', false,
    'Shiletha Tucker', 'Shiletha Tucker', 'Shilethatucker@gmail.com', '404-287-3568',
    'Recruited during provider-portal /provider/apply outage; job-scoped provisional authorization pending normal onboarding',
    'MARTA/transit only -- no personal vehicle. Confirmed route: Bus 1 to 17th Street.'
  );

  insert into public.dd_providers (
    id, org_id, first_name, last_name, is_active, provider_code, contact_name,
    source_system, source_channel
  ) values (
    v_provider_id, v_org_id, 'Shiletha', 'Tucker', true, 'PROV-SHILETHA-TUCKER',
    'Shiletha Tucker', 'manual_owner_onboarding', 'messenger_recruitment'
  );

  insert into public.dd_provider_applications (
    id, provider_id, application_status, applicant_type, legal_name,
    contact_first_name, contact_last_name, contact_email, contact_phone,
    tax_form_status, insurance_status, identity_status, agreement_status,
    background_check_status, compliance_status, network_access_level,
    service_area, years_experience, availability, vehicle_equipment,
    service_notes, willing_outside_radius, source, referral_source,
    notes, submitted_at
  ) values (
    gen_random_uuid(), v_provider_id, 'SUBMITTED', 'INDIVIDUAL', 'Shiletha Tucker',
    'Shiletha', 'Tucker', 'Shilethatucker@gmail.com', '404-287-3568',
    'PENDING', 'NOT_REQUIRED', 'PENDING', 'PENDING',
    'PENDING', 'PENDING', 'APPLICANT',
    'West End (origin) / Midtown / Atlantic Station', 3, 'Flexible, transit-dependent',
    'MARTA/transit (Bus 1 to 17th Street); no personal vehicle -- her own vacuum should not be relied on for jobs',
    'Carries own supplies (Fabuloso, glass cleaner, baking soda, foam bathroom cleaner, broom, mop, carpet stain remover, duster, washcloths, backpack, cleaning bag/bucket). Experienced cleaner. ZIP to be collected when she finishes signup.',
    true, 'manual_intake', 'provider_portal_apply_route_failure',
    'Provisional one-job authorization for DD-KRYSTAL-20260924 (2026-09-25 8:30 AM). Normal onboarding (background check, W-9, agreement, identity) not yet started. Do not treat as onboarded or generally assignment-ready.',
    now()
  );

  insert into public.dd_fulfillment_work_packages (
    id, job_id, canonical_sku, package_code, package_name, scope_description,
    required_provider_count, assignment_strategy, coordination_mode,
    scheduled_start_at, scheduled_end_at, status, economics_snapshot
  ) values (
    v_wp_id, v_job_id, 'DNI-01A-021', 'WP-KRYSTAL-CLEANING-20260925', 'Krystal Livingston cleaning -- provisional single-provider',
    'Two bathrooms deep clean/sanitize; vacuum two carpeted bedrooms; optional light dusting. Customer supplies cleaning products.',
    1, 'SINGLE_PROVIDER', 'INDEPENDENT',
    v_scheduled_start, v_scheduled_end, 'PARTIALLY_ASSIGNED',
    jsonb_build_object('customer_price', 160.00, 'deposit', 50.00, 'balance_due', 110.00, 'provider_offer', 60.00, 'payment_method', 'Zelle')
  );

  insert into public.dd_work_package_provider_slots (
    id, work_package_id, slot_number, required_capability_key, provider_id,
    slot_status, service_payout_amount
  ) values (
    v_slot_id, v_wp_id, 1, 'CLEANING', v_provider_id,
    'ACCEPTED', 60.00
  );

end $$;
