# DANI Hosting Continuity Release Contract

This contract governs the temporary/DR Netlify runtime while Vercel case `01hI3OZDUVFTzz26` is unresolved.

## Authority
- GitHub: canonical application source/configuration.
- Supabase tester `okvepooyxurujcwgfoju`: synthetic/research/runtime proving ground.
- Supabase production `ajxezpczaemunlcmqlgl`: authoritative live operational database.
- Vercel: current production deployment until an approved cutover.
- Netlify: continuity/DR runtime candidate; it does not become production authority by being deployed.

## Mandatory order
1. Inventory and compatibility audit.
2. Platform adapter work in isolated branch.
3. Netlify runtime using TESTER Supabase only.
4. Full tester regression/parity.
5. Classify tester/production schema differences; never bulk-promote by count.
6. Production shadow deployment from the exact approved Git commit.
7. Verify read/auth/routing with external side effects disabled.
8. Approve exactly one active owner for each singleton: cron, webhook endpoint, outbound worker.
9. Explicit owner approval for DNS/webhook cutover.
10. Post-cutover verification and rollback test.

## Hard blocks
Until their gate is explicitly passed, the continuity runtime MUST NOT:
- point `danideclares.com` to Netlify;
- use production Supabase in deploy previews;
- activate production Stripe/PayPal/Thumbtack webhook endpoints;
- duplicate production cron/outbox/provider dispatch;
- send real customer/provider messages from tester;
- copy secrets into source control;
- treat tester-only synthetic/research migrations as production dependencies;
- remove or downgrade the existing Vercel production runtime.

## Runtime parity gates
Frontend/build/SEO rewrites; SPA routes; owner/provider/customer auth; Supabase RLS and service-role boundaries; Quote Builder/catalog; provider signup/routing; Stripe checkout and raw-body signature verification; Thumbtack auth/idempotency/V4 normalization; PayPal only after its governed adapter is separately approved; OAuth callbacks; outbox; scheduling; W-9 crypto; CORS/origins; observability; TLS/domain; rollback.

## Netlify-specific evidence
Netlify deploy contexts support distinct environment values. Deploy previews do not automatically run scheduled functions. These properties are safety controls, not substitutes for DANI's own gates.

## Cutover rule
A host is not production because it builds. Production cutover requires the same approved code revision to pass tester on the target runtime, production schema dependencies to be separately approved, singleton side effects to have one active owner, and post-cutover verification to pass.
