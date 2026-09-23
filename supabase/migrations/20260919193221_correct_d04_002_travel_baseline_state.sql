BEGIN;

UPDATE public.dd_service_economic_baselines b
SET
  travel_cost = NULL,
  travel_status = 'PENDING_REAL_WORLD_MILEAGE',
  notes = 'Planning baseline only. DNI-04A-002 is explicitly On-Site Administrative Support; service scope states local travel is included. Travel/dispatch direct cost remains unresolved pending real-world mileage evidence and must not be treated as zero.',
  updated_at = now()
FROM public.dd_master_service_universe m
WHERE b.master_service_id = m.id
  AND m.canonical_sku = 'DNI-04A-002'
  AND b.evidence_status = 'THEORETICAL_BASELINE';

DO $$
DECLARE
  v_count integer;
  v_bad integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.dd_service_economic_baselines b
  JOIN public.dd_master_service_universe m ON m.id=b.master_service_id
  WHERE m.canonical_sku='DNI-04A-002'
    AND b.evidence_status='THEORETICAL_BASELINE';

  SELECT count(*) INTO v_bad
  FROM public.dd_service_economic_baselines b
  JOIN public.dd_master_service_universe m ON m.id=b.master_service_id
  WHERE m.canonical_sku='DNI-04A-002'
    AND b.evidence_status='THEORETICAL_BASELINE'
    AND (
      b.travel_cost IS NOT NULL
      OR b.travel_status <> 'PENDING_REAL_WORLD_MILEAGE'
    );

  IF v_count <> 1 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: expected exactly one DNI-04A-002 theoretical baseline, found %', v_count;
  END IF;

  IF v_bad <> 0 THEN
    RAISE EXCEPTION 'FAIL-CLOSED: DNI-04A-002 travel baseline still contains unsupported zero/known travel state';
  END IF;
END $$;

COMMIT;
