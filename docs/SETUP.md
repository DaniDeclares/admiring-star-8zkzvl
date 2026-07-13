# Setup Checklist

## Required environment variables
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- `REACT_APP_STRIPE_CONNECT_CLIENT_ID`
- `REACT_APP_STRIPE_CONNECT_REDIRECT_URL`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_GA_MEASUREMENT_ID`
- `GOOGLE_MAPS_API_KEY`
- `ORIGIN_ADDRESS`
- `BASE_RADIUS_MILES` (optional; defaults to `10`)
- `MILEAGE_RATE` (optional; defaults to `1.0`)
- `BASE_TRAVEL_FEE` (optional; defaults to `25`)
- `PRINTIFY_API_TOKEN`
- `PRINTIFY_STORE_ID`

## Where to set environment variables
- **Vercel:** Project → Settings → Environment Variables.
- **Codex:** Add variables in your Codex environment configuration for this repo.
- **Local:** Copy `.env.example` to `.env.local` and fill values.

## Public services/pages
- `/` (Homepage)
- `/request-service`
- `/services`
- `/field-services`
- `/events`
- `/govcon`
- `/federal`
- `/contact`
- `/blog` and `/blog/:slug`
- `/shop`
- `/book`
- `/pay`
- `/payment-success`
- `/payment-cancel`
- `/travel-quote`

## Optional features to re-enable later
- **Festival feature flag:** Toggle `SHOW_FESTIVAL` in `src/data/siteConfig.js`.
- **Snipcart:** Re-add the Snipcart stylesheet/script to `public/index.html`, restore Snipcart buttons/attributes in Shop/Membership components, and reintroduce any cart UI you want to support.
