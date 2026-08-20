# DANI DECLARES — Production Audit

**Date:** 2026-08-20
**Repository:** DaniDeclares/admiring-star-8zkzvl
**Supabase project:** ajxezpczaemunlcmqlgl

## Executive status

The operating architecture is substantially in place, but the stack is not yet independently certifiable as fully production-ready because Vercel access is currently blocked by a 403 scope/authentication error and production credentials cannot be inspected through the available connector.

## GitHub

- Main is the base branch.
- The completion branch is 7 commits ahead and 0 behind main.
- Draft PR #128 remains intentionally unmerged.
- Government page claims were sanitized.
- Public partner opportunity-board data was removed from the public Partner Network page. Current project/work-order opportunities should be authenticated/internal.
- Cass, finance, and provider operating documents are internal documentation and are not public website pages.

## Public/internal boundary

Public:
- DANI DECLARES services and commercial offers
- customer intake
- B2B/B2G capability information
- government capability statement
- partner application/intake

Authenticated/internal:
- customer jobs
- provider assignments
- work orders
- completion evidence
- internal opportunities
- provider economics
- payouts
- operational metrics

Restricted/internal finance:
- Cass financial work
- bank statements
- P&L
- projections
- funding request
- use-of-funds evidence
- provider cost schedules

## Supabase

Current production project reports ACTIVE_HEALTHY.

Security advisor returned no security lints at audit time.

Database counts at audit time:
- auth.users: 0
- dd_portal_identities: 0
- dd_providers: 0
- services: 17
- service_requests: 0

This means the schema/application layer exists, but no real production users, providers, or service requests have been provisioned yet.

Performance advisor reports unused indexes and multiple permissive RLS-policy warnings. These are optimization/maintainability work, not evidence of an active security failure. Indexes should be removed only after query-plan review.

Supabase Edge Functions currently report 0 deployed functions. Any architecture that assumes a Supabase Edge Function worker must therefore be reconciled with the actual deployed runtime before it is treated as live.

Auth logs include deprecated JWT group configuration warnings that should be cleaned up during maintenance.

## Supabase service catalog

The public operational `services` table currently contains 17 active services with starting prices and quote-based services. These values do not automatically establish canonical DANI DECLARES pricing. The master commercial catalog remains the source that must be reconciled before database prices are changed.

## Stripe

The connected Stripe account is live and contains real products, prices/payment links, and commercial history.

Observed architecture:
- products exist;
- active payment links exist;
- payment links resolve to Stripe Price objects;
- product objects inspected did not expose default_price consistently.

Stripe must remain the financial execution layer, not the upstream commercial source of truth. Website/catalog prices should resolve upstream and create frozen estimates before payment.

A full product/payment-link reconciliation is still required before archiving legacy Stripe links or altering live prices. No live Stripe price was changed during this audit.

## Vercel

Production access is currently blocked by a 403 authorization/scope error. This prevents independent verification of:
- current production deployment;
- environment variables;
- production domain;
- runtime logs;
- cron configuration;
- production deployment SHA.

This is an external credential/scope prerequisite, not a code defect established by this audit.

## Immediate remaining actions

1. Re-authenticate Vercel for the correct team/project scope.
2. Verify production deployment and runtime logs.
3. Verify production environment variables including notification credentials and cron secret.
4. Reconcile the notification-worker deployment model between GitHub/Vercel and Supabase.
5. Provision authorized portal users/providers when real operators are ready.
6. Reconcile canonical pricing against Supabase services and Stripe products/prices/payment links.
7. Review Supabase performance advisor findings against real query plans before removing indexes or consolidating policies.
8. Replace deprecated Auth JWT configuration.
9. Run end-to-end browser verification after Vercel access is restored.
10. Merge PR #128 only after production verification passes.

## Do not do

- Do not publish Cass's financial packet.
- Do not publish NAWFside/R.E.A.C.H. internal economics.
- Do not publish provider payout schedules.
- Do not fabricate financial source documents.
- Do not overwrite the canonical pricing system with Stripe or Supabase values without reconciliation.
- Do not claim production health while Vercel access remains unverified.
