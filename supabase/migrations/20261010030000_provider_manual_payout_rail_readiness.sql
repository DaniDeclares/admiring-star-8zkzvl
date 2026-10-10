-- Provider payout readiness: accept an owner-approved manual payout rail.
--
-- Before: dd_provider_assignment_readiness_v1 counted a provider as payout-ready
-- only with a dd_provider_stripe_connect_accounts row (payouts enabled, nothing
-- due). Nothing in the codebase creates those rows, so assignment_ready was
-- false for every provider and createDispatchOffer refused all of them.
--
-- After: a provider is also payout-ready when BOTH
--   1. the owner has approved a manual rail: dd_provider_payout_clearance_policy
--      row MANUAL_PAYOUT_RAIL with owner_approved and external_payout_authorized
--      (its clearance_mode is unused here; payout timing stays on DEFAULT),
--      and
--   2. staff verified that provider's payout destination: the existing
--      PAYOUT_SETUP item in dd_provider_compliance_items has status VERIFIED.
-- Stripe Connect still works unchanged. Every other gate (application approved,
-- W-9, agreement, identity, compliance, insurance) is untouched.
--
-- The policy row is seeded OFF. Nothing changes for any provider until the
-- owner turns it on. No new tables; columns, column order and grants stay the
-- same, so the dependent views (dd_morning_clockin_readiness_v1,
-- dd_provider_readiness_layers_v1) are unaffected.

insert into public.dd_provider_payout_clearance_policy (policy_key, clearance_mode, owner_approved, external_payout_authorized, rationale, effective_from)
values ('MANUAL_PAYOUT_RAIL', 'UNRESOLVED', false, false,
        'Owner decision required: allow providers to be paid by a verified manual rail (e.g. Zelle or PayPal) instead of Stripe Connect. Turning this on also requires each provider''s PAYOUT_SETUP compliance item to be VERIFIED.',
        null)
on conflict (policy_key) do nothing;

create or replace view public.dd_provider_assignment_readiness_v1 with (security_invoker = true) as
 WITH req AS (
         SELECT dd_provider_compliance_items.provider_org_id,
            bool_and(((NOT dd_provider_compliance_items.required) OR (dd_provider_compliance_items.status = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text, 'CURRENT'::text, 'WAIVED'::text])))) FILTER (WHERE (dd_provider_compliance_items.requirement_code = 'W9'::text)) AS w9_compliance_ready,
            bool_and(((NOT dd_provider_compliance_items.required) OR (dd_provider_compliance_items.status = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text, 'CURRENT'::text, 'WAIVED'::text])))) FILTER (WHERE (dd_provider_compliance_items.requirement_code = 'AGREEMENT'::text)) AS agreement_compliance_ready,
            bool_and(((NOT dd_provider_compliance_items.required) OR (dd_provider_compliance_items.status = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text, 'CURRENT'::text, 'WAIVED'::text])))) FILTER (WHERE (dd_provider_compliance_items.requirement_code = 'COI'::text)) AS coi_compliance_ready,
            bool_and(((NOT dd_provider_compliance_items.required) OR (dd_provider_compliance_items.status = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text, 'CURRENT'::text, 'WAIVED'::text])))) FILTER (WHERE (dd_provider_compliance_items.requirement_code = 'BUSINESS_REGISTRATION'::text)) AS registration_compliance_ready,
            bool_and(((NOT dd_provider_compliance_items.required) OR (dd_provider_compliance_items.status = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text, 'CURRENT'::text, 'WAIVED'::text])))) FILTER (WHERE (dd_provider_compliance_items.requirement_code = 'RATE_CARD'::text)) AS rate_card_ready,
            bool_and(((NOT dd_provider_compliance_items.required) OR (dd_provider_compliance_items.status = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text, 'CURRENT'::text, 'WAIVED'::text])))) FILTER (WHERE (dd_provider_compliance_items.requirement_code = 'SERVICE_MENU'::text)) AS service_menu_ready,
            bool_or((dd_provider_compliance_items.status = 'VERIFIED'::text)) FILTER (WHERE (dd_provider_compliance_items.requirement_code = 'PAYOUT_SETUP'::text)) AS manual_payout_destination_verified
           FROM dd_provider_compliance_items
          GROUP BY dd_provider_compliance_items.provider_org_id
        ), app AS (
         SELECT DISTINCT ON (dd_provider_applications.provider_id) dd_provider_applications.provider_id,
            dd_provider_applications.id AS application_id,
            dd_provider_applications.application_status,
            dd_provider_applications.applicant_type,
            dd_provider_applications.legal_name,
            dd_provider_applications.dba_name,
            dd_provider_applications.tax_form_status,
            dd_provider_applications.insurance_status,
            dd_provider_applications.identity_status,
            dd_provider_applications.agreement_status,
            dd_provider_applications.background_check_status,
            dd_provider_applications.compliance_status,
            dd_provider_applications.network_access_level,
            dd_provider_applications.service_area,
            dd_provider_applications.service_radius_miles,
            dd_provider_applications.service_zip_codes,
            dd_provider_applications.submitted_at,
            dd_provider_applications.reviewed_at
           FROM dd_provider_applications
          WHERE (dd_provider_applications.provider_id IS NOT NULL)
          ORDER BY dd_provider_applications.provider_id, dd_provider_applications.updated_at DESC
        ), w9 AS (
         SELECT DISTINCT ON (dd_provider_w9_submissions.provider_org_id) dd_provider_w9_submissions.provider_org_id,
            dd_provider_w9_submissions.status AS w9_status,
            dd_provider_w9_submissions.classification,
            dd_provider_w9_submissions.tin_type,
            dd_provider_w9_submissions.tin_last_four,
            dd_provider_w9_submissions.signed_at,
            dd_provider_w9_submissions.verified_at
           FROM dd_provider_w9_submissions
          ORDER BY dd_provider_w9_submissions.provider_org_id, dd_provider_w9_submissions.created_at DESC
        ), stripe AS (
         SELECT dd_provider_stripe_connect_accounts.provider_id,
            dd_provider_stripe_connect_accounts.stripe_account_id,
            dd_provider_stripe_connect_accounts.connect_api_model,
            dd_provider_stripe_connect_accounts.onboarding_mode,
            dd_provider_stripe_connect_accounts.onboarding_status,
            dd_provider_stripe_connect_accounts.transfers_status,
            dd_provider_stripe_connect_accounts.tax_reporting_status,
            dd_provider_stripe_connect_accounts.payout_destination_status,
            dd_provider_stripe_connect_accounts.payouts_enabled,
            dd_provider_stripe_connect_accounts.requirements_due,
            dd_provider_stripe_connect_accounts.last_sync_at,
            dd_provider_stripe_connect_accounts.last_error
           FROM dd_provider_stripe_connect_accounts
        ), org AS (
         SELECT dd_provider_organizations.id AS provider_org_id,
            dd_provider_organizations.legal_name,
            dd_provider_organizations.insurance_expiry
           FROM dd_provider_organizations
        ), manual_rail AS (
         SELECT COALESCE(bool_or((dd_provider_payout_clearance_policy.owner_approved AND dd_provider_payout_clearance_policy.external_payout_authorized)), false) AS approved
           FROM dd_provider_payout_clearance_policy
          WHERE (dd_provider_payout_clearance_policy.policy_key = 'MANUAL_PAYOUT_RAIL'::text)
        ), base AS (
         SELECT p.id AS provider_id,
            p.provider_code,
            p.is_active,
            p.org_id,
            a.application_id,
            a.application_status,
            a.applicant_type,
            a.legal_name,
            a.dba_name,
            a.tax_form_status,
            a.insurance_status,
            a.identity_status,
            a.agreement_status,
            a.background_check_status,
            a.compliance_status,
            a.network_access_level,
            a.service_area,
            a.service_radius_miles,
            a.service_zip_codes,
            w.w9_status,
            w.classification,
            w.tin_type,
            w.tin_last_four,
            o.insurance_expiry,
            s.stripe_account_id,
            s.connect_api_model,
            s.onboarding_mode,
            s.onboarding_status,
            s.transfers_status,
            s.tax_reporting_status,
            s.payout_destination_status,
            s.payouts_enabled,
            s.requirements_due,
            s.last_sync_at,
            s.last_error,
            COALESCE(req.w9_compliance_ready, true) AS w9_compliance_ready,
            COALESCE(req.agreement_compliance_ready, true) AS agreement_compliance_ready,
            COALESCE(req.coi_compliance_ready, true) AS coi_compliance_ready,
            COALESCE(req.registration_compliance_ready, true) AS registration_compliance_ready,
            COALESCE(req.rate_card_ready, true) AS rate_card_ready,
            COALESCE(req.service_menu_ready, true) AS service_menu_ready,
            ((s.stripe_account_id IS NOT NULL) AND COALESCE(s.payouts_enabled, false) AND (s.onboarding_status = ANY (ARRAY['COMPLETE'::text, 'COMPLETED'::text, 'VERIFIED'::text])) AND (s.requirements_due = '[]'::jsonb)) AS stripe_payout_ready,
            (mr.approved AND COALESCE(req.manual_payout_destination_verified, false)) AS manual_payout_ready,
            mr.approved AS manual_rail_approved
           FROM ((((((dd_providers p
             LEFT JOIN app a ON ((a.provider_id = p.id)))
             LEFT JOIN w9 w ON ((w.provider_org_id = p.org_id)))
             LEFT JOIN org o ON ((o.provider_org_id = p.org_id)))
             LEFT JOIN stripe s ON ((s.provider_id = p.id)))
             LEFT JOIN req ON ((req.provider_org_id = p.org_id)))
             CROSS JOIN manual_rail mr)
        )
 SELECT base.provider_id,
    base.provider_code,
    base.is_active,
    base.org_id,
    base.application_id,
    base.application_status,
    base.applicant_type,
    base.legal_name,
    base.dba_name,
    base.tax_form_status,
    base.insurance_status,
    base.identity_status,
    base.agreement_status,
    base.background_check_status,
    base.compliance_status,
    base.network_access_level,
    base.service_area,
    base.service_radius_miles,
    base.service_zip_codes,
    base.w9_status,
    base.classification,
    base.tin_type,
    base.tin_last_four,
    base.insurance_expiry,
    base.stripe_account_id,
    base.connect_api_model,
    base.onboarding_mode,
    base.onboarding_status,
    base.transfers_status,
    base.tax_reporting_status,
    base.payout_destination_status,
    base.payouts_enabled,
    base.requirements_due,
    base.last_sync_at,
    base.last_error,
    base.w9_compliance_ready,
    base.agreement_compliance_ready,
    base.coi_compliance_ready,
    base.registration_compliance_ready,
    base.rate_card_ready,
    base.service_menu_ready,
        CASE
            WHEN (NOT base.is_active) THEN 'INACTIVE_PROVIDER'::text
            WHEN ((base.application_status IS NULL) OR (base.application_status <> ALL (ARRAY['SUBMITTED'::text, 'IN_REVIEW'::text, 'APPROVED'::text, 'ACTIVE'::text]))) THEN 'APPLICATION_NOT_APPROVED'::text
            WHEN ((base.applicant_type = 'INDIVIDUAL'::text) AND (COALESCE(base.w9_status, 'PENDING'::text) <> ALL (ARRAY['VERIFIED'::text, 'APPROVED'::text]))) THEN 'W9_REQUIRED'::text
            WHEN (base.agreement_status <> ALL (ARRAY['EXECUTED'::text, 'APPROVED'::text])) THEN 'AGREEMENT_REQUIRED'::text
            WHEN (base.identity_status <> ALL (ARRAY['VERIFIED'::text, 'APPROVED'::text])) THEN 'IDENTITY_REQUIRED'::text
            WHEN (base.compliance_status <> ALL (ARRAY['APPROVED'::text, 'VERIFIED'::text, 'CURRENT'::text])) THEN 'COMPLIANCE_REVIEW'::text
            WHEN ((base.insurance_expiry IS NOT NULL) AND (base.insurance_expiry < CURRENT_DATE)) THEN 'INSURANCE_EXPIRED'::text
            WHEN base.stripe_payout_ready OR base.manual_payout_ready THEN 'READY'::text
            WHEN (base.manual_rail_approved AND (base.stripe_account_id IS NULL)) THEN 'MANUAL_PAYOUT_SETUP_REQUIRED'::text
            WHEN (base.stripe_account_id IS NULL) THEN 'STRIPE_CONNECT_ONBOARDING_REQUIRED'::text
            WHEN ((NOT COALESCE(base.payouts_enabled, false)) OR (base.onboarding_status <> ALL (ARRAY['COMPLETE'::text, 'COMPLETED'::text, 'VERIFIED'::text]))) THEN 'STRIPE_PAYOUT_SETUP_REQUIRED'::text
            WHEN (base.requirements_due <> '[]'::jsonb) THEN 'STRIPE_REQUIREMENTS_DUE'::text
            ELSE 'READY'::text
        END AS onboarding_next_action,
    (base.is_active AND (base.application_status = ANY (ARRAY['APPROVED'::text, 'ACTIVE'::text])) AND ((base.applicant_type <> 'INDIVIDUAL'::text) OR (COALESCE(base.w9_status, 'PENDING'::text) = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text]))) AND (base.agreement_status = ANY (ARRAY['EXECUTED'::text, 'APPROVED'::text])) AND (base.identity_status = ANY (ARRAY['VERIFIED'::text, 'APPROVED'::text])) AND (base.compliance_status = ANY (ARRAY['APPROVED'::text, 'VERIFIED'::text, 'CURRENT'::text])) AND ((base.insurance_expiry IS NULL) OR (base.insurance_expiry >= CURRENT_DATE)) AND (base.stripe_payout_ready OR base.manual_payout_ready)) AS assignment_ready,
    (base.stripe_payout_ready OR base.manual_payout_ready) AS payout_rail_ready
   FROM base;

grant select on public.dd_provider_assignment_readiness_v1 to service_role;
