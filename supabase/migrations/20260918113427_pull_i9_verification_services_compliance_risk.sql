-- A real prior audit (uploaded to Google Drive today, "DANI_DECLARES_MASTER_AUDIT_AND_EXECUTION_
-- REPORT") found: "I-9 | PROHIBITED | Remove from active pricing, packets, proposals and
-- capability materials." Two live services offer I-9 verification directly:
--   - DNI-05A-007 "I-9 Verification Support" ($60, added earlier this session/prior)
--   - DNI-04A-044 "I-9 Verification Appointment" ($95, added in this session's R.E.A.C.H. pass)
-- Both were SELL_NOW. I-9 employment verification is federally regulated (anti-discrimination
-- and authorized-representative rules apply); this audit's own finding is that DANI DECLARES is
-- not established as authorized to perform this directly. Per the standing rule to never let a
-- real, credible compliance flag keep selling live, both are pulled to DO_NOT_SELL pending
-- Danielle's direct confirmation of DANI's actual I-9/E-Verify authority (or removal, if the
-- audit's finding holds). This does not delete the services -- preserves them for a real
-- fulfillment-authorization decision rather than silently erasing the record.

UPDATE public.dd_governed_service_offers
SET commercial_offer_status = 'DO_NOT_SELL',
    offer_basis = offer_basis || ' PULLED 2026-09-18: a real prior compliance audit (DANI_DECLARES_MASTER_AUDIT_AND_EXECUTION_REPORT) found I-9 services are PROHIBITED for DANI DECLARES to offer directly pending authorized-representative/E-Verify status verification. Do not reactivate without Danielle''s direct confirmation.'
WHERE canonical_sku IN ('DNI-05A-007', 'DNI-04A-044');

UPDATE public.dd_master_service_universe
SET conflict_register = coalesce(conflict_register, '') ||
  ' PULLED FROM SELL_NOW 2026-09-18: real prior compliance audit flags I-9 verification as' ||
  ' PROHIBITED for DANI DECLARES to offer directly pending authorized-representative/E-Verify' ||
  ' status confirmation. Set to DO_NOT_SELL.',
  updated_at = now()
WHERE canonical_sku IN ('DNI-05A-007', 'DNI-04A-044');
