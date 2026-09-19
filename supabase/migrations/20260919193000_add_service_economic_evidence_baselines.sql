BEGIN;

CREATE TABLE public.dd_service_economic_baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_service_id uuid NOT NULL
    REFERENCES public.dd_master_service_universe(id)
    ON DELETE RESTRICT,
  runtime_service_id uuid NULL
    REFERENCES public.services(id)
    ON DELETE RESTRICT,
  evidence_status text NOT NULL,
  estimated_duration_hours numeric(10,2) NULL,
  labor_rate numeric(10,2) NOT NULL DEFAULT 30.00,
  materials_cost numeric(12,2) NOT NULL DEFAULT 0.00,
  travel_cost numeric(12,2) NULL,
  other_direct_cost numeric(12,2) NOT NULL DEFAULT 0.00,
  travel_status text NOT NULL DEFAULT 'NOT_REVIEWED',
  source_type text NOT NULL,
  source_reference text NULL,
  source_date date NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dd_service_economic_baselines_evidence_status_chk
    CHECK (evidence_status IN ('THEORETICAL_BASELINE','OBSERVED_JOB','AUDITED')),
  CONSTRAINT dd_service_economic_baselines_duration_chk
    CHECK (estimated_duration_hours IS NULL OR estimated_duration_hours > 0),
  CONSTRAINT dd_service_economic_baselines_labor_rate_chk
    CHECK (labor_rate >= 0),
  CONSTRAINT dd_service_economic_baselines_materials_chk
    CHECK (materials_cost >= 0),
  CONSTRAINT dd_service_economic_baselines_travel_chk
    CHECK (travel_cost IS NULL OR travel_cost >= 0),
  CONSTRAINT dd_service_economic_baselines_other_direct_chk
    CHECK (other_direct_cost >= 0),
  CONSTRAINT dd_service_economic_baselines_travel_status_chk
    CHECK (travel_status IN (
      'NOT_REVIEWED',
      'PENDING_REAL_WORLD_MILEAGE',
      'NOT_APPLICABLE_REMOTE_BASELINE',
      'OBSERVED',
      'AUDITED'
    )),
  CONSTRAINT dd_service_economic_baselines_theoretical_policy_chk
    CHECK (evidence_status <> 'THEORETICAL_BASELINE' OR labor_rate = 30.00)
);

COMMENT ON TABLE public.dd_service_economic_baselines IS
  'Subordinate economic evidence layer. Preserves theoretical, observed, and audited cost evidence without overwriting dd_master_service_universe narrative economics. THEORETICAL_BASELINE rows are planning evidence only and do not authorize checkout.';

COMMENT ON COLUMN public.dd_service_economic_baselines.evidence_status IS
  'Evidence tier: THEORETICAL_BASELINE = planning estimate only; OBSERVED_JOB = supported by actual job telemetry/direct-cost evidence; AUDITED = formally reconciled and promoted.';
COMMENT ON COLUMN public.dd_service_economic_baselines.labor_rate IS
  'Economic modeling labor rate. THEORETICAL_BASELINE rows are constrained to the current DANI $30.00/hr internal labor floor.';
COMMENT ON COLUMN public.dd_service_economic_baselines.travel_cost IS
  'Known direct travel cost when evidenced. NULL is permitted where mileage/dispatch evidence is not yet established.';
COMMENT ON COLUMN public.dd_service_economic_baselines.travel_status IS
  'Explicit travel-evidence state so NULL travel cost cannot be mistaken for zero travel cost.';

CREATE INDEX dd_service_economic_baselines_master_service_idx
  ON public.dd_service_economic_baselines(master_service_id);
CREATE INDEX dd_service_economic_baselines_runtime_service_idx
  ON public.dd_service_economic_baselines(runtime_service_id);
CREATE INDEX dd_service_economic_baselines_evidence_status_idx
  ON public.dd_service_economic_baselines(evidence_status);
