# Lead Notification Gap — Documentation

## Status

**Automated lead notifications are not yet implemented.**

As of this PR, service requests submitted via `/request-service` are written to the
Supabase `leads` and `service_requests` tables, but no automated notification is sent
to the Dani Declares operations team when a new lead arrives.

## Current Interim Behavior

- On success, users see: _"Your request was received. Dani Declares will follow up as soon
  as possible. For urgent requests, call or text (470) 485-7173."_
- On error (system unavailable), users see the public call/text number so the lead is not
  silently lost.

## Recommended Next Build

Implement one of the following to ensure no new lead sits unnoticed:

### Option A — Supabase Edge Function + Email (Recommended)

1. Create a Supabase Edge Function triggered by `INSERT` on `service_requests`.
2. Send an email to `admin@danideclares.com` (and optionally `vendors@danideclares.com`
   for VendorOps/procurement requests) with the lead details.
3. Use Resend, SendGrid, or Supabase's built-in SMTP integration.

### Option B — Supabase Realtime + Internal Dashboard Alert

1. Subscribe to the `service_requests` table in the admin dashboard.
2. Display a badge/count for new unread requests.
3. Useful as a supplement to Option A, not a replacement.

### Option C — Operations Lead Queue (Longer Term)

1. Build a lightweight internal queue view scoped to `status = 'new'`.
2. Assign leads to team members and track follow-up status.
3. This fits naturally into the existing DashboardPage.

## Public Contact Reference

| Purpose                              | Contact                          |
|--------------------------------------|----------------------------------|
| Public call/text (all regions)       | (470) 485-7173                   |
| SC-specific line                     | (864) 326-5362                   |
| General admin / account continuity   | admin@danideclares.com           |
| Vendor / property mgr / procurement  | vendors@danideclares.com         |
