-- Reconciles the pricing conflict Danielle flagged in a pasted (non-authoritative)
-- prior-chat document that proposed a third pricing scheme for Christopher Walker's
-- DTF and computer services. Danielle's decision: lock the audit principle that
-- Supabase's governed catalog is the single source of truth, and that a pasted
-- inventory "cannot legitimately promote anything to live merely by supplying
-- prices." Her literal answer on which numbers should be canonical was "I set the
-- price but let's go with what makes the most sense" -- since the Master Pricebook
-- DTF tiers are the real, dated, already-governed source (vs. an unsourced paste),
-- "what makes the most sense" is keeping them as canonical and rejecting the paste.
-- No price change is made; this only writes the reconciliation decision into each
-- affected record's conflict_register for audit trail, per her own stated principle
-- that every service needs "one canonical identity, one governed commercial
-- definition, one pricing source."

UPDATE public.dd_master_service_universe
SET conflict_register = coalesce(conflict_register, '') ||
  ' RECONCILED 2026-09-18: A pasted, unreconciled prior-chat document proposed an alternate' ||
  ' per-shirt DTF pricing table ($25/$22/$20/$18/$16 by volume, +$8 front+back, +$5 sleeve).' ||
  ' Owner decision: the live Dani Declares Master Pricebook (06/21/2026) tiered structure' ||
  ' (Single $25+$18/item, Small Batch-12 $300, Standard Batch-24 $540, Event Merch Batch-50' ||
  ' $1050) remains canonical since it is the real, dated, already-governed source. The pasted' ||
  ' table is rejected as a pricing source and kept only as non-authoritative reference in' ||
  ' docs/UPLOADED_MATERIALS_DISPOSITION_REGISTRY_2026-09-18.md.',
  updated_at = now()
WHERE canonical_sku IN ('DNI-11A-017', 'DNI-11A-018');

UPDATE public.dd_master_service_universe
SET conflict_register = coalesce(conflict_register, '') ||
  ' RECONCILED 2026-09-18: A pasted, unreconciled prior-chat document proposed a broader' ||
  ' computer-services price table (PC Assembly $225, Custom PC Build Management $300,' ||
  ' Workstation Setup $175, Computer Setup/Tune-Up $125, Printer/Peripheral/Network Setup,' ||
  ' Data Transfer, Software Configuration, Troubleshooting $85/hr). It does not directly' ||
  ' collide with this SKU''s live price, but is not adopted as a pricing source -- kept only' ||
  ' as non-authoritative reference. Live governed price stands as canonical.',
  updated_at = now()
WHERE canonical_sku IN ('DNI-06A-016', 'DNI-06A-017');
