# Operation $1 Million — Company-wide offer recovery contract
**Owner requirement (2026-10-10):** Every historically approved capability must be accounted for; every eligible offer must have a legitimate path to sale; every division must contribute visibly to the revenue operation.

## Scope and authority
- Audit **all 13 canonical divisions** and the current owner-directed five commercial channels: CH01 Residents (direct and property-activated), CH03 Property Management & Apartments, CH04 Real Estate & Brokerages, CH05 Businesses, plus the separate government/institution procurement path. **Legacy channel IDs are not to be mass-remapped**; preserve existing rows and resolve semantics through authority-backed mappings first.
- History-first sources: `docs/company-wide-catalog-master-2026-08-23.md`, `docs/dani-declares-master-service-catalog.md`, `docs/DANI_DECLARES_COMMERCIAL_MASTER_2026.md`, `docs/master-discovery-audit-gap-register-2026-08-27.md`, latest approved owner corrections, migrations, service universe, services, release contract, pricing rules, Shopify and Stripe.
- No new planner, governor, queue, price authority, or unapproved SKU. Extend existing master reconciliation and Owner HQ projections.
- Treat `CANONICAL_ACTIVE`, `LIVE_READY`, published storefront, linked payment, fulfilled job, and collected revenue as **different facts**. Never infer one from another.

## Required evidence-backed reconciliation, per capability or product
Preserve source document/section or owner decision, normalized identity, current canonical SKU or service ID, division owner, applicable buyers/channels, fulfillment mode (Execute / Coordinate / Source / Document / Deliver / Produce / Refer), target jurisdiction, provider/equipment/legal qualification, price authority and economics, package or retainer entitlements, release gate, public discovery path, quote/checkout path, marketing attribution, transaction evidence, QA proof and repeat/cross-sell path.

Allowed audit dispositions: `PRESERVED`, `MISSING`, `BURIED`, `RENAMED`, `DUPLICATED`, `GATED`, `RETIRED`, `READY_FOR_RELEASE`. Disposition is descriptive; it **does not** change commercial state.

### Explicit recovery coverage
- D01: household, cleaning, laundry, home/house manager, pet, plant, vacation/home watch, seasonal, moves.
- D02: property turns, leasing-office administration/coverage, amenity organization, field inspection, vendor coordination, facilities support.
- D03: listing prep, open-house help, real-estate logistics, transaction/closing support.
- D04: office/administrative operations, bookkeeping coordination, documentation, research, workflow support.
- D05: mobile/general notary, signing, document logistics, authentication/filing coordination.
- D06: formation and digital infrastructure, websites, application, computer/IT services via qualified worker.
- D07: property tour media, UGC creators, amenities content, visual assets, social media and commercial production.
- D08: buyer acquisition, sales follow-up, partner development, growth retainers.
- D09: training, workshops, digital courses, printable workbooks and provider education.
- D10: events, ceremonies, resident activations, office and community experiences.
- D11: DTF/heat press, branded apparel, signage, printed products, labels, stickers, gifts.
- D12: courier, sourcing, field logistics, mobile/roadside partner services.
- D13: institutional procurement, compliant pursuit, administration and delivery through qualified underlying divisions.
- Cross-cutting: Shopify digital-product deliverables; physical products; memberships, packages and retainer entitlements; government certification and funding readiness; eligible referral income. Preserve Shadow & Sol as separate legal/accounting authority.

## Existing-system execution order
1. Recover historical decisions and current `main`, open PRs, canonical master universe and runtime (Tester then appropriate Production read-back). Log conflicts with source location and exact affected IDs; no arbitrary deletion.
2. Join or otherwise reconcile each historical capability against canonical records and commercial variants; identify aliases, retired records and gaps. Avoid double counting a capability reused across channels.
3. Resolve channel labels: establish explicit, versioned legacy-ID → present buyer-context interpretation without overwriting persisted historical references until all dependents are known.
4. For each *eligible* offer verify scope, permitted jurisdiction, provider eligibility/equipment, pricing economics, approval gates, customer-facing route and actual quote/payment readiness. A draft document is not an offer.
5. Feed existing service release checks. Promote only after verified receipts; blocked and ineligible offerings remain visible in internal audit, not on public purchase paths.
6. Add/reuse existing Owner HQ evidence summaries per **division × channel**: historical capabilities accounted / unresolved; eligible offers; LIVE_READY sellable offers; leads/requested/quoted/accepted; paid and net collected; jobs delivered/QA; repeats, blockers, source freshness. Every metric includes reporting window and authoritative source. Unknown is not zero.
7. Route verified ready offers into existing acquisition, matching, quoting, outreach and fulfillment paths. Respect no-contact, consent, economic and owner approval controls. Verify real buyer conversion through paid receipt and QA, not code deploy.
8. Re-run after any catalog, pricing, provider, channel or release update using existing refresh functions. Rank exceptions at the existing owner attention points; no parallel scheduler.

## Acceptance conditions
- 13/13 divisions audited against historical catalog with source-backed counts, including legitimate zero **sales** and unknown values distinguished.
- Every approved historical capability has a traceable canonical match or an explicit disposition, evidence and unresolved owner decision only where genuinely needed.
- Every eligible offer has a verified customer discovery/intake → governed quote or checkout → payment record → fulfillment/QA path, or specific gate and repair action.
- CH03 explicitly covers leasing office, apartment tours, content creators, amenities, events and retention as well as turns.
- All mapped multi-channel offerings reuse one underlying capability, preserving buyer-specific rates and access rights.
- Owner HQ reports evidence freshness and source lineage; no unsupported GREEN, fabricated buyers, cash or LIVE_READY.
- Exactly one governed source of truth; no unverified code or registry change treated as successful business outcome.

**Current state:** This document records the approved recovery requirement and audit acceptance contract. It does **not** certify that the full row-by-row Production audit, releases, or revenue proof have happened.
