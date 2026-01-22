# ENV + Integrations Inventory Report

This file inventories environment variables referenced in the repository, where they are used, and whether they should remain configured in Vercel.

| Variable | Used? | Where used (file:line) | Client/Server | Keep/Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| BASE_RADIUS_MILES | Yes | api/travel-quote.js | Server | Keep | Used to compute travel fee radius in the travel quote API. |
| BASE_TRAVEL_FEE | Yes | api/travel-quote.js | Server | Keep | Used to compute travel fee base in the travel quote API. |
| GOOGLE_MAPS_API_KEY | Yes | api/travel-quote.js | Server | Keep | Required for Google Maps Distance Matrix requests. |
| MILEAGE_RATE | Yes | api/travel-quote.js | Server | Keep | Used to compute travel fee mileage rate in the travel quote API. |
| ORIGIN_ADDRESS | Yes | api/travel-quote.js | Server | Keep | Required to set the origin for travel quotes. |
| NODE_ENV | Yes | build tooling | Client | Keep | Build/runtime environment flag; provided by build tooling. |
| PUBLIC_URL | Yes | src/pages/Homepage.jsx, src/pages/WeddingsPage.jsx | Client | Keep | CRA public asset base URL. |
| NEXT_PUBLIC_GA_ID | Yes | src/App.js | Client | Keep | Used to initialize GA tracking on the client (if present in your App). |
| REACT_APP_GA_MEASUREMENT_ID | Yes | src/App.js | Client | Keep | Used to initialize GA tracking on the client. |
| REACT_APP_FB_PIXEL_ID | No | README.md only | Client | Delete | Mentioned in README example only; not referenced in code. |
| REACT_APP_SNIPCART_API_KEY | No | README.md only | Client | Delete | Mentioned in README example only; not referenced in code. |
| PRINTIFY_API_TOKEN | Yes | src/setupProxy.js, src/scripts/printify.mjs | Server | Keep | Used for Printify API requests (proxy and script). |
| PRINTIFY_STORE_ID | Yes | src/scripts/printify.mjs | Server | Keep | Used for Printify product creation script. |
| REACT_APP_STRIPE_POA | Yes | src/config/stripeLinks.js | Client | Keep | Stripe payment link for POA service. |
| REACT_APP_STRIPE_I9 | Yes | src/config/stripeLinks.js | Client | Keep | Stripe payment link for I-9 service. |
| REACT_APP_STRIPE_APOSTILLE | Yes | src/config/stripeLinks.js | Client | Keep | Stripe payment link for apostille service. |
| REACT_APP_STRIPE_LOAN_SIGNING_DEPOSIT | Yes | src/config/stripeLinks.js | Client | Keep | Stripe deposit link for loan signing. |
| REACT_APP_STRIPE_TRUST_DEPOSIT | Yes | src/config/stripeLinks.js | Client | Keep | Stripe deposit link for trust services. |
| REACT_APP_STRIPE_OFFICIANT_DEPOSIT | Yes | src/config/stripeLinks.js | Client | Keep | Stripe deposit link for officiant service. |
| REACT_APP_STRIPE_COURIER_DEPOSIT | Yes | src/config/stripeLinks.js | Client | Keep | Stripe deposit link for courier service. |
| REACT_APP_STRIPE_CONNECT_CLIENT_ID | Yes | src/pages/OnboardingPage.jsx, src/pages/PartnerOnboarding.jsx | Client | Keep | Used for Stripe Connect onboarding links. |
| REACT_APP_STRIPE_CONNECT_REDIRECT_URL | Yes | src/pages/OnboardingPage.jsx, src/pages/PartnerOnboarding.jsx | Client | Keep | Optional redirect URL for Stripe Connect onboarding. |
| REACT_APP_PAYPAL_CLIENT_ID | No | (removed / not referenced) | Client | Delete | PayPal integration is being removed; do not keep this env var once PR #33 is merged. |
| STRIPE_SECRET_KEY | No | Not referenced in repo | Server | Delete | Not referenced; remove unless you add server-side Stripe API usage later. |
| STRIPE_WEBHOOK_SECRET | No | Not referenced in repo | Server | Delete | Not referenced; remove unless webhooks are implemented later. |

