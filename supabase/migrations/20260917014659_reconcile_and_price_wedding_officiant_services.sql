-- Wedding Officiant Services was sitting as an untouched PRESERVED_CANDIDATE brainstorm row
-- (no canonical_sku, no economics) even though a real, currently-licensed provider exists for
-- it: Danielle Fong is ordained and Georgia requires no state registration for ministers to
-- officiate weddings (GA Code 19-3-30; confirmed via research). Reconciling it into the
-- canonical/governed catalog the same way every other Division 10 SELL_NOW service was done.
-- Pricing: $295 flat for a standard ceremony (research showed Atlanta-market officiant rates
-- of ~$220-$500 depending on customization/travel; $295 sits in the realistic working middle,
-- consistent with how comparable one-time Division 10 experience services were priced).

UPDATE public.dd_master_service_universe
SET lifecycle_status = 'CANONICAL_ACTIVE',
    canonical_sku = 'DNI-10A-022',
    commercial_object_type = 'SERV',
    customer_price = '$295 flat (standard ceremony, up to 30 min, within 25 miles of Atlanta metro); travel and custom scripting quoted separately.',
    provider_qualifications = 'Must hold current, valid ordination or equivalent officiant authority recognized under the law of the state where the ceremony is performed. No Georgia state registration exists or is required (GA Code 19-3-30).',
    compliance_legal_boundaries = 'Officiant authority is jurisdiction-specific like notary authority: an ordination valid in one state does not automatically authorize solemnizing marriages in another. Verify the ceremony location''s state law before dispatching a provider outside Georgia.',
    updated_at = now()
WHERE service_name = 'Wedding Officiant Services' AND lifecycle_status = 'PRESERVED_CANDIDATE';

UPDATE public.services
SET commercial_status = 'CANONICAL_ACTIVE',
    pricing_type = 'FIXED',
    billing_cycle = 'ONETIME',
    starting_price = 295.00,
    description = 'Licensed/ordained officiant performs a standard wedding ceremony (up to 30 minutes) and signs the marriage license. Includes one consultation call. Travel beyond 25 miles of Atlanta metro, custom vow writing, and rehearsal attendance are quoted separately.',
    resident_discount_eligible = false,
    updated_at = now()
WHERE id = '0fd8d9b9-fe4f-47d2-a78b-27eed38ddd69';

INSERT INTO public.dd_service_pricing_rules (service_id, channel_code, pricing_type, base_price_cents, currency, billing_cycle, lock_status, resident_discount_eligible, tax_class, effective_date, status)
SELECT '0fd8d9b9-fe4f-47d2-a78b-27eed38ddd69', ch, 'FIXED', 29500, 'USD', 'ONETIME', 'LOCKED', false, 'STANDARD', current_date, 'ACTIVE'
FROM unnest(ARRAY['CH01','CH02','CH03','CH04','CH05']) AS ch;

-- Officiant authority is a real license/ordination gate, same pattern as NOTARY_PUBLIC.
INSERT INTO public.dd_service_capability_requirements (canonical_sku, capability_key, requirement_code, required, source)
VALUES ('DNI-10A-022', 'OFFICIANT_ORDAINED', 'LICENSE_SERVICE', true, 'GA Code 19-3-30 -- ordained minister/officiant authority required; verified this session.');

-- Danielle Fong is GA-ordained (confirmed by her directly) -- authorize her org for this
-- specific capability/service, same org-level capability-grant pattern already in use for
-- her Cleaning/Concierge/Home Watch/Laundry Valet authorizations.
INSERT INTO public.dd_provider_capabilities (provider_org_id, service_id, capability_key, service_line, is_authorized)
VALUES ('19c10267-898f-4c10-a25e-186f6aff8771', '0fd8d9b9-fe4f-47d2-a78b-27eed38ddd69', 'OFFICIANT_ORDAINED', 'Wedding Officiant Services', true);

INSERT INTO public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division, commercial_object_type, runtime_service_id,
  pricing_rule_count, market_rule_count, channel_availability_count, authorized_provider_capability_count,
  priced_channel_count, ch01_a_priced, ch01_b_priced, commercial_offer_status, fulfillment_gate_status,
  offer_basis, source_authority
)
SELECT m.id, m.canonical_sku, m.service_name, m.division, m.commercial_object_type, '0fd8d9b9-fe4f-47d2-a78b-27eed38ddd69',
  5, 0, 0, 1,
  5, true, false, 'SELL_NOW', 'READY',
  'Reconciled from PRESERVED_CANDIDATE: real licensed provider (Danielle Fong, GA-ordained) identified, Atlanta-market-researched flat pricing applied, licensing gate added.',
  'OWNER_CONFIRMED_CREDENTIAL'
FROM public.dd_master_service_universe m
WHERE m.canonical_sku = 'DNI-10A-022';
