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

## Locked CH01 subchannel distinction

**CH01-A — Regular / Direct Residents**
- Normal direct-to-consumer resident ingress.
- Standard CH01 pricing.
- **No apartment-program discount/perk package by default.**
- A person does not receive CH01-B benefits merely because they live in an apartment.

**CH01-B — Apartment / Property Residents**
- The B2B2C resident/customer-beneficiary path.
- **Only available through a participating apartment/property relationship after that property has become a DANI DECLARES client.**
- The property/client sends the authenticated enrollment link or invitation to its residents.
- Enrollment establishes the resident's association with the specific property/community program.
- CH01-B benefits are delivered because the **property relationship exists**.
- The resident benefit package is a **property-sales/retention mechanism** for DANI. It is not designed as a general consumer promotion to acquire residents independently.

## B2B2C rule

B2B2C is a relationship model connecting an organizational relationship to an end-consumer/resident audience. It is not a sixth intake channel, catalog, pricing authority, checkout route, or service SKU.

For apartment/community relationships:
- organization/property operations use CH02;
- resident direct transactions use CH01;
- the apartment-program resident path is CH01-B;
- the normal direct-resident path is CH01-A;
- B2B2C is retained as relationship/program metadata linking the organization and resident experiences.

The organization and resident remain distinct identities.

The **property is the B2B client/acquisition target**. The resident is the end-customer/beneficiary of the apartment program when the resident is the person purchasing/receiving the service.

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

If the resident pays DANI directly through a participating apartment program, the transaction follows CH01-B and the property/community program relationship remains the required eligibility context.

If the resident pays DANI without a participating property relationship, the transaction follows CH01-A.

## Pricing and benefits

- **CH01-A receives no apartment-program discount by default.**
- **CH01-B receives the governed apartment-program benefits.**
- The current CH01-B baseline benefit is **15% on qualifying services**, subject to canonical service eligibility and program rules.
- The 15% benefit is not a general resident promotion and must not be exposed as a blanket offer to the public.
- CH01-B benefits are unlocked only through the participating property's authenticated enrollment path.
- CH01-B pricing/benefits never leak into CH02 organization contract pricing.
- Organization contract pricing never becomes resident pricing merely because a service benefits a resident.
- B2B2C does not create a new price book.
- Pricing remains governed by canonical service, channel/subchannel, market and pricing rules.
- Any property-specific benefit may be stronger, narrower, or differently structured only through an explicitly governed program record with identified eligibility/funding/authority; it must not be created ad hoc in the UI.

## Commercial strategy

The apartment-resident benefit is **not the core consumer acquisition strategy**.

The commercial sequence is:

**DANI wins property/client → property enables resident program → property distributes enrollment link → residents join CH01-B → residents receive governed benefits → property receives a stronger resident-facing value proposition → DANI gains property retention/expansion opportunity.**

Therefore marketing, sales, and KPI reporting must measure the **property/client acquisition and relationship value first**, with resident enrollment and usage treated as supporting evidence of property-program value.

## Connected-system authority

Supabase is runtime authority. GitHub is source/machine-enforceable contract authority. Vercel is deployment/runtime. Stripe is payment authority. HubSpot is CRM authority. Airtable is governance/economics/reference. Notion is operating control knowledge. Asana is execution control. PostHog is behavioral evidence. Slack is communication.

No connected system may create a competing channel taxonomy or independently grant CH01-B eligibility.

## Enforcement

New runtime routing must accept only CH01, CH02, CH03, CH04 or CH05 as official channels.

B2B2C may be carried as commercial-model metadata only.

CH01-A vs CH01-B is a governed subchannel distinction and must be determined from the authenticated commercial relationship/program context, not from a user-selected discount toggle.

Before any channel, relationship, pricing, benefit, catalog or routing mutation:

DEFINE -> TRACE -> COMPARE -> DETERMINE AUTHORITY -> CHANGE -> VERIFY
