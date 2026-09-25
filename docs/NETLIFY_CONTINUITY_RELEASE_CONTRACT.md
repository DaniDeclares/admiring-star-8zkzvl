# DANI Temporary Netlify Production Release Contract

Netlify is the temporary production host while Vercel is intentionally out of the launch path.

## Authority
- GitHub: canonical application source/configuration after approved reconciliation.
- Supabase tester `okvepooyxurujcwgfoju`: proving ground.
- Supabase production `ajxezpczaemunlcmqlgl`: authoritative live operational database.
- Netlify: temporary production deployment/runtime.
- Vercel: parked during the temporary hosting period; its deployment status is not a Netlify release gate.

## Mandatory order
1. Cross-system inventory and compatibility audit.
2. Repair known lifecycle/security defects before migration.
3. Netlify adapters use tester Supabase first.
4. Full provider/customer/owner regression and parity.
5. Classify tester/production schema differences; never bulk-promote by count.
6. Configure production secrets only after tester proof.
7. Verify read/auth/routing with external side effects disabled.
8. Assign exactly one owner for each singleton cron/webhook/outbound worker.
9. Cut over the public domain only after runtime proof.
10. Post-cutover verification and rollback proof.

## Hard blocks
Until explicitly proven, Netlify MUST NOT activate production payment webhooks, duplicate cron/outbox/provider dispatch, send tester messages to real parties, commit secrets, or treat synthetic/research migrations as production dependencies.

## Runtime parity gates
Build/SEO/SPA routes; owner/provider/customer auth; Supabase RLS/service-role boundaries; Quote Builder/catalog; provider signup/onboarding/routing; job execution/evidence/QA; provider earnings/referrals; payment checkout/webhook verification; OAuth callbacks; outbox/scheduling; W-9 crypto; CORS/origins; observability; TLS/domain; rollback.

## Cutover rule
A host is not production because it builds. The exact approved code revision must pass tester on Netlify, production dependencies must be separately approved, singleton side effects must have one active owner, and post-cutover verification must pass.