-- Before reconciling Division 02's 8 remaining PRESERVED_CANDIDATE rows (Apartment
-- Common-Area Reset, Apartment Unit Turn Coordination, etc.), found they carry real,
-- specific descriptions that substantially overlap in scope with 20 ALREADY-canonical
-- Division-02A services (Amenity Reset, Apartment Turn, Vendor Coordination, Punch
-- List, etc.) -- which themselves only carry a generic placeholder description
-- ("Canonical company-wide service offer...") with no real differentiation. Creating
-- new priced SKUs for the candidates risks selling the same real-world work twice
-- under two different names. That needs a real side-by-side adjudication (or Danielle's
-- confirmation these are genuinely distinct tiers), not a unilateral guess -- paused,
-- not reconciled, pending that.
--
-- What's real and safe to fix now: all 20 already-canonical Division-02A services are
-- SELL_NOW/READY with real prices, but every single one has zero authorized providers
-- -- the same "priced but unbookable" gap found company-wide earlier this session.
-- Authorizing Danielle Fong here on the 11 that are unambiguous, hands-on
-- cleaning/reset/inspection/documentation work, matching her already-confirmed
-- capabilities (she already holds "Deposit Security Move-Out Turn / Vacant Unit
-- Detailing" and "Home Inventory & Household Asset Documentation"-type work).
-- Deliberately NOT authorizing her on Handyman Support, Punch List, Asset
-- Verification, Field Data Collection, Site Status Verification, Property Transition
-- Support, Vendor Coordination, Work Order Coordination, or Commercial Space Reset --
-- those lean toward repair/admin/coordination roles she has not confirmed she performs.

INSERT INTO public.dd_provider_capabilities (provider_org_id, service_id, capability_key, service_line, is_authorized)
SELECT '19c10267-898f-4c10-a25e-186f6aff8771', s.id, 'CLEANING', s.name, true
FROM public.services s
WHERE s.name IN ('Amenity Reset','Apartment Turn','Common Area Detail','Make-Ready Cleaning',
                 'Move-In Readiness','Move-Out Readiness','Office Cleaning','Vacant Property Check',
                 'Photo Documentation','Property Inspection','Facility Supply Replenishment');

UPDATE public.dd_governed_service_offers o
SET authorized_provider_capability_count = 1, updated_at = now()
FROM public.services s
WHERE o.runtime_service_id = s.id
  AND s.name IN ('Amenity Reset','Apartment Turn','Common Area Detail','Make-Ready Cleaning',
                 'Move-In Readiness','Move-Out Readiness','Office Cleaning','Vacant Property Check',
                 'Photo Documentation','Property Inspection','Facility Supply Replenishment');
