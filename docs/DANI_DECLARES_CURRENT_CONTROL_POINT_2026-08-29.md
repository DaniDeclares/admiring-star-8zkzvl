# DANI DECLARES — CURRENT COMPANY-WIDE CONTROL POINT
Date: 2026-08-29
Authority: Danielle Fong, Owner/Managing Director
## LOCKED DECISIONS
- Official commercial channels: CH01 Resident Concierge; CH02 Property Management & Apartments; CH03 Real Estate Offices & Brokerages; CH04 Businesses; CH05 Government & Institutional Procurement.
- CH01-A Regular Resident Concierge and CH01-B Apartment Resident Concierge are distinct price books; CH02 is a separate property-management customer relationship. Never automatically apply regular-resident pricing to apartment residents or CH02.
- Georgia and South Carolina are authorized commercial markets. The architecture is national-ready for future 50-state activation; states are not represented as commercially active until their service, pricing, fulfillment and compliance gates are verified.
- Master Commercial Universe / DANI Supabase commercial architecture is authoritative for canonical commercial identity; website is downstream and not a source of truth.
- 11 operating matrices are locked.
- Commercialization order: Services → Buyers/Customers → Channels → Locations → Prices → Pricing Rules → Fulfillment → Compliance → SOP/QA → Commercial Variants → SKUs → System Activation.
- All D01 pricing previously discussed and explicitly approved by Danielle on 2026-08-29 is OWNER APPROVED. Existing-service pricing authority is delegated to ChatGPT to research, calculate and maintain from market evidence and fulfillment economics; genuinely new services require Danielle's approval before activation.
## CURRENT TECHNICAL AUTHORITY
Supabase: commercial architecture/master service universe/fulfillment/customer relationship/payment data domains as registered. GitHub: application source. Vercel: deployment. HubSpot: CRM relationship layer. Stripe: payment authority. Shopify: product commerce. PostHog: analytics. Resend/Twilio: customer communications.
## VERIFIED CURRENT STATE
- Supabase commercial channels: 5 active; CH01-A and CH01-B active.
- Latest production deployment is READY and aliases danideclares.com and www.danideclares.com. Current launch commit: 4af7a5b (channel-aware checkout authorization). Earlier red deployments were caused by the Vercel Hobby serverless-function-per-deployment limit after the new checkout endpoint temporarily raised the function count above the limit; the unused legacy subscription endpoint was removed and subsequent builds are compiling successfully.
- Current production build contains 12 serverless functions and completed successfully without build errors.
- Supabase services contain canonical D01 records plus legacy/absorbed records; public selling consumes the canonical commercial registry and not legacy pricing tables.
- Active provider organizations: 46; fully qualified provider organizations matching all tested qualification conditions: 0. DANI may fulfill directly where permitted; provider-routed work remains gated until provider qualification is complete.
- Auth users: 0; portal identities: 0; commercial relationships: 0. Portals exist in architecture/code but have no real authenticated users/relationships yet.
- Leads: 0; service requests: 0; jobs: 0; payment events: 0; notification outbox: currently empty.
- Supabase pg_cron notification worker exists and is active every 5 minutes. Vault contains dd_cron_secret. Vercel Production still needs CRON_SECRET matching that Vault value for the secure worker endpoint.
- Existing Vercel environment list shows TWILIO_PHONE_NUMBER, and code accepts TWILIO_FROM_NUMBER or TWILIO_PHONE_NUMBER.
- Resend production credentials were not present in the Vercel environment list supplied in this project; email delivery remains blocked until configured.
## LIVE LAUNCH OFFERS
These five D01 offers are owner-approved and activated in the canonical runtime for immediate direct commercial launch through /request-service and hosted Stripe Checkout:
- DNI-01A-009 Bin Sanitation — starting at $59.
- DNI-01A-010 Odor Neutralization — starting at $99.
- DNI-01C-001 Indoor Plant Care — starting at $149/month.
- DNI-01D-002 Home Watch / Household Absence Check — starting at $65/visit; basic recurring offer $149/month is separately defined.
- DNI-01D-004 Event / Party Home Preparation & Reset — starting at $175.
These launch anchors are customer prices, not provider payouts. They are not automatically discounted unless the canonical offer explicitly marks resident discount eligibility.
## FIXES MADE 2026-08-29
- Corrected application commercial registry to exactly five official channels and explicit CH01-A/CH01-B subchannels.
- Activated the five owner-approved D01 launch offers in the canonical runtime registry with server-side price resolution.
- Fixed canonical resolver compatibility so isCanonicalActive accepts either a service ID or record object.
- Added a server-side Stripe Checkout Session endpoint using canonical runtime pricing and request/service metadata; no legacy Stripe Payment Link is treated as commercial authority.
- Enforced channel eligibility at checkout so a B2C launch offer cannot be purchased through CH02-CH05 simply by changing a form selection.
- Connected /request-service to the approved launch offers and secure hosted Stripe Checkout.
- Removed the unused legacy subscription endpoint to remain within Vercel's serverless-function limit.
- Routed legacy public resident-concierge, wedding/festival, and travel-quote paths into governed intake instead of exposing historical pricing pages.
- Updated public footer links to governed paths and Georgia + South Carolina service-area language.
- Updated canonical pricing governance to GA + SC current with national-ready architecture and explicit separation of CH01, CH02 and other commercial relationships.
- Updated README and this control point so stale six-channel/Georgia-only statements no longer govern current implementation.
## VERIFIED PRODUCTION TESTS
- Production homepage/request-service URL responds HTTP 200.
- `/api/create-checkout-session` responds HTTP 405 to GET, confirming the production endpoint is deployed and method-gated; POST checkout requires an existing request ID and canonical offer and was not completed with a live charge.
- Latest production build compiled successfully and Vercel reports READY with no build errors.
## CRITICAL FINDINGS
- The site is now on the governed launch path, but a full browser POST journey and completed payment have not been independently executed in this environment. Do not represent that a live charge was tested.
- Existing live Stripe Payment Links are historical evidence and must not be exposed as substitutes for canonical launch offers without crosswalk verification.
- Provider capability/rate-card coverage is not complete. Never invent provider qualification or payout economics.
- Supabase security/performance advisors contain INFO/WARN findings; prioritize by production exposure and do not bulk-clear blindly.
## OWNER ACTIONS ONLY
1. Add Vercel Production CRON_SECRET using the existing Supabase Vault dd_cron_secret value; do not send the value in chat.
2. Add Vercel Production/Preview RESEND_API_KEY and RESEND_FROM_EMAIL using a verified sender/domain; do not send secret values in chat.
3. Add NOTIFICATION_PHONE in Vercel if SMS lead alerts to Danielle are desired; do not send the private number in chat.
4. Perform the first real staff/provider authentication identity only when ready; no Auth UUID should be invented or hard-coded.
5. A live payment verification should use a real customer/order only when Danielle intentionally authorizes the transaction; safe checkout/session creation can be tested without completing a charge.
## NEXT CRITICAL PATH
1. Run one controlled browser checkout using a real service request and a safe/test payment method if the Stripe environment permits it; otherwise stop before charge and record the exact limitation.
2. Verify checkout.session.completed → request transition → job creation → accounting reconciliation.
3. Configure CRON_SECRET and Resend if owner alerts are required.
4. Continue horizontal service × buyer × channel × location × pricing × fulfillment reconciliation; do not regenerate SKUs until commercial variants are correct.
## NON-NEGOTIABLE
Do not ask Danielle to re-approve decisions already listed as OWNER APPROVED here. Do not treat unchanged downstream data as evidence that an owner decision was not made. When a downstream record conflicts with this control point, reconcile the record to the locked decision or surface a genuine new conflict only.