# DANI DECLARES LLC — 2026 Pricing Compliance & Channel Specification

**Status:** Business-specification baseline / migration control document
**Branch:** `pricing/compliance-b2b-b2c-audit`

> This is a commercial/engineering specification, not legal advice. Statutory fees, tax treatment, consumer disclosures, cancellation terms, notarial requirements, and other regulated matters must be reviewed for the jurisdictions in which DANI DECLARES operates before publication or charging.

## 1. One system, separate commercial channels

DANI DECLARES uses **one canonical pricing system** containing B2C, B2B, B2B2C, and B2G services. B2C and B2B are intentionally different commercial channels, not separate sources of truth.

Every service record must define: channel, customer type, service, pricing unit, base price, included scope, exclusions, modifiers, discount eligibility, materials/pass-through treatment, travel treatment, approval requirements, disclosures, effective date, legacy IDs, and pricing status.

### Pricing statuses

- `LOCKED` — approved business price
- `PROPOSED` — candidate only; not publishable as final
- `UNDEFINED_PENDING` — requires business/cost/compliance decision
- `CUSTOM_QUOTE` — scope must be quoted
- `DISCARDED_LEGACY` — historical repository value; never surface

A number existing in legacy code does not become canonical merely because it exists.

## 2. B2C vs. B2B rules

### B2C

- Clear retail/package pricing.
- Mandatory known fees disclosed before payment.
- Additional work cannot be silently added.
- Eligible resident discount may apply only to designated services.
- Government/statutory/pass-through fees are not discounted unless expressly stated.
- Gift cards are sold at face value and receive no resident discount.
- Severe-condition charges are non-discountable where designated.
- Materials, travel, disposal, and third-party charges are disclosed when not included.

### B2B

- **No automatic 15% B2C resident discount.**
- Commercial pricing may be per-unit, hourly, per-item, per-event, retainer, volume, SOW, or custom quote.
- Proposal/work order/SOW controls the contracted scope.
- Base price applies only to the defined scope and assumptions.
- Scope expansion follows **DOCUMENT → NOTIFY → APPROVE → PROCEED** whenever reasonably practicable.
- Commercial materials sourcing uses **Cost + 10%** where applicable.
- Government, permit, disposal, filing, shipping, venue, and other pass-through charges are separate unless expressly included.
- Modifiers require objective triggers and documentation before being locked.
- Retainers are commercial contracts, not resident memberships.

### B2B2C / Community

The commercial payer and resident-facing benefit must be represented separately. A community-paid service or resident perk must never accidentally inherit direct-B2C or ordinary-B2B pricing rules.

## 3. B2C locked business baseline

| Service | Retail | Eligible Resident | Status |
|---|---:|---:|---|
| Resident Refresh — 1BR | $100 | $85 | LOCKED |
| Resident Refresh — 2BR | $150 | $127.50 | LOCKED |
| Resident Refresh — 3BR | $250 | $212.50 | LOCKED |
| Resident Refresh — 4BR | $375 | $318.75 | LOCKED |
| Deep Structural Reset — 1BR | $275 | $233.75 | LOCKED |
| Deep Structural Reset — 2BR | $325 | $276.25 | LOCKED |
| Deep Structural Reset — 3BR | $425 | $361.25 | LOCKED |
| Deep Structural Reset — 4BR | $550 | $467.50 | LOCKED |
| Premium Move-In Vacant Reset | Starting $375 | Starting $318.75 | LOCKED / STARTING |
| Severe Pet Mess / Heavy Soil | $150 | Non-discountable | LOCKED |
| Wash, Dry & Fold — basket | $45 | $38.25 | LOCKED |
| General Notary | $35/signature | — | LOCKED BUSINESS BASELINE; jurisdiction review required |
| Mobile Notary Dispatch | $65 base | — | LOCKED BUSINESS BASELINE; disclose separately from statutory fee |
| Referral Service Credit | $25 | $25 | LOCKED |
| Gift Cards | Face value | No discount | LOCKED |

B2C membership tiers and final prices remain `UNDEFINED_PENDING` until reconciled with the legacy membership implementation.

## 4. B2B Property Management baseline

| Service | Price | Status |
|---|---:|---|
| Standard Turn / Make-Ready — standard 1–2BR scope | $350/unit | LOCKED |
| Deep Move-In / Reset | $450/unit | LOCKED |
| Minimum Maintenance Dispatch | $85 | LOCKED |
| Commercial Handyman | $55/hr | LOCKED |
| Materials sourcing | Cost + 10% | LOCKED POLICY |
| Property Support Retainer | $1,500/mo | LOCKED |
| Resident Experience Program | $3,250/mo | LOCKED |
| Operations Partner | $4,500/mo | LOCKED |

**Do not use the legacy $250/$350/$450 1BR/2BR/3BR structure as the new commercial definition.**

B2B 3BR+ / additional-bedroom pricing remains `UNDEFINED_PENDING`.

## 5. B2B Real Estate baseline

| Service | Price | Status |
|---|---:|---|
| Listing / Physical Support | $55/hr | LOCKED |
| Open House Setup & Takedown | $300/event | LOCKED |
| Listing & Transaction Support | $1,200/mo | LOCKED |
| Office Operations | $2,500/mo | LOCKED |

## 6. B2B Scope Shield

### Mandatory pre-work baseline

1. Entrance/main-room wide photo
2. Appliance interior photo as applicable
3. Visible debris photo
4. Damage/pre-existing-condition photo

### Waste

The former 15-lb rule is **replaced** by a visual handling metric:

