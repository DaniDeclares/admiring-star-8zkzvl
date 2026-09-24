
CREATE OR REPLACE VIEW public.vw_owner_compliance_crosswalk AS
WITH active_services AS (
  SELECT id AS service_id, sku, name, division_id,
         commercial_intent_status, commercial_status, pricing_type,
         pricing_engine_code
  FROM public.services
  WHERE is_active = true
    AND commercial_status = 'CANONICAL_ACTIVE'
),
owner_caps AS (
  SELECT service_id,
         COUNT(*) AS owner_capability_rows,
         COUNT(*) FILTER (WHERE is_authorized = true) AS owner_authorized_capability_rows
  FROM public.dd_provider_capabilities
  WHERE provider_org_id = '19c10267-898f-4c10-a25e-186f6aff8771'
  GROUP BY service_id
),
service_reqs AS (
  SELECT service_id,
         COUNT(*) AS service_requirement_rows,
         COUNT(*) FILTER (WHERE required = true) AS required_service_requirement_rows,
         COUNT(*) FILTER (WHERE lower(requirement_type) LIKE '%license%' OR lower(requirement_type) LIKE '%credential%') AS license_credential_requirement_rows,
         COUNT(*) FILTER (WHERE lower(requirement_type) LIKE '%insurance%') AS insurance_requirement_rows
  FROM public.dd_service_requirements
  GROUP BY service_id
),
cap_reqs AS (
  SELECT canonical_sku,
         COUNT(*) AS capability_requirement_rows,
         COUNT(*) FILTER (WHERE required = true) AS required_capability_requirement_rows,
         COUNT(*) FILTER (WHERE lower(requirement_code) LIKE '%license%' OR lower(requirement_code) LIKE '%credential%') AS license_credential_capability_requirement_rows,
         COUNT(*) FILTER (WHERE lower(requirement_code) LIKE '%insurance%') AS insurance_capability_requirement_rows
  FROM public.dd_service_capability_requirements
  GROUP BY canonical_sku
),
geo AS (
  SELECT
    g.service_id,
    g.geography_id,
    geo.code AS geography_code,
    geo.name AS geography_name,
    geo.geography_type,
    geo.state_code,
    geo.status AS geography_status,
    g.capability_key,
    g.eligibility_status,
    g.required_license,
    g.insurance_requirement,
    g.worker_classification_rule,
    g.tax_or_fee_rule,
    g.notes AS compliance_notes
  FROM public.dd_geographic_service_compliance g
  JOIN public.dd_geographies geo ON geo.id = g.geography_id
)
SELECT
  a.service_id,
  a.sku,
  a.name,
  a.division_id,
  a.commercial_intent_status,
  a.commercial_status,
  a.pricing_type,
  a.pricing_engine_code,
  g.geography_id,
  g.geography_code,
  g.geography_name,
  g.geography_type,
  g.state_code,
  g.geography_status,
  g.capability_key,
  g.eligibility_status,
  g.required_license,
  g.insurance_requirement,
  g.worker_classification_rule,
  g.tax_or_fee_rule,
  g.compliance_notes,
  COALESCE(o.owner_capability_rows,0) AS owner_capability_rows,
  COALESCE(o.owner_authorized_capability_rows,0) AS owner_authorized_capability_rows,
  COALESCE(r.service_requirement_rows,0) AS service_requirement_rows,
  COALESCE(r.required_service_requirement_rows,0) AS required_service_requirement_rows,
  COALESCE(r.license_credential_requirement_rows,0) AS license_credential_requirement_rows,
  COALESCE(r.insurance_requirement_rows,0) AS insurance_requirement_rows,
  COALESCE(c.capability_requirement_rows,0) AS capability_requirement_rows,
  COALESCE(c.required_capability_requirement_rows,0) AS required_capability_requirement_rows,
  COALESCE(c.license_credential_capability_requirement_rows,0) AS license_credential_capability_requirement_rows,
  COALESCE(c.insurance_capability_requirement_rows,0) AS insurance_capability_requirement_rows,
  CASE
    WHEN g.service_id IS NULL THEN 'COMPLIANCE_GEOGRAPHY_UNVERIFIED'
    WHEN g.eligibility_status IS DISTINCT FROM 'ELIGIBLE' THEN 'GEOGRAPHIC_ELIGIBILITY_UNVERIFIED'
    WHEN g.required_license IS NOT NULL AND btrim(g.required_license) <> '' THEN 'LICENSE_REVIEW_REQUIRED'
    WHEN g.insurance_requirement IS NOT NULL AND btrim(g.insurance_requirement) <> '' THEN 'INSURANCE_REVIEW_REQUIRED'
    WHEN COALESCE(o.owner_authorized_capability_rows,0) = 0 THEN 'OWNER_CAPACITY_UNVERIFIED'
    ELSE 'STRUCTURAL_COMPLIANCE_DATA_PRESENT'
  END AS structural_compliance_state
FROM active_services a
LEFT JOIN geo g ON g.service_id = a.service_id
LEFT JOIN owner_caps o ON o.service_id = a.service_id
LEFT JOIN service_reqs r ON r.service_id = a.service_id
LEFT JOIN cap_reqs c ON c.canonical_sku = a.sku;