CREATE UNIQUE INDEX dd_service_economic_baselines_one_theoretical_per_service_idx
  ON public.dd_service_economic_baselines(master_service_id)
  WHERE evidence_status = 'THEORETICAL_BASELINE';

ALTER TABLE public.dd_service_economic_baselines ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.dd_service_economic_baselines FROM anon, authenticated;

INSERT INTO public.dd_service_economic_baselines (
  master_service_id, runtime_service_id, evidence_status,
  estimated_duration_hours, labor_rate, materials_cost, travel_cost,
  other_direct_cost, travel_status, source_type, source_reference,
  source_date, notes
)
SELECT
  m.id, s.id, 'THEORETICAL_BASELINE', e.draft_hours, 30.00,
  COALESCE(e.stated_materials,0),
  CASE WHEN e.sku LIKE 'DNI-04A-%' THEN 0.00 ELSE NULL END,
  0.00,
  CASE WHEN e.sku LIKE 'DNI-04A-%'
       THEN 'NOT_APPLICABLE_REMOTE_BASELINE'
       ELSE 'PENDING_REAL_WORLD_MILEAGE' END,
  'LEGACY_NARRATIVE_PARSED',
  'public.vw_sprint2b_economic_evaluation',
  DATE '2026-09-19',
  CASE WHEN e.sku LIKE 'DNI-04A-%'
       THEN 'Planning baseline only. Duration parsed from legacy narrative; remote baseline excludes unverified travel, dispatch, pass-through, software, equipment, and other direct costs.'
       ELSE 'Planning baseline only. Duration/materials parsed from legacy narrative; field travel is intentionally unresolved pending real-world mileage/dispatch evidence.'
  END
FROM public.vw_sprint2b_economic_evaluation e
JOIN public.dd_master_service_universe m ON m.canonical_sku=e.sku
JOIN public.services s ON s.sku=e.sku
WHERE e.sku IN (
  'DNI-02A-007','DNI-02A-008','DNI-02A-013','DNI-02A-014',
  'DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005',
  'DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010',
  'DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015',
  'DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019','DNI-04A-020'
);

DO $$
DECLARE v_count integer; v_missing_runtime integer; v_bad_rate integer; v_bad_duration integer;
BEGIN
  SELECT count(*) INTO v_count FROM public.dd_service_economic_baselines WHERE evidence_status='THEORETICAL_BASELINE';
  SELECT count(*) INTO v_missing_runtime FROM public.dd_service_economic_baselines WHERE evidence_status='THEORETICAL_BASELINE' AND runtime_service_id IS NULL;
  SELECT count(*) INTO v_bad_rate FROM public.dd_service_economic_baselines WHERE evidence_status='THEORETICAL_BASELINE' AND labor_rate<>30.00;
  SELECT count(*) INTO v_bad_duration FROM public.dd_service_economic_baselines WHERE evidence_status='THEORETICAL_BASELINE' AND estimated_duration_hours IS NULL;
  IF v_count<>24 THEN RAISE EXCEPTION 'FAIL-CLOSED: expected 24 theoretical baselines, found %',v_count; END IF;
  IF v_missing_runtime<>0 THEN RAISE EXCEPTION 'FAIL-CLOSED: % theoretical baselines have no runtime service link',v_missing_runtime; END IF;
  IF v_bad_rate<>0 THEN RAISE EXCEPTION 'FAIL-CLOSED: % theoretical baselines violate $30 labor-rate invariant',v_bad_rate; END IF;
  IF v_bad_duration<>0 THEN RAISE EXCEPTION 'FAIL-CLOSED: % theoretical baselines have no duration',v_bad_duration; END IF;
END $$;

