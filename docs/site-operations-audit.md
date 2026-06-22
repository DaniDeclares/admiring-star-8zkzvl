# Dani Declares LLC — Site Operations Audit

> **Status:** Reference document. Do not change code, pricing, compliance language, or protected-route assumptions without explicit approval.  
> **Last updated:** 2026-06-22  
> **Source:** Live repository audit of `DaniDeclares/admiring-star-8zkzvl`

---

## 1. Website Structure & Route Map

### Public Routes

| Route | Component | Notes |
|---|---|---|
| `/` | `HomePage` | Primary landing page |
| `/services` | `ServicesPage` | Services hub |
| `/signature-services` | `SignatureServicesPage` | Signature / premium services |
| `/field-services` | `FieldServicesPage` | On-site field work |
| `/events` | `EventsPage` | Events and officiant services |
| `/facility-visits` | `FacilityVisitsPage` | Facility inspection visits |
| `/federal` | `FederalPage` | Government contracting capabilities |
| `/tax-services` | `TaxServicesPage` | Tax-related services |
| `/request-service` | `RequestServicePage` | **Primary intake form** → Supabase |
| `/about` | `AboutPage` | Company overview |
| `/shop` | `ShopPage` | Printify-powered merchandise |
| `/book` | `BookingPage` | TidyCal booking widget |
| `/pay` | `PayPage` | Stripe payment portal |
| `/travel-quote` | `TravelQuotePage` | Distance-based fee calculator |
| `/festival` | `FestivalPage` | Festival event page (flag-gated) |
| `/membership` | `MembershipPage` | Membership offerings |
| `/contact` | `ContactPage` | General contact/inquiry |
| `/blog` | `BlogPage` | Blog index |
| `/blog/:slug` | `BlogPostPage` | Individual blog posts |
| `/partners` | `PartnerNetwork` | Partner network directory |
| `/partner-onboarding` | `PartnerOnboarding` | Stripe Connect partner intake |
| `/terms` | `TermsPage` | Terms of service |
| `/privacy` | `PrivacyPage` | Privacy policy |
| `/payment-success` | `PaymentSuccess` | Stripe success redirect |
| `/payment-cancel` | `PaymentCancel` | Stripe cancel redirect |
| `/login` | `LoginPage` | Auth entry point for dashboards |

### Legacy Redirects (Active)

| Old Route | Redirects To |
|---|---|
| `/federal-services` | `/federal` |
| `/tax` | `/tax-services` |
| `/bookings` | `/book` |
| `/onboarding` | `/partner-onboarding` |
| `/notary` | `/services` |
| `/apostille` | `/book?service=apostille` |
| `/officiant` | `/events` |
| `/packages` | `/signature-services` |
| `/real-estate` | `/field-services` |
| `/legal-services` | `/services` |
| `/professional-services` | `/services` |
| `/weddings` | `/events` |
| `/financial` | `/services` |

### Protected Routes (Login Required)

| Route | Component | Access Check |
|---|---|---|
| `/dashboard` | `DashboardPage` | `stripeAccount` in URL param or `localStorage` |
| `/notary-dashboard` | `NotaryDashboard` | Same |
| `/vendor-portal` | `VendorPortal` | Same |
| `/festival-dashboard` | `FestivalDashboard` | Same |
| `/success` | `SuccessPage` | Same |
| `/cancel` | `CancelPage` | Same |

---

## 2. Primary Public Flow

```
Home (/)
  └── Service pages (/services, /field-services, /events, /signature-services, etc.)
        └── /request-service  ← primary intake form
              └── Supabase (leads + service_requests tables)
                    └── Manual follow-up by Dani Declares staff
                          └── Quote delivered (off-platform or via /pay)
                                └── Job execution
                                      └── Payment (/pay → Stripe)
                                            └── Review / completion
```

Supporting booking path (known-service, fixed price):

```
/book  →  TidyCal scheduling  →  /pay  →  Stripe  →  /payment-success
```

---

## 3. Internal Divisions

Divisions are surfaced in `/request-service` as a required dropdown. The values below are the canonical fallback list used when Supabase is not yet returning live `divisions` table rows.

| Division Key | Display Name |
|---|---|
| DocOps | Document & Compliance |
| FieldOps | Property Operations & Resets |
| CourierOps | Logistics & Courier |
| EventOps | Event Planning & Execution |
| ProductOps | Stickers, Labels, Heat Press & Merch |
| DesignOps | Canva, CADlink, DTF & Print Prep |
| MediaOps | Content & Lead Generation |
| GovOps | Government Contracting Support |
| VendorOps | Vendor Readiness & Subcontractors |
| BusinessOps | Admin Systems & Business Support |

