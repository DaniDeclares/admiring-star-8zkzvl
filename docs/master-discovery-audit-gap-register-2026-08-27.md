# DANI DECLARES LLC — Master Discovery Audit & Gap Register

**Date:** 2026-08-27  
**Status:** OPEN — enterprise-wide discovery/reconciliation  
**Purpose:** Capture missing services, commercial objects, network capabilities, compliance gates, technical dependencies, beta requirements, and contradictions before any division is fully locked.

## 1. Authority

The six customer channels remain canonical. The 13 divisions remain canonical. Customer-side channels and worker-side Capability Network are separate architectures. No new official channel is created for a provider type, capability, use case, product, or fulfillment method.

The Phase 0 company-wide catalog lock establishes Execute / Coordinate / Source / Document / Deliver / Produce / Refer as fulfillment modes and explicitly separates catalog breadth, commercialization, fulfillment, economics, qualifications, equipment, and SKU creation.

## 2. Critical Discovery Finding

The current Supabase database is NOT the complete service universe. It currently contains 27 service rows: 8 active canonical Division 01 records and 19 pending records. Therefore database contents must not be treated as the master discovery pool.

Current commercial catalog state:
- 13 active divisions
- 6 active channels
- 27 service records
- 8 active services
- 19 pending-reconciliation services
- 40 package records, none public/active
- 28 add-on records, none active
- 8 commercial-behavior records
- 16 pricing rules
- 118 service-channel availability rows
- 8 service requirement rows
- 4 business-build relationships
- 2 provider organizations
- 0 provider records
- 0 provider capabilities
- 0 provider assets
- 0 provider coverage records
- 0 provider availability records
- 0 jobs
- 0 service requests
- 0 leads

## 3. Missing Discovery Categories Identified

The enterprise discovery pass must explicitly search for:

### Home / Property / Exterior
- Lawn mowing
- Lawn maintenance
- Yard cleanup
- Landscaping
- Garden/bed maintenance
- Leaf removal
- Gutter cleaning
- Pressure washing
- Driveway cleaning
- Patio/deck cleaning
- Exterior house washing
- Fence cleaning
- Outdoor furniture setup/put-away
- Storm/seasonal exterior reset
- Exterior painting coordination
- Tree/shrub work through qualified providers
- Pool maintenance coordination
- Irrigation/sprinkler services through qualified providers
- Pest-control coordination/referral
- Junk/furniture removal

### Household / Field / Handyman-adjacent
- Furniture assembly
- Furniture disassembly
- TV mounting
- Shelf/art mounting
- Light installation
- Cabinet installation/repair coordination
- Minor repair coordination
- Painting
- Drywall/patching
- Door/lock-related work where qualified
- Appliance installation/repair coordination
- Home technology/smart-home setup
- Move labor and furniture movement
- Delivery/pickup
- Donation drop-off
- Errands

### Automotive / Mobile
- Mobile detailing
- Fleet cleaning
- Vehicle transport coordination
- Mobile tire/roadside services through qualified providers
- Vehicle pickup/drop-off

### Production / Fabrication / Media
- DTF printing
- Heat press
- Laser engraving/cutting
- Custom signage
- Asset tagging
- Promotional products
- Custom apparel
- Corporate gifts
- Photography
- Videography
- Recording/editing
- Print production

### Professional / Specialist Network
- Notary
- Officiant/minister
- Bookkeeping
- Business administration
- Technical support
- Computer setup
- PC/workstation deployment
- Printer/scanner setup
- Website/application support
- Database/system configuration
- Cybersecurity/advanced IT as qualified external specialist only
- Security
- Catering
- HVAC/plumbing/electrical
- Appliance repair
- Specialized cleaning/restoration

These must enter the discovery pool first; they must not be automatically assigned to Division 01 or made into SKUs merely because they have been discussed.

## 4. Commercial Object Gaps

Packages, memberships, retainers, programs, bundles, add-ons, and custom SOWs require a separate reconciliation layer.

They must be able to compose services across divisions. A package does not inherit a single division merely because one component does.

