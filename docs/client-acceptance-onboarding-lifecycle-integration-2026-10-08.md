# DANI DECLARES — Client Acceptance → Onboarding → Fulfillment contract
2026-10-08 | Proposed integration into EXISTING commercial lifecycle | No production release

## History-first inventory (verified)
Both Tester and Production have dd_invoices, dd_portal_onboarding_intakes, dd_client_organizations, dd_client_properties, dd_provider_agreement_signatures, dd_provider_onboarding_work_queue, dd_provider_onboarding_worker_runs, and dd_vendor_onboarding_documents. These names do not prove customer agreement signature, automatic welcome delivery, or monthly reporting exists. Verify actual table columns, policies, triggers, code paths, and historical migrations before modifying.

## Service-class templates; never blanket seven-email automation
- CH01 one-time cleaning: approved quote/scope → accepted terms if required → payment per existing terms → concise welcome + preparation instructions → verified assignment → evidence/QA → completion notice.
- CH01 recurring House Manager: governed agreement and service allowances → secure household preferences/intake → recurring billing state and scheduling → qualified provider assignment → evidence/QA → monthly service/allowance report.
- CH02 property management: verified company/property contact authority → agreement/PO where required → approved pricing/payment terms → site access through controlled channel → work orders, evidence, QA → monthly report only for active recurring account.
- CH04/CH05 project services: signed scope and applicable terms → deposit/invoice as approved → kickoff only when complexity requires → access limited to project → deliverables and acceptance.

## Event-driven contract: use existing workers and owner-attention ranking, NO NEW QUEUE
1. BUYER_ACCEPTED is a sales intent, not payment or dispatch authorization.
2. AGREEMENT_REQUIRED → verify exact signed version, parties, scope, signature time; skip only when current authorized service policy permits.
3. BILLING_REQUIRED → invoice or payment link idempotently, reuse existing Stripe identifiers; invoice.sent != invoice.paid. Payment gate uses verified Stripe ledger state and configured terms, not optimistic webhook receipt.
4. WELCOME_ELIGIBLE → after agreement and confirmed booking prerequisites; use existing communication authorization, suppress duplicates by (customer, job/contract, template version, event).
5. ACCESS_REQUIRED → only needed fields, authorized property access; NEVER request raw passwords by ordinary email or store access codes in generic notes. Expire/revoke permissions after work.
6. KICKOFF_REQUIRED → complex/recurring only; scheduling invitation cannot change job state until confirmed.
7. ASSIGNMENT_ELIGIBLE → verified scope, economics, provider eligibility, timing, access readiness, and payment terms.
8. COMPLETION_CONFIRMED → evidence + QA authority, not provider self-assertion.
9. MONTHLY_REPORT_ELIGIBLE → only recurring account with governed reporting cadence, source from authoritative job/payment/QA records; redact household/private details.

## Required idempotency and recovery
- On retries, resume incomplete step; never resend completed messages, reissue invoices, or duplicate jobs.
- Corrections to scope, price, payment, cancellation, or appointment invalidate downstream derived readiness; preserve immutable receipts.
- A failed message/receipt creates existing owner attention or governed retry, not a new planner/governor/queue.
- Preserve customer opt-outs, quiet hours, communication preferences, and no-recontact gates.

## Test matrix for Tester before promotion
Positive: one-time cleaning accepted and paid; recurring House Manager signed + scheduled; CH02 authorized PO; valid exception under existing invoice terms.
Negative: verbal yes only; unsigned required agreement; unpaid invoice; duplicate Stripe event; stale payment state; missing property authorization; missing provider qualification; held SKU; revoked access; canceled booking; failed QA; unverified buyer source; wrong customer/recipient.
Reconcile exact historical production function signatures and policies before any migration.

