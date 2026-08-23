# DANI DECLARES LLC — Phase 0.5 Provider, Inventory & Dependency Master

**Effective:** August 23, 2026  
**Status:** Active reconciliation layer; SKU creation remains gated until Phase 1 reconciliation  
**Authority:** Master Operating Architecture Authority v1.0 + Phase 0 Company-Wide Catalog Master

## Purpose

This document establishes the missing master-data layer between the capability universe and future service/SKU commercialization.

The governing sequence is:

`CAPABILITY → SERVICE FAMILY → SERVICE → TASK → COMMERCIAL OBJECT → SCOPE/DEPENDENCIES → CHANNEL/BUYER/MARKET → CUSTOMER PRICE → FULFILLMENT → PROVIDER → QUALIFICATIONS → INVENTORY/ASSETS → INTERNAL ECONOMICS → SOP/QA → SKU`

Provider capability does not create commercial ownership. Inventory availability does not create a capability. A capability may remain pending until provider, equipment, qualification, legal, or operational requirements are verified.

## Provider Master

| Provider | Role | Current authority | Current routing state | Key boundary |
|---|---|---|---|---|
| DANI | Commercial owner / primary operator | Customer relationship, pricing, marketing, scope authority | Active as company authority | Does not automatically imply every specialist capability is personally fulfilled |
| Cayla | Fulfillment provider / plant specialist | Plant-care fulfillment lane | Pending reconciliation | $20/hr is internal benchmark only; no plant resale assumed |
| Chris | Internal specialist | Computer/technical, media, DTF/heat-press | Pending equipment/qualification verification | Provider-owned equipment must not be represented as DANI inventory |
| Cass | Fulfillment provider | Business/financial/bookkeeping/project administration | Pending qualification/scope verification | No customer-pricing authority |
| NAWFside | Fulfillment provider | Property/facilities/trade lane | Agreement executed but production routing remains gated pending compliance activation | Existing DB capability rows are not automatically authorized |
| Qualified external specialist | External fulfillment | Licensed/specialist work | Case-by-case | Used where veterinary, grooming, electrical, plumbing, HVAC, legal, or other specialist boundaries apply |

## Verified DANI Inventory

The following items are recorded because they were specifically identified as existing inventory/equipment. Unknown quantities remain marked as unknown rather than invented.

| Inventory | Owner | Status | Fulfillment relevance |
|---|---|---|---|
| McCulloch MC1385 steam cleaner | DANI | Operational / available | Cleaning and household maintenance support |
| Bissell cleaning machine/vacuum | DANI | **Limited** — hose broken | May support general cleaning when otherwise appropriate; **not classified as a fully operational commercial carpet extractor** |
| Zep degreaser | DANI | Available; quantity to verify | Cleaning/household maintenance |
| OdoBan | DANI | Available; quantity to verify | Cleaning/odor-control support within ordinary scope |
| Microfiber towels | DANI | Available; quantity to verify | Cleaning |
| 55-gallon trash bags | DANI | Available; quantity to verify | Cleaning, debris handling and logistics |
| Roach gel | DANI | Available | Household pest-control support only within applicable product-label/legal boundaries; does not create a licensed pest-control service |
| Roach traps | DANI | Available | Household pest-control support only; does not create a licensed pest-control service |
| Broom | DANI | **Broken / unavailable** | Do not use as a fulfillment dependency until replaced/repaired |
| Drill | DANI | **Not owned / unavailable** | Do not assume handyman capability based on a drill that is not currently held |
| Air filter/air purifier | DANI | **Broken / unavailable** | Do not treat as available equipment |

## Provider-Owned / Unverified Inventory

Chris's DTF/heat-press and computer/media equipment are recorded as provider-owned capabilities/assets, not DANI-owned inventory. Exact models, quantities, condition and availability still require provider verification before routing is considered fully eligible.

## Capability Dependency Rules

1. **Cleaning equipment rule:** The McCulloch MC1385 is a verified steam-cleaning asset. The Bissell exists but is limited by a broken hose. Neither entry should be interpreted as ownership of a commercial carpet-extraction fleet.
2. **Carpet-extraction rule:** Carpet extraction is not a current standalone equipment capability merely because a Bissell exists. Any future carpet-extraction service requires explicit equipment verification or qualified external fulfillment.
3. **Provider-equipment rule:** Chris's production and technical equipment belongs to Chris unless a separate ownership record says otherwise.
4. **Provider-qualification rule:** NAWFside's historical capability list does not equal production authorization. Current database state remains `accepts_new_work=false` until documentary activation is complete.
5. **Commercial-ownership rule:** DANI remains the customer-facing commercial authority. Providers receive approved scope and payout terms but cannot overwrite customer pricing or catalog identity.
6. **No phantom capability rule:** A missing tool, broken tool, unavailable asset, or unverified qualification must not silently become an operational dependency.
7. **No phantom SKU rule:** No SKU may be created solely because a historical price, package, provider capability, equipment item, or website label exists.

## Current Production Gates

- Provider Master: established; detailed eligibility remains partially pending.
- Inventory Master: established with verified DANI equipment and explicit unavailable/limited states.
- Provider Capability Master: established for known lanes; remaining provider capabilities require evidence/qualification reconciliation.
- Dependency Master: established and linked to capability keys.
- Pricing: remains frozen/pending reconciliation.
- Packages, memberships and retainers: remain frozen until their underlying service universe is reconciled.
- SKU creation: **GATED** until Phase 1 reconciliation uses this layer.

## Explicit Unknowns That Must Not Be Invented

- Exact quantities of DANI consumables.
- Exact Bissell model and replacement-hose status.
- Exact Chris equipment inventory and condition.
- Chris's exact computer-repair hardware/software scope.
- Cass's final qualified financial/admin scope and documentation status.
- Cayla's complete plant-care equipment inventory and exact service capacity.
- NAWFside's complete current equipment, trade licenses/insurance and activation status.
- Vehicle ownership/capacity for logistics work.
- Any commercial carpet extractor not specifically verified.

## Database Implementation

The authoritative internal tables are:

- `private.dd_catalog_provider_master`
- `private.dd_catalog_provider_capability_master`
- `private.dd_catalog_inventory_master`
- `private.dd_catalog_capability_dependency_master`

These tables are intentionally private and are not public catalog endpoints. They exist to prevent fulfillment assumptions from leaking into customer-facing catalog logic.
