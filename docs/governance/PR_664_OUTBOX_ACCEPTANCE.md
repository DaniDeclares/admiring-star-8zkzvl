# PR #664 — blocked acceptance contract

Do not merge or replay historical notifications. This repair is pre-production.

The existing worker delegates its notification loop to `lib/notificationOutbox.mjs`; research processing and authentication stay in the existing handler. EMAIL uses Resend's receipt and frozen request; SMS uses Twilio's SID and SMS intent timestamp; INTERNAL preserves the existing no-external-effect completion handler. An expired external intent is held, never blindly resent. An old FAILED row with no provenance is ambiguous and held. Exhausted historical FAILED rows are never claimed. Expired PROCESSING rows can be reconciled even at the attempt limit.

`attempts` counts worker claims, including configuration checks and reconciliation. It is not a provider-call counter. Send-intent timestamps show authorization to attempt an external call, not proof that a call happened. Provider IDs show acceptance, not delivery. Test receipts separately count invocations of the fake provider. A real crash between intent and the provider call remains ambiguous by design.

## Configuration recovery

Missing credentials yield FAILED / CONFIGURATION_BLOCKED with no new send intent and no provider invocation. Fix the worker's configuration first, then use its server environment to run:

```
node scripts/resume-notification-configuration-block.mjs <outbox-uuid>
```

This validates channel configuration and payload, then performs a guarded per-record transition to PENDING / RETRYABLE. It preserves attempts and last-error evidence, refuses exhausted rows and any row with provider or intent evidence, and does not send. The existing worker performs the next claim. Correcting credentials alone does not reopen a row.

Do not clear `first_attempt_at` for previously misclassified UNCERTAIN records. The recovery utility refuses those records. They need separate execution evidence proving no provider request occurred; no bulk correction is included.

## Verification and CI

The former Node.js CI check used React/Jest plus a Stripe node:test suite. It omitted `tests/notification-outbox-contract.test.mjs`, explaining green CI despite a failing outbox test. The historical-protection test asserted a source assignment (`attempts=MAX_RETRIES`) that was absent. Its replacement executes the invariant against PostgreSQL: four exhausted failures must remain byte-for-byte unchanged with zero provider calls. This does not relax historical protection or add the destructive assignment merely to satisfy a regex.

`npm run test:outbox` now runs inside the existing Node.js CI build job against a disposable PostgreSQL 16 service and inside Supabase Migration Replay after full clean replay. Both check out the exact PR head and propagate nonzero test exits without continue-on-error. Tests require an explicit allowlisted loopback database; they never fall back to DATABASE_URL and never silently skip. Providers are fake and cannot send messages. Crash and concurrency scenarios use separate Prisma clients/connections.

The GitHub integration returned 403 for `branches/main/protection`; the repository rulesets API returned an empty list. This does not establish whether legacy branch protection requires Node.js CI. Required-check enforcement remains unverified; preserve the draft/merge block until that evidence is available.

Final evidence must name the exact head commit, actual CI run IDs/results, local/full migration context, provider calls separately from processing attempts, and any remaining hold. Green general CI or a ready Vercel Preview does not substitute for these gates. No production data or live provider calls are part of this proof.