The system must support:
- multi-division package composition
- membership entitlements
- recurring allocations/credits
- retainer capacity
- program milestones
- package eligibility rules
- ingress/gate rules
- add-ons/modifiers
- customer entitlements
- provider entitlements/network access
- cross-division work orders
- one customer relationship with multiple service/division relationships

## 5. Marketplace / Capability Network Gaps

The schema exists, but live operational master data is not populated sufficiently for beta dispatch.

Required before provider beta:
- provider identity
- provider organization
- relationship role(s)
- capability taxonomy
- equipment/assets
- credentials/licenses/certifications
- insurance
- geography/coverage
- availability
- capacity
- authorized SKU list
- payout/compensation terms
- agreement status
- performance score
- acceptance/response metrics
- evidence/QA requirements
- suspension/revocation state

Network access must remain an entitlement and must never imply guaranteed work.

## 6. Business-Build Model Gaps

Business-build relationships must support:
- setup
- launch
- commercialization
- pricing authority where granted
- marketing authority where granted
- systems/website build
- customer acquisition
- scaling
- deferred/revenue-triggered compensation
- milestone compensation
- IP ownership
- account ownership
- network access
- provider conversion
- termination/post-termination treatment

Renee, Cayla, Cass, NAWFside and Chris require agreement/scope/evidence reconciliation before all capabilities are treated as production-authorized.

## 7. Legal / Compliance Gates

The catalog needs service-level compliance metadata rather than a generic company-wide disclaimer.

Potential gates include:
- Georgia worker classification
- business licensing
- local occupational licensing where applicable
- insurance class/limits
- regulated trade licensing
- pesticide applicator/contractor licensing
- structural pest-control licensing
- veterinary/animal-care boundaries
- transportation requirements
- process-serving/legal-document boundaries
- notary rules
- officiant/legal ceremony boundaries
- data/privacy/security requirements
- background-check requirements
- customer property/access controls
- hazardous material/biohazard exclusions
- environmental/waste disposal rules
- tax classification
- government procurement requirements

## 8. Economics Gaps

The system must model customer economics and provider economics separately.

Required:
- customer price
- provider payout
- DANI gross margin
- travel/dispatch cost
- materials cost
- platform/payment cost
- taxes/pass-throughs
- cancellation/no-show economics
- minimum job economics
- surge/rush rules
- geographic price differences
- package allocation economics
- membership utilization economics
- retainer utilization economics
- cross-sell/customer lifetime value

## 9. Geographic Activation

Catalog breadth and operational activation must remain separate.

A service can exist in the catalog without being active in every geography.

Activation should consider:
- provider density
- qualified provider density
- coverage radius
- availability
- response rate
- capacity
- customer demand
- margin
- risk
- SLA
- equipment availability

A universal 'three providers = active' rule should not be hard-coded; thresholds should vary by service risk, demand, and SLA.

## 10. Ask DANI / Intent Orchestration

Ask DANI must be treated as an orchestration/intake layer, not a channel, division, or SKU.

It must translate unstructured customer intent into:
- likely use case
- candidate services
- required qualifications
- required equipment
- geographic eligibility
- package/membership opportunities
- multi-division work components
- quote vs instant-price route
- provider matching requirements
- compliance questions

## 11. Beta Program Gaps

Two explicit beta populations are needed:

### Customer Beta
Capture raw requests, willingness to pay, cross-division combinations, repeat demand, geographic demand, quote friction, cancellation behavior, and customer satisfaction.

### Provider Beta
Capture capabilities, equipment, geography, availability, qualifications, response rate, acceptance rate, completion rate, evidence quality, QA, payout experience, and provider retention.

Beta needs feature flags, cohort/segment controls, analytics events, consent/privacy controls, feedback collection, and a clear transition path from beta to production.

## 12. Current Analytics Finding

PostHog project exists but has no recent product events and no feature flags. Therefore the beta measurement layer is not operational yet.

Required analytics taxonomy should include at minimum:
- customer_intent_submitted
- service_candidate_generated
- quote_requested
- quote_viewed
- booking_started
- booking_completed
- payment_started
- payment_completed
- provider_profile_completed
- capability_verified
- opportunity_sent
- opportunity_viewed
- opportunity_accepted
- opportunity_declined
- job_started
- evidence_uploaded
- job_completed
- qa_passed
- payout_issued
- customer_repeat
- membership_started
- membership_utilized
- package_purchased
- cross_division_purchase

