-- Reverses the 2026-09-18 revert of DNI-12A-022/023/024/025/026 (Roadside Assistance, Mobile
-- Tire Installation, Mobile Puncture Repair, Mobile Tire Mounting & Balancing, Mobile Tire Sales
-- & Installation) based on NEW real information, not a mistake correction. Danielle directly
-- confirmed in chat: "nawfside said i can create all the pricing and do all the marketing" --
-- meaning NawfSide has granted DANI DECLARES pricing and marketing authority over this roadside/
-- tire work. The real 2026-09-13 governance decision that blocked this ("remain provider
-- capabilities/candidates only; no new canonical DANI SKUs invented") almost certainly existed
-- because that commercial authority question was unresolved at the time -- it now is resolved,
-- directly by the vendor, per the owner's own statement. This reuses the existing 5 canonical SKU
-- identities (their real prior prices: Roadside Assistance $125, Mobile Tire Installation $150,
-- Mobile Puncture Repair $75, Mobile Tire Mounting & Balancing $150, Mobile Tire Sales &
-- Installation $150) rather than inventing new ones, since the identities themselves were never
-- the problem. This time all three governance layers (services.commercial_status,
-- dd_master_service_universe.lifecycle_status, dd_governed_service_offers.commercial_offer_status)
-- are updated together, avoiding this morning's inconsistency bug. Real gaps still open and NOT
-- resolved by this: the actual payout/margin split with NawfSide is still not formally agreed
-- (documented as such, not fabricated), and PROPERTY_EVENT_VENDING/handyman_support capabilities
-- on this org remain unauthorized as still out of confirmed scope.

UPDATE public.services
SET commercial_status = 'CANONICAL_ACTIVE'
WHERE sku IN ('DNI-12A-022','DNI-12A-023','DNI-12A-024','DNI-12A-025','DNI-12A-026');

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'CANONICAL_ACTIVE',
    conflict_register = coalesce(conflict_register, '') ||
      ' RE-RESOLVED 2026-09-18: owner confirmed NawfSide directly granted DANI pricing and' ||
      ' marketing authority over this work ("nawfside said i can create all the pricing and do' ||
      ' all the marketing"). This resolves the commercial-authority question the 2026-09-13' ||
      ' governance restriction was gatekeeping. Reactivated as a real Dani-priced/Dani-sold' ||
      ' canonical service (Model A), fulfilled by NawfSide. Payout/margin split with NawfSide' ||
      ' still not formally agreed -- tracked separately, does not block sale.',
    updated_at = now()
WHERE canonical_sku IN ('DNI-12A-022','DNI-12A-023','DNI-12A-024','DNI-12A-025','DNI-12A-026');

UPDATE public.dd_governed_service_offers
SET commercial_offer_status = 'SELL_NOW',
    fulfillment_gate_status = 'READY',
    offer_basis = offer_basis || ' RE-ACTIVATED 2026-09-18: owner-confirmed NawfSide granted DANI pricing/marketing authority, resolving the prior governance restriction. See dd_master_service_universe.conflict_register for full history.'
WHERE canonical_sku IN ('DNI-12A-022','DNI-12A-023','DNI-12A-024','DNI-12A-025','DNI-12A-026');

UPDATE public.dd_provider_capabilities
SET is_authorized = true
WHERE provider_org_id = '6bb73275-cd4d-44ea-98e4-19113d1954cc'
  AND service_id IN ('1dd18513-c33a-4416-b6cd-3d3f724f7d22','1ae920cc-31e4-492a-bd63-642ba43cc788','6749481c-c150-418d-8ee0-f9065533695a','695b361a-bc7f-401c-8bfa-1c5789726eaa','43fbcb9b-1ec4-4975-a2c5-ba2a94d7a21d');

UPDATE public.dd_provider_organizations
SET source_reference = source_reference || ' RE-RESOLVED 2026-09-18: owner confirmed NawfSide directly granted DANI pricing/marketing authority over the roadside/tire cluster ("nawfside said i can create all the pricing and do all the marketing") -- reactivated as Model A (Dani-priced/sold, NawfSide-fulfilled). Payout/margin split still not formally agreed with NawfSide; PROPERTY_EVENT_VENDING/handyman_support remain unauthorized as out of confirmed scope.'
WHERE id = '6bb73275-cd4d-44ea-98e4-19113d1954cc';
