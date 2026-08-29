# DANI DECLARES — COMPANY-WIDE COMMERCIAL EXPANSION
Date: 2026-08-29
Authority: Danielle Fong, Owner/Managing Director

## Executive result
The company-wide commercial audit expanded the canonical sellable/requestable service universe from the five D01 launch offers to **284 active service records across all 13 divisions**. The public catalog now reads those canonical records from Supabase and is live at `/catalog`.

## Division coverage
- D01 Home, Pet, Plant & Household Support — 44
- D02 Property, Facilities & Field Operations — 20
- D03 Real Estate & Closing Support — 20
- D04 Administrative & Business Operations — 20
- D05 Notary & Document Services — 20
- D06 Business Formation & Digital Infrastructure — 20
- D07 Marketing, Content & Media Production — 20
- D08 Business Development & Growth — 20
- D09 Classes, Workshops & Training — 20
- D10 Experiences & Resident Programming — 20
- D11 Creative Design & Production — 20
- D12 Logistics, Courier & Asset Sourcing — 20
- D13 Government & Institutional Procurement — 20

## Commercial channel architecture
All offers remain inside the five locked official channels:
CH01 Resident Concierge; CH02 Property Management & Apartments; CH03 Real Estate Offices & Brokerages; CH04 Businesses; CH05 Government & Institutional Procurement.
The `/catalog` experience is a discovery layer, not a sixth channel.

## Pricing work
Pricing anchors were researched against current Atlanta/Georgia market categories for cleaning/property services, real-estate support/media, administrative/virtual-assistant services, notary/document work, business formation/digital setup, marketing/SEO/media, business development/consulting, workshops/training, events, creative/print production, courier/logistics and GovCon support.

DANI customer prices are customer-price anchors. They are not provider payouts. Variable or high-scope work is quote/SOW gated. Government/statutory fees, third-party software, ad spend, materials, carrier costs and other pass-throughs remain separate where applicable.

## Governance and fulfillment gates
Catalog activation does not mean provider qualification. Current provider audit shows 46 provider organizations in the system but 0 fully qualified against all tested qualification conditions. DANI may fulfill directly where permitted; provider-routed work remains gated until qualification is complete.

Regulated and professional boundaries are preserved for notary, legal/tax/accounting-adjacent, government procurement, transportation, media, event staffing and other specialized work. No provider license, insurance, certification, availability, government award, clearance or contract qualification has been invented.

## Technical implementation
- Canonical service records were populated in Supabase.
- Five-channel pricing rules were populated for the canonical service universe.
- Georgia market pricing anchors were populated for the canonical service universe and five channels; local submarket validation remains ongoing.
- D02/D03 null SKU and pricing defects discovered during reconciliation were corrected.
- The five D01 launch prices were reconciled across service, master, pricing-rule and market-pricing layers.
- A public `/catalog` page with search and division filtering was added and linked as `All Services` in the main navigation.
- Server-side commercial-intent validation now resolves canonical services directly from Supabase when they are not present in the legacy static launch registry.
- Catalog reads were consolidated into the existing verifier endpoint so the application remains within the Vercel serverless-function limit.
- Latest production deployment is READY.

## Current direct-pay launch anchors
- Bin Sanitation — $59 starting
- Odor Neutralization — $99 starting
- Indoor Plant Care — $149/month starting
- Home Watch / Household Absence Check — $65/visit starting; $149/month recurring anchor separately defined
- Event / Party Home Preparation & Reset — $175 starting

## What remains
1. Reconcile the remaining legacy public service pages against the 284-record canonical catalog.
2. Continue service-by-service provider qualification and fulfillment readiness.
3. Continue localized market-price and contribution-margin validation by buyer/channel/location.
4. Convert additional fixed-price offers to direct checkout only when fulfillment and commercial gates support it.
5. Complete a controlled end-to-end checkout → request → job → accounting verification without creating an unintended live charge.
6. Configure CRON_SECRET and Resend credentials when owner-controlled communications are desired.
