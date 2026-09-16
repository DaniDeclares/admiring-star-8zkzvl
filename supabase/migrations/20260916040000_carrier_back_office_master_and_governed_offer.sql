-- Follow-up to 20260916030000: Carrier Back-Office Support (DNI-12A-028) got a
-- real services row, was flipped to CANONICAL_ACTIVE/SELL_NOW, and got a real
-- dd_service_pricing_rules row -- but the staff Quote Builder
-- (quoteBuilder2026.js getQuoteCatalog/createEstimate) doesn't read `services`
-- or `dd_service_pricing_rules` directly. It reads dd_governed_service_offers,
-- and that table had zero rows for this SKU, so the service was flipped
-- "sellable" at the catalog level but was invisible to the one tool staff
-- actually use to quote it. Confirmed by reading loadRules()'s real query:
-- it only needs dd_service_pricing_rules (already correct) plus a
-- dd_governed_service_offers row pointing at the runtime service (missing).
--
-- dd_governed_service_offers.master_record_id is NOT NULL, UNIQUE, and FKs to
-- dd_master_service_universe(id) -- every governed offer has to trace back to
-- a master record. Carrier Back-Office Support never had one (it only ever
-- existed as marketing copy in dani-declares-website-copy.md before this
-- session), so this adds that master record first, dated today rather than
-- backdated, then the governed-offer row.
--
-- fulfillment_lane is set to "DANI DIRECT" to match its sibling DNI-04A-015
-- (Back-Office Support) -- this is paperwork/admin work (broker packets,
-- rate-con filing, invoicing, IFTA), not a field/driving capability, which is
-- also why PortalAccessPage.jsx's provider-capability picker excludes this
-- SKU even though it's filed under Division 12 for commercial grouping.

insert into public.dd_master_service_universe (
  division, section, capability, service_family, service_name, task,
  commercial_object_type, canonical_sku, scope, exclusions,
  market_treatment, customer_price, commercial_ownership, fulfillment_lane,
  provider_qualifications, compliance_legal_boundaries, lifecycle_status,
  version, source_authority, conflict_register
)
select
  '12', 'Logistics, Courier & Asset Sourcing', 'CARRIER_BACK_OFFICE_SUPPORT',
  'Logistics, Courier & Asset Sourcing', 'Carrier Back-Office Support',
  'Owner-operator carrier admin: broker packet prep, carrier onboarding,
   rate confirmation organization, load documentation management, POD/BOL
   collection, invoice creation and broker invoice submission, payment
   tracking, detention/lumper documentation, claims assistance, compliance
   and permit/insurance-reminder tracking, and quarterly IFTA fuel-tax
   filing administration.',
  'SERVICE', 'DNI-12A-028',
  'Administrative and paperwork support for owner-operator carriers; dispatch
   support offered only as a secondary service when needed.',
  'Freight brokerage, load booking/negotiation as a broker of record, and any
   activity requiring FMCSA broker authority are explicitly excluded -- this
   is dispatcher/back-office administrative support, not brokerage.',
  '2026 owner-operator dispatch/back-office market research: full dispatch
   support runs $300-650/week or 5-10% of gross load revenue; back-office-only
   services run $50-150/load flat; IFTA quarterly filing runs $30-100/quarter
   per truck. Priced at the low end since this service is admin-first with
   dispatch only secondary.',
  'Starting at $75/load; $500/month retainer available for ongoing engagements',
  'DANI DECLARES', 'DANI DIRECT — owner fulfillment; scope-controlled',
  'No provider qualification is implied by catalog activation.',
  'Dispatcher/back-office administrative service; does not constitute freight
   brokerage or carrier dispatch-as-broker activity. Any expansion into
   broker-of-record services requires separate FMCSA broker authority and
   legal review before activation.',
  'CANONICAL_ACTIVE', '2026-09-16',
  'Owner commercialization directive + dani-declares-website-copy.md Page 4
   (Logistics & Courier) historical service plan + 2026 dispatch/back-office
   market research',
  '2026-09-16: activated from historical planning copy (never previously a
   structured catalog record) with researched pricing; IFTA quarterly filing
   added to scope as a real, common, non-brokerage carrier admin expense.'
where not exists (
  select 1 from public.dd_master_service_universe where canonical_sku = 'DNI-12A-028'
);

insert into public.dd_governed_service_offers (
  master_record_id, canonical_sku, service_name, division,
  commercial_object_type, runtime_service_id, pricing_rule_count,
  market_rule_count, channel_availability_count,
  authorized_provider_capability_count, priced_channel_count,
  ch01_a_priced, ch01_b_priced, commercial_offer_status,
  fulfillment_gate_status, offer_basis, source_authority
)
select
  m.id, 'DNI-12A-028', 'Carrier Back-Office Support', '12',
  'SERVICE', s.id, 1,
  0, 0,
  0, 1,
  false, false, 'SELL_NOW',
  'READY',
  'Owner-direct fulfillment; researched CH04 pricing recorded in
   dd_service_pricing_rules. market_rule_count/channel_availability_count
   left at 0 (honest) rather than copied from another SKU''s template --
   those tables have no rows for this SKU and are not required by the real
   quote-calculation path (loadRules() only reads dd_service_pricing_rules).',
  'DANI_SPECIALS_APPROVED + MASTER_COMMERCIAL_UNIVERSE'
from public.dd_master_service_universe m
join public.services s on s.sku = 'DNI-12A-028'
where m.canonical_sku = 'DNI-12A-028'
and not exists (
  select 1 from public.dd_governed_service_offers g where g.canonical_sku = 'DNI-12A-028'
);
