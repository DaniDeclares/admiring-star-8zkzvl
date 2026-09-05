# DANI DECLARES — Authoritative Environment Variable Inventory
**Audit Date:** September 5, 2026  
**Authority:** Code consumption verification + Vercel configuration audit  
**Status:** Supersedes `docs/integrations-inventory.md` (which contained false Stripe conclusions)

---

## EXECUTIVE SUMMARY

| Finding | Impact |
|---------|--------|
| **Stale inventory existed** | Previous document (`integrations-inventory.md`) incorrectly recommended deleting Stripe secrets |
| **STRIPE_SECRET_KEY is REQUIRED** | Used in webhook handler, balance API, and multiple scripts |
| **STRIPE_WEBHOOK_SECRET is REQUIRED** | Used in webhook signature verification |
| **Current Vercel config is correct** | All critical notification/auth variables present |
| **ADMIN_API_KEY identified as hardening target** | Bearer-token only; needs Supabase Auth + rate limiting |

---

## PART I: PRODUCTION RUNTIME VARIABLES

### A. Database & ORM (✅ Operational)

| Variable | Consumer | Type | Scope | Status |
|----------|----------|------|-------|--------|
| `DATABASE_URL` | `lib/prisma.js` + `prisma/schema.prisma` | Connection string | Server-only | ✅ Vercel |
| `POSTGRES_*` | System-generated (not consumed by app code) | Legacy | N/A | 🟡 Classify before cleanup |

**Note:** Prisma adds `?pgbouncer=true` for Supabase connection pooling.

---

### B. Supabase Authentication (✅ Operational)

| Variable | Consumer | Type | Scope | Status |
|----------|----------|------|-------|--------|
| `SUPABASE_URL` | `api/_portalAuth.js`, seed scripts | Server URL | Server | ✅ Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/_portalAuth.js`, admin tooling | API credential | **Server-only** | ✅ Vercel |
| `SUPABASE_JWT_SECRET` | Portal auth workflows | Secret | Server | ✅ Vercel |
| `NEXT_PUBLIC_SUPABASE_URL` | Client-side Supabase | Public URL | Client | ✅ Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase | Public key | Client | ✅ Vercel |

**Security:** ✅ Service-role strictly server-only; client credentials properly scoped.

---

### C. Stripe Payment Processing (✅ Operational | 🔴 Inventory Was Wrong)

| Variable | Consumer | Type | Scope | Status | Note |
|----------|----------|------|-------|--------|------|
| `STRIPE_SECRET_KEY` | `api/stripe-webhook.js:8`, `api/stripe/fetch-balance.js:20`, `scripts/generateStripeProducts.js:4`, `scripts/auditStripeCanonicalCrosswalk.mjs:71`, `scripts/reconcile-stripe-links.py:58` | API secret | Server-only | ✅ Vercel | **CRITICAL:** Previous inventory incorrectly recommended deletion. Keep configured. |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe-webhook.js:9` (signature verification) | Webhook secret | Server-only | ✅ Vercel | **CRITICAL:** Previous inventory incorrectly recommended deletion. Keep configured. |
| `NEXT_PUBLIC_STRIPE_KEY` | `src/services/stripeClient.js` (client checkout) | Publishable key | Client | ✅ Vercel | Expected `NEXT_PUBLIC_*` prefix |

**Webhook Code (Production Critical):**
```javascript
// api/stripe-webhook.js
const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = secretKey ? new Stripe(secretKey) : null;

export default async function handler(req, res) {
  if (!stripe || !webhookSecret) {
    console.error('Stripe webhooks unconfigured: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.');
    return res.status(500).json({ error: 'Stripe webhook configuration missing' });
  }
  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], webhookSecret);
  } catch (err) {
    console.error('Stripe Webhook Signature Verification Failed:', err.message);
    return res.status(400).send('Webhook Signature Error');
  }
  // ... process payment event
}
```

---

### D. Email Notifications — Resend (✅ Operational)

| Variable | Consumer | Type | Scope | Status |
|----------|----------|------|-------|--------|
| `RESEND_API_KEY` | `api/process-outbox.js`, `api/process-provider-routing.js` | API credential | Server-only | ✅ Vercel (Aug 20) |
| `RESEND_FROM_EMAIL` | Email sender identity | Config | Server | ✅ Vercel (Aug 30) |
| `NOTIFICATION_FROM_EMAIL` | Fallback sender | Config | Server | 🟡 Optional |

**Security:** ✅ API key server-only; code guards against test `@resend.dev` in production.

---

### E. SMS Notifications — Twilio (✅ Operational)

| Variable | Consumer | Type | Scope | Status |
|----------|----------|------|-------|--------|
| `TWILIO_ACCOUNT_SID` | `api/process-outbox.js`, `api/process-provider-routing.js` | Account ID | Server | ✅ Vercel |
| `TWILIO_API_KEY_SID` | SMS handlers | API key | Server | ✅ Vercel |
| `TWILIO_API_KEY_SECRET` | SMS handlers | API secret | Server | ✅ Vercel |
| `TWILIO_FROM_NUMBER` | SMS sender (preferred) | Phone number | Server | ✅ Vercel |
| `TWILIO_PHONE_NUMBER` | SMS sender (fallback) | Phone number | Server | 🟡 Legacy |

