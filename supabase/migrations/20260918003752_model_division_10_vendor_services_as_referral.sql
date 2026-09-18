-- Implements the approved payout-model decision for the 11 Division 10 vendor-fulfilled
-- services: REFERRAL/LEAD-FEE model, not the DANI-sets-price/pays-provider model used for
-- cleaning. The vendor sets and collects their own price directly from the customer; DANI
-- DECLARES takes a referral fee (proposed default: 15% of the vendor's quoted price,
-- invoiced to the vendor after a booking closes -- adjustable, and not yet an automated
-- billing process; someone still has to track closed referrals and invoice the vendor).
--
-- Concretely: these services are marked pricing_type='VARIABLE_QUOTE' (no DANI-set price)
-- and get a governed offer with commercial_offer_status='INTAKE_ONLY' so they show up on the
-- public catalog as "Request a Quote" -- never a direct DANI Stripe checkout, which would be
-- the wrong model here (the vendor bills the customer, not DANI). fulfillment_gate_status
-- stays FULFILLMENT_GATED and authorized_provider_capability_count stays 0 until a real
-- vetted vendor is authorized -- this migration only fixes the commercial model and public
-- visibility, it does not authorize anyone.

UPDATE public.services
SET pricing_type = 'VARIABLE_QUOTE', commercial_status = 'CANONICAL_ACTIVE',
    description = 'Third-party vendor service coordinated through the DANI DECLARES vendor network. The vendor sets pricing and bills the customer directly; DANI DECLARES receives a referral fee for the introduction and does not process payment for this service.',
    updated_at = now()
WHERE sku IN ('DNI-10B-001','DNI-10C-001','DNI-10D-001','DNI-10E-001','DNI-10F-001','DNI-10G-001','DNI-10H-001','DNI-10I-001','DNI-10J-001','DNI-10K-001','DNI-10L-001');

UPDATE public.dd_master_service_universe
SET commercial_ownership = 'THIRD_PARTY_VENDOR_REFERRAL',
    provider_payout = 'N/A -- vendor bills customer directly',
    margin_economics = 'Referral fee model: DANI DECLARES receives a proposed 15% referral fee of the vendor''s quoted price per closed booking, invoiced to the vendor after completion. Not yet an automated billing process. Fee percentage is adjustable pending owner confirmation.',
    updated_at = now()
WHERE canonical_sku IN ('DNI-10B-001','DNI-10C-001','DNI-10D-001','DNI-10E-001','DNI-10F-001','DNI-10G-001','DNI-10H-001','DNI-10I-001','DNI-10J-001','DNI-10K-001','DNI-10L-001');

INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, s.id,
  0, 0, 0, 0,
  0, false, false, 'INTAKE_ONLY', 'FULFILLMENT_GATED',
  'Vendor-fulfilled referral-model service: no DANI-set price, vendor bills customer directly, DANI takes a referral fee. Visible as Request-a-Quote; not checkout-eligible by design, not just pending authorization.',
  'OWNER_VENDOR_NETWORK_INTAKE_2026-09-17'
FROM public.dd_master_service_universe m
JOIN public.services s ON s.sku = m.canonical_sku
WHERE m.canonical_sku IN ('DNI-10B-001','DNI-10C-001','DNI-10D-001','DNI-10E-001','DNI-10F-001','DNI-10G-001','DNI-10H-001','DNI-10I-001','DNI-10J-001','DNI-10K-001','DNI-10L-001');
