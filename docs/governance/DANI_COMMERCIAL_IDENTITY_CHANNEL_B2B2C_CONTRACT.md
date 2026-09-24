# DANI Commercial Identity, Channel & B2B2C Contract

## Locked channel taxonomy

DANI has exactly five official customer channels:

- CH01 — Resident Concierge
- CH02 — Property Management & Apartments
- CH03 — Real Estate Offices & Brokerages
- CH04 — Businesses
- CH05 — Government & Institutional Procurement

CH01-A and CH01-B are subchannels of CH01.

B2C, B2B, B2B2C and B2G are commercial relationship/economic models, not additional channels.

## B2B2C rule

B2B2C is a relationship model connecting an organizational relationship to an end-consumer/resident audience. It is not a sixth intake channel, catalog, pricing authority, checkout route, or service SKU.

For apartment/community relationships:
- organization/property operations use CH02;
- resident direct transactions use CH01 and the governed CH01-A/CH01-B subchannel;
- B2B2C is retained as relationship/program metadata linking the organization and resident experiences.

The organization and resident remain distinct identities. An organization may sponsor, subsidize, discount, or simply provide access. It does not have to pay for a resident service.

## Commercial roles

A request must be able to distinguish:
- buyer
- payer
- recipient
- beneficiary
- coordinator
- organization
- resident/person
- program
- official channel
- commercial model
- pricing context
- provenance

If the organization pays DANI, the organization-side commercial authority governs the transaction and the resident is the recipient/beneficiary.

If the resident pays DANI directly, the transaction follows the appropriate CH01 path and the organization/community relationship remains eligibility/program context.

## Pricing

- CH01 resident pricing never automatically becomes CH02 pricing.
- CH01-B eligibility is server-verified.
- Resident discounts never leak into organization contracts.
- Organization contract pricing never becomes resident pricing merely because the service benefits a resident.
- B2B2C does not create a new price book.
- Pricing remains governed by canonical service, channel/subchannel, market and pricing rules.

## Connected-system authority

Supabase is runtime authority. GitHub is source/machine-enforceable contract authority. Vercel is deployment/runtime. Stripe is payment authority. HubSpot is CRM authority. Airtable is governance/economics/reference. Notion is operating control knowledge. Asana is execution control. PostHog is behavioral evidence. Slack is communication.

No connected system may create a competing channel taxonomy.

## Enforcement

New runtime routing must accept only CH01, CH02, CH03, CH04 or CH05 as official channels. B2B2C may be carried as commercial-model metadata only.

Before any channel, relationship, pricing, catalog or routing mutation:

DEFINE -> TRACE -> COMPARE -> DETERMINE AUTHORITY -> CHANGE -> VERIFY
