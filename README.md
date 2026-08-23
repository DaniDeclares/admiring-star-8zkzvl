# DANI DECLARES LLC — MASTER OPERATING AUTHORITY

**Effective:** August 23, 2026  
**Status:** Architecture locked; commercial catalog still under reconciliation

> **DANI DECLARES LLC is an Operational Asset Protection & Experience Infrastructure Company.**

This repository is the software/operations implementation layer for DANI DECLARES. The website, database, pricing logic, provider routing, documents, and AI-assisted workflows must follow the operating architecture below.

---

## 🚨 CRITICAL: LEGACY PRICING IS QUARANTINED

The repository previously contained multiple generations of pricing catalogs, pricing resolvers, geographic calculators, package engines, Stripe mappings, and provider-economics assumptions.

Those generations are **historical evidence only**.

They are no longer commercial authority and must not be used to calculate, display, quote, or checkout a customer price.

See:

**`docs/legacy-pricing-quarantine-2026-08-23.md`**

That document contains the recovered legacy pricing evidence and the list of quarantined pricing engines.

### Runtime rule

Until a new canonical pricing registry is intentionally established:

- no legacy numeric price may be returned as customer pricing;
- unreconciled services must return `PENDING RECONCILIATION`, `CUSTOM QUOTE`, `STARTING AT / QUOTED`, or `CONTRACT / SOLICITATION PRICING`;
- the system must fail closed rather than guess;
- historical prices remain available only for audit/reconciliation purposes.

---

# 1. COMPANY IDENTITY

DANI DECLARES is not a cleaning company, notary-only company, event-only company, product-only company, or single-purpose field-service company.

It is a parent operating company that captures needs, coordinates execution, protects customer time/assets, manages operational infrastructure, and routes fulfillment across multiple divisions.

Core proposition:

> **We protect your time and assets by handling the operational work that keeps things moving.**

---

# 2. MASTER OPERATING ARCHITECTURE

The authoritative hierarchy is:

```text
COMPANY
→ GOVERNANCE / AUTHORITY
→ DIVISION
→ CAPABILITY UNIVERSE
→ SERVICE FAMILY
→ CAPABILITY
→ SERVICE
→ TASK
→ COMMERCIAL OBJECT
→ SKU / PRODUCT IDENTITY
→ SCOPE
→ EXCLUSIONS
→ DEPENDENCIES
→ MODIFIERS
→ DELIVERY MODEL
→ COMMERCIALIZATION TYPE
→ PACKAGE
→ RECURRING PLAN
→ MEMBERSHIP
→ RETAINER / CONTRACT
→ CUSTOMER CHANNEL
→ BUYER TYPE
→ MARKET
→ SERVICE AREA / DISPATCH ZONE
→ CUSTOMER PRICE
→ TRANSACTION
→ FULFILLMENT WALL
→ FULFILLMENT LANE
→ PROVIDER
→ QUALIFICATIONS
→ INTERNAL COST
→ PAYOUT
→ MARGIN
→ SOP / WORKFLOW
→ QA / DOCUMENTATION
→ SLA
→ INTAKE
→ COMPLIANCE
→ CUSTOMER EXPERIENCE
→ LIFECYCLE
→ VERSION
→ LEGACY ID
→ SOURCE AUTHORITY
→ CONFLICT REGISTER
→ CROSS-DIVISION / DEPENDENCY MAP
```

No layer may overwrite, impersonate, or determine another layer.

---

# 3. THE SIX FUNDAMENTAL QUESTIONS

### WHAT?
Capability → Service Family → Service → Task → SKU

### HOW?
Scope → Exclusions → SOP → Workflow → Delivery Model → Modifiers

### WHO BUYS?
Channel → Buyer Type → Commercial Ownership

### WHERE?
Market → Service Area → Dispatch Zone

### WHO DOES IT?
Fulfillment Lane → Provider → Qualifications → Internal Economics

### WHICH VERSION IS REAL?
Lifecycle → Version → Legacy ID → Source → Conflict Register

---

# 4. 13-DIVISION ORGANIZATIONAL ARCHITECTURE

## Division 01 — Home, Pet, Plant & Household Support

Home cleaning, household maintenance/support, pet support, indoor plant care, organization/decluttering, household concierge, home watch, vacation preparation, seasonal support, move/transition support, and related household programs.

**Division 01 is NOT fully reconciled or SKU-locked.**

## Division 02 — Property, Facilities & Field Operations

Multifamily turns, make-ready, property readiness, facility maintenance coordination, inspections, field verification, work-order oversight, vendor coordination, and property inventory/supply support.

## Division 03 — Real Estate & Closing Support

Listing preparation, showing support, open-house readiness, transaction support, closing support, mobile closing logistics, vacancy checks, and real-estate field services.

## Division 04 — Administrative & Business Operations

Administrative assistance, scheduling, document handling, research, data entry, office operations, workflow support, business administration, and back-office execution.

## Division 05 — Notary & Document Services

Mobile notary, loan signing support, authorized witnessing/document services, authentication support, and document field support subject to applicable law and authorization.

## Division 06 — Business Formation & Digital Infrastructure

Business formation support, digital infrastructure, Google Workspace, domains/hosting, systems configuration, application/database support, and technical setup.

## Division 07 — Marketing, Content & Media Production

Marketing strategy, campaign operations, social media, content, property photography/video, walkthroughs, amenity media, video production, and editing.

**Chris's computer/PC, technical, recording, editing, and property-media capabilities remain represented here where applicable.**

## Division 08 — Business Development & Growth

Sales pipeline development, partnerships, referrals, vendor-network development, growth strategy, client acquisition, and commercial relationship architecture.

## Division 09 — Classes, Workshops & Training

Educational programs, entrepreneurship workshops, skills training, career development, lifestyle/skills classes, and resident/community education.

## Division 10 — Experiences & Resident Programming

Event planning, event production, community events, resident appreciation, pop-ups, hospitality, resident programming, setup/takedown, and vendor coordination.

**Event planning is a real company capability. It is not waiting to be discovered later.**

## Division 11 — Creative Design & Production

Graphic design, print production, branding assets, custom merchandise, DTF printing, heat press, custom apparel, and physical product fabrication.

**Chris's DTF, heat-press, and technical fabrication capabilities remain here where applicable.**

## Division 12 — Logistics, Courier & Asset Sourcing

Courier, delivery, errands, asset movement, document transport, material sourcing, procurement support, key handoff, chain-of-custody logistics, and field logistics.

## Division 13 — Government & Institutional Procurement

Government/institutional contracting readiness, procurement support, compliance packaging, solicitation support, contract administration, public-sector execution, and institutional delivery.

Division 13 is primarily an institutional/contract wrapper for capabilities originating in Divisions 01–12.

---

# 5. CUSTOMER CHANNELS

The six current customer channels are:

- **CH01 — Property Residents**
- **CH02 — Direct / Regular Residents**
- **CH03 — Property Management**
- **CH04 — Real Estate**
- **CH05 — Business / Commercial**
- **CH06 — Government / Institutional**

Channels are NOT divisions.

Channels are NOT delivery models.

A service may be usable through multiple channels without changing its organizational division.

---

# 6. CORE MARKETS

The current geographic framework contains seven core markets:

- Jonesboro
- Tucker
- Stone Mountain
- Chamblee
- Brookhaven
- Midtown
- Buckhead

Deprecated travel-surcharge engines must not be used.

Market treatment must come from the current commercial architecture and must not double-count location costs.

---

# 7. PROVIDER WALL

Customer pricing and fulfillment economics are independent branches.

```text
SKU
├── COMMERCIAL BRANCH
│   └── CHANNEL → MARKET → CUSTOMER PRICE
│
└── FULFILLMENT BRANCH
    └── LANE → PROVIDER → INTERNAL COST → PAYOUT → MARGIN
```

### DANI

Operational authority, commercial ownership, QA, scheduling, complex management, customer relationship management, coordination, and approved execution.

### CAYLA

Indoor plant/botanical care specialist. Internal benchmark: **$20/hour**. This is private fulfillment economics and must never become customer pricing.

### CHRIS

Technical/creative fulfillment capabilities including computer/PC support, hardware configuration, technical setup, video recording/editing, property media, DTF printing, heat press, and technical fabrication.

### CASS

Project/SOW fulfillment lane. Do not invent a universal hourly rate.

### NAWFside

Negotiated trade/volume/project fulfillment lane. Trade economics do not determine customer price.

### EXTERNAL SPECIALISTS

Use qualified/licensed/insured specialists where required by scope or law.

---

# 8. COMMERCIAL OBJECT TYPES

The system distinguishes:

- `SERV` — Service
- `PROD` — Product
- `DIGITAL` — Digital Product/Service
- `KIT` — Kit
- `RET` — Retainer
- `EVENT` — Event
- `WORK-ORDER` — Operational Work Order

Not every capability becomes a public SKU.

Not every task becomes a commercial object.

---

# 9. COMMERCIALIZATION TYPES

Possible commercialization states include:

- Fixed Price
- Configured Price
- Starting At / Quoted
- SOW / Custom Quote
- Recurring
- Package Component
- Membership Benefit
- Retainer
- Contract / Solicitation

These are delivery/commercialization mechanisms, not customer channels.

---

# 10. LIFECYCLE STATES

Use only:

- `CANONICAL_ACTIVE`
- `ABSORBED_REDIRECTED`
- `DEPRECATED_HISTORICAL`
- `PENDING_RECONCILIATION`

