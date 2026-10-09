# DANI Home Operations — Original Task Library v1
Status: TESTER CANDIDATE / NOT LIVE / no prices or dispatch authority
Source: original DANI structure inspired by generic household management categories; no copied third-party pages, copy, layout, or branding.

## One library, four permissioned views
- Resident: planning, own task ownership, grocery and meal choices, safe home maintenance reminders.
- House Manager: customer-authorized tasks, due dates, vendor coordination, customer approvals, completion status; no automatic access to sensitive family records.
- Provider: assigned approved SKU, limited task scope, due date, job evidence requirements, QA; never emergency contacts or children's details by default.
- CH03 property manager: property identifier, owner/tenant-approved access, maintenance scheduling, vendor handoff and QA; no resident private household plan.
- Shadow & Sol: separate educational templates for gardening, resilience and family preparedness; no commingling of entities or revenue.

## Normalized task schema
task_key | module | recurrence | responsible_role | instructions | completion_criteria | routing | sensitivity | evidence_policy
Routing is DIY, DANI_APPROVED_SKU, LICENSED_SPECIALIST, or REMINDER_ONLY. A route to DANI must resolve existing LIVE_READY SKU and verified price, scope, economics, capacity, consent. No inferred customer demand.

## Seed task definitions (original wording)
| key | module | recurrence | completion criterion | routing |
| --- | --- | --- | --- | --- |
| HOME-01 | Weekly household review | weekly | Calendar, food needs, supplies and task owners reviewed | DIY |
| HOME-02 | Household responsibility assignments | weekly | Adult-approved assignments and appropriate expectations recorded | DIY |
| HOME-03 | Grocery staples inventory | weekly | Pantry, refrigerator, freezer and household essentials checked | DIY |
| HOME-04 | Meal rotation | weekly | Flexible meal options and shopping needs recorded | DIY |
| HOME-05 | Cleaning focus rotation | weekly | Areas prioritized and approved service needs identified | DIY |
| HOME-06 | Home maintenance log | monthly | Completed maintenance and next due dates documented | REMINDER_ONLY |
| HOME-07 | Household routines | weekly | Morning, evening and school-day routines updated | DIY |
| HOME-08 | Repeatable household procedure | as-needed | Purpose, owner, supplies, steps and done definition documented | DIY |
| HOME-09 | Emergency contacts and reunification | quarterly | Contact and meeting plan reviewed privately with household | REMINDER_ONLY |
| HOME-10 | Recurring decisions | monthly | Routine decisions captured as editable defaults, not mandates | DIY |
| HOME-11 | Household budget and spending | monthly | Budget reviewed without collecting bank credentials | DIY |
| HOME-12 | Seasonal maintenance | quarterly | Seasonal checks scheduled; regulated work referred appropriately | LICENSED_SPECIALIST |
| HOME-13 | Delegation and escalation | weekly | Each task assigned DIY, authorized DANI service, or specialist | REMINDER_ONLY |
| HOME-14 | Home resilience and garden planning | seasonal | Household-appropriate supplies and planting plan reviewed | DIY |

## Workflow contract
1. Offer original printable/digital product, without treating download as service consent.
2. Customer optionally submits task or service inquiry with explicit permission and minimum necessary data.
3. Match only verified buyer need to existing approved LIVE_READY service with cost, scope and provider eligibility gates.
4. Existing quote, agreement, payment, assignment, evidence, QA, and customer follow-up systems remain sole execution authority.
5. Respect no-recontact, opt-outs, cancellation, record retention and reporting permissions. No new independent queue or scheduler.
6. Monthly analytics: product view -> consented inquiry -> qualified quote -> payment collected -> QA-complete job -> repeat booking. Never count impressions as revenue.

## Safety and privacy
- No minor names, schedules, addresses, medical details, alarm codes or emergency contacts in marketing analytics or provider printables.
- Household emergency plans stay household-controlled and private. Use Ready.gov guidance as independent reference, not copied proprietary forms.
- Do not turn child task assignments into unsafe work or assign safety-critical duties to children.
- Service providers cannot promise licensed HVAC, electrical, pest control or other regulated services without verification.
- Do not automatically create Shopify products until target store, digital fulfillment, pricing and delivery are verified.

## Acceptance tests for next worker integration
- Consumer can view/edit task templates without creating a buyer record.
- Explicit inquiry with verified consent can enter existing buyer evidence gates.
- Held SKU, unsigned required agreement, unpaid required deposit, unqualified provider or no-recontact all prevent execution.
- Provider views exclude household-sensitive records.
- Monthly metrics distinguish collected payments from content reach.
- Same event retried twice never creates duplicate invoice, outreach, assignment or report.
- Source and runtime dependencies tested in Tester before Production promotion.
