# DANI DECLARES LLC — Platform Capability Gap Matrix

**Date:** 2026-09-05  
**Status:** GOVERNING BUILD ROADMAP / AUDIT OUTPUT  
**Purpose:** Reconcile the recovered platform direction with the current application so portal work extends the existing system instead of creating disconnected apps.

## 1. Target platform

DANI DECLARES is building a unified operating platform whose capabilities incorporate proven patterns from marketplace, field-service, CRM, workforce, dispatch, payments, and customer-experience products. These are capability references, not required third-party dependencies.

Reference capability families:
- DoorDash / Uber: dispatch, assignment, availability, routing, on-demand execution
- Thumbtack: lead intake, matching, marketplace opportunity flow
- Jobber / Housecall Pro: CRM-to-quote-to-job-to-invoice field-service lifecycle
- Jibble: worker time and attendance accountability
- Airbnb-style systems: trust, identity, reputation, verification
- ServiceNow-style systems: work orders, SLA, incidents, approvals, auditability
- Event/hospitality platforms: event lifecycle, guest/service logistics, event-day operations

## 2. Current platform layers

| Capability | Current state | Gap | Priority |
|---|---|---|---|
| Authentication / role routing | Implemented | Full role/account test matrix | P0 |
| Portal identity scope | Hardened | Continue end-to-end tests | P0 |
| Customer organization/property scope | Partially implemented | Formal organization/property authorization model across all endpoints | P0 |
| CH01-B resident invitation/property binding | Implemented + hardened | Full abuse-path testing | P0 |
| Provider identity/capability model | Architecture defined | Runtime capability lifecycle needs expansion | P0 |
| Provider compliance/document vault | Partial architecture | Capability-specific compliance workflow/runtime enforcement | P0 |
| Provider availability | Partial/limited | Native availability/capacity model | P0 |
| Matching engine | Hardened routing infrastructure | Automated fallback and richer ranking | P0 |
| Dispatch | Implemented basic offer/accept flow | Automated multi-provider dispatch/fallback | P0 |
| Scheduling | Implemented basic appointments | Availability-aware scheduling and conflict controls | P0 |
| Job/work-order lifecycle | Partial | Full state machine, dependencies, SLA, exceptions, closeout | P0 |
| Provider tasks/evidence | Implemented + DB scope gate | Storage authorization + richer QA/closeout | P0 |
| Time tracking | Not verified as full runtime capability | Job-linked time/attendance/approval | P1 |
| Customer CRM | HubSpot exists as CRM layer | Deeper lead/account/opportunity synchronization | P1 |
| Quotes/estimates | Implemented staff quote builder | Full quote→approval→contract→job lifecycle | P0 |
| Contracts/SOW | Partial | Native contract/SOW/renewal model | P1 |
| Billing/invoices | Partial | Full invoice/payment/change-order/reconciliation lifecycle | P0 |
| Provider payout | Data/runtime exists | Governed settlement/reconciliation workflow | P1 |
| Messaging | Partial notifications | Unified customer↔DANI↔provider conversation timeline | P0 |
| Notifications | Transactional infrastructure exists | Event-driven notification matrix/preferences | P1 |
| Recurring services | Catalog concepts exist | Runtime recurring job/billing/renewal engine | P1 |
| Memberships/retainers/packages | Airtable objects exist | Reconcile into runtime without creating duplicate authority | P1 |
| Property operations | Partial | Portfolio/property/building/unit operational model | P0 for CH02 contracts |
| Resident experience | Partial | Full CH02→CH01-B property-aware experience | P1 |
| Real estate workspace | Partial/general customer model | CH03-specific workflow extensions | P1 |
| Business workspace | Partial/general customer model | CH04-specific workflow extensions | P1 |
| Government workspace | Partial/general customer model | CH05 procurement/contract/reporting extensions | P1 |
| Event operations | Catalog/services exist | Event lifecycle/run-of-show/staff/vendor execution | P2 |
| Documents | Partial | Unified document vault, versioning, expiration, access rules | P0 |
| Storage/evidence security | Database/API controls exist; evidence scope gate added | Complete storage.objects audit and production abuse-path tests | P0 |
| QA/reputation | Partial | Structured QA, reviews, rework, provider performance | P1 |
| Inventory/equipment | Service engineering tables exist | Runtime equipment/assets/material usage | P2 |
| Multi-state rules | Architecture direction exists | State/jurisdiction activation and compliance engine | P1 |
| Analytics/command center | Operations console exists | Executive, sales, operations, provider, financial dashboards | P1 |
| Automation/event engine | Outbox/event infrastructure exists | Complete business-event orchestration | P1 |
| AI operations layer | Not established as core runtime | Add only after governed primitives are stable | P2 |

## 3. Non-negotiable architecture

Do not create separate apps for each reference product or customer channel.

Build shared primitives once:

**Identity → Organizations → Locations → People → Catalog → Pricing → Requests → Quotes → Contracts → Jobs → Tasks → Appointments → Assignments → Providers → Time → Evidence → QA → Billing → Communications → Reporting**

Customer/channel portals are permissioned views into these shared primitives.

Official channels remain exactly:
- CH01 Resident Concierge
- CH02 Property Management & Apartments
- CH03 Real Estate Offices & Brokerages
- CH04 Businesses
- CH05 Government & Institutional Procurement

The provider network is fulfillment infrastructure, not a sixth channel.

## 4. Provider architecture is capability-based

One provider participant has one account/profile and can hold multiple capabilities. Capability activation is independently governed by service, geography, documentation, compliance, availability, equipment, and authorization requirements.

Lifecycle:

**Participant → Capabilities → Compliance → Authorization → Opportunities → Assignment → Execution → Evidence → QA → Settlement**

A provider prospect is never automatically dispatchable.

## 5. Recommended build sequence

### P0 — Contract-ready operating core
1. Complete portal authorization matrix.
2. Complete Storage/evidence authorization.
3. Formalize customer/org/property authorization helpers and endpoint coverage.
4. Complete provider capability/compliance activation gates.
5. Complete matching/dispatch requirements and automated fallback.
6. Complete job/work-order state machine and SLA/exception controls.
7. Complete quote→approval→contract/job linkage.
8. Complete invoice/payment/change-order reconciliation.
9. Complete customer↔DANI↔provider communications.
10. Complete document/evidence vault controls.

### P1 — Scale recurring company operations
11. Provider availability/capacity.
12. Time/attendance.
13. Contract/SOW/renewal engine.
14. Recurring services/retainers/memberships.
15. Property portfolio/unit operations.
16. CRM synchronization and acquisition workflow.
17. QA/reputation/performance.
18. Reporting/command center.
19. State/jurisdiction rules.
20. Event-driven automation.

### P2 — Differentiation and optimization
21. Event operations.
22. Inventory/equipment management.
23. Advanced marketplace behavior.
24. AI-assisted operations.
25. Advanced analytics/optimization.

## 6. Security work completed in this execution pass

- Production Vercel deployment containing the contract-acquisition layer was verified READY after the unused legacy NFC function was retired to remain within the current function limit.
- `dd_job_evidence` now has a database-level defense-in-depth gate requiring task/job consistency and an active provider with an ACCEPTED assignment.
- Provider assignment insertion/update is now database-gated for service-linked jobs: the provider must have an explicitly authorized capability for the requested service.
- Provider routing was corrected to derive a job's service from its linked request when the caller does not provide one, and provider selection within a selected organization is constrained to the already eligible provider set rather than any active provider.
- Contract-to-job linkage was audited: there are currently no contract-linked jobs and no orphan contract references; this is consistent with the fact that no contracts have yet been activated in runtime.

## 7. Governance rule

A missing capability does not justify rebuilding an existing portal. Extend the current unified platform minimally, preserve locked architecture, and keep Airtable as commercial governance, Supabase as runtime/application data, GitHub as code/schema/tests, Vercel as deployment, HubSpot as CRM relationship infrastructure, and Stripe as payment infrastructure.

## 8. Current security gate

Before expanding into the next P0 modules, finish:

**Portal authorization → Storage authorization → endpoint authorization → production abuse-path tests.**

The portal identity scope and evidence/assignment database gates have now been hardened. Remaining work is the broader endpoint matrix, storage policy reconciliation/testing, and production abuse-path test suite.

Only after these pass should the remaining operational engines be expanded aggressively.
