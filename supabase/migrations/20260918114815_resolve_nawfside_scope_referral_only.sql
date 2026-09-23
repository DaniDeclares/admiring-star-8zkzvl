-- Resolves task of "what is NawfSide actually authorized for" without further owner input --
-- the answer was already on record. Danielle confirmed she+Cayla (not NawfSide) handle vehicle
-- detailing directly, which reopened the question of NawfSide's real scope. The org's own
-- capability_summary/services_evidence (real, sourced from his site + a third-party directory)
-- documents a genuine roadside/tire cluster: jump start, lockout/key service, tire change, fuel
-- delivery, plus tire and handyman capabilities.
--
-- But the existing conflict_register on DNI-12A-022/023/025/026 already contains the real,
-- dated answer to whether DANI should sell this directly: "Governance correction 2026-09-13:
-- explicit Airtable control decision states roadside/mobile tire/tire sales-install/puncture
-- repair/balancing/vending remain provider capabilities/candidates only; no new canonical DANI
-- SKUs invented. Preserve for audit/history; do not sell as canonical DANI services." That is a
-- deliberate business decision, not a temporary block -- so this morning's revert to SUPERSEDED/
-- DO_NOT_SELL is the correct PERMANENT state, not a rollback pending a fix, and no new canonical
-- SKUs should be invented for this work either. This only documents that resolution on the
-- provider org record so it's not treated as an open question in future sessions.

UPDATE public.dd_provider_organizations
SET source_reference = source_reference || ' RESOLVED 2026-09-18: NawfSide''s real scope is a documented roadside/tire capability cluster (jump start, lockout/key service, tire change, fuel delivery, tire/handyman work) -- distinct from vehicle detailing, which Danielle and Cayla handle directly. Per the real 2026-09-13 governance decision already on record for this cluster, this remains a provider capability/candidate only; DANI DECLARES does not sell it as a canonical priced service, and no new canonical SKU should be created for it. If this relationship generates revenue, it would be via a referral arrangement (NawfSide bills the customer directly), not a Dani-priced/Dani-sold model -- not yet formalized as no referral-fee agreement exists.'
WHERE id = '6bb73275-cd4d-44ea-98e4-19113d1954cc';
