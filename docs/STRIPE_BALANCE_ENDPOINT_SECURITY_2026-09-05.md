# Stripe Balance Endpoint Security — 2026-09-05

## Purpose

Security hardening record for `GET /api/stripe/fetch-balance`, an internal financial-reporting endpoint that retrieves Stripe account balance data.

## Audit finding

The prior endpoint accepted a bearer token matching `ADMIN_API_KEY` as its only authorization control. No repository caller for this endpoint was identified during the engineering audit, so the endpoint is treated as internal-only rather than customer-facing.

The endpoint uses `STRIPE_SECRET_KEY` to retrieve live Stripe balance data. That secret remains server-side and is not being removed or rotated.

## Implemented controls

1. **Supabase Auth required** — requests must present a valid Supabase access token through the existing server-side portal authentication boundary.
2. **Financial role restriction** — only `admin`, `owner`, or `staff_admin` roles may access the endpoint. Ordinary `staff` and customer/provider identities are rejected.
3. **MFA session required** — the access token must indicate an MFA-authenticated session (`aal2` or an MFA/OTP/TOTP authentication method). A valid password-only session is insufficient.
4. **Rate limiting** — maximum 5 successful authorization attempts per authenticated user per 60-second window, with `429` and `Retry-After` when exceeded.
5. **Structured access logging** — method failures, authentication failures, authorization failures, MFA failures, rate limiting, Stripe configuration errors, successful reads, and Stripe errors are logged without logging bearer tokens or Stripe secrets.
6. **Response hardening** — financial responses are marked `no-store` and `noindex`; a request ID is returned for operational tracing.
7. **Legacy bearer authorization removed** — `ADMIN_API_KEY` is no longer accepted by this endpoint.

## Important implementation limitation

The current rate limiter is process-local memory. This provides protection within a warm serverless instance but is not a globally shared distributed limiter across all Vercel instances. A persistent/shared rate-limit store should be introduced if this endpoint is exposed to multiple concurrent production instances or materially higher usage.

This limitation is intentionally documented rather than adding a new infrastructure dependency or database object without an approved migration path.

## Owner-dependent validation

- Create/activate the authorized owner/staff Supabase Auth identity if not already present.
- Enroll the authorized account in Supabase MFA and confirm the session reaches `aal2` before using the financial endpoint.
- Confirm the endpoint returns `401/403` for missing/invalid auth, unauthorized roles, and password-only sessions.
- Confirm `429` after the sixth request within the same one-minute window.
- Confirm successful balance retrieval only with an MFA-authenticated authorized role.

## Non-goals

- No Stripe credentials were deleted or rotated.
- No Vercel environment variables were changed.
- No customer-facing portal flow was changed.
- No pricing, catalog, fulfillment, or payment reconciliation logic was changed.
