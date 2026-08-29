# DANI DECLARES — Checkout / Webhook Pipeline Audit
Date: 2026-08-29

## Scope
Primary path: governed CH01 launch offer → service request → Stripe Checkout → `checkout.session.completed` → job → accounting reconciliation → outbox.

## Findings

1. `api/create-checkout-session.js` now uses the canonical commercial registry and fails closed for non-canonical services. Checkout no longer treats arbitrary database service rows as commercial authority.
2. The current intake implementation creates a B2C request in `routed` state even when a frozen commercial price is attached. The B2C workflow state machine expects `PAYMENT_PENDING → PAID → JOB_CREATED`; therefore a newly paid request can fail transition validation unless intake marks paid-eligible requests as `payment_pending`.
3. `api/stripe-webhook.js` creates a job before calling accounting reconciliation, but reconciliation requires a frozen `dd_estimates` record. The current public intake path did not create that estimate for the five launch offers. This is a real end-to-end blocker and must be closed before claiming successful payment-to-accounting execution.
4. The webhook must independently compare the Stripe amount to the frozen commercial snapshot attached to the request. Metadata identifies the request/service but should not be treated as proof that the amount is correct.
5. Notification delivery is already designed as an outbox/worker pattern; provider routing should remain downstream of verified payment and job creation.

## Execution decision
Fix the B2C launch-request state and frozen-estimate handoff before attempting any real payment test. This preserves the current architecture and closes the discovered integration gap without introducing a second pricing authority.

## Validation boundary
A real charge has not been executed. Production endpoint method gating is verified; live payment/webhook execution requires an intentionally authorized test transaction and the corresponding Stripe event.
