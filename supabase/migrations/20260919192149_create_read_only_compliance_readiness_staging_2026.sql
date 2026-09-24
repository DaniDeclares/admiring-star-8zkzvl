
CREATE OR REPLACE VIEW public.vw_compliance_readiness_staging_2026 AS
WITH active_services AS (
  SELECT
    s.id AS service_id,
    s.sku,
    s.name,
    s.division_id,
    d.name AS division_name,
    s.commercial_intent_status,
    s.commercial_status,
    s.pricing_type,
    s.pricing_engine_code,
    CASE
      WHEN s.commercial_status = 'CANONICAL_ACTIVE' THEN 'CANONICAL_ACTIVE'
      ELSE 'ACTIVE_NONCANONICAL'
    END AS catalog_population
  FROM public.services s
  LEFT JOIN public.divisions d ON d.id = s.division_id
  WHERE s.is_active = true
),
owner_caps AS (
  SELECT
    pc.service_id,
    count(*)::int AS owner_capability_rows,
    count(*) FILTER (WHERE pc.is_authorized = true)::int AS owner_authorized_capability_rows,
    bool_or(pc.is_authorized = true) AS owner_has_authorized_capability
  FROM public.dd_provider_capabilities pc
  WHERE pc.provider_org_id = '19c10267-898f-4c10-a25e-186f6aff8771'::uuid
  GROUP BY pc.service_id
),
service_reqs AS (
  SELECT
    sr.service_id,
    count(*)::int AS service_requirement_rows,
    count(*) FILTER (WHERE sr.required = true)::int AS required_service_requirement_rows,
    count(*) FILTER (
      WHERE sr.required = true
        AND lower(sr.requirement_type) LIKE '%license%'
    )::int AS required_license_requirement_rows,
    count(*) FILTER (
      WHERE sr.required = true
        AND lower(sr.requirement_type) LIKE '%credential%'
    )::int AS required_credential_requirement_rows,
    count(*) FILTER (
      WHERE sr.required = true
        AND lower(sr.requirement_type) LIKE '%insurance%'
    )::int AS required_insurance_requirement_rows
  FROM public.dd_service_requirements sr
  GROUP BY sr.service_id
),
cap_reqs AS (
  SELECT
    scr.canonical_sku,
    count(*)::int AS capability_requirement_rows,
    count(*) FILTER (WHERE scr.required = true)::int AS required_capability_requirement_rows,
    count(*) FILTER (
      WHERE scr.required = true
        AND (
          lower(scr.requirement_code) LIKE '%license%'
          OR lower(scr.requirement_code) LIKE '%credential%'
        )
    )::int AS required_license_credential_capability_rows,
    count(*) FILTER (
      WHERE scr.required = true
        AND lower(scr.requirement_code) LIKE '%insurance%'
    )::int AS required_insurance_capability_rows
  FROM public.dd_service_capability_requirements scr
  GROUP BY scr.canonical_sku
),
geo AS (
  SELECT
    gsc.service_id,
    gsc.geography_id,
    g.code AS geography_code,
    g.name AS geography_name,
    g.geography_type,
    g.state_code,
    g.status AS geography_status,
    gsc.capability_key,
    gsc.eligibility_status,
    gsc.required_license,
    gsc.insurance_requirement,
    gsc.worker_classification_rule,
    gsc.tax_or_fee_rule,
    gsc.notes AS compliance_notes
  FROM public.dd_geographic_service_compliance gsc
  JOIN public.dd_geographies g ON g.id = gsc.geography_id
),
geo_rollup AS (
  SELECT
    service_id,
    count(*)::int AS geography_rows,
    count(*) FILTER (WHERE eligibility_status = 'ELIGIBLE')::int AS eligible_geography_rows,
    count(*) FILTER (WHERE eligibility_status = 'PENDING_RECONCILIATION')::int AS pending_geography_rows,
    count(*) FILTER (
      WHERE required_license IS NOT NULL AND btrim(required_license) <> ''
    )::int AS geography_license_requirement_rows,
    count(*) FILTER (
      WHERE insurance_requirement IS NOT NULL AND btrim(insurance_requirement) <> ''
    )::int AS geography_insurance_requirement_rows,
    string_agg(DISTINCT geography_code, ', ' ORDER BY geography_code) AS geography_codes,
    string_agg(DISTINCT geography_type, ', ' ORDER BY geography_type) AS geography_types,
    string_agg(
      DISTINCT CASE
        WHEN required_license IS NOT NULL AND btrim(required_license) <> ''
        THEN required_license
      END,
      ' | '
    ) AS required_license_evidence,
    string_agg(
      DISTINCT CASE
        WHEN insurance_requirement IS NOT NULL AND btrim(insurance_requirement) <> ''
        THEN insurance_requirement
      END,
      ' | '
    ) AS insurance_requirement_evidence
  FROM geo
  GROUP BY service_id
)
SELECT
  a.service_id,
  a.sku,
  a.name,
  a.division_id,
  a.division_name,
  a.catalog_population,
  a.commercial_intent_status,
  a.commercial_status,
  a.pricing_type,
  a.pricing_engine_code,

  COALESCE(gr.geography_rows, 0) AS geography_rows,
  COALESCE(gr.eligible_geography_rows, 0) AS eligible_geography_rows,
  COALESCE(gr.pending_geography_rows, 0) AS pending_geography_rows,
  gr.geography_codes,
  gr.geography_types,
  CASE
    WHEN gr.service_id IS NULL THEN 'COMPLIANCE_GEOGRAPHY_UNVERIFIED'
    WHEN COALESCE(gr.eligible_geography_rows, 0) = 0 THEN 'GEOGRAPHIC_ELIGIBILITY_UNVERIFIED'
    WHEN COALESCE(gr.pending_geography_rows, 0) > 0 THEN 'GEOGRAPHIC_REVIEW_REQUIRED'
    ELSE 'GEOGRAPHIC_DATA_PRESENT'
  END AS geography_state,

  gr.required_license_evidence,
  gr.required_license_evidence AS geographic_license_requirement,
  COALESCE(gr.geography_license_requirement_rows, 0) AS geography_license_requirement_rows,
  COALESCE(sr.required_license_requirement_rows, 0)
    + COALESCE(sr.required_credential_requirement_rows, 0)
    + COALESCE(cr.required_license_credential_capability_rows, 0)
    AS structured_license_credential_requirement_rows,
  CASE
    WHEN COALESCE(gr.geography_license_requirement_rows, 0)
       + COALESCE(sr.required_license_requirement_rows, 0)
       + COALESCE(sr.required_credential_requirement_rows, 0)
       + COALESCE(cr.required_license_credential_capability_rows, 0) > 0
      THEN 'SERVICE_SPECIFIC_LICENSE_CREDENTIAL_REVIEW_REQUIRED'
    ELSE 'NO_RECORDED_SERVICE_SPECIFIC_LICENSE_CREDENTIAL_REQUIREMENT'
  END AS license_credential_state,

  gr.insurance_requirement_evidence,
  COALESCE(gr.geography_insurance_requirement_rows, 0)
    + COALESCE(sr.required_insurance_requirement_rows, 0)
    + COALESCE(cr.required_insurance_capability_rows, 0)
    AS service_insurance_requirement_rows,
  CASE
    WHEN COALESCE(gr.geography_insurance_requirement_rows, 0)
       + COALESCE(sr.required_insurance_requirement_rows, 0)
       + COALESCE(cr.required_insurance_capability_rows, 0) > 0
      THEN 'SERVICE_SPECIFIC_INSURANCE_REVIEW_REQUIRED'
    ELSE 'NO_RECORDED_SERVICE_SPECIFIC_INSURANCE_REQUIREMENT'
  END AS service_insurance_requirement_state,

  COALESCE(sr.service_requirement_rows, 0) AS service_requirement_rows,
  COALESCE(sr.required_service_requirement_rows, 0) AS required_service_requirement_rows,
  COALESCE(cr.capability_requirement_rows, 0) AS capability_requirement_rows,
  COALESCE(cr.required_capability_requirement_rows, 0) AS required_capability_requirement_rows,

  COALESCE(oc.owner_capability_rows, 0) AS owner_capability_rows,
  COALESCE(oc.owner_authorized_capability_rows, 0) AS owner_authorized_capability_rows,
  COALESCE(oc.owner_has_authorized_capability, false) AS owner_has_authorized_capability,

  'MASTER_POLICY_EVIDENCE_NOT_YET_CROSSWALKED'::text AS master_policy_evidence_state,

  CASE
    WHEN gr.service_id IS NULL THEN 'HOLD_FAIL_CLOSED'
    WHEN COALESCE(gr.pending_geography_rows, 0) > 0 THEN 'HOLD_FAIL_CLOSED'
    WHEN COALESCE(gr.eligible_geography_rows, 0) = 0 THEN 'HOLD_FAIL_CLOSED'
    WHEN COALESCE(gr.geography_license_requirement_rows, 0)
       + COALESCE(sr.required_license_requirement_rows, 0)
       + COALESCE(sr.required_credential_requirement_rows, 0)
       + COALESCE(cr.required_license_credential_capability_rows, 0) > 0
      THEN 'REVIEW_REQUIRED'
    WHEN COALESCE(gr.geography_insurance_requirement_rows, 0)
       + COALESCE(sr.required_insurance_requirement_rows, 0)
       + COALESCE(cr.required_insurance_capability_rows, 0) > 0
      THEN 'REVIEW_REQUIRED'
    ELSE 'REVIEW_REQUIRED'
  END AS compliance_promotion_state,

  CASE
    WHEN gr.service_id IS NULL THEN 'COMPLIANCE_GEOGRAPHY_UNVERIFIED'
    WHEN COALESCE(gr.pending_geography_rows, 0) > 0 THEN 'GEOGRAPHIC_ELIGIBILITY_UNVERIFIED'
    WHEN COALESCE(gr.eligible_geography_rows, 0) = 0 THEN 'GEOGRAPHIC_ELIGIBILITY_UNVERIFIED'
    WHEN COALESCE(gr.geography_license_requirement_rows, 0)
       + COALESCE(sr.required_license_requirement_rows, 0)
       + COALESCE(sr.required_credential_requirement_rows, 0)
       + COALESCE(cr.required_license_credential_capability_rows, 0) > 0
      THEN 'LICENSE_CREDENTIAL_REVIEW_REQUIRED'
    WHEN COALESCE(gr.geography_insurance_requirement_rows, 0)
       + COALESCE(sr.required_insurance_requirement_rows, 0)
       + COALESCE(cr.required_insurance_capability_rows, 0) > 0
      THEN 'INSURANCE_REVIEW_REQUIRED'
    ELSE 'MASTER_POLICY_EVIDENCE_REVIEW_REQUIRED'
  END AS primary_compliance_blocker

FROM active_services a
LEFT JOIN geo_rollup gr ON gr.service_id = a.service_id
LEFT JOIN owner_caps oc ON oc.service_id = a.service_id
LEFT JOIN service_reqs sr ON sr.service_id = a.service_id
LEFT JOIN cap_reqs cr ON cr.canonical_sku = a.sku;
