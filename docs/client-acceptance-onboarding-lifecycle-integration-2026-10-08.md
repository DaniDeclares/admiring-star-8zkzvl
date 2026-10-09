# DANI DECLARES — Client Acceptance → Onboarding → Fulfillment contract
2026-10-08 | Proposed integration into EXISTING commercial lifecycle | No production release

## History-first inventory (verified)
Both Tester and Production have dd_invoices, dd_portal_onboarding_intakes, dd_client_organizations, dd_client_properties, dd_provider_agreement_signatures, dd_provider_onboarding_work_queue, dd_provider_onboarding_worker_runs, and dd_vendor_onboarding_documents. These names do not prove customer agreement signature, automatic welcome delivery, or monthly reporting exists. Verify actual table columns, policies, triggers, code paths, and historical migrations before modifying.

## Service-class templates; never blanket seven-email automation
- CH01 one-time cleaning: approved quote/scope → accepted terms if required → payment per existing terms → concise welcome + preparation instructions → verified assignment → evidence/QA → completion notice.
- CH01 recurring House Manager: governed agreement and service allowances → secure household preferences/intake → recurring billing state and scheduling → qualified provider assignment → evidence/QA → monthly service/allowance report.
- CH03 property management: verified company/property contact authority → agreement/PO where required → approved pricing/payment terms → site access through controlled channel → work orders, evidence, QA → monthly report only for active recurring account.
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
Positive: one-time cleaning accepted and paid; recurring House Manager signed + scheduled; CH03 authorized PO; valid exception under existing invoice terms.
Negative: verbal yes only; unsigned required agreement; unpaid invoice; duplicate Stripe event; stale payment state; missing property authorization; missing provider qualification; held SKU; revoked access; canceled booking; failed QA; unverified buyer source; wrong customer/recipient.
Reconcile exact historical production function signatures and policies before any migration.

## Original social content (draft, not published)
Reel: 'What happens after you book DANI DECLARES? First we confirm your scope and terms. Then we handle payment and preparation, assign qualified help, document the work, and follow through on quality. Bigger recurring projects get a structured kickoff and reporting. We handle the execution.'
Carousel: 'You said yes. Here's what happens next.' Cards: Confirm scope / Agreement when required / Clear payment instructions / Preparation and access / Scheduled service / QA and completion / Recurring reporting when applicable.
Only demonstrate with fabricated data; never publish real client identifiers, property entry instructions, invoices, or provider credentials.

## Approval and release
This document is a governed implementation specification, not evidence that runtime automations are deployed. Reuse existing C-team authority for routine, within-policy decisions. Hold legal terms, material pricing changes, new outbound permissions, and production publishing at their existing gates.
