# DANI DECLARES — CURRENT COMPANY-WIDE CONTROL POINT
Date: 2026-08-29
Authority: Danielle Fong, Owner/Managing Director
## LOCKED DECISIONS
- Official commercial channels: CH01 Resident Concierge; CH02 Property Management & Apartments; CH03 Real Estate Offices & Brokerages; CH04 Businesses; CH05 Government & Institutional Procurement.
- CH01-A Regular Resident Concierge and CH01-B Apartment Resident Concierge are distinct price books; CH02 is a separate property-management customer relationship.
- Georgia is the current commercial operating jurisdiction.
- Master Commercial Universe / DANI Supabase commercial architecture is authoritative for canonical commercial identity; website is downstream and not a source of truth.
- 11 operating matrices are locked.
- Commercialization order: Services → Buyers/Customers → Channels → Locations → Prices → Pricing Rules → Fulfillment → Compliance → SOP/QA → Commercial Variants → SKUs → System Activation.
- All D01 pricing previously discussed and explicitly approved by Danielle on 2026-08-29 is OWNER APPROVED. Do not re-request approval unless a genuinely new price/policy conflict is introduced.
## CURRENT TECHNICAL AUTHORITY
Supabase: commercial architecture/master service universe/fulfillment/customer relationship/payment data domains as registered. GitHub: application source. Vercel: deployment. HubSpot: CRM relationship layer. Stripe: payment authority. Shopify: product commerce. PostHog: analytics. Resend/Twilio: customer communications.
## VERIFIED CURRENT STATE
- Supabase commercial channels: 5 active; CH01-A and CH01-B active.
- Supabase services: 5 CANONICAL_ACTIVE, 21 CANONICAL_LOCKED, 18 PENDING_RECONCILIATION.
- Market pricing rules: 14 ACTIVE, 175 PRICED, 35 QUOTE_REQUIRED, 1,624 PENDING_RECONCILIATION.
- Active provider organizations: 46; fully qualified provider organizations matching all tested qualification conditions: 0.
- Auth users: 0; portal identities: 0; commercial relationships: 0. Therefore portals exist in architecture/code but have no real authenticated users/relationships yet.
- Leads: 0; service requests: 0; jobs: 0; payment events: 0; notification outbox: currently empty.
- Supabase pg_cron notification worker exists and is active every 5 minutes. Vault contains dd_cron_secret with sufficient length. Vercel still needs CRON_SECRET in Production for /api/process-outbox to accept the worker call.
- Existing Vercel environment list shows TWILIO_PHONE_NUMBER, not TWILIO_FROM_NUMBER. Code has been changed to accept either name.
- Resend production credentials were not present in the Vercel environment list supplied in this project; email delivery therefore remains blocked until configured.
## FIXES MADE 2026-08-29
- Reconciled five D01 approved prices in Supabase: Bin Sanitation $59 starting; Odor Neutralization $99 starting; Indoor Plant Care $149/month; Home Watch $65/visit starting plus $149/month basic recurring offer; Event/Party Home Preparation & Reset $175 starting.
- Added the owner-approved pricing rule and resident price-book distinction to catalog governance so future work does not re-open already approved decisions.
- Corrected the application canonical catalog registry from an obsolete six-channel definition to the locked five-channel architecture and added CH01-A/CH01-B explicitly.
- Updated notification worker to use TWILIO_FROM_NUMBER or existing TWILIO_PHONE_NUMBER.
- Updated intake webhook to persist leads/requests and queue owner email/SMS notification events when notification destinations are configured, without failing the customer's successful intake if notification queuing fails.
- GitHub changes automatically triggered production Vercel deployments; latest deployment is associated with commit 623b6cb50c7fe007961c73114fca344c9dabe34e0.
## CRITICAL FINDINGS
- The public site still contains legacy messaging and capability references that do not fully match the locked commercial architecture, including South Carolina availability and legacy division/channel language. These must be corrected before declaring the public presence synchronized.
- The booking compatibility layer currently has bookingEnabled=false and paymentEnabled=false for its canonical capabilities; the site therefore does not yet provide a governed service-payment path for the current D01 catalog.
- Existing live Stripe Payment Links exist, but public navigation intentionally does not expose raw links; they must be crosswalked to approved commercial offers before reuse.
- The current active D01 service records have no provider capability rows or approved provider rate cards. Do not invent provider qualification or payout economics.
- Supabase security/performance advisors show many INFO/WARN findings, including RLS-enabled tables with no policies, multiple permissive policies, unindexed foreign keys, duplicate indexes and unused indexes. These should be prioritized by external exposure/production impact rather than bulk-cleared blindly.
- Historical production-activation documentation is stale: it says dd_cron_secret is absent, but current Supabase Vault now contains it. Future status documents must reference this control point.
## OWNER ACTIONS ONLY
1. Add Vercel Production CRON_SECRET using the existing Supabase Vault dd_cron_secret value; do not send the value in chat.
2. Add Vercel Production/Preview RESEND_API_KEY and RESEND_FROM_EMAIL using a verified sender/domain. Do not send the secret value in chat.
3. Add NOTIFICATION_PHONE in Vercel if Danielle wants lead alerts by SMS; the code already supports it. Do not send the phone number in chat if private.
4. Create/activate the first real staff/provider authentication identity only when ready; no Auth UUID should be invented or hard-coded.
## NEXT CRITICAL PATH
1. Complete the production deployment verification for the latest commits.
2. Correct public-site legacy/contradictory messaging and ensure all five channels and Georgia-only commercial positioning are reflected.
3. Build the governed commercial service/payment path from the approved commercial matrix rather than legacy bookingServices.
4. Close fulfillment/provider/compliance gates for the first services that Danielle wants to sell immediately; provider evidence must be qualified before provider-routed work is activated.
5. Verify intake → database → notification → payment → job → dispatch → completion end-to-end with a controlled test transaction before public launch.
6. Reconcile remaining pricing/service records horizontally across all channels and markets; do not regenerate SKUs until commercial variants are correct.
## NON-NEGOTIABLE
Do not ask Danielle to re-approve decisions already listed as OWNER APPROVED here. Do not treat unchanged downstream data as evidence that an owner decision was not made. When a downstream record conflicts with this control point, reconcile the record to the locked decision or surface a genuine new conflict only.