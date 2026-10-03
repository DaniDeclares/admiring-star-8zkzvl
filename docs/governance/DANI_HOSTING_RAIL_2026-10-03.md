# DANI hosting rail: Vercel Hobby (2026-10-03)

**Owner decision (Dani, 2026-10-03):** production returns to Vercel on the free Hobby plan. No paid hosting while DANI has no revenue. Netlify is not restored.

| | |
|---|---|
| Production rail | Vercel Hobby, team `danideclares` (`team_E1ObiftcLzJdXzNE0W2fs6PG`) |
| Project | `admiring-star-8zkzvl-dhnz` (`prj_sjL4eMox6OLrt6daRuJxUJeKA1Ba`), transferred from the expired Pro team on 2026-10-03; domains, Git link and project env vars came across |
| Production branch | `main`, deployed by Vercel's Git integration |
| Domains | `danideclares.com`, `www.danideclares.com` (www redirects to apex in `vercel.json`) |
| Netlify | Team suspended for credit exhaustion 2026-10-02; billing cycle resets 2026-10-24. Historical evidence only. `netlify.toml` and `netlify/functions` stay in the repo as a fallback and import the same handlers. |
| Terms | Vercel Hobby is for non-commercial use. This rail is temporary until DANI has revenue to pay for hosting. |

## Release path

1. PR to `main`. Vercel builds a Preview deployment for the PR head (previews are behind Vercel Authentication; custom domains are not).
2. Node CI and the DANI quality loop must pass on the exact head.
3. Merge. Vercel deploys `main` to Production automatically. **A merge to `main` is a Production deploy.**
4. Verify the Production deployment's commit SHA in Vercel matches the merge commit, then run the public smoke and runtime proof.

The Netlify workflows (`netlify-preview-runtime-proof.yml`, `netlify-production-release.yml`) only run when the repository variable `DANI_HOSTING_RAIL` is `netlify`. Leave it unset while Vercel is the rail.

## Hobby limits DANI must stay inside

| Limit | Hobby value | How DANI meets it |
|---|---|---|
| Functions per deployment (non-Next.js) | 12 | All 32 handlers live in `api-handlers/`; `api/router.js` is the only function. `vercel.json` rewrites `/api/:path*` to it. `src/lib/vercelHobbyRail.test.js` fails if `api/` grows past 12 entrypoints. |
| Cron interval | Once per day, ±59 min | `/api/integrations/gmail/sync` runs daily at 12:00 UTC (was every minute on Pro). Anything that needs a tighter cadence must be triggered from outside Vercel. |
| Deployments per day | 100 | Do not push speculative commits to PR branches in loops. |
| Concurrent builds | 1 | Builds queue. |

Sources: vercel.com/docs/cron-jobs/usage-and-pricing, vercel.com/docs/functions/runtimes#functions-created-per-deployment, vercel.com/docs/limits (read 2026-10-03).

## Environment variables (names only)

Read from the code on `main` (b20aa18) and compared with the Vercel project's env list on 2026-10-03. Values were not read.

**Already set in Vercel (Production + Preview):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `CRON_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFICATION_EMAIL`, `ADMIN_API_KEY`, `DATABASE_URL`, `POSTGRES_*`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_*`.

**Verify before the first Hobby production deploy:**
- `SUPABASE_SERVICE_ROLE_KEY` must hold the Production service key. On Netlify the same name held a broken value while `PRODUCTION_SUPABASE_SECRET_KEY` worked. Almost every handler reads `SUPABASE_SERVICE_ROLE_KEY`. Only `verify-commercial-intent` falls back from `PRODUCTION_SUPABASE_SECRET_KEY`. If unsure, paste the known-good Production secret key into `SUPABASE_SERVICE_ROLE_KEY`.
- `SUPABASE_URL` / `REACT_APP_SUPABASE_URL` must point at Production (`ajxezpczaemunlcmqlgl`), never Tester.
- `STRIPE_WEBHOOK_SECRET` must match the signing secret of the Stripe webhook endpoint that targets `https://danideclares.com/api/stripe-webhook`.

**Missing in Vercel, needed for features DANI uses:**
- `PROVIDER_W9_ENCRYPTION_KEY`: provider W-9 storage throws without it. Use the same value Netlify had, or existing encrypted W-9s cannot be decrypted.
- `GOOGLE_MAPS_ROUTES_API_KEY`: without it, paid jobs hold provider route offers (`ROUTES_API_KEY_MISSING`).
- `GOOGLE_MAPS_SERVER_API_KEY`: Google routing in operations.
- `SITE_URL` = `https://danideclares.com`: invite and recovery links fall back to the request host without it.
- `APPOINTMENT_CONFIRMATION_SECRET`: appointment links fall back to signing with the service key. Set a dedicated value.
- `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET`, `TWILIO_FROM_NUMBER`, `NOTIFICATION_PHONE`: SMS notifications. Skip if SMS is not in use.
- `INTEGRATION_TOKEN_ENCRYPTION_KEY` plus the OAuth pairs `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI`, `HUBSPOT_CLIENT_ID/SECRET/REDIRECT_URI`, `ASANA_…`, `NOTION_OAUTH_…`, `QUICKBOOKS_…`: Owner HQ integration connections. Same encryption key as Netlify, or stored tokens cannot be decrypted.

**Optional (build-time, client):** `REACT_APP_STRIPE_PUBLISHABLE_KEY` (code falls back to the live publishable key), `REACT_APP_POSTHOG_KEY`, `REACT_APP_POSTHOG_HOST`, `REACT_APP_STRIPE_CONNECT_CLIENT_ID`, `REACT_APP_STRIPE_CONNECT_REDIRECT_URL`.

`PRODUCTION_SUPABASE_SECRET_KEY` is optional on Vercel once `SUPABASE_SERVICE_ROLE_KEY` is correct.

## Not transferred with the project

Integrations and log drains do not move with a project transfer. `SENTRY_VERCEL_LOG_DRAIN_URL` exists as a variable but the drain itself must be re-created if wanted. Checkly's Vercel integration likewise.
