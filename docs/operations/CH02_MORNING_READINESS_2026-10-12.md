# CH02 sales and 9:00 AM readiness: read-only audit (2026-10-12)

Scope: read-only queries of Production Supabase (`ajxezpczaemunlcmqlgl`), HubSpot company search, Gmail search. No writes, no emails sent, no deployments, no merges.

## Workers and schedules (Production)
- 50 pg_cron jobs defined; 49 active (`dani-code-email-lead-miner` is inactive).
- Last 24 h: zero non-succeeded runs. `company-controller-hourly` 24/24 succeeded; `process-notification-outbox-secure` 288/288 succeeded (latest 00:30Z).
- `dd_morning_clockin_readiness_v1` (00:30Z): 108 live-ready services, 127 contactable leads (63 priority), 45 open attention items (3 urgent), 6 estimates (all 6 economics-unresolved), 0 open jobs, 0 assignment-ready providers, 96 passing proofs in 24 h, 2 payment events.

## Providers (Production, `dd_morning_provider_readiness_v1`)
- 51 active provider records; 0 approved-active, 0 operational-ready, 0 dispatch-ready, 0 payout-ready.
- 49 have no application record; 2 await application approval. Nothing is awaiting W-9, agreement, identity, compliance or payout rail because those steps cannot start without an application.
- No reminders were sent by this audit. Sending requires the existing onboarding coordinator and its opt-out and no-recontact gates.

## CH02 packages and services
- All 7 CH02 outcome packages in `dd_governed_packages` are `INTAKE_ONLY`, no package price, "routing only; priced through component SKUs". There is no approved bundle price or retainer package.
- CH02 service availability: 134 ACTIVE, 11 ELIGIBLE, 1 QUOTE_REQUIRED, 41 PENDING.
- Release state of the ACTIVE/ELIGIBLE/QUOTE_REQUIRED CH02 services: 56 LIVE_READY (49 fixed one-time, 5 recurring monthly, 2 SOW/procurement), 82 HOLD, 10 BLOCKED. Only 1 CH02 service shows a verified Stripe price plus payment path (a monthly fixed service, state HOLD). The other LIVE_READY services show no verified Stripe price, so they are quote-first, not checkout-ready.
- Contract artifact types on file: MSA, SOW, Work Order, Portfolio Agreement. Their approved terms were not verified in this pass.

## Prospects
- HubSpot company search "Dunwoody": 0 results. Gmail search "Dunwoody": newsletters only, no correspondence. The S-named prospect was not identified. Nothing was guessed.

## Classification for the calls
- QUOTE-ONLY: any CH02 service. Use LIVE_READY fixed-price services as the quote basis only after the owner confirms the price from the governed rule.
- BLOCKED / not ready to promise: bundled packages, retainers, and any dispatch commitment (0 dispatch-ready providers).
