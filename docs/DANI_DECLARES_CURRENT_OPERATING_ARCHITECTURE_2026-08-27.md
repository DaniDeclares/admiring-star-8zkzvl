# DANI DECLARES LLC — Current Operating Architecture

**Effective:** 2026-08-27  
**Status:** CURRENT / GOVERNING

## 1. Customer Side — Five Official Commercial Channels

These five channels are the only official DANI DECLARES commercial/customer channels:

1. **CH01 — Resident Concierge**
2. **CH02 — Property Management & Apartments**
3. **CH03 — Real Estate Offices & Brokerages**
4. **CH04 — Businesses**
5. **CH05 — Government & Institutional Procurement**

No additional official customer channels are created for specialists, products, use cases, commercial models, events, partners, or fulfillment resources.

### CH01 Resident Concierge Subchannels

CH01 is internally segmented into resident service subchannels. These are **not additional commercial channels**; they are routing/service-family segments beneath CH01:

- **01A — Home & Cleaning**
- **01B — Pet Care & Household Pet Support**
- **01D — Household Concierge**
- **01E — Move & Transition**
- **01F — Seasonal**
- **01G — Household Programs**

A resident request may touch multiple CH01 subchannels and may also route to other DANI divisions when the requested work requires them.

The former database labels `CH01 Property Residents`, `CH02 Direct / Regular Residents`, `CH03 Property Management & Apartments`, `CH04 Real Estate Offices & Brokerages`, `CH05 Businesses / Commercial`, and `CH06 Government & Institutional Procurement` were reconciled on 2026-08-27. The duplicate resident channel was removed and the remaining channels were renumbered to the canonical five-channel architecture.

## 2. Worker Side — Capability Network

The worker side is **not a second channel system**. It is the DANI DECLARES Capability Network.

A network participant may be an individual, business, professional, specialist, subcontractor, vendor, employee, or strategic partner. A participant may hold multiple capabilities and multiple relationship types.

Core attributes:
- capabilities
- service specialties
- credentials/licenses/certifications
- insurance
- equipment/assets
- geography/coverage
- availability/capacity
- authorized DANI SKUs
- agreement and compensation terms
- performance history
- network-access level

## 3. Network Access

Network access is an entitlement, not a channel and not a promise of income.

Levels:
- NONE
- APPLICANT
- VERIFIED
- AUTHORIZED
- PREFERRED
- STRATEGIC

A qualifying Business Setup, Launch, Scaling, project, deferred-payment, or other written agreement may include network access. Eligibility remains SKU- and compliance-specific. Access does not guarantee work.

## 4. Business-Build / Commercialization Clients

DANI may build, launch, commercialize, or scale a client's business/capability. Business-build work may include:
- business/service architecture
- pricing
- packaging
- branding/marketing
- website and intake infrastructure
- payment systems
- administrative systems
- SOPs/workflows
- sales/customer acquisition
- operational coordination
- scaling support
- network access where contractually included

Business-build relationships are relationship types, not additional commercial channels.

## 5. Commercial Models

B2C, B2B, B2B2C, and B2G remain valid commercial relationship/economic models. They are not official channels.

## 6. Fulfillment Model

Customer request → channel/subchannel/segment → division/service/SKU → commercial rules → qualification → eligible network → opportunity → acceptance/assignment → execution → evidence/QA → invoicing/payment → provider settlement → follow-up/cross-sell.

DANI may fulfill directly, use employees, independent providers, subcontractors, strategic partners, vendors, or other qualified resources as appropriate.

## 7. Governance Rules

- Georgia is the current commercial operating jurisdiction.
- Canonical catalog/pricing outranks legacy code/data.
- Legacy material is archived/quarantined rather than used for current commerce.
- No service becomes active solely because it was discussed historically.
- Active offerings require a defined commercial owner, customer/channel fit, service/product class, price model, fulfillment method, and applicable compliance status.
- Regulated/specialized work requires appropriate credential/license/insurance verification and contract scope.
- Network access does not guarantee work.
- Public customer-facing commercial data must not expose provider economics, private fulfillment agreements, internal margins, restricted finance, or internal funding records.

## 8. Platform System-of-Record Map

| System | Governing role |
|---|---|
| GitHub | Source code and technical history |
| Vercel | Application deployment/runtime |
| Supabase | Canonical application data, operational state, identity linkage, permissions |
| Stripe | Payment execution and reconciliation |
| Shopify | Product commerce execution |
| HubSpot | CRM, sales relationships, opportunities and communications |
| Apollo / FullEnrich | B2B prospecting and enrichment |
| Semrush | SEO and market intelligence |
| Clutch | B2B provider/service-provider intelligence |
| PostHog | Product and funnel analytics |

No connected platform may silently become a competing source of commercial truth.

## 9. Core Commercial Architecture

Master commercial catalog → channel/subchannel → customer/segment/use case → pricing → pricing rules → service execution → package/membership/retainer → capability/provider → dispatch/network → portal/workflow.

The canonical customer transaction is:

**discover → identify → request → qualify → estimate/quote → approve → pay → match → schedule → fulfill → verify → complete → review → retain → repeat**

The canonical provider transaction is:

**apply → verify → activate → set availability → receive opportunity → accept → fulfill → evidence → complete → settlement → performance → repeat**

## 10. Current Production State — 2026-08-27

- Canonical five-channel database migration applied successfully.
- Duplicate resident channel removed after confirming its pricing rows duplicated the canonical resident pricing rows.
- Supabase currently contains five active commercial channels after reconciliation.
- CH01 resident subchannels are now explicitly governed as 01A, 01B, 01D, 01E, 01F and 01G beneath CH01.
- Supabase Vault contains the `dd_cron_secret` secret name; the secret value is never stored in source control.
- Production Auth currently has zero users; intentional staff/provider/customer identities remain an activation gate.
- Provider organizations exist, but no individual provider records are currently active; provider compliance/authorization remains a hard routing gate.
- Public provider/private economics separation remains mandatory.
- Live Stripe crosswalk and final end-to-end payment/job verification remain required before declaring commerce fully activated.

## 11. Out of Active Scope

- Six-channel customer architecture
- Superseded pricing/package definitions
- Legacy product/price records in customer-facing commerce
- South Carolina as an active commercial catalog jurisdiction
- Unverified regulated services
- Guaranteed-work representations for network participants
- New official channels created merely for customer types, specialists, products, events, commercial models, or fulfillment resources

Historical records may remain available for audit and provenance but are not active commercial authority.