## 13. Current CRM / Commerce Finding

HubSpot currently contains zero Product records. Shopify currently contains zero products. Therefore neither system is currently authoritative for the catalog.

Stripe is connected in live mode, but the current connector surface used in this audit did not expose a catalog listing operation. GitHub search also found no hard-coded Stripe `price_` / `prod_` IDs. Stripe/catalog synchronization remains a verification gate, not an assumed completed integration.

## 14. Current Web / Deployment Finding

Vercel production deployments are READY, but the current production project has a runtime error on `/api/process-outbox` caused by a Prisma prepared-statement conflict (`42P05`, `s0 already exists`). This must be resolved before treating notifications/outbox processing as production-ready.

## 15. Current Architecture / Division Contradiction

Earlier discovery drafts proposed a hypothetical 'Division 08 Property Exterior & Maintenance' and 'Division 09 Automotive & Mobile Logistics.' Those are NOT the currently canonical 13 divisions in Supabase.

The live canonical divisions are:
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

Therefore pressure washing, lawn care, mobile detailing, and production capabilities must be classified against these actual 13 divisions. No new division should be created merely because a new category is discovered.

## 16. Market Benchmark Findings

Current marketplace competitors demonstrate that demand is broader than the original DANI household-cleaning catalog. Taskrabbit currently exposes categories including assembly, mounting, moving, cleaning, outdoor help, home repairs, painting, yardwork, lawn care, furniture removal, delivery, errands, pressure washing, gutter cleaning, landscaping, appliance installation, and more. Angi similarly exposes appliance repair, carpet cleaning, electrical, HVAC, house cleaning, gutters, landscaping, lawn/yard work, junk hauling, moving, pest control, pressure washing, roofing, siding, windows and related categories.

These benchmarks validate the discovery strategy but do not dictate DANI's final catalog.

## 17. Georgia Compliance Finding

Georgia Department of Agriculture states that paid pesticide application to another person's property requires the appropriate Commercial Applicator License and Pesticide Contractor License. This directly affects lawn care, turf treatment, mosquito control, and pest-related offerings.

Georgia Department of Labor guidance also emphasizes that independent-contractor status depends on the underlying relationship, not merely labels or an agreement. Direction/control, independent business status, and other statutory factors matter.

Georgia Department of Revenue states most services are generally exempt from sales tax, while certain tangible personal property and specified services are taxable; mixed service/product transactions require classification review.

## 18. Immediate Stop Conditions

Do not:
- lock Division 01 yet
- begin Division 02 service hydration yet
- create new SKUs solely from historical records
- reactivate legacy packages/add-ons
- activate regulated services without qualification gates
- activate provider dispatch before provider master data is populated
- treat PostHog/HubSpot/Shopify as populated systems
- assume Stripe catalog synchronization is complete

## 19. Immediate Work Order

1. Complete Master Discovery Pool across the Library and prior decisions.
2. Reconcile all 13 divisions against the discovery pool.
3. Separate service/product/capability/asset/commercial-wrapper records.
4. Reconcile packages, memberships, retainers, programs and add-ons globally.
5. Build the final service/capability dependency graph.
6. Build provider beta intake and verification requirements.
7. Define beta customer/provider analytics taxonomy.
8. Resolve Vercel outbox error.
9. Verify Stripe catalog state through an appropriate catalog-capable connector/API path.
10. Establish catalog-to-Stripe-to-website synchronization rules.
11. Only then re-open Division 01 for final atomic service reconciliation.
12. Lock Division 01 only after it passes all architectural, commercial, network, compliance, economics, and technical gates.

## 20. Final Principle

**DANI DECLARES should own the orchestration layer, not the capital burden of every capability.**

Catalog breadth may be broad. Operational activation must be evidence-based. A provider capability may fulfill many divisions. A customer may buy across many divisions. A package/membership/retainer may compose multiple divisions. The worker network is not a seventh channel. Ask DANI is not a SKU. Equipment is not a service. Historical evidence is not current authority.
