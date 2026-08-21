# Production Activation Status — 2026-08-20

## Completed in this pass

- Canonical commercial registry remains the source of customer-facing pricing and marketing intent.
- Existing B2C resident discount and B2B footprint resolvers remain the governed calculation path.
- Raw Stripe Payment Links were removed from the public `src/config/stripeLinks.js` authority surface; navigation now enters the canonical request-service flow.
- Safe Stripe crosswalk audit command added: `npm run audit:stripe-crosswalk`.
- Offline audit evidence from `payment_links.csv` was processed without mutating Stripe.
- Supabase B2B retainer rows were reconciled to the current 12-tier canonical ladder.
- NAWFside commercial authority was recorded as DANI DECLARES pricing/marketing authority with provider role `FULFILLMENT_ONLY`.
- NAWFside remains operationally gated because compliance is still `PENDING` and `accepts_new_work` remains `false`.
- Stale PR #139 was closed and replaced with draft PR #141.

## Current evidence

The library `payment_links.csv` contains 87 Payment Links. It has 82 active rows and 5 inactive rows, but no Stripe Price/Product amount columns. Therefore the offline reconciliation reports 77 `UNMAPPED` rows and 10 `MATCHED_REVIEW` rows; none is treated as amount-verified.

## Hard blockers

1. **Live Stripe audit:** requires running the audit with `STRIPE_SECRET_KEY` in a server-side/admin environment.
2. **Production CRON secret:** `vault.decrypted_secrets` currently has no `dd_cron_secret`; the Supabase cron worker is installed but intentionally returns without dispatch when the secret is absent.
3. **Resend/Twilio secrets:** Supabase Vault currently has no secrets configured; production environment injection still needs to be verified.
4. **Portal identities:** `auth.users` currently has zero users, so real staff/provider portal identities cannot be provisioned yet.
5. **NAWFside compliance:** agreement is executed, but compliance remains pending; do not enable new work until COI/W-9/licensing/documentary requirements are verified.
6. **E2E deployment verification:** the connected Vercel mutation tool was unavailable in this session, so no claim of production secret injection or deployment success is made.

## Explicit safety boundaries

- No Stripe Product, Price, or Payment Link was changed.
- No public customer price was derived from a provider price sheet.
- No provider payout was inferred from customer price.
- No Auth UUID was invented or hard-coded.
- No secret was committed to Git.