CREATE OR REPLACE VIEW public.vw_sprint2b_economic_evaluation AS
WITH target AS (
  SELECT m.* FROM public.dd_master_service_universe m
  WHERE m.canonical_sku = ANY (ARRAY[
    'DNI-02A-007','DNI-02A-008','DNI-02A-013','DNI-02A-014',
    'DNI-04A-001','DNI-04A-002','DNI-04A-003','DNI-04A-004','DNI-04A-005',
    'DNI-04A-006','DNI-04A-007','DNI-04A-008','DNI-04A-009','DNI-04A-010',
    'DNI-04A-011','DNI-04A-012','DNI-04A-013','DNI-04A-014','DNI-04A-015',
    'DNI-04A-016','DNI-04A-017','DNI-04A-018','DNI-04A-019','DNI-04A-020'
  ])
),
parsed AS (
  SELECT t.*,
    (NULLIF(substring(t.internal_cost, '([0-9]+(\\.[0-9]+)?)\\s*hrs?'), ''))::numeric AS draft_hours,
    (NULLIF(substring(t.internal_cost, '\\+\\s*~?\\$([0-9]+(\\.[0-9]+)?)\\s*(materials|parts)'), ''))::numeric AS stated_materials,
    (NULLIF(substring(t.margin_economics, 'owner-approved lock \\(\\$([0-9]+(\\.[0-9]+)?)\\)'), ''))::numeric AS owner_approved_price_from_note
  FROM target t
)
SELECT
  p.canonical_sku AS sku, p.service_name, p.customer_price, p.internal_cost,
  p.margin_economics, p.draft_hours,
  COALESCE(p.stated_materials,0)::numeric AS stated_materials,
  30.00::numeric AS owner_labor_rate,
  round((p.draft_hours*30.00),2) AS owner_labor_cost,
  round(((p.draft_hours*30.00)+COALESCE(p.stated_materials,0)),2) AS owner_floor_direct_cost,
  round((2*((p.draft_hours*30.00)+COALESCE(p.stated_materials,0))),2) AS owner_floor_50_margin_minimum,
  p.owner_approved_price_from_note,
  CASE WHEN p.canonical_sku LIKE 'DNI-04A-%' THEN 'REMOTE_OR_BLOCK_SCOPED'
       ELSE 'FIELD_TRAVEL_NOT_INCLUDED_IN_THIS_SCENARIO' END AS travel_treatment,
  'NO_TIMED_DANI_JOB_EVIDENCE'::text AS duration_evidence_status,
  'SCENARIO_ONLY_NOT_AUDITED'::text AS evaluation_status,
  'Draft hours are parsed from the legacy narrative only. This view does not promote them to audited economics and excludes unverified travel, dispatch, pass-through, software, equipment, and other direct costs.'::text AS evaluation_note,
  b.id AS baseline_id,
  b.evidence_status AS baseline_evidence_status,
  b.estimated_duration_hours AS baseline_estimated_duration_hours,
  b.labor_rate AS baseline_labor_rate,
  b.materials_cost AS baseline_materials_cost,
  b.travel_cost AS baseline_travel_cost,
  b.other_direct_cost AS baseline_other_direct_cost,
  b.travel_status AS baseline_travel_status,
  round((b.estimated_duration_hours*b.labor_rate)+b.materials_cost+COALESCE(b.travel_cost,0)+b.other_direct_cost,2) AS baseline_direct_cost,
  round(2*((b.estimated_duration_hours*b.labor_rate)+b.materials_cost+COALESCE(b.travel_cost,0)+b.other_direct_cost),2) AS baseline_50_margin_minimum,
  b.source_type AS baseline_source_type,
  b.source_reference AS baseline_source_reference,
  b.source_date AS baseline_source_date,
  b.notes AS baseline_notes
FROM parsed p
LEFT JOIN LATERAL (
  SELECT b.* FROM public.dd_service_economic_baselines b
  WHERE b.master_service_id=p.id
  ORDER BY CASE b.evidence_status WHEN 'AUDITED' THEN 1 WHEN 'OBSERVED_JOB' THEN 2 WHEN 'THEORETICAL_BASELINE' THEN 3 ELSE 4 END,
           b.updated_at DESC, b.created_at DESC
  LIMIT 1
) b ON true;

COMMIT;