These fallback names must match any live `divisions` table records in Supabase. Adding or renaming divisions should be coordinated across both the database and the fallback array in `src/pages/RequestServicePage.jsx`.

---

## 4. `/request-service` Intake Behavior & Verification Needs

### What It Does Today

- Renders a service request form with required fields: Full Name, Phone, Division Needed, Service Needed, Request Details.
- Optional fields: Company Name, Email, Timeline, How did you find us, Service Location, Budget Range.
- On submit, the form:
  1. Inserts a row into the Supabase `leads` table with contact info and source attribution.
  2. Inserts a row into the Supabase `service_requests` table linked by `lead.id`, with division, service details, location, timeline, budget, and status `"new"`.
- If Supabase is not configured (`isSupabaseConfigured === false`), the form shows an error message directing the client to call or text directly. **No data is saved.**

### Division and Marketing Source Options

- Division list is loaded from Supabase `divisions` table (filter: `is_active = true`, ordered by `sort_order`). Falls back to hardcoded list if Supabase is unavailable.
- Marketing source list is loaded from Supabase `marketing_sources` table (filter: `is_active = true`, ordered by `name`). Falls back to hardcoded list.

### Remaining Verification Needs

| Item | Status |
|---|---|
| Supabase `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` set in Vercel | Needs confirmation |
| `divisions` table seeded with active records matching fallback names | Needs confirmation |
| `marketing_sources` table seeded with active records | Needs confirmation |
| `leads` table schema includes all fields written by `leadPayload` | Needs confirmation |
| `service_requests` table schema includes all fields written by `requestPayload` | Needs confirmation |
| Post-submission follow-up workflow connected (HubSpot, email alert, or Airtable) | Not yet implemented in code |
| Form validation for phone format | Not implemented |
| Duplicate lead detection | Not implemented |

---

## 5. Tool Operating Map

| Tool | Role | Integration Status |
|---|---|---|
| **Supabase** | Primary operational database. Stores `leads`, `service_requests`, `divisions`, `marketing_sources`. | Integrated in code via `src/lib/supabaseClient.js`. Requires env vars in Vercel. |
| **Stripe** | Payment collection via hosted payment links and Stripe Buy Buttons. Also used for partner/Connect onboarding. | Integrated. Links in `src/config/stripeLinks.js` and `src/data/servicesCatalog.js`. Connect client ID in env vars. |
| **TidyCal** | Appointment scheduling. Booking links embedded on `/book` and referenced in service catalog entries. | Integrated via `src/lib/loadTidycal.js` and `src/config/tidycalLinks.js`. |
| **HubSpot** | CRM / contact tracking. HubSpot tracking script is injected on every page load via `src/lib/loadHubSpot.js`. Page views are pushed on route change. | Script-level integration active. No form-to-HubSpot deal automation in code yet. |
| **Mailchimp** | Email marketing. Script injected on app mount in `src/App.js` (mcjs). | Script-level integration active. No form submission wired to list signup. |
| **Google Analytics** | Page view tracking. GA4 tag loaded and page-view events fired on each route change. | Active in production via `REACT_APP_GA_MEASUREMENT_ID`. |
| **Printify** | Print-on-demand merchandise. API proxy in `src/setupProxy.js` and product creation script in `src/scripts/printify.mjs`. | Integrated. Requires `PRINTIFY_API_TOKEN` and `PRINTIFY_STORE_ID` env vars. |
| **Google Maps** | Travel distance calculation for `/travel-quote`. Serverless API in `api/travel-quote.js`. | Integrated. Requires `GOOGLE_MAPS_API_KEY`, `ORIGIN_ADDRESS`, `BASE_TRAVEL_FEE`, `BASE_RADIUS_MILES`, `MILEAGE_RATE` env vars. |
| **Airtable** | Operational project/task tracking. Referenced in operational workflows. | **Not integrated in code.** Manual tool only at this time. |
| **Asana** | Project management and task tracking. | **Not integrated in code.** Manual tool only. |
| **Google Drive / Docs / Sheets** | Document storage, service records, carrier documents. | **Not integrated in code.** Manual tool only. |
| **Gmail / Google Contacts / Google Calendar** | Client communications, contact management, appointment visibility. | **Not integrated in code.** Manual tool only; TidyCal provides calendar sync independently. |
| **GitHub / Vercel** | Source control and deployment. React app deployed to Vercel from this repository. | Active. Vercel auto-deploys on push to main branch. |

---

## 6. Known Site Gaps

| Gap | Description |
|---|---|
| **No post-intake automation** | After a lead is written to Supabase, there is no automated notification, HubSpot deal creation, or email alert to staff. Follow-up is entirely manual. |
| **Supabase env vars unconfirmed** | If `REACT_APP_SUPABASE_URL` or `REACT_APP_SUPABASE_ANON_KEY` are missing from Vercel, the `/request-service` form silently fails and shows a manual contact message. |
| **Protected routes use localStorage auth only** | `ProtectedRoute` checks for a `stripeAccount` param in the URL or in `localStorage`. There is no session token, JWT, or Supabase Auth. Any user who sets this localStorage key can access dashboard routes. |
| **SETUP.md lists stale routes** | `SETUP.md` references `/coaching`, `/financial`, `/notary`, `/packages`, `/real-estate`, `/legal-services` as public pages. All of these are now legacy redirects, not standalone pages. |
| **No Airtable / Asana / Google Workspace integration** | These operational tools are used manually. There is no code bridge between intake data and project management systems. |
| **No email confirmation to client** | After a successful `/request-service` submission, the client receives only an on-screen message. No confirmation email is sent. |
| **STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET not referenced in code** | These env vars appear in Vercel configuration but serve no code-level purpose in the current repo. |
| **Festival feature is flag-gated off** | `SHOW_FESTIVAL = false` in `src/data/siteConfig.js`. The `/festival` route and `FestivalDashboard` exist but are not surfaced in navigation. |
| **`/partners` and partner onboarding are new and untested** | `PartnerNetwork` and `PartnerOnboarding` pages were recently added. Their connection to Stripe Connect and any backend partner record storage has not been audited. |
| **No sitemap.xml or robots.txt verified** | SEO infrastructure not confirmed present or up to date with current route map. |

---

## 7. What Not to Change Without Approval

The following items must not be modified, removed, or reconfigured without explicit written approval:

| Protected Area | Reason |
|---|---|
| **Stripe payment links and Buy Button IDs** | Live payment URLs are active and connected to real Stripe products. Changes would break payment collection. |
| **TidyCal booking links** | Live scheduling links tied to calendar availability and service configuration. |
| **Pricing values in `src/data/servicesCatalog.js`** | Canonical pricing canon. Any price change must be approved and coordinated with Stripe product updates. |
| **Compliance and legal disclaimer language** | Footer statements (not legal advice, independent contractor, equipment ownership, youth workforce compliance) are operational disclosures. |
| **Government contracting positioning and NAICS codes** | GovOps positioning and any SAM/UEI/CAGE content must not be altered without business-level approval. |
| **Notary commission language** | Any reference to notarial authority, commission, or authorized service area must remain accurate to actual commission status. |
| **REACH public positioning** | Any public-facing language about REACH (community/youth initiative) must not be changed without approval. |
| **Protected route access assumptions** | The `ProtectedRoute` component currently checks `stripeAccount` in localStorage. Do not change the authentication mechanism or remove route protection without a full auth migration plan. |
| **Brand colors and global CSS tokens** | Defined in `src/index.css` and component-level CSS. Visual identity changes require design approval. |

---

## 8. Immediate Development Sequence

The following represents the approved next steps in priority order. **Do not begin any step without confirmation.**

1. **Verify Supabase connection in Vercel**  
   Confirm `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set and that the `leads`, `service_requests`, `divisions`, and `marketing_sources` tables exist with the expected schema.

2. **Seed Supabase lookup tables**  
   Populate `divisions` and `marketing_sources` with active records matching the fallback arrays in `RequestServicePage.jsx` so the live form uses database-driven options.

3. **Add post-intake staff notification**  
   Wire a Supabase database webhook or edge function to send an email alert (via Gmail or a transactional email provider) when a new `service_requests` row is created with status `"new"`.

4. **Add client confirmation email**  
   After a successful form submission, send the client a confirmation email with their submitted details and expected response time.

5. **Audit and harden protected routes**  
   Evaluate the `stripeAccount`-based auth pattern and determine whether Supabase Auth or another session mechanism should replace it before any dashboard content is made sensitive.

6. **Reconcile SETUP.md with current route map**  
   Update `docs/SETUP.md` to reflect the live route structure and remove stale references to redirected legacy paths.

7. **Add sitemap.xml and verify robots.txt**  
   Ensure all public routes are crawlable and indexed correctly given the updated route map.

8. **Connect HubSpot to intake submissions**  
   Wire form submissions from `/request-service` (and optionally `/contact`) to create HubSpot contacts and deals, enabling CRM-based follow-up tracking.