## Original social content (draft, not published)
Reel: 'What happens after you book DANI DECLARES? First we confirm your scope and terms. Then we handle payment and preparation, assign qualified help, document the work, and follow through on quality. Bigger recurring projects get a structured kickoff and reporting. We handle the execution.'
Carousel: 'You said yes. Here's what happens next.' Cards: Confirm scope / Agreement when required / Clear payment instructions / Preparation and access / Scheduled service / QA and completion / Recurring reporting when applicable.
Only demonstrate with fabricated data; never publish real client identifiers, property entry instructions, invoices, or provider credentials.

## Approval and release
This document is a governed implementation specification, not evidence that runtime automations are deployed. Reuse existing C-team authority for routine, within-policy decisions. Hold legal terms, material pricing changes, new outbound permissions, and production publishing at their existing gates.

## CH02 booking controls verified on 2026-10-19

Evidence scope: read-only inspection of the repository default branch and the live DaniDeclares database. This section records observed implementation and required repairs. It does not change production prices, release states, signatures, payment records or dispatch authorization.

### Existing paths inspected
- `src/pages/portal/QuoteBuilderPage.jsx` builds multi-SKU estimates and collects component fulfillment inputs.
- `src/lib/operations/quoteBuilder2026.js` resolves governed quote lines and creates an economics snapshot. Unsupported proposed package prices are not public price authority.
- `src/pages/portal/EstimateReviewCockpitPage.jsx` exposes review, customer-portal delivery and hosted Stripe invoice actions.
- `api-handlers/portal-operations.js`, action `send_estimate`, requires ready-to-send status, economics PASS and commercially resolved assignment readiness. It records portal delivery, which is not independent proof of email delivery.
- Action `estimate_decision` checks customer ownership and sent status, then writes approved/declined. The inspected action does not itself persist acceptance bound to exact quote, service-order and terms versions. Preserve actor/time and presented immutable copies before claiming agreement acceptance.
- Action `create_stripe_invoice` creates or recovers an invoice. The staff API permits approved or ready-to-send estimates; customer payment requires approved status. Therefore invoice creation must never be treated as proof of customer acceptance. Monthly billing is routed separately.
- PayPal references exist, but automatic PayPal-to-HQ settlement reconciliation was not demonstrated.
- Live `public.dd_start_job` checks actor/assignment, work-order reference, status and duplicate start. It does not itself recheck customer agreement acceptance or required payment.
- The inspected `dd_jobs` triggers cover normalization, completion, history, task instantiation and work-order synchronization. This is not complete proof of all upstream or alternate start controls.

### Preserve the existing commercial lifecycle
Quote Builder -> economics/review -> customer receipt and exact-version acceptance -> invoice/payment or approved corporate PO/credit terms -> accepted worker compensation and schedule -> authorized work order/start -> evidence/QA -> final balance and payout reconciliation.

These are CH02 apartment/property-management assignments. CH01 resident-paid orders remain separate. CH05 retains its procurement-approved contract/PO/invoice route. Do not create a new CRM, governor or independent queue.

### Required customer-order evidence
For each actual order, link existing estimate, request, customer/property, invoice, assignment and job identifiers. Retain:
1. Canonical SKU/components and approved customer quote revision.
2. Presented service order, scope schedule and terms versions, including retained copies.
3. Authorized customer identity/role, explicit acceptance, actor and timestamp, plus DANI acceptance.
4. Quote/invoice notification attempt and actual delivery or confirmed receipt.
5. Required amount, currency, payment source/reference and verified status, or explicit approved corporate credit/PO exception.
6. Named worker acceptance of scope, compensation, expenses and availability; current qualifications, coverage and access.
7. Authorized start window, reviewer and evidence references.
8. Deliverables, QA exceptions, customer delivery and balance/payout reconciliation.
A scope, price, payment or schedule change invalidates affected derived readiness and requires renewed evidence.