Legacy IDs must be preserved for traceability.

Historical documents are evidence repositories, not competing authorities.

---

# 11. 47-POINT RECONCILIATION RULE

Every surviving service/commercial object must eventually be evaluated against the full reconciliation vector covering:

1. Division
2. Section
3. Capability
4. Service Family
5. Service
6. Task
7. Commercial Object Type
8. SKU
9. Scope
10. Exclusions
11. Dependencies
12. Add-ons
13. Condition/Severity
14. Package Eligibility
15. Recurring Eligibility
16. Membership Eligibility
17. Retainer Eligibility
18. CH01 Rule
19. CH02 Rule
20. CH03 Rule
21. CH04 Rule
22. CH05 Rule
23. CH06 Rule
24. Market Treatment
25. Service Area / Dispatch Zone
26. Customer Price
27. Commercial Ownership
28. Fulfillment Lane
29. Assigned Provider
30. Provider Qualifications
31. Internal Cost
32. Provider Payout
33. Margin/Economics
34. SOP
35. Workflow
36. QA
37. Documentation
38. SLA
39. Intake Requirements
40. Compliance / Legal Boundaries
41. Customer Experience
42. Lifecycle Status
43. Version
44. Legacy IDs
45. Source Authority
46. Conflict Register
47. Cross-Division / Dependency Relationships

Unknown information must be marked `PENDING RECONCILIATION`, never guessed.

---

# 12. DIVISION 01 STATUS

Division 01 remains OPEN for deep reconciliation.

Known historical families include:

- 01-A Home Cleaning & Household Maintenance
- 01-B Pet & Companion Support
- 01-C Indoor Plant / Botanical Care
- 01-D Household Organization / Decluttering / Concierge
- 01-E Home Watch / Household Support / Vacation Preparation
- 01-F Move / Transition / Household Relocation Support
- 01-G+ Seasonal / Holiday / additional recovered household families

The section taxonomy is not final until historical source recovery is complete.

Known cleaning duplicate families include historical bathroom, kitchen, appliance, floor, and bedroom/living generations. Preserve legacy IDs; reconcile them before final SKU promotion.

---

# 13. PHASE STATUS

### Phase 0 — Capability Universe

**STRUCTURALLY ESTABLISHED** across all 13 divisions.

### Phase 1 — Enterprise Reconciliation

**ACTIVE.** Historical material is being reconciled against the current architecture.

### Division 01

**OPEN.** Deep reconciliation is incomplete.

### Divisions 02–13

**STRUCTURAL MAP ESTABLISHED.** Deep reconciliation remains pending.

### Pricing / Packages / Memberships / Retainers

**FROZEN WHERE RECONCILIATION IS INCOMPLETE.**

---

# 14. WEBSITE / RUNTIME RULES

The website is the front end of the operating system.

Primary intake route:

`/request-service`

The site must not expose or calculate legacy prices from quarantined engines.

Stripe is payment execution, not commercial authority.

Supabase is the operational backend foundation, not permission to bypass the commercial authority.

The website must fail closed when a service has no current canonical price.

---

# 15. LEGACY PRICING QUARANTINE

The following files contain or participate in historical pricing logic and must not be treated as current authority:

- `src/data/masterCatalog2026.js`
- `src/data/pricingCanon.js`
- `src/data/pricingResolver2026.js`
- `src/data/channelPricingMatrix2026.js`
- `src/data/b2bCommercialCatalog2026.js`
- `src/data/b2bEnterprisePackages2026.js`
- `src/data/b2bPricingResolver2026.js`
- `src/config/commercialRegistry.js`
- `src/config/stripeLinks.js`
- `src/services/travelCalculator.js`
- `api/travel-quote.js`
- `src/lib/operations/estimatePricingSnapshot2026.js`
- `src/lib/operations/pricingConnector2026.js`
- `src/services/proposalEngine.js`
- `scripts/generateStripeProducts.js`

See `docs/legacy-pricing-quarantine-2026-08-23.md` for the recovered values and audit rules.

**Do not import these files as pricing authority.**

---

# 16. DEVELOPMENT RULE

Audit first.

```text
Audit
→ Verify
→ Modify
→ Verify Again
→ PR
→ Checks
→ Merge
→ Deploy
→ Live Test
```

No new pricing engine, SKU catalog, package table, provider payout table, or checkout rule may be introduced outside the Master Operating Architecture.

---

# 17. CURRENT NEXT STEP

Continue **Phase 1 Enterprise Reconciliation**.

The immediate catalog work is Division 01 deep reconciliation using the full 47-point schema.

Do not prematurely lock prices, packages, providers, or section numbers.

Do not restart Phase 0.

Do not resurrect legacy generations.

**Architecture is locked. Catalog reconciliation is still in progress.**
