# DANI DECLARES Commercial Activation Rules — 2026

## Authority

The Master Commercial Universe is the authoritative commercial source. Activated runtime records are downstream representations. A SKU is sellable only when its canonical offer, channel/subchannel, pricing, fulfillment, compliance, and QA gates are satisfied.

## Five locked channels

- CH01 — Resident Concierge
  - CH01-A — Regular Resident Concierge
  - CH01-B — Apartment Resident Concierge
- CH02 — Property Management & Apartments
- CH03 — Real Estate Offices & Brokerages
- CH04 — Businesses
- CH05 — Government & Institutional Procurement

Providers/workers are fulfillment infrastructure, not a commercial channel.

## Activation buckets

### SELL NOW
All required conditions are true:
- canonical active offer
- approved customer price
- correct channel and buyer mapping
- valid territory
- fulfillment lane exists
- qualified/authorized provider or internal fulfillment capability exists
- applicable compliance requirements verified
- SOP/QA exists
- checkout route is enabled

### INTAKE / QUOTE
Use when the offer is commercially defined but requires custom scope, estimator review, SOW, project pricing, or other controlled quote logic. No unapproved price may be inferred from client input.

### FULFILLMENT GATED
Use when commercial definition and pricing may exist but fulfillment capacity, provider qualification, coverage, licensing, insurance, agreement, SOP/QA, or another operational gate is unresolved. Do not expose as direct production checkout.

### DO NOT SELL
Use for unresolved compliance/statutory authority, unverified pricing, obsolete/legacy SKU authority, unmapped territory, prohibited scope, or other hard blockers. Checkout must fail closed.

## CH01 pricing isolation

CH01-A and CH01-B are separate commercial relationships and price books. CH01-B must never silently inherit CH01-A pricing. Apartment/community pricing is resolved from the apartment/community price book; community overrides may replace the base apartment rule. The existing 15% resident/community benefit is a distinct rule, not a mutation of the Regular Resident price book.

## Provider economics

Customer price and provider payout are separate private operational values. Never expose provider splits, internal costs, margin targets, or provider rates in public/client payloads. Do not invent provider rates. Statutory fees and verified pass-throughs are handled separately according to the applicable compliance rules.

## Fail-closed requirements

- Client-supplied price is ignored.
- Historical/legacy Stripe IDs cannot authorize a transaction.
- Noncanonical SKU/channel combinations are rejected.
- CH02–CH05 cannot be spoofed through CH01 routes.
- A provider is not dispatch-eligible merely because a provider record exists.
- Completion and payout require the established work-order, evidence, QA, and financial gates.
