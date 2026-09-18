-- Corrects course from a prior failed migration attempt: a real NawfSide Roadside Enterprise
-- LLC provider org ALREADY existed in the database (created 2026-08-20, before this session),
-- with a real EXECUTED subcontractor agreement dated 2026-08-11, and 5 of its capability rows
-- already correctly matched to 5 real Division 12 automotive services (Roadside Assistance,
-- Mobile Tire Installation, Mobile Puncture Repair, Mobile Tire Mounting & Balancing, Mobile
-- Tire Sales & Installation) -- but those services were sitting at lifecycle_status=SUPERSEDED
-- with no pricing rules and no governed offer rows (never actually wired into the sellable
-- catalog), and every one of NawfSide's capability rows was is_authorized=false. Danielle
-- confirmed directly in chat: "Joho and Joseph are the same. He is NAWFside and active," and
-- "NAWFside is the one contracted for the car stuff" -- matching the real signed agreement
-- already on file. This activates exactly those 5 real automotive services (not the unrelated
-- PROPERTY_EVENT_VENDING or handyman_support rows also sitting on this org, which are out of
-- the "car stuff" scope Danielle confirmed) and updates the org's access flags to reflect her
-- confirmation, while leaving compliance_status at PENDING since a physical COI/cert document
-- still hasn't been produced.

UPDATE public.dd_provider_organizations
SET accepts_new_work = true,
    network_access_level = 'AUTHORIZED',
    permission_status = 'APPROVED',
    qualification_status = 'QUALIFIED',
    source_reference = source_reference || ' UPDATE 2026-09-18: Owner (Danielle) directly confirmed identity and active status in chat: "Joho and Joseph are the same. He is NAWFside and active" / "NAWFside is the one contracted for the car stuff." Georgia Secretary of State confirms Joseph Sink as registered agent for an Active/Compliance LLC at 3379 Peachtree Road NE Suite 655, Atlanta GA 30326 (a second LLC at 4191 Gravitt Place NW, Duluth is Administratively Dissolved and is not this entity). Automotive/roadside services activated; PROPERTY_EVENT_VENDING and handyman_support capabilities on this org remain unauthorized as out of confirmed scope.'
WHERE id = '6bb73275-cd4d-44ea-98e4-19113d1954cc';

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'CANONICAL_ACTIVE', updated_at = now()
WHERE canonical_sku IN ('DNI-12A-022','DNI-12A-023','DNI-12A-024','DNI-12A-025','DNI-12A-026');

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT s.id, ch,
  CASE WHEN s.pricing_type = 'QUOTE' THEN 'VARIABLE_QUOTE' ELSE 'STARTING_AT' END,
  round(s.starting_price * 100)::int, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM public.services s
CROSS JOIN unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch
WHERE s.id IN ('1dd18513-c33a-4416-b6cd-3d3f724f7d22','1ae920cc-31e4-492a-bd63-642ba43cc788','6749481c-c150-418d-8ee0-f9065533695a','695b361a-bc7f-401c-8bfa-1c5789726eaa','43fbcb9b-1ec4-4975-a2c5-ba2a94d7a21d');

INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, s.name, m.division, m.commercial_object_type, s.id,
  5, 0, 0, 1, 5, true, false, 'SELL_NOW', 'READY',
  'Activated 2026-09-18: real Division 12 automotive services, previously superseded/never wired into the sellable catalog, now fulfilled by NawfSide Roadside Enterprise LLC per owner confirmation.',
  'OWNER_CONFIRMED_2026-09-18'
FROM public.dd_master_service_universe m
JOIN public.services s ON s.sku = m.canonical_sku
WHERE m.canonical_sku IN ('DNI-12A-022','DNI-12A-023','DNI-12A-024','DNI-12A-025','DNI-12A-026');

UPDATE public.dd_provider_capabilities
SET is_authorized = true
WHERE provider_org_id = '6bb73275-cd4d-44ea-98e4-19113d1954cc'
  AND service_id IN ('1dd18513-c33a-4416-b6cd-3d3f724f7d22','1ae920cc-31e4-492a-bd63-642ba43cc788','6749481c-c150-418d-8ee0-f9065533695a','695b361a-bc7f-401c-8bfa-1c5789726eaa','43fbcb9b-1ec4-4975-a2c5-ba2a94d7a21d');
