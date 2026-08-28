# DANI DECLARES LLC — Phase 1 Capability Reconciliation Plan

**Date:** 2026-08-27
**Purpose:** Complete the capability/service universe before SKU activation or provider routing.

## Authority
The Company-Wide Catalog Master is the structural capability authority. Historical pricing, packages, add-ons, website catalogs, Stripe objects, provider records, and legacy IDs are evidence until explicitly reconciled.

## Customer Architecture
Five official commercial channels remain:
- CH01 Resident Concierge
  - CH01-A Apartment / Property Residents
  - CH01-B Regular / Direct Residents
- CH02 Property Management & Apartments
- CH03 Real Estate Offices & Brokerages
- CH04 Businesses
- CH05 Government & Institutional Procurement

CH01-A and CH01-B are resident relationship subchannels, not additional official channels.

## Reconciliation Sequence
1. Inventory every capability across Divisions 01–13 from the authoritative Company-Wide Catalog Master.
2. Reconcile historical service/package/add-on evidence against each capability.
3. Distinguish capability, service family, service, task, SKU, package, add-on, program, membership, retainer, and event/SOW.
4. Record dependencies without duplicating service identity.
5. Assign customer-channel eligibility and CH01 resident subchannel eligibility where applicable.
6. Assign fulfillment modes: EXECUTE, COORDINATE, SOURCE, DOCUMENT, DELIVER, PRODUCE, REFER.
7. Attach compliance/qualification requirements.
8. Attach equipment/asset requirements.
9. Map qualified provider capabilities only after service definitions are stable.
10. Create SKUs only after reconciliation gates pass.

## Current Evidence
The authoritative Company-Wide Catalog Master contains broad capability coverage across all 13 divisions. Division 01 alone includes home cleaning/sanitation, household maintenance/reset, pet/companion support, indoor plant care, organization/decluttering, home watch/concierge, seasonal/holiday support, move/transition, and household programs. Divisions 02–13 likewise contain multiple capability families.

The current production `services` table is therefore a partial commercialization/evidence layer and must not be mistaken for the complete service universe.

## Required Master Artifacts
- Company-Wide Capability Reconciliation Register
- Service Definition Register
- Cross-Division Dependency Register
- Channel/Subchannel Eligibility Matrix
- Inventory Master
- Provider Capability & Eligibility Master
- Compliance Requirement Matrix
- Legacy ID / Conflict Register
- SKU Registry Crosswalk

## Gate Rules
- Do not activate historical services solely because they exist in a legacy table.
- Do not delete historical evidence merely because it is inactive.
- Do not infer customer prices from provider economics.
- Do not infer provider eligibility from a service name alone.
- Do not represent unavailable equipment as owned by DANI DECLARES.
- Do not create a new official commercial channel for a capability, customer type, specialist, product, event, or fulfillment resource.
- Do not create duplicate service identities solely because a service crosses divisions or channels.

## Immediate Next Build
Populate the reconciliation register from the full 13-division capability master, then map each reconciled service to the five channels and CH01 resident subchannels. Provider mapping follows only after this register is approved.