**Auth Method:** API-key (correct, not deprecated token).

---

### F. Scheduled Notification Processing (✅ Operational)

| Variable | Consumer | Type | Scope | Status |
|----------|----------|------|-------|--------|
| `CRON_SECRET` | `api/process-outbox.js`, `api/process-provider-routing.js` | Bearer token | Server | ✅ Vercel (Aug 21) |

**Requirement:** Must match `dd_cron_secret` in Supabase Vault.  
**Status:** Value-match unverified (cannot inspect secrets).

---

### G. Owner Notifications (✅ Email ready | 🟡 SMS optional)

| Variable | Consumer | Type | Scope | Status |
|----------|----------|------|-------|--------|
| `NOTIFICATION_EMAIL` | Notification queue | Destination | Server | ✅ Vercel |
| `NOTIFICATION_PHONE` | Optional SMS alerts | Phone | Server | 🟡 Not set (optional) |

---

### H. Financial & Administrative (✅ Configured | 🟡 Hardening needed)

| Variable | Consumer | Type | Scope | Status | Issue |
|----------|----------|------|-------|--------|-------|
| `ADMIN_API_KEY` | `api/stripe/fetch-balance.js` | Bearer token | Server | ✅ Vercel | Bearer-token only; needs Supabase Auth + rate limiting |

**Endpoint:** `/api/stripe/fetch-balance?account=<optional>`  
**Authorization:** `Authorization: Bearer <ADMIN_API_KEY>` only  
**Exposure:** Financial data (Stripe balance/payouts)  

**Hardening Required:** Add Supabase Auth verification + request rate limiting (5 req/min per user).

---

## PART II: CLIENT-SIDE & PUBLIC VARIABLES

| Variable | Consumer | Type | Scope | Status |
|----------|----------|------|-------|--------|
| `REACT_APP_GA_MEASUREMENT_ID` | `src/App.js` | Analytics ID | Client | ✅ Vercel |
| `REACT_APP_STRIPE_*` (legacy) | Deprecated payment links | Link ID | Client | ⏳ Deprecating |
| `GOOGLE_MAPS_API_KEY` | `api/travel-quote.js` | API key | Server | ✅ Vercel |
| `PRINTIFY_API_TOKEN` | Scripts + proxy | API credential | Server | ✅ Vercel |
| `PRINTIFY_STORE_ID` | Printify scripts | Store ID | Server | ✅ Vercel |

**Verification:** No production secrets exposed via `REACT_APP_*` or `NEXT_PUBLIC_*` prefixes in browser bundle.

---

## PART III: CRITICAL CORRECTIONS

### Correction #1: Stripe Secrets Are Required

**Previous (Incorrect):**
```
STRIPE_SECRET_KEY | No | Not referenced in repo | Server | Delete
STRIPE_WEBHOOK_SECRET | No | Not referenced in repo | Server | Delete
```

**Verified Usage:**
- `STRIPE_SECRET_KEY`: 5 confirmed locations (webhook, balance, 3 scripts)
- `STRIPE_WEBHOOK_SECRET`: 1 confirmed location (webhook signature)

**Action:** Keep both configured. Do not delete.

---

### Correction #2: No Secrets in Client Bundle

**Verified:** ✅ `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `ADMIN_API_KEY` not exposed via public bundle variables.

---

## PART IV: PRODUCTION STATUS MATRIX

| Component | Status | Action |
|-----------|--------|--------|
| Vercel Variables | ✅ Configured | None |
| CRON Logic | ✅ Implemented | Verify Vault value match |
| Stripe Webhook | ✅ Active | Test with safe event |
| Email | ✅ Ready | Test end-to-end |
| SMS | ✅ Ready | Owner decides on alerts |
| Financial Endpoint | 🟡 Working | Add Supabase Auth + rate limit |
| Documentation | 🔴 Stale | ← You are reading the fix |

---

## PART V: OWNER/ADMIN ACTIONS REQUIRED

1. **Verify CRON_SECRET ↔ Vault Match**
   - Go to Supabase → Vault
   - Confirm `dd_cron_secret` exists (don't share value)

2. **Test Email End-to-End (Safe)**
   - Insert test record into `dd_event_outbox`
   - Wait 5 minutes
   - Verify email arrives at `NOTIFICATION_EMAIL`

3. **Harden `/api/stripe/fetch-balance`**
   - Add Supabase Auth verification
   - Implement rate limiting (5 req/min)
   - Log all access

4. **Decide on SMS Alerts**
   - If yes: set `NOTIFICATION_PHONE` in Vercel
   - If no: document as intentionally disabled

---

## PART VI: FINAL ASSESSMENT

**Production Readiness:** ✅ **READY WITH KNOWN HARDENING ITEMS**

- ✅ No client-side secret exposure
- ✅ All critical variables configured in Vercel
- ✅ Stripe webhook, Resend, Twilio architecturally sound
- 🟡 ADMIN_API_KEY endpoint needs multi-factor auth
- 🟡 CRON Vault value-match verification pending (mechanism correct)
- 🔴 Old inventory doc has false Stripe recommendations (this doc replaces it)

**DO NOT** follow `docs/integrations-inventory.md` recommendations about Stripe secret deletion.
