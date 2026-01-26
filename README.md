# 📂 Dani Declares Project

## 1. Business Overview

**Name:** Dani Declares LLC  
**Owner:** Danielle Williams  
**Primary Service Area:** Georgia & South Carolina  
**Website:** https://danideclares.com  

**Business Type:**  
Mobile legal, administrative, and compliance support services provider.

Dani Declares LLC delivers mobile-first, compliance-driven services for individuals, businesses, institutions, and government entities. Notary services are foundational, but the company is not positioned as “notary-only.”

---

## 2. Brand & Positioning

**Core Positioning Principles**
- Compliance-first
- Revenue-generating, high-demand services prioritized
- Conservative, capability-forward presentation (especially for government and institutional clients)
- Mobile/field services are a core differentiator

**Brand Colors**
- Burgundy (Primary): `#8B1E2E`
- Ivory (Secondary): `#F8F5F1`
- Gold (Accent): `#D4AF37`

**Typography**
- Headings: Roboto, Georgia, Merriweather  
- Body: Arial, Helvetica, Montserrat  

---

## 3. Core Services (Public Website)

Services are intentionally grouped and prioritized to support mobile legal/admin/compliance support while keeping a capability-forward posture for institutional and government audiences.

### Primary Service Categories
1. **Legal & Compliance Documentation Support**
   - Affidavits, sworn statements, POAs
   - IRS and tax-related documentation
   - Time-sensitive filings

2. **General Notary & Document Execution**
   - Mobile notarizations
   - Personal, legal, and business documents
   - GA & SC compliant statutory fees

3. **School & Family Documentation**
   - Enrollment affidavits
   - Travel consent
   - Guardianship-related documents

4. **Employer / I-9 & Administrative Services**
   - I-9 employment verification
   - Administrative document assistance
   - HR support (non-legal)

5. **Apostille & Authentication**
   - Intake coordination
   - Status tracking
   - Domestic & international document preparation support

6. **Facility Visits (Mobile Field Services)**
   - Hospitals & nursing homes
   - Assisted living & rehab facilities
   - Correctional facilities
   - Courthouses & government offices

> **Officiant services are offered but intentionally de-emphasized.**  
> They are never a hero service or primary CTA.

---

## 4. Booking & Payments (NON-NEGOTIABLE)

### Scheduling
- **TidyCal is the ONLY booking system**
- Authoritative booking paths:
  - `danideclaresns/notary`
  - `danideclaresns/apostille`
  - `danideclaresns/officiant`
  - `danideclaresns/loansigning`

### Payments
- **Stripe Payment Links ONLY**
- No Stripe Buy Button embed snippets
- All payments are routed through:
  - `/pay` (centralized payment page)
- Stripe Payment Links are launched via:
  - `window.location.assign`
- Fallback contact is always visible:
  - Call/Text: (864) 326-5362
  - Email: admin@danideclares.com

### Booking Flow (Required)
1. Client books via TidyCal  
2. Appointment is **pending**
3. Client completes payment via `/pay`
4. Payment confirms appointment

---

## 5. Federal / Government Services Page

A dedicated **Federal / Government** page exists and must:

- Use conservative, capability-based language
- Contain **NO Stripe buttons**
- Contain **NO booking CTAs**
- Avoid sales language entirely
- Be suitable for procurement officers and prime contractors

Includes:
- Core capabilities
- NAICS / PSC alignment
- UEI / CAGE (when provided)
- Compliance posture
- Coverage areas

---

## 6. Technology Stack

**Frontend**
- React (Create React App)
- React Router
- CSS modules / scoped CSS

**Hosting & Deployment**
- Vercel (production & preview environments)
- GitHub-integrated CI/CD

**Payments**
- Stripe Payment Links (no embedded checkout widgets)

**Scheduling**
- TidyCal (external, authoritative)

**CRM / Forms**
- HubSpot (forms + tracking)

**Analytics**
- Google Analytics 4
- (Loaded in production only)

---

## 7. Environment Variables

> Managed via Vercel dashboard or local `.env`.  
> **Never commit secrets to the repository.**

```env
# Analytics
REACT_APP_GA_MEASUREMENT_ID=

# Maps / Travel Calculations
GOOGLE_MAPS_API_KEY=
ORIGIN_ADDRESS=
BASE_RADIUS_MILES=10
MILEAGE_RATE=1.0
BASE_TRAVEL_FEE=25
