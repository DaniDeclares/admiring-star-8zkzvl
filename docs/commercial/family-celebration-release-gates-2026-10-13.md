# Family Milestones & Celebrations — release gate (2026-10-13)

Status: **AUDIT / NOT APPROVED FOR PUBLICATION**. Preserve the four original brochure tiers; do not replace or create canonical SKUs without Airtable identity reconciliation.

## Historical offer evidence (not runtime authorization)
- Essential Ceremony $225: **Maxine-only prior quote**, including agreed Loganville travel and Christian dedication. Do not publish as universal price.
- Signature + Certificate $260: **Maxine-only** $225 + $35, one personalized certificate, one digital proof, one printed copy, one envelope. $100 deposit credited, $160 balance due Nov 14, 2026.
- Ceremony + Keepsakes $399: brochure price; Maxine previously expressed interest. Original brochure item quantities **unverified**. Do not replace any prior promise without customer reconciliation.
- Ceremony + Coordination from $699: quote-required until hours, staffing, responsibilities and exclusions approved.
- Full Family Celebration from $1,500: custom scoped quote, not a fixed basket.
- Apparel (family shirts, baby onesies), programs, welcome signs, labels, favors, thank-you cards, certificates and keepsakes are supported *concepts*, not guaranteed stock or dispatch eligibility. Remembrance is a separate service category.

## Fail-closed checks before sellability
1. Airtable: locate canonical family/ceremony/print/apparel/coordination service IDs; distinguish variant/package/add-on from canonical service; verify five-channel taxonomy. Do not invent IDs.
2. Supabase: reconcile governed offer, pricing, channel routing, package BOM, compliance, fulfillment, SOP and release receipts. Historical `dd_service_packages` pricing was quarantined in 2026-08-23 migrations; never activate those rows by restoring a brochure price.
3. Print collection: lock certificate count, prayer/program count, letter, folder, design revisions, print fallback, delivery and per-unit cost.
4. Apparel collection: lock garment type, size/color, count, design placement/proof, Chris acceptance, blank/transfer cost, reprint policy, lead time and margin. No presumed provider authorization.
5. Coordination: lock prep hours, day-of hours, travel, setup, vendor count, exclusions and overage rules.
6. Calculate labor, materials, provider payout, travel, processing, rush, tax/fees, contribution and cash timing for each channel before publishing.
7. Customer quote: preserve Maxine's prior $225 and approved $260 exception; $100 deposit **not collected** until payment verified. Balance due Nov 14; requested event Nov 28 at 2pm **not confirmed** until deposit and scope.
8. Verify customer-facing quote → approved price → real Stripe payment → job/assignment → QA. Do not claim paid, deployed or LIVE_READY from code changes.

## Proposed implementation placement
Extend existing governed offer, service package components, quote-builder and release checks. Add *validation*, not a new pricing authority or alternate queue. A package fails closed if apparel/print quantities or coordination hours are missing; if owner acceptance is missing; or if economics, provider, customer-specific quote, or compliance gate fails.

## Operation $1 Million Dollar Company
Treat this as an existing-inquiry conversion lane: Maxine's scoped quote → deposit receipt → confirmed ceremony → documented fulfillment → appropriate keepsake upsell and follow-up. No revenue credited before collection.

## Decision questions for owner (only if unresolved by records)
1. Does the original $399 brochure or prior conversation commit Maxine to a particular apparel item or quantity? Preserve it if so.
2. After verified cost estimates, should $399 offer print-only as default with apparel quoted separately, or two fixed cost-equivalent collections?
3. What exact coordination support hours can DANI commit to at the $699 starting tier?

No production catalog, pricing, customer or payment changes are authorized by this document.
