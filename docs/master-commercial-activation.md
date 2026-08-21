# DANI DECLARES Master Commercial Activation Runbook

## Authority hierarchy

1. **Master Commercial Reconciliation Registry** — customer-facing commercial intent.
2. **Resolver engines** — permitted modifiers and structural calculations.
3. **Checkout verification API** — server-side frozen-price gate.
4. **Stripe** — payment execution and reconciliation token only.
5. **Provider work order / SOW** — private fulfillment economics.

No UI component, Stripe URL, provider rate sheet, or historical catalog entry may override the registry.

## NAWFside commercial control

Per the current business instruction, NAWFside has granted DANI DECLARES full authority to control the customer-facing pricing and marketing presentation of NAWFside-fulfilled services.

Therefore:

- DANI DECLARES may set, change, package, discount, promote, bundle, and market customer prices.
- DANI DECLARES owns customer-facing offer names, descriptions, campaigns, resident perks, and promotional positioning.
- NAWFside remains a fulfillment lane unless a separate written agreement changes that role.
- Provider compensation is private and must be established through the executed work order/SOW; it must never be calculated from or exposed as the customer price.
- A provider cannot be used as a source of public pricing truth after the Provider Wall is crossed.

## Current code changes

- `src/config/commercialRegistry.js` is the new canonical registry for the audited offers supplied in the Master Commercial Reconciliation Matrix.
- `src/lib/operations/masterCommercialResolver.js` implements the B2C resident/heavy-soil resolver and the B2B footprint resolver.
- `api/verify-commercial-intent.js` provides the server-side commercial gate for this Vercel/React architecture.
- `src/config/stripeLinks.js` now treats legacy Stripe keys as routing aliases and refuses to guess when no exact canonical service exists.
- `src/data/pricingCanon.js` reads the reconciliation registry before falling back to the legacy 2026 catalog.
- `src/lib/operations/masterCommercialResolver.test.js` locks the core price and deprecated-token invariants.
- Twilio notifications use the dedicated revokable API-key pair (`TWILIO_API_KEY_SID` + `TWILIO_API_KEY_SECRET`), never the master Twilio Auth Token.

## Reconciliation inventory

The Library `payment_links.csv` contains **87 Payment Links: 82 active and 5 inactive**. The export contains link IDs, status, URLs, names, and limited metadata, but no Stripe Product/Price amount fields. Therefore the offline audit is evidence-only: **77 rows are `UNMAPPED` and 10 rows are `MATCHED_REVIEW`**. None is treated as amount-verified until the live Stripe API is queried.

The live Stripe crosswalk remains read-only. No Product, Price, Payment Link, or historical object may be mutated merely because its name resembles a canonical service.

## Remaining production activation gates

### 1. Live Stripe reconciliation

Run `npm run audit:stripe-crosswalk` in a server-side/admin environment with the existing production `STRIPE_SECRET_KEY`. The live audit must compare Stripe Product/Price amounts against the canonical registry before any legacy object is retired or repointed.

Each active Payment Link must be classified as:

- `MATCH` — canonical service and amount agree.
- `AMOUNT_MISMATCH` — service identity is known but Stripe amount differs.
- `UNMAPPED` — Stripe product/link has no canonical service ID.
- `DEPRECATED` — link points to a historical service.
- `MISSING_STRIPE_EXECUTION` — canonical direct-link service has no active execution token.
- `QUOTE_ONLY` — service must not have a public fixed-price checkout.

Do not delete historical Stripe links until reconciliation evidence has been captured.

### 2. Replace direct client pricing

Search the application for hard-coded customer amounts, `basePrice`, `workingBaselineRate`, `startingPrice`, or Stripe `unit_amount` values used in client-side booking components. Migrate customer-facing fixed-price offers to canonical service IDs.

### 3. Finish `/request-service` mapping

The route should accept `?service=<canonical serviceId>`, display the resolved offer, collect channel/scope information, and submit the canonical service ID to the server. The browser may display a price for convenience, but the server response remains authoritative.

### 4. Checkout gate

Every paid fixed-price path must obtain a successful `/api/verify-commercial-intent` response before creating or redirecting to checkout. The client must never submit an arbitrary amount.

### 5. Stripe reconciliation metadata

When Stripe execution objects are newly created or updated, metadata should carry at least:

- `service_id`
- `commercial_registry_version`
- `channel`
- `provider_lane`
- `price_snapshot_cents`
- `resident_discount_applied`
- `modifier_codes`

Provider payout data must not be written into customer-facing Stripe metadata.

### 6. Production secrets

The current Vercel project already contains the Stripe and Supabase production credentials shown in the project settings. Do **not** add a Twilio `AUTH_TOKEN`; the application is already implemented for the dedicated Twilio API-key credentials.

The remaining notification/cron configuration is:

- `CRON_SECRET` — a new random secret shared between Vercel and Supabase Vault as `dd_cron_secret`.
- `RESEND_API_KEY` — the Resend API key used by the email adapter.
- `RESEND_FROM_EMAIL` — the verified sender, currently defaulted/documented as `DANI DECLARES <noreply@danideclares.biz>`.
- `TWILIO_ACCOUNT_SID` — existing Twilio account identifier.
- `TWILIO_API_KEY_SID` — the dedicated Twilio API key SID.
- `TWILIO_API_KEY_SECRET` — the dedicated Twilio API key secret.
- `TWILIO_FROM_NUMBER` — the Twilio sending number.

The repository contains no production secret values. `CRON_SECRET` must not be committed or pasted into source control.

### 7. Scheduler architecture

Vercel Hobby only supports daily native Cron Jobs, so `vercel.json` intentionally remains on its once-daily schedule. The actual notification worker is already protected by the Supabase `pg_cron` job `process-notification-outbox-secure`, which is live at `*/5 * * * *` and fail-closed until `dd_cron_secret` exists in Vault. Supabase currently has **no Vault secrets**, so the worker is intentionally dormant until the shared secret is configured.

### 8. Portal identities

Provision the actual staff administrator and provider accounts using the already-deployed Supabase provisioning functions. Never hard-code Auth UUIDs in source. The current Supabase project has **zero Auth users**, so this remains a real-world identity-provisioning gate rather than a code gap.

### 9. NAWFside fulfillment activation

Commercial autonomy is already established separately from fulfillment activation. NAWFside remains `compliance_status = PENDING` and `accepts_new_work = false` until the documentary requirements are verified. Do not bypass that gate merely because DANI DECLARES controls customer pricing and marketing.

### 10. Notification smoke test

After the secrets are configured, insert one controlled test event into `dd_event_outbox`, verify the five-minute Supabase scheduler reaches `/api/process-outbox`, verify the notification succeeds, then remove/mark the test record according to the production audit policy.

### 11. Build and deployment verification

Node.js CI passes on the current commercial-activation branch. The latest Vercel build completed the application build successfully, but Vercel reports a project deployment/build-rate-limit failure rather than an application compilation error. Production deployment should be re-verified after the current Vercel limit clears.

Then verify the deployed `/request-service` flow in a browser and exercise:

- canonical B2C fixed price
- resident 15% discount
- heavy-soil surcharge
- B2B 1BR/1BA credit
- B2B 3BR/2BA debit
- B2B 4BR/3BA debit
- >1100 sqft surcharge
- deprecated token rejection
- bespoke quote routing
- provider-lane isolation
- notification outbox delivery

## Do not activate yet

The existing `src/data/masterCatalog2026.js` contains legacy placeholders such as `5.00 / hr` and `5.00 / pkg`. Those values should remain only as historical compatibility data until the complete reconciliation is finished. Do not globally replace them with guesses.
