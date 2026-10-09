-- TESTER-ONLY PARITY MIGRATION (do not apply to Production: these objects already exist there).
-- Production contains dd_provider_stripe_connect_accounts and dd_provider_assignment_readiness_v1
-- that are not created by any recorded Production migration (created outside the migration
-- history), and dd_provider_readiness_layers_v1 (migration provider_readiness_layers_v1b) which
-- never reached Tester. Definitions below are copied verbatim from Production's catalog so
-- Tester can prove readiness behavior. This is release-train drift and must be reconciled in
-- GitHub migrations.

create table if not exists public.dd_provider_stripe_connect_accounts (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null unique references public.dd_providers(id) on delete cascade,
  stripe_account_id text,
  connect_api_model text not null default 'ACCOUNTS_V2',
  onboarding_mode text not null default 'EMBEDDED',
  onboarding_status text not null default 'NOT_STARTED',
  transfers_status text not null default 'NOT_REQUESTED',
  tax_reporting_status text not null default 'NOT_STARTED',
  payout_destination_status text not null default 'NOT_STARTED',
  payouts_enabled boolean not null default false,
  requirements_due jsonb not null default '[]'::jsonb,
  last_stripe_event_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dd_provider_stripe_connect_accounts enable row level security;
revoke all on public.dd_provider_stripe_connect_accounts from anon, authenticated;

create or replace view public.dd_provider_assignment_readiness_v1 with (security_invoker = true) as
WITH req AS (
  SELECT provider_org_id,
    bool_and(NOT required OR status = ANY (ARRAY['VERIFIED','APPROVED','CURRENT','WAIVED'])) FILTER (WHERE requirement_code = 'W9') AS w9_compliance_ready,
    bool_and(NOT required OR status = ANY (ARRAY['VERIFIED','APPROVED','CURRENT','WAIVED'])) FILTER (WHERE requirement_code = 'AGREEMENT') AS agreement_compliance_ready,
    bool_and(NOT required OR status = ANY (ARRAY['VERIFIED','APPROVED','CURRENT','WAIVED'])) FILTER (WHERE requirement_code = 'COI') AS coi_compliance_ready,
    bool_and(NOT required OR status = ANY (ARRAY['VERIFIED','APPROVED','CURRENT','WAIVED'])) FILTER (WHERE requirement_code = 'BUSINESS_REGISTRATION') AS registration_compliance_ready,
    bool_and(NOT required OR status = ANY (ARRAY['VERIFIED','APPROVED','CURRENT','WAIVED'])) FILTER (WHERE requirement_code = 'RATE_CARD') AS rate_card_ready,
    bool_and(NOT required OR status = ANY (ARRAY['VERIFIED','APPROVED','CURRENT','WAIVED'])) FILTER (WHERE requirement_code = 'SERVICE_MENU') AS service_menu_ready
  FROM public.dd_provider_compliance_items GROUP BY provider_org_id
), app AS (
  SELECT DISTINCT ON (provider_id) provider_id, id AS application_id, application_status, applicant_type, legal_name, dba_name,
    tax_form_status, insurance_status, identity_status, agreement_status, background_check_status, compliance_status,
    network_access_level, service_area, service_radius_miles, service_zip_codes, submitted_at, reviewed_at
  FROM public.dd_provider_applications WHERE provider_id IS NOT NULL ORDER BY provider_id, updated_at DESC
), w9 AS (
  SELECT DISTINCT ON (provider_org_id) provider_org_id, status AS w9_status, classification, tin_type, tin_last_four, signed_at, verified_at
  FROM public.dd_provider_w9_submissions ORDER BY provider_org_id, created_at DESC
), stripe AS (
  SELECT provider_id, stripe_account_id, connect_api_model, onboarding_mode, onboarding_status, transfers_status, tax_reporting_status,
    payout_destination_status, payouts_enabled, requirements_due, last_sync_at, last_error
  FROM public.dd_provider_stripe_connect_accounts
), org AS (
  SELECT id AS provider_org_id, legal_name, insurance_expiry FROM public.dd_provider_organizations
)
SELECT p.id AS provider_id, p.provider_code, p.is_active, p.org_id, a.application_id, a.application_status, a.applicant_type, a.legal_name, a.dba_name,
  a.tax_form_status, a.insurance_status, a.identity_status, a.agreement_status, a.background_check_status, a.compliance_status, a.network_access_level,
  a.service_area, a.service_radius_miles, a.service_zip_codes, w.w9_status, w.classification, w.tin_type, w.tin_last_four, o.insurance_expiry,
  s.stripe_account_id, s.connect_api_model, s.onboarding_mode, s.onboarding_status, s.transfers_status, s.tax_reporting_status,
  s.payout_destination_status, s.payouts_enabled, s.requirements_due, s.last_sync_at, s.last_error,
  COALESCE(req.w9_compliance_ready, true) AS w9_compliance_ready,
  COALESCE(req.agreement_compliance_ready, true) AS agreement_compliance_ready,
  COALESCE(req.coi_compliance_ready, true) AS coi_compliance_ready,
  COALESCE(req.registration_compliance_ready, true) AS registration_compliance_ready,
  COALESCE(req.rate_card_ready, true) AS rate_card_ready,
  COALESCE(req.service_menu_ready, true) AS service_menu_ready,
  CASE
    WHEN NOT p.is_active THEN 'INACTIVE_PROVIDER'
    WHEN a.application_status IS NULL OR (a.application_status <> ALL (ARRAY['SUBMITTED','IN_REVIEW','APPROVED','ACTIVE'])) THEN 'APPLICATION_NOT_APPROVED'
    WHEN a.applicant_type = 'INDIVIDUAL' AND (COALESCE(w.w9_status, 'PENDING') <> ALL (ARRAY['VERIFIED','APPROVED'])) THEN 'W9_REQUIRED'
    WHEN a.agreement_status <> ALL (ARRAY['EXECUTED','APPROVED']) THEN 'AGREEMENT_REQUIRED'
    WHEN a.identity_status <> ALL (ARRAY['VERIFIED','APPROVED']) THEN 'IDENTITY_REQUIRED'
    WHEN a.compliance_status <> ALL (ARRAY['APPROVED','VERIFIED','CURRENT']) THEN 'COMPLIANCE_REVIEW'
    WHEN o.insurance_expiry IS NOT NULL AND o.insurance_expiry < CURRENT_DATE THEN 'INSURANCE_EXPIRED'
    WHEN s.stripe_account_id IS NULL THEN 'STRIPE_CONNECT_ONBOARDING_REQUIRED'
    WHEN NOT COALESCE(s.payouts_enabled, false) OR (s.onboarding_status <> ALL (ARRAY['COMPLETE','COMPLETED','VERIFIED'])) THEN 'STRIPE_PAYOUT_SETUP_REQUIRED'
    WHEN s.requirements_due <> '[]'::jsonb THEN 'STRIPE_REQUIREMENTS_DUE'
    ELSE 'READY'
  END AS onboarding_next_action,
  p.is_active AND (a.application_status = ANY (ARRAY['APPROVED','ACTIVE']))
    AND (a.applicant_type <> 'INDIVIDUAL' OR (COALESCE(w.w9_status, 'PENDING') = ANY (ARRAY['VERIFIED','APPROVED'])))
    AND (a.agreement_status = ANY (ARRAY['EXECUTED','APPROVED'])) AND (a.identity_status = ANY (ARRAY['VERIFIED','APPROVED']))
    AND (a.compliance_status = ANY (ARRAY['APPROVED','VERIFIED','CURRENT'])) AND (o.insurance_expiry IS NULL OR o.insurance_expiry >= CURRENT_DATE)
    AND s.stripe_account_id IS NOT NULL AND COALESCE(s.payouts_enabled, false) AND (s.onboarding_status = ANY (ARRAY['COMPLETE','COMPLETED','VERIFIED']))
    AND s.requirements_due = '[]'::jsonb AS assignment_ready,
  s.stripe_account_id IS NOT NULL AND COALESCE(s.payouts_enabled, false) AND (s.onboarding_status = ANY (ARRAY['COMPLETE','COMPLETED','VERIFIED']))
    AND s.requirements_due = '[]'::jsonb AS payout_rail_ready
FROM public.dd_providers p
  LEFT JOIN app a ON a.provider_id = p.id
  LEFT JOIN w9 w ON w.provider_org_id = p.org_id
  LEFT JOIN org o ON o.provider_org_id = p.org_id
  LEFT JOIN stripe s ON s.provider_id = p.id
  LEFT JOIN req ON req.provider_org_id = p.org_id;

create or replace view public.dd_provider_readiness_layers_v1 with (security_invoker = true) as
SELECT r.*,
  r.is_active AND (r.application_status = ANY (ARRAY['APPROVED','ACTIVE'])) AND (r.applicant_type <> 'INDIVIDUAL' OR (COALESCE(r.w9_status, 'PENDING') = ANY (ARRAY['VERIFIED','APPROVED'])))
    AND (r.agreement_status = ANY (ARRAY['EXECUTED','APPROVED'])) AND (r.identity_status = ANY (ARRAY['VERIFIED','APPROVED']))
    AND (r.compliance_status = ANY (ARRAY['APPROVED','VERIFIED','CURRENT'])) AND (r.insurance_expiry IS NULL OR r.insurance_expiry >= CURRENT_DATE)
    AND r.w9_compliance_ready AND r.agreement_compliance_ready AND r.coi_compliance_ready AND r.registration_compliance_ready AND r.rate_card_ready AND r.service_menu_ready AS operational_ready,
  r.is_active AND (r.application_status = ANY (ARRAY['APPROVED','ACTIVE'])) AND (r.applicant_type <> 'INDIVIDUAL' OR (COALESCE(r.w9_status, 'PENDING') = ANY (ARRAY['VERIFIED','APPROVED'])))
    AND (r.agreement_status = ANY (ARRAY['EXECUTED','APPROVED'])) AND (r.identity_status = ANY (ARRAY['VERIFIED','APPROVED']))
    AND (r.compliance_status = ANY (ARRAY['APPROVED','VERIFIED','CURRENT'])) AND (r.insurance_expiry IS NULL OR r.insurance_expiry >= CURRENT_DATE)
    AND r.w9_compliance_ready AND r.agreement_compliance_ready AND r.coi_compliance_ready AND r.registration_compliance_ready AND r.rate_card_ready AND r.service_menu_ready
    AND r.payout_rail_ready AS fully_dispatch_ready,
  CASE
    WHEN NOT r.is_active THEN 'INACTIVE_PROVIDER'
    WHEN r.application_status IS NULL THEN 'APPLICATION_RECORD_REQUIRED'
    WHEN r.application_status <> ALL (ARRAY['APPROVED','ACTIVE']) THEN 'APPLICATION_APPROVAL_REQUIRED'
    WHEN r.applicant_type = 'INDIVIDUAL' AND (COALESCE(r.w9_status, 'PENDING') <> ALL (ARRAY['VERIFIED','APPROVED'])) THEN 'W9_REQUIRED'
    WHEN r.agreement_status <> ALL (ARRAY['EXECUTED','APPROVED']) THEN 'AGREEMENT_REQUIRED'
    WHEN r.identity_status <> ALL (ARRAY['VERIFIED','APPROVED']) THEN 'IDENTITY_REQUIRED'
    WHEN r.compliance_status <> ALL (ARRAY['APPROVED','VERIFIED','CURRENT']) THEN 'COMPLIANCE_REVIEW_REQUIRED'
    WHEN r.insurance_expiry IS NOT NULL AND r.insurance_expiry < CURRENT_DATE THEN 'INSURANCE_EXPIRED'
    WHEN NOT r.w9_compliance_ready THEN 'W9_COMPLIANCE_REQUIRED'
    WHEN NOT r.agreement_compliance_ready THEN 'AGREEMENT_COMPLIANCE_REQUIRED'
    WHEN NOT r.coi_compliance_ready THEN 'COI_COMPLIANCE_REQUIRED'
    WHEN NOT r.registration_compliance_ready THEN 'REGISTRATION_COMPLIANCE_REQUIRED'
    WHEN NOT r.rate_card_ready THEN 'RATE_CARD_REQUIRED'
    WHEN NOT r.service_menu_ready THEN 'SERVICE_MENU_REQUIRED'
    WHEN NOT r.payout_rail_ready THEN 'PAYOUT_RAIL_REQUIRED'
    ELSE 'READY'
  END AS canonical_next_blocker
FROM public.dd_provider_assignment_readiness_v1 r;

revoke all on public.dd_provider_assignment_readiness_v1, public.dd_provider_readiness_layers_v1 from anon;

-- Production has these two policies; Tester had RLS enabled on dd_provider_agreement_signatures
-- with zero policies, so applicants could not sign the agreement in Tester at all.
create policy dd_provider_signature_self_insert on public.dd_provider_agreement_signatures for insert to authenticated
  with check ((signer_user_id = auth.uid()) and exists (select 1 from public.dd_provider_applications a where a.id = dd_provider_agreement_signatures.application_id and a.applicant_user_id = auth.uid()));
create policy dd_provider_signature_self_read on public.dd_provider_agreement_signatures for select to authenticated
  using ((signer_user_id = auth.uid()) or private.dd_is_staff_admin());