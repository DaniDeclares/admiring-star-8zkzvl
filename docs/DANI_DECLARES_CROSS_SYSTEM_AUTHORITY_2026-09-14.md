# DANI DECLARES — Cross-System Authority & Change Control

**Effective:** 2026-09-14

## Purpose

DANI DECLARES is one connected enterprise system. Audits must resolve conflicts by the authority of the domain involved, then trace downstream dependencies before changing anything.

## Authority by domain

| Domain | System of record | Governs |
|---|---|---|
| Business governance | Airtable | Business classification, working catalog, governance relationships, commercialization planning/reference |
| Runtime commercial truth | Supabase | Runtime services, governed offers, commercial/fulfillment status, operational relationships used by the application |
| Payment truth | Stripe | Charges, payment intents, checkout/payment objects, refunds and payment outcomes |
| Application behavior | GitHub | Source code and application configuration actually implementing business logic |
| Deployment/hosting | Vercel | What application revision/configuration is deployed and serving traffic |
| CRM/pipeline | HubSpot | Leads, customer relationships, opportunities and CRM lifecycle |
| Customer behavior | PostHog | Product usage, traffic, conversion and behavioral evidence |
| Prospect discovery | Apollo / FullEnrich / Clutch / Zillow | External discovery/enrichment inputs only; these do not become CRM authority automatically |

## Conflict rule

Authority is **domain-specific**, not a universal ranking. A lower-listed system must not redefine another system's domain. For example:

- Supabase determines whether a runtime offer is eligible for checkout.
- GitHub determines whether the application actually reads that authority.
- Vercel determines whether the relevant code is deployed.
- Stripe determines whether money actually moved.
- PostHog determines whether customers encountered and used the resulting flow.

## Required audit loop

**DEFINE → TRACE → COMPARE → DETERMINE AUTHORITY → CHANGE → VERIFY**

Every material audit must identify the finding's disposition. A comparison without a corrective action is not reconciliation.

## Prospecting rule

Apollo, FullEnrich, Clutch and Zillow are source inputs. Qualified prospects should be normalized into HubSpot rather than maintained as parallel CRM lists. Provenance must be preserved.

## Behavioral control rules

PostHog is a feedback/control signal, not commercial authority. Governance-review candidates include checkout-eligible SKUs with meaningful traffic but zero real conversions. Revenue-review candidates include high-traffic SKUs that remain fulfillment-gated or intake-only.

## Change control

Objective architecture/data corrections may be executed when supported by the established authority model. Business-policy changes require owner approval. Ambiguous records are preserved rather than deleted. Every write must be followed by verification of the affected downstream system(s).

## Payment-specific control

The direct-payment path must authorize from the governed Supabase runtime catalog, validate the frozen estimate server-side before creating Checkout, and reconcile the Stripe webhook before advancing the operational request/job state. Quote/SOW/variable services remain outside blind direct checkout.
