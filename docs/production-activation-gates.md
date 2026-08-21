# DANI DECLARES — Production Activation Gates

## Commercial authority

- Human-approved commercial specification is the source of intent.
- `src/config/commercialRegistry.js` is the executable commercial authority.
- Quote / frozen-estimate state is the transaction authority for variable or bespoke work.
- Stripe is payment execution and reconciliation only.
- Provider public pricing and marketing do not override DANI DECLARES commercial authority.

## NAWFside commercial autonomy

The executed provider relationship permits DANI DECLARES to control customer-facing pricing and marketing. This does **not** waive provider compliance, insurance, licensing, routing, or work-order requirements.

The provider wall therefore remains:

1. DANI DECLARES owns public price, offer packaging, promotions, and marketing.
2. NAWFside fulfills approved work under the executed agreement/work orders.
3. NAWFside payout is determined only by executed work order/SOW terms, never by reverse-calculating from public price.
4. Provider-facing economics remain private.
5. No work is routed merely because a provider exists in the registry.

## Production secret contract

### Already present in Vercel

The production project already has Stripe server credentials and webhook configuration, plus Supabase server credentials. These remain server-only; never move them into `NEXT_PUBLIC_*` variables.

### Required for the outbox worker

- `CRON_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (or existing `NOTIFICATION_FROM_EMAIL`)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`
- `TWILIO_FROM_NUMBER`

The worker intentionally uses a Twilio API Key SID + API Key Secret rather than the account master Auth Token. If only the API Key SID is available, the secret and Account SID are still required.

## Activation blockers

- Supabase Vault write for `dd_cron_secret` requires the project's vault crypto privileges; the application SQL role cannot currently write the secret. Set the same generated `CRON_SECRET` in Vercel and Supabase Vault using an authorized Supabase project-owner/admin context.
- Resend is not configured in the observed Vercel environment yet.
- Twilio messaging credentials are not present in the observed Vercel environment yet.
- NAWFside is still `accepts_new_work = false`, with compliance pending and all current capability authorization flags false. Do not flip those flags until the documentary gates are verified.
- Cass remains inactive for routing because her agreement/compliance/capability records are not complete.

## Stripe crosswalk

Run:

```bash
STRIPE_SECRET_KEY=... npm run audit:stripe-crosswalk
```

The script is read-only. It inventories active and inactive Payment Links and line items and writes `docs/stripe-canonical-crosswalk.live.json` locally. Unknown offers remain `UNMAPPED`; no Product, Price, or Payment Link is changed.

The supplied historical `payment_links.csv` is an audit input, not the source of commercial truth. The library inventory includes legacy and current links such as Apostille Facilitation, I-9 Employment Verification, Mobile Notary Service, Administrative Support Session, Property Reset Deposit, and event packages; each must be dispositioned against the canonical registry before retirement or replacement.

## Definition of done

Production activation is complete only when:

- Stripe crosswalk is generated and reviewed.
- No new customer-facing hardcoded price authority exists outside the canonical registry.
- `CRON_SECRET` is configured in both Vercel and Supabase Vault.
- Resend and Twilio credentials are configured and the outbox test is processed successfully.
- Intentional staff/provider identities are provisioned and role boundaries are tested.
- NAWFside compliance and routing gates are verified before work activation.
- Cass documentation and capabilities are verified before routing.
- Full intake → quote → payment → job → assignment → notification → completion → accounting flow passes end-to-end.
