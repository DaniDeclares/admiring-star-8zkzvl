# 📂 Dani Declares Project

## 1. Business Overview

**Name:** Dani Declares LLC  
**Owner:** Danielle Williams (@danideclares)  
**Primary Service Area:** Georgia + South Carolina  
**Website:** https://danideclares.com  

**Business Type:**  
Mobile operations & execution support company providing legal, administrative, compliance, logistics, property, event, and media services. Notary work is foundational but the brand is **not** “notary-only.”

---

## 2. Brand & Positioning

| Principle            | Meaning                                                                |
|----------------------|------------------------------------------------------------------------|
| **Compliance-first** | Every service is delivered to meet or exceed legal requirements.       |
| **Revenue & demand** | High-demand, cash-generating services get front-page priority.         |
| **Capability-forward** | Conservative tone for government & institutional audiences.          |
| **Mobile execution** | We come to the client: hospitals, jails, courts, job sites, homes.     |

### Brand Colors
- Burgundy (primary) `#8B1E2E`
- Ivory (secondary) `#F8F5F1`
- Gold (accent) `#D4AF37`

### Typography
- **Headings:** Roboto • Georgia • Merriweather  
- **Body:** Arial • Helvetica • Montserrat  

---

## 3. Divisional Structure & Public Services

### 3.1 Document & Compliance (Primary Cash Engine)

| Service Set            | Examples                                                             |
|------------------------|----------------------------------------------------------------------|
| **Document Handling**  | Printing, scanning, secure packaging, courier hand-off               |
| **Legal Docs (non-attorney)** | POA, affidavits, sworn statements, contracts                 |
| **Tax & IRS Support**  | 2848, SS-4, W-9, W-7, 4506-T                                         |
| **Notary Services**    | Mobile GA & SC notarizations, witness signings                       |
| **I-9 Verification**   | Authorized representative, E-Verify liaison                          |
| **Apostille Facilitation** | Intake, courier to SOS, status tracking                         |
| **Document Packaging & Submission** | Signature tiered service, full chain of custody        |

### 3.2 Logistics & Courier (B2B / Recurring)

| Service Set            | Examples                                                             |
|------------------------|----------------------------------------------------------------------|
| **Court & Agency Runs**| Filing, retrieval, same-day rush                                     |
| **Carrier Back-Office**| Broker packets, invoicing, compliance tracking                       |
| **Process Serving**    | Standard and rush, first attempt within 48 h                         |
| **Custom Courier**     | Medical records, equipment, time-sensitive docs                      |

### 3.3 Field Services (Property Reset)

| Service                           | Base Price* |
|-----------------------------------|-------------|
| Move-in / Move-out Cleaning       | from \$300  |
| Deep Cleaning                     | from \$400  |
| Full Property Reset (signature)   | \$500–\$1 500 |
| Add-ons                           | Carpet extraction, steam sanitize, haul-out |

### 3.4 Event Planning & Execution (High Ticket)

| Service                    | Notes                                  |
|----------------------------|----------------------------------------|
| Turn-key Event Planning    | Theme, vendor coordination, timeline   |
| Setup & Breakdown          | Crew dispatched on-site                |
| Custom Decor & Production  | Balloon installs, backdrops, props     |
| Sticker / Label Packages   | Brand-matched custom items             |

### 3.5 Product System (Add-on)

- Custom stickers & labels  
- Business starter kits  
- Branded apparel (bundled only)

### 3.6 Media System

- Content creation showcasing real work & systems  
- Lead-generation funnels (Facebook, Google, Thumbtack, etc.)  
- Weekly FB Creator tasks for monetization

### 3.7 Government Contracting

| Code  | Description                                     |
|-------|-------------------------------------------------|
| NAICS | 561410, 541120, 541199, 561611, 531390           |
| PSC   | R699, R499, R707, R418                           |

**UEI:** TD4TSG48LHN9  
*Focus:* subcontracting for admin, compliance, logistics, property support

> \* All published prices exclude travel and rush fees. Detailed rate cards live in `src/data/services.json`.

---

## 4. Booking & Payments (Non-Negotiable)

| Flow            | System              | Rule                                                                                      |
|-----------------|---------------------|-------------------------------------------------------------------------------------------|
| **Scheduling**  | TidyCal             | Only four authoritative slugs: `notary`, `apostille`, `officiant`, `loansigning`          |
| **Payments**    | Stripe Payment Links| Launched via `window.location.assign` from `/pay`                                         |
| **Confirmation**| Internal            | Appointment moves from *pending* to *confirmed* only after payment                        |

**Fallback Contact**  
Call / Text (864) 326-5362 | admin@danideclares.com

---

## 5. Federal / Government Page

- Conservative, capability-based copy  
- Lists NAICS, PSC, UEI, coverage area  
- **No** Stripe buttons, **no** booking CTAs  
- Purpose-built for procurement reviewers

---

## 6. Technology Stack

| Layer       | Tooling                                   |
|-------------|-------------------------------------------|
| **Frontend**| React (CRA), React Router, CSS Modules    |
| **Data**    | `services.json` catalog read at build-time|
| **Hosting** | Vercel (preview & prod)                   |
| **CI/CD**   | GitHub → Vercel auto-deploy               |
| **Payments**| Stripe Payment Links                      |
| **Scheduling** | TidyCal                               |
| **CRM / Forms** | HubSpot                              |
| **Analytics** | Google Analytics 4 (prod only)          |

---

## 7. Environment Variables

Manage in Vercel or local `.env` — **never commit secrets**.

```env
# Analytics
REACT_APP_GA_MEASUREMENT_ID=

# Maps & Travel
GOOGLE_MAPS_API_KEY=
ORIGIN_ADDRESS="650 Abberley Way, Stone Mountain GA 30083"
BASE_RADIUS_MILES=10
MILEAGE_RATE=1.0      # dollars per mile charged
BASE_TRAVEL_FEE=25    # minimum travel fee
