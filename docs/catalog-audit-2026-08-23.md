# DANI DECLARES LLC — FULL CATALOG AUDIT

**Date:** 2026-08-23  
**Status:** PHASE 0 COMPANY-WIDE CATALOG MASTER ESTABLISHED — SKU RECONCILIATION REMAINS BLOCKED UNTIL PHASE 1 47-POINT RECONCILIATION  
**Governing Authority:** Master Operating Architecture Authority v1.0  
**Authoritative Phase 0 catalog:** `docs/company-wide-catalog-master-2026-08-23.md`

## Executive Finding

The repository contains multiple historical catalog generations, commercial registries, solution bundles, channel matrices, service data, and documentation that overlap or contradict the current 13-division / 6-channel / 7-market architecture.

The correct action was not to choose the newest catalog. The repository has now been separated conceptually into:

1. governing architecture;
2. authoritative Phase 0 capability universe;
3. future reconciled commercial objects;
4. quarantined historical evidence; and
5. runtime presentation/checkout data that must consume only promoted canonical records.

The Phase 0 Company-Wide Catalog Master now exists and covers Divisions 01–13 without assigning new SKUs or customer prices.

## Audit Findings Retained

### 1. Older master service catalog is historical evidence

`docs/dani-declares-master-service-catalog.md` uses an older 10-division taxonomy and legacy prefixes such as `PO`, `AS`, `ND`, `EV`, `BP`, `BS`, `CS`, `LG`, `RS`, and `OC`.

It is **not** the current structural authority. Its entries remain useful historical evidence and must not be converted directly into SKUs.

### 2. Older Commercial Master is evidence, not Phase 0 authority

`docs/DANI_DECLARES_COMMERCIAL_MASTER_2026.md` contains multiple pricing generations and unresolved commercial taxonomies. It must not be treated as the current customer-price authority until individual records are reconciled and promoted.

### 3. Runtime pricing remains fail-closed

Legacy pricing registries and travel/mileage engines must not be allowed to silently recreate customer pricing. No old price is a fallback.

### 4. Legacy service presentation data remains a migration target

`src/data/services.js`, `src/data/solutionsData.js`, and legacy catalog/config files may contain useful service descriptions but are not allowed to become independent catalog authorities. They must eventually consume promoted canonical records.

### 5. Channels and commercial models remain separate

Current channels:

- CH01 — Property Residents
- CH02 — Direct / Regular Residents
- CH03 — Property Management
- CH04 — Real Estate
- CH05 — Business / Commercial
- CH06 — Government / Institutional

Older B2C/B2B/B2C/B2G labels can remain as commercial-model evidence but do not replace the six-channel architecture.

### 6. Markets remain separate from travel pricing

Core markets are Jonesboro, Tucker, Stone Mountain, Chamblee, Brookhaven, Midtown, and Buckhead.

The old mileage/per-mile/travel-surcharge engine is not authoritative. Geographic treatment must be resolved through the commercial architecture and must not double-count location costs.

### 7. Commercial object types remain distinct

The master system must preserve:

- `SERV` — Service
- `PROD` — Physical Product
- `DIGITAL` — Digital Product/Service
- `KIT` — Kit / Bundle
- `RET` — Retainer
- `EVENT` — Event / Experience
- `WORK-ORDER` — Operational Work Order

These cannot be flattened into one service list.

### 8. Provider identities are fulfillment resources

DANI, Cayla, Chris, Cass, NAWFside, and qualified external specialists do not determine division ownership or customer pricing.

Known provider boundaries remain:

- Cayla — indoor plant/botanical primary lane; $20/hour is internal benchmark only.
- Chris — computer/PC support, technical setup, recording/editing, property media, DTF/heat press and related technical production where qualified.
- Cass — approved project/SOW and administrative/financial support; no invented universal rate.
- NAWFside — trade/volume/project fulfillment; no customer pricing authority.
- DANI — commercial/operational authority and approved execution.
- External specialists — licensed/regulated/specialized work where required.

### 9. Equipment is a fulfillment constraint, not a catalog authority

Current known DANI-side equipment includes a Bissell machine with a broken hose/limited status and a McCulloch MC1385 steam cleaner. DANI must not represent the Bissell as a commercial carpet extractor. Carpet extraction remains equipment/qualification gated until reconciled.

Other known operating supplies may support fulfillment but do not automatically create commercial promises.

### 10. Cross-division capabilities are explicitly retained

The Phase 0 master includes, among other things:

- computer/technical support in Division 06;
- property media and video in Division 07;
- event planning and event production in Division 10;
- DTF/heat-press and physical creative production in Division 11;
- logistics/sourcing in Division 12;
- institutional contracting/procurement wrapper in Division 13;
- plant care in Division 01;
- notary in Division 05; and
- administrative/financial project support in Division 04 where properly qualified and scoped.

Provider fulfillment does not move these capabilities into another division.

## Phase 0 Catalog Authority

The authoritative structural catalog is now:

`docs/company-wide-catalog-master-2026-08-23.md`

It defines the company-wide capability universe across all 13 divisions and intentionally contains **no new SKU assignments and no customer-price authority**.

The catalog follows:

**Division → Capability Area → Capability → Service Family → Service → Task → Commercial Object → SKU**

and preserves the distinctions among scope, exclusions, dependencies, commercialization, channels, buyer types, markets, fulfillment, qualifications, economics, compliance, lifecycle, version and source authority.

## Phase 1 Gate — Still Required

The next operation is not to invent more services and not to create SKUs. It is to reconcile the Phase 0 universe against historical evidence.

Required sequence:

1. Recover every historical object.
2. Classify commercial object type.
3. Map to the 13-division catalog.
4. Deduplicate and absorb duplicates while preserving legacy IDs.
5. Map capability → service family → service → task.
6. Map dependencies and cross-division relationships.
7. Resolve scope/exclusions/qualifications/safety boundaries.
8. Resolve commercialization state.
9. Resolve channel/buyer/market treatment.
10. Resolve fulfillment eligibility and equipment dependencies.
11. Resolve customer pricing state and internal economics separately.
12. Apply lifecycle state and source authority.
13. Populate the 47-point reconciliation vector.
14. Only then create/promote runtime SKUs.

## Gate Decision

**PHASE 0: COMPLETE STRUCTURALLY.**  
**PHASE 1: OPEN.**  
**SKU CREATION: BLOCKED UNTIL RECONCILIATION.**  
**LEGACY PRICES: QUARANTINED.**  
**PROVIDER ECONOMICS: PRIVATE.**  
**RUNTIME: FAIL CLOSED WHEN NO PROMOTED CANONICAL RECORD EXISTS.**

## Authority Conclusion

The repository now has a clean structural catalog layer to reconcile against historical evidence. The old service catalog, old commercial master, legacy solution bundles, travel engines, provider rates, and Stripe objects cannot independently become current truth.

**Next authoritative task: Phase 1 47-point reconciliation, beginning with Division 01 and then progressing through Divisions 02–13.**
