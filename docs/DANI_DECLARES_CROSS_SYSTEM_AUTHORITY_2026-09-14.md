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


## Role & Workspace Architecture

DANI DECLARES uses one governed platform with role-based workspaces. A dashboard is a permissioned view of shared authoritative data; it is not a separate database or competing source of truth.

A single identity may hold multiple roles. Access is additive only where explicitly authorized. The owner may access multiple internal workspaces without maintaining separate accounts.

Governed workspace families:

- Owner / Executive — DANI HQ
- Sales / Business Development — Sales Console
- Operations / Dispatcher — Operations Command Center
- Estimator / Quote Specialist — Quote Desk
- Customer Service / Concierge — Customer Care
- Provider Recruitment / Onboarding — Provider Management
- Field Provider / Worker — Provider Portal
- Quality Assurance / Field Supervisor — QA Console
- Finance / Bookkeeping — Finance Console
- Contracts / Account Management — Account Console
- Marketing / Growth — Growth Console
- System Administrator / Technical Operations — Admin Console
- Customer — Customer Portal

Government contracting/procurement, HR, compliance, inventory and purchasing begin as permissioned modules inside the appropriate workspace and become standalone workspaces only when operating volume and dedicated staffing justify the separation.

### Workspace control rules

1. Authentication establishes identity; authorization establishes roles and permissions; workspace routing follows the governed authorization result.
2. Role and workspace are not one-to-one. One person may have multiple roles, and a workspace may require multiple granular permissions.
3. Internal users must receive the minimum access required for their duties. Owner authority does not imply that every internal employee receives owner/system-administrator authority.
4. Sales cannot override commercial, pricing, fulfillment or compliance gates merely to complete a sale.
5. Provider onboarding authority is distinct from provider dispatch eligibility. Application does not equal qualification, verification, authorization, availability or dispatch eligibility.
6. Finance access does not automatically grant provider, sales, customer, infrastructure or system-administration authority.
7. System administration is separated from ordinary operations even when the owner can access both.
8. A transaction initiated in one workspace must continue through the same governed operating chain rather than being re-created in another workspace.
9. Supabase remains runtime/operational authority for identity-linked operational state and permissions consumed by the application; GitHub defines application behavior; other domain systems retain their authority as specified above.
10. New positions should be implemented by composing roles/permissions and workspace modules before creating a new database or parallel application.
