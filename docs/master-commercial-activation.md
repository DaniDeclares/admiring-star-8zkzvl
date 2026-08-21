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

## Remaining production activation gates

### 1. Complete the reconciliation inventory

Run a Stripe export/API comparison against the registry. Each active Payment Link must be classified as:

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

### 5. Stripe reconciliation

Stripe metadata should carry at least:

- `service_id`
- `commercial_registry_version`
- `channel`
- `provider_lane`
- `price_snapshot_cents`
- `resident_discount_applied`
- `modifier_codes`

Provider payout data must not be written into customer-facing Stripe metadata.

### 6. Production secrets

Set `CRON_SECRET` in the production Vercel environment and store the matching secret in Supabase Vault under `dd_cron_secret`. Never commit the token to Git.

Also configure production `RESEND_API_KEY` and `TWILIO_AUTH_TOKEN` only in the production secret store.

### 7. Portal identities

Provision the actual staff administrator and provider accounts using the already-deployed Supabase provisioning functions. Never hard-code Auth UUIDs in source.

### 8. Notification smoke test

Insert one controlled test event into `dd_event_outbox`, verify the worker processes it, then remove/mark the test record according to the production audit policy.

### 9. Build and deployment verification

Run:

```bash
npm test -- --watchAll=false
npm run build
```

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

## Do not activate yet

The existing `src/data/masterCatalog2026.js` contains legacy placeholders such as `5.00 / hr` and `5.00 / pkg`. Those values should remain only as historical compatibility data until the complete reconciliation is finished. Do not globally replace them with guesses.
