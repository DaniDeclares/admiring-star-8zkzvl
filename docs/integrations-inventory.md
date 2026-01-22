# ENV + Integrations Inventory Report

| Variable | Used? | Where used (file:line) | Client/Server | Keep/Delete | Notes |
| --- | --- | --- | --- | --- | --- |
| BASE_RADIUS_MILES | Yes | api/travel-quote.js:51 | Server | Keep | Used to compute travel fee radius in the travel quote API. |
| BASE_TRAVEL_FEE | Yes | api/travel-quote.js:53 | Server | Keep | Used to compute travel fee base in the travel quote API. |
| GOOGLE_MAPS_API_KEY | Yes | api/travel-quote.js:49 | Server | Keep | Required for Google Maps Distance Matrix requests. |
| MILEAGE_RATE | Yes | api/travel-quote.js:52 | Server | Keep | Used to compute travel fee mileage rate in the travel quote API. |
| NODE_ENV | Yes | src/App.js:47 | Client | Keep | Build/runtime environment flag; provided by build tooling. |
| ORIGIN_ADDRESS | Yes | api/travel-quote.js:50 | Server | Keep | Required to set the origin for travel quotes. |
| PRINTIFY_API_TOKEN | Yes | src/setupProxy.js:13<br>src/scripts/printify.mjs:6 | Server | Keep | Used for Printify API requests (proxy and script). |
| PRINTIFY_STORE_ID | Yes | src/scripts/printify.mjs:5 | Server | Keep | Used for Printify product creation script. |
| PUBLIC_URL | Yes | src/pages/Homepage.jsx:7<br>src/pages/WeddingsPage.jsx:64 | Client | Keep | CRA public asset base URL. |
| REACT_APP_FB_PIXEL_ID | No | README.md:74 | Client | Delete | Mentioned in README example only; not referenced in code. |
| REACT_APP_GA_MEASUREMENT_ID | Yes | src/App.js:45 | Client | Keep | Used to initialize GA tracking on the client. |
| REACT_APP_PAYPAL_CLIENT_ID | Yes | src/components/PayPalButton.jsx:11 | Client | Keep | Used to load the PayPal SDK script on the client. |
| REACT_APP_SNIPCART_API_KEY | No | README.md:69 | Client | Delete | Mentioned in README example only; not referenced in code. |
| REACT_APP_STRIPE_APOSTILLE | Yes | src/config/stripeLinks.js:5 | Client | Keep | Stripe payment link for apostille service. |
| REACT_APP_STRIPE_CONNECT_CLIENT_ID | Yes | src/pages/OnboardingPage copy.jsx:7<br>src/pages/OnboardingPage.jsx:7<br>src/pages/PartnerOnboarding.jsx:7 | Client | Keep | Used for Stripe Connect onboarding links. |
| REACT_APP_STRIPE_CONNECT_REDIRECT_URL | Yes | src/pages/OnboardingPage copy.jsx:9<br>src/pages/OnboardingPage.jsx:9<br>src/pages/PartnerOnboarding.jsx:9 | Client | Keep | Optional redirect URL for Stripe Connect onboarding. |
| REACT_APP_STRIPE_COURIER_DEPOSIT | Yes | src/config/stripeLinks.js:13 | Client | Keep | Stripe deposit link for courier service. |
| REACT_APP_STRIPE_I9 | Yes | src/config/stripeLinks.js:4 | Client | Keep | Stripe payment link for I-9 service. |
| REACT_APP_STRIPE_LOAN_SIGNING_DEPOSIT | Yes | src/config/stripeLinks.js:8 | Client | Keep | Stripe deposit link for loan signing. |
| REACT_APP_STRIPE_OFFICIANT_DEPOSIT | Yes | src/config/stripeLinks.js:10 | Client | Keep | Stripe deposit link for officiant service. |
| REACT_APP_STRIPE_POA | Yes | src/config/stripeLinks.js:3 | Client | Keep | Stripe payment link for power of attorney service. |
| REACT_APP_STRIPE_TRUST_DEPOSIT | Yes | src/config/stripeLinks.js:9 | Client | Keep | Stripe deposit link for trust services. |
| STRIPE_SECRET_KEY | No | Not referenced in repo | Server | Delete | No code reference found. |
| STRIPE_WEBHOOK_SECRET | No | Not referenced in repo | Server | Delete | No code reference found. |