- Bag 1 or less: included
- Standard allowance: one 33-gallon contractor bag
- Additional-bag price: `UNDEFINED_PENDING`
- Bag-count ceiling: `UNDEFINED_PENDING`
- Beyond ceiling: custom debris-removal project

The previously discussed +$40/bag is **PROPOSED, not locked**.

### Special handling

Use predefined categories rather than subjective crew judgment:

- small bulk
- large bulk
- two-person handling
- specialty disposal
- furniture
- mattress
- large appliance
- electronics

The previously discussed +$75/item is **PROPOSED, not locked**. Two-person handling must not double-charge the same item.

### Heavy soil / pet mess

Both remain `UNDEFINED_PENDING` for B2B until trigger, labor, material, documentation, approval, and margin rules are validated. Prior $150 B2B proposals are not canonical.

### Access / second trip

The $85 dispatch baseline is locked for minimum maintenance dispatch. Exact wait-time/second-trip stacking rules require explicit contractual language before implementation.

## 7. Events

Events require their own pricing model. Do not promote a legacy guest-count formula to canonical pricing without business approval.

Event records must support event type, guest count, duration, staffing, setup, teardown, rentals, materials, travel, venue requirements, overtime, special requests, deposits, cancellation/rescheduling, and custom-quote status.

## 8. Required compliance disclosures

### Notary

Customer-facing notary content must distinguish, where applicable:

1. statutory/regulated notarial fee
2. DANI DECLARES service fee
3. mobile/travel/dispatch fee
4. third-party/pass-through charges

Suggested disclosure:

> DANI DECLARES LLC provides notarial services only where authorized and does not provide legal advice or document-drafting services unless separately and lawfully offered. Notarial fees, service/dispatch fees, travel charges, and third-party fees are disclosed separately where applicable. Applicable statutory fee limits and requirements may vary by jurisdiction.

Final wording requires jurisdiction-specific review.

### Document preparation

> Administrative document preparation is limited to organization, formatting, completion assistance, or other expressly stated administrative support. DANI DECLARES does not provide legal advice or attorney services through administrative document-preparation offerings.

### I-9 / employment documentation

> DANI DECLARES provides administrative/documentation support and does not make employment eligibility determinations on behalf of an employer except to the extent specifically authorized and legally permitted.

### Apostille / authentication

> DANI DECLARES provides administrative coordination/support for document authentication or apostille processes. Government, agency, filing, certification, shipping, and other third-party fees are separate unless expressly included. Processing times and acceptance are controlled by the applicable authority.

### Cleaning / property

> Pricing applies to the stated service scope and ordinary service conditions. Additional labor, severe conditions, specialty handling, disposal, materials, travel, or third-party charges may apply where disclosed and authorized under the applicable service terms.

### B2B scope

> Commercial pricing is based on the scope, access conditions, unit/property condition, service specifications, and assumptions stated in the applicable proposal, work order, SOW, or service agreement. Conditions materially exceeding that scope may result in an additional charge. Qualifying additional work will be documented and submitted for approval before proceeding whenever reasonably practicable.

### Pass-through

> Government fees, permit/filing charges, disposal charges, shipping, venue charges, third-party service fees, and other pass-through costs are not subject to promotional or resident discounts unless expressly stated otherwise.

### Materials

> Materials sourced by DANI DECLARES for commercial services may be billed at documented acquisition cost plus the applicable 10% sourcing markup, unless the governing proposal or agreement states otherwise.

## 9. Canonical UI rule

No customer-facing component may own a service price.

Required flow:

`Customer UI → Pricing Resolver → Canonical Service Record → Price + Scope + Disclosure Metadata`

The resolver must return pricing unit, starting/custom-quote state, discount eligibility, exclusions/disclaimers, approval requirements, and applicable modifier disclosures.

## 10. Lock gate

A service/modifier may become `LOCKED` only after:

1. business intent
2. channel/customer
3. pricing unit
4. included scope
5. exclusions
6. modifier trigger
7. labor/cost model
8. margin validation
9. material/pass-through treatment
10. discount treatment
11. customer disclosure
12. applicable compliance review
13. canonical-data update
14. resolver/UI/checkout integration

## 11. Immediate unresolved decisions

1. B2B 3BR+ / additional-bedroom pricing
2. B2B bathroom modifier
3. Additional-bag price
4. Bag ceiling
5. Partial-bag rounding
6. Small-bulk price
7. Large-bulk price
8. Two-person/specialty handling structure
9. Disposal-cost model
10. Heavy-soil trigger and price
11. Pet-mess trigger and price
12. Rush/after-hours pricing
13. Second-trip/wait-time stacking
14. Final B2C membership tiers/prices
15. Event pricing architecture
16. Travel policy across channels
17. Jurisdiction-specific notary/statutory fee treatment
18. Final compliance/legal review

## 12. Migration guardrails

Until the above is resolved:

- do not bulk-replace legacy prices
- do not treat repository `LOCKED_2026` labels as business authority
- do not apply B2C discounts to B2B
- do not charge unapproved modifiers
- do not silently expand B2B scope
- do not expose statutory fees as DANI DECLARES fees
- do not hardcode prices in customer-facing JSX
- do not delete legacy pricing sources until reachability is proven

## 13. Target end state

**One master commercial pricing system** containing B2C Resident Concierge, B2B Property Management, B2B Real Estate, B2B2C Community/Resident Perks, B2G Government Procurement, and future approved channels.

Business specification controls intent. Canonical data controls values. Resolver controls calculations. UI and checkout consume resolver output. Disclosures travel with the service definition.