### Pricing reconciliation boundary
The 17-offer workbook contains verified existing CH02 rate references and separately labeled proposed bounded-offer totals. Existing examples: DNI-04A-036 $125/up to 90 minutes; DNI-02A-041 $325/up to four working hours; DNI-02A-042 $575/up to eight working hours; DNI-02A-012 $275 base office-cleaning visit; DNI-02A-002 $350 standard-turn quote anchor.

The single-email $295, tour-interest campaign $795, showcase filming/editing $895 and filmed four-video batch $1,295 totals remain proposals. Existing editing/content SKUs do not include filming. Reconcile a filming component or existing composite identity before registration; do not invent a duplicate SKU or silently expand existing scope.

The live provider rate-card table was empty and selected offers had no accepted provider-compensation rows or component-cost baselines. Fifteen editable cost scenarios are planning models, not accepted pay, measured job costs or clearance. Price/availability/release contradictions must be resolved through existing machinery. The release view alone is not sufficient where other authoritative controls disagree.

### Release-control repair and verification
Trace every write path capable of scheduling, authorizing or starting a job before applying a minimal patch. Required semantics:
- Reject missing or superseded required agreement acceptance.
- Reject unpaid/pending required amounts unless a documented, authorized credit/PO policy permits start.
- Reject missing worker acceptance, unavailable schedule, invalid scope/price or revoked access.
- Validate relationships among customer, property, estimate, agreement, invoice and work order.
- Evaluate prerequisites atomically at the protected transition, preserving idempotency and immutable evidence.
- Do not bypass holds by changing status labels or setting missing costs to zero.
A manual checklist is a temporary control only if the operator can enforce it. It does not repair the application.

### Test and evidence status
Workbook-only checks demonstrated missing acceptance/payment produces HOLD and that a zero receipt or dispute cannot satisfy a positive required-payment amount. Those checks made no application or financial writes.

Application/database end-to-end tests remain NOT RUN in this audit. Use the existing isolated tester with synthetic parties and external notifications, live payment credentials and physical dispatch disabled. Prove positive, missing-term, stale-version, unpaid, approved-credit, unaccepted-worker, wrong-customer, duplicate/replay, alternate-write and failed-QA cases. Preserve per-step evidence and identify the exact implementation tested. No production release follows from this documentation update alone.

Processor reference: https://docs.stripe.com/api/events/types . Stripe invoice.paid can include out-of-band marking; verify the underlying settlement source rather than asserting a Stripe charge from the event name.


## Owner decision — 19 October 2026, 11:45 EDT

Danielle approved 10% as the NEW standard participating-resident benefit on explicitly eligible resident-service charges, with bounded benefits. This supersedes 15% as the intended new standard; it does not retroactively rewrite existing contracts or prove runtime activation.

- Verify resident and active participating property; reconcile the approved price basis and eligible SKU list before numeric resident quoting/checkout.
- No automatic CH02 discount; no stacking or repeat discount on an already-discounted price. Exclude taxes, pass-through purchases, travel and third-party fees unless explicitly approved.
- Initially keep laundry, linen and custom intensive work outside automatic activation until pricing units/scope/costs are reconciled. Key/Access is ineligible under the inspected live rule.
- Bounded benefits: approved menu and single service-request contact; booking assistance within confirmed capacity. Community service days require confirmed staffing/demand. No priority reservation, free visit or unlimited support.
- Property-funded welcome/renewal credits need separate funding, cap, eligibility and redemption/order tracking.
- Identify and preserve existing binding 15% commitments according to their terms. Historical source/rule evidence must not be silently overwritten.
- Any later 15% promotion needs separate approval, defined audience/duration, actual delivery/perk costs and successful economics review.

Implementation remains pending: trace all resident price/checkout sources, preserve existing commitments, version the new rules and verify positive/negative eligibility/stacking cases without moving real money. This documentation change changes no runtime behavior.

The supplied 100%-upfront / 50%-booking payment examples remain proposals, not an approved universal deposit policy. Start with bounded assignments; recurring packages define quantities/hours and portfolio arrangements preserve per-property payer, approver and scope.
