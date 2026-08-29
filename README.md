# DANI DECLARES LLC — CURRENT MASTER OPERATING AUTHORITY
**Effective:** August 29, 2026  
**Authority:** Danielle Fong, Owner/Managing Director  
**Status:** Architecture locked; production activation in progress

> DANI DECLARES makes it easier to get things done — and easier for businesses to scale.

This repository is the software and operations implementation layer. It must consume governed commercial authority and must never create competing prices, channels, provider economics, or customer relationships.

## 0. AUTHORITY ORDER
1. Master Operating Architecture / owner-locked decisions
2. Approved commercial reconciliation decisions
3. Master Commercial Universe / canonical commercial registry
4. Canonical customer-pricing rules and market matrix
5. Fulfillment/provider eligibility and private economics
6. Website/application implementation
7. Supabase/Stripe/runtime records
8. Historical files, old site generations, legacy Stripe objects, old pricing engines and Git history as evidence only

If authority is unresolved: preserve the conflict and use `PENDING_RECONCILIATION`. Never resurrect a legacy price or invent missing commercial data.

## 1. COMPANY STRUCTURE
DANI DECLARES has 13 divisions:
1. Home, Pet, Plant & Household Support
2. Property, Facilities & Field Operations
3. Real Estate & Closing Support
4. Administrative & Business Operations
5. Notary & Document Services
6. Business Formation & Digital Infrastructure
7. Marketing, Content & Media Production
8. Business Development & Growth
9. Classes, Workshops & Training
10. Experiences & Resident Programming
11. Creative Design & Production
12. Logistics, Courier & Asset Sourcing
13. Government & Institutional Procurement

Division ownership is separate from fulfillment-provider identity. Cross-division dependencies do not automatically create duplicate services or SKUs.

## 2. OFFICIAL COMMERCIAL CHANNELS — LOCKED
Exactly five official channels exist:
- **CH01 — Resident Concierge**
  - **CH01-A — Regular Resident Concierge**
  - **CH01-B — Apartment Resident Concierge**
- **CH02 — Property Management & Apartments**
- **CH03 — Real Estate Offices & Brokerages**
- **CH04 — Businesses**
- **CH05 — Government & Institutional Procurement**

There is no CH06. Customer channel, buyer type, delivery model, and fulfillment lane are separate dimensions.

**Critical pricing rule:** CH01-A, CH01-B and CH02 are distinct commercial relationships and price books. Never automatically apply Regular Resident pricing to Apartment Residents or Property Management.

## 3. GEOGRAPHY
The national architecture is state → market → service area → dispatch zone.

**Commercially authorized now:** Georgia and South Carolina.  
**Long-term architecture:** all 50 states.

A state is not represented as commercially active until its service, pricing, fulfillment and compliance gates are verified. Existing Georgia markets remain market/service-area data, not a replacement for the national geography model.

## 4. COMMERCIALIZATION ORDER
**Services → Buyers/Customers → Channels → Locations → Prices → Pricing Rules → Fulfillment → Compliance → SOP/QA → Commercial Variants → SKUs → System Activation**

A capability is not automatically a service. A service is not automatically a SKU. A SKU identifies an approved commercial offer; it does not define the offer.

## 5. PRICING AUTHORITY
Customer price is governed output. Provider payout is private economics and never becomes customer pricing.

Existing-service pricing authority is delegated by Danielle to the DANI DECLARES team/ChatGPT to research, calculate, reconcile and maintain based on market evidence and fulfillment economics. No owner re-approval is required for an existing service price change unless a genuinely new policy/business-direction decision is involved.

## 6. 11 OPERATING MATRICES
1. Master Commercial Catalog Matrix
2. Commercial Channel Matrix
3. Customer/Buyer/Use-Case Matrix
4. Master Pricing Matrix
5. Pricing Rules/Engine Matrix
6. Service Execution Matrix
7. Package/Membership/Retainer Matrix
8. Capability/Provider Matrix
9. Compliance/Qualification Matrix
10. Commercial Variant/SKU Matrix
11. System Activation/Integration Matrix

These matrices reconcile horizontally. Division-by-division work is not the commercial source of truth.

## 7. COMMERCIAL VS FULFILLMENT
**Commercial:** service → commercial variant → channel → buyer → market → customer price → transaction.  
**Fulfillment:** transaction → fulfillment lane → qualified provider/worker → internal cost → payout → margin → work order → QA → completion.

A provider prospect is not an authorized provider. Never invent licenses, insurance, qualifications, availability, provider rates or payouts.

## 8. CURRENT PRODUCTION RUNTIME
GitHub = application source. Vercel = deployment. Supabase/Postgres = operational data. Stripe = payment execution. Twilio/Resend = communications. HubSpot = CRM. PostHog = analytics.

The website is downstream. Stripe is not commercial authority. Supabase runtime records are not independent commercial authority.

## 9. CUSTOMER JOURNEY
**Visitor → Offer → Customer/Channel → Location → Canonical Price → Intake → Request/Order → Stripe Checkout → Payment Webhook → Supabase → Notification → Job → Fulfillment → QA → Completion**

Primary governed intake route: `/request-service`.

The website must fail closed when an offer lacks authorized customer pricing. Public APIs/UI must never expose provider rates, payouts, margins or private work-order economics.

## 10. CURRENT D01 LAUNCH OFFERS
Owner-approved immediate launch offers:

| SKU | Offer | Customer Price |
|---|---|---:|
| DNI-01A-009 | Bin Sanitation | Starting at $59 |
| DNI-01A-010 | Odor Neutralization | Starting at $99 |
| DNI-01C-001 | Indoor Plant Care | Starting at $149/month |
| DNI-01D-002 | Home Watch / Household Absence Check | Starting at $65/visit; $149/month basic recurring offer |
| DNI-01D-004 | Event / Party Home Preparation & Reset | Starting at $175 |

These are customer prices, not provider payouts. No automatic resident discount is applied unless the canonical offer explicitly says it is eligible.

Additional already-approved/reconciled services may be activated as their canonical commercial records and fulfillment gates are verified. Unreconciled services remain pending rather than becoming accidental sellable offers.

## 11. LEGACY QUARANTINE
Historical pricing engines, old Stripe links, old booking catalogs, old travel-fee calculators and prior commercial registries are evidence only. They cannot become runtime authority by fallback.

Do not hardcode a competing frontend catalog or create a second pricing engine.

## 12. OWNER APPROVAL BOUNDARY
Danielle does not need to approve routine technical implementation, database structure, code fixes, testing, documentation, reconciliation, research or pricing decisions for existing services.

Bring Danielle only genuinely owner-level decisions: new services, major strategic direction, material legal/financial/entity commitments, formal relationships requiring her acceptance/signature, irreversible high-risk actions, or actions requiring owner-only account authorization.

## 13. CHANGE CONTROL
**AUDIT → RECOVER PRIOR DECISIONS → VERIFY AUTHORITY → IDENTIFY CONFLICTS → PLAN → MODIFY → TEST → DEPLOY → LIVE TEST → RECORD RESULT**

Once an owner decision is approved, downstream systems must be reconciled to it. Never reopen an approved decision simply because an older database row, README section, Stripe object or historical branch still contains a different value.

## 14. CURRENT CONTROL POINT
Detailed production status, owner-only actions and launch blockers are maintained in:
`docs/DANI_DECLARES_CURRENT_CONTROL_POINT_2026-08-29.md`

That control point supersedes stale historical descriptions while preserving Git history for auditability.
