# DANI DECLARES — Commercial Channel & B2B2C Enforcement Contract

**Status:** LOCKED CONTROL CONTRACT — 2026-09-20

This document is the machine-readable implementation companion to the locked operating contract in Notion.

## 1. Official customer channels

DANI has exactly five official customer channels:

- CH01 — Resident Concierge
- CH02 — Property Management & Apartments
- CH03 — Real Estate Offices & Brokerages
- CH04 — Businesses
- CH05 — Government & Institutional Procurement

CH01-A and CH01-B are CH01 subchannels. They are not additional channels.

## 2. Commercial models are separate from channels

The valid commercial relationship/economic models are:

- B2C
- B2B
- B2B2C
- B2G

**B2B2C is not a channel. It must never become a sixth intake channel, route, catalog, pricing authority, or checkout channel.**

## 3. CH01-B / CH02 + resident experience

For an apartment/community relationship:

- **Organization/property-side commercial relationship:** CH02
- **Resident direct experience:** CH01
- **Resident community subchannel:** CH01-B when the resident is verified through the governed property/community relationship
- **Commercial model:** B2B2C when the organization-side relationship intentionally bridges DANI to a resident audience

A single program may therefore have two distinct experiences:

**CH02 organization experience** → property/account, work orders, quotes/proposals, organizational billing

**CH01-B resident experience** → resident identity, eligible resident services/perks, resident booking/order experience

Do not collapse the organization and resident into one customer identity.

## 4. Role separation

A B2B2C transaction may have different:

- buyer
- payer
- recipient
- beneficiary
- coordinator
- organization
- resident/person
- program/community

If the organization pays DANI for work delivered to a resident, the organization-side commercial authority remains CH02 and the resident is recipient/beneficiary.

If the resident pays DANI directly, the transaction remains CH01; CH01-B may provide eligibility/program context.

## 5. Pricing

- CH01 resident pricing is not CH02 contract pricing.
- CH01-B eligibility is server-verified.
- Resident discounts never leak into CH02 organization contracts.
- A CH02 contract price never becomes a CH01 resident price merely because the service benefits a resident.
- B2B2C alone does not create a new price book.
- Pricing remains governed by the applicable channel/subchannel/service rules.

## 6. Runtime contract

Runtime code must carry these concepts separately:

- official channel
- commercial model
- organization
- buyer
- payer
- recipient/beneficiary
- coordinator
- program/community
- resident eligibility
- pricing context
- provenance

During schema transition, JSON may carry the additional context, but the meaning must remain canonical.

## 7. Enforcement rule

Any incoming value of B2B2C presented as channelType must be rejected as a channel and must not be silently remapped.

Correct examples:

- channel=CH02, commercialModel=B2B2C for organization-side property/community commercial activity.
- channel=CH01, subchannel=CH01-B, commercialModel=B2C for a verified resident-side experience.
- channel=CH01, subchannel=CH01-A, commercialModel=B2C for an ordinary direct resident experience.

## 8. Connected-system authority

- Supabase: runtime authority.
- GitHub: application source, migrations, tests, machine-enforceable contracts.
- Vercel: deployment/runtime.
- Stripe: payment authority.
- HubSpot: CRM/account/contact/opportunity authority.
- Airtable: governance, reconciliation, commercial planning/economics reference.
- Notion: operating documentation/control knowledge.
- PostHog: behavioral/runtime evidence.
- Slack: communication only.

No connected tool may introduce a competing channel taxonomy.

## 9. Future channel releases

For every future channel, reuse:

Channel → Buyer/segment → Outcome/use case → Canonical offer/SKU → Commercial model → Pricing → Availability → Qualification/Fulfillment → Payment → Application/API → Evidence

CH02 is not the template for commercial assumptions in other channels. The architecture is reusable; each channel's commercial and fulfillment rules must still be audited independently.
