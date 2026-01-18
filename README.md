# 📂 Dani Declares Project

## 1. Business Overview

* **Name:** Dani Declares
* **Owner:** Danielle Williams
* **Location:** Atlanta, GA
* **Website:** [https://danideclares.com](https://danideclares.com)

> *“We simplify life’s milestones—weddings, legal services, financial planning—in one warm, empowering experience.”*

---

## 2. Brand Kit

* **Primary Color (Burgundy):** #8B1E2E
* **Secondary Color (Ivory):** #F8F5F1
* **Accent Color (Gold):** #D4AF37
* **Fonts:**

  * Headings: Roboto, Georgia, Merriweather
  * Body: Arial, Helvetica, Montserrat
* **Logo Files:**

  * `/assets/logo-primary.png`
  * `/assets/logo-gold-seal.png`

---

## 3. Services & Packages

| Service                          | URL Slug    |         Starting Price | Notes                                             |
| -------------------------------- | ----------- | ---------------------: | ------------------------------------------------- |
| Mobile Notary                    | `/notary`   |                   \$50 | Apostille, fingerprinting                         |
| Wedding Officiant                | `/weddings` |                  \$150 | Elopement → Full planning                         |
| Coaching (DIY / Group / 1:1 VIP) | `/coaching` | \$99 / \$499 / \$2,500 | Funnel: eBook → Webinar → VIP                     |
| Events                           | `/events`   |           See calendar | Sign & Sip, Love & Legalities, Declare Your Worth |

---

## 4. Upcoming Events & Milestones

| Date        | Event                                           | Folder / Design Path          |
| ----------- | ----------------------------------------------- | ----------------------------- |
| Jun 2 2025  | Sign & Sip: Notary + Networking Pop-Up          | `src/pages/EventsPage.jsx`    |
| Jul 13 2025 | Love & Legalities: Wedding Mixer                | `src/pages/WeddingsPage.jsx`  |
| Sept 2025   | Declare Your Worth Festival (Brook Run)         | `src/pages/FestivalPage.jsx`  |
| Jan 1 2026  | Start filming ‘WedFest: Battle for the Big Day’ | —                             |

---

## 5. Website Structure & Tech

### 5.1 Build, E-Commerce & Analytics

* **Build & Deploy:** Vercel (`vercel.json` defines builds + routes)
* **E-commerce:** Snipcart (use `<button class="snipcart-add-item" data-item-id="…" …>` snippets in product pages)
* **Analytics/Ads:** Google Analytics, Facebook Pixel (load only in production)

---

## 6. Environment Variables

> *These are managed securely in your Vercel dashboard or a local `.env` file. Never commit secrets to version control.*

```
# .env (example — DO NOT COMMIT REAL KEYS)
REACT_APP_SNIPCART_API_KEY=your-public-api-key
PRINTIFY_STORE_ID=your-store-id
REACT_APP_PAYPAL_CLIENT_ID=your-client-id
NEXT_PUBLIC_GA_ID=your-ga-id
REACT_APP_GA_MEASUREMENT_ID=your-ga-id
REACT_APP_FB_PIXEL_ID=your-pixel-id
```

*If you've accidentally committed secrets, revoke and rotate them immediately.*
