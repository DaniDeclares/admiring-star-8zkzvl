CREATE TABLE IF NOT EXISTS public.dd_master_service_reconciliation_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_record_id uuid NOT NULL REFERENCES public.dd_master_service_universe(id),
  canonical_sku text,
  service_name text NOT NULL,
  division text NOT NULL,
  runtime_service_id uuid REFERENCES public.services(id),
  duplicate_group text,
  entity_classification text NOT NULL DEFAULT 'PENDING_RECONCILIATION',
  reconciliation_status text NOT NULL DEFAULT 'PENDING_RECONCILIATION',
  resolution_notes text,
  authority_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(master_record_id)
);

INSERT INTO public.dd_master_service_reconciliation_ledger (
  master_record_id, canonical_sku, service_name, division, runtime_service_id,
  duplicate_group, entity_classification, reconciliation_status, resolution_notes, authority_source
)
SELECT
  m.id,
  m.canonical_sku,
  m.service_name,
  m.division,
  s.id,
  CASE WHEN dup.n > 1 THEN m.canonical_sku END,
  CASE
    WHEN dup.n > 1 THEN 'DUPLICATE_IDENTITY_PENDING'
    ELSE 'CANONICAL_SERVICE_PENDING'
  END,
  CASE
    WHEN dup.n > 1 THEN 'PENDING_RECONCILIATION'
    WHEN s.id IS NULL THEN 'RUNTIME_MISSING'
    ELSE 'MATCHED_RUNTIME'
  END,
  CASE
    WHEN dup.n > 1 THEN 'Preserved source row; duplicate canonical_sku requires non-destructive identity classification before promotion.'
    WHEN s.id IS NULL THEN 'No runtime service match found; recover/approve before creating or promoting a runtime record.'
    ELSE 'Exact canonical_sku match to runtime service; downstream pricing/channel/fulfillment gates still apply.'
  END,
  'dd_master_service_universe'
FROM public.dd_master_service_universe m
LEFT JOIN public.services s ON s.sku = m.canonical_sku
LEFT JOIN (
  SELECT canonical_sku, count(*) n
  FROM public.dd_master_service_universe
  WHERE canonical_sku IS NOT NULL
  GROUP BY canonical_sku
) dup ON dup.canonical_sku = m.canonical_sku
ON CONFLICT (master_record_id) DO UPDATE SET
  canonical_sku = EXCLUDED.canonical_sku,
  service_name = EXCLUDED.service_name,
  division = EXCLUDED.division,
  runtime_service_id = EXCLUDED.runtime_service_id,
  duplicate_group = EXCLUDED.duplicate_group,
  entity_classification = EXCLUDED.entity_classification,
  reconciliation_status = EXCLUDED.reconciliation_status,
  resolution_notes = EXCLUDED.resolution_notes,
  authority_source = EXCLUDED.authority_source,
  updated_at = now();

COMMENT ON TABLE public.dd_master_service_reconciliation_ledger IS 'Non-destructive control ledger for reconciling the 300-row Master Service Universe to runtime services. No source rows are deleted; duplicate canonical SKUs remain preserved until explicitly classified.';