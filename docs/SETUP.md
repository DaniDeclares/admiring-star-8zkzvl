# Setup Checklist

## Required environment variables
- `REACT_APP_PAYPAL_CLIENT_ID`
- `REACT_APP_STRIPE_CONNECT_CLIENT_ID`
- `REACT_APP_STRIPE_CONNECT_REDIRECT_URL`
- `PRINTIFY_API_TOKEN`
- `PRINTIFY_STORE_ID`

## Where to set environment variables
- **Vercel:** Project → Settings → Environment Variables.
- **Codex:** Add variables in your Codex environment configuration for this repo.

## Public services/pages
- `/` (Homepage)
- `/shop`
- `/coaching`
- `/financial`
- `/weddings`
- `/events`
- `/notary`
- `/membership`
- `/contact`
- `/blog` and `/blog/:slug`
- `/packages`
- `/real-estate`
- `/legal-services`
- `/payment-success`
- `/payment-cancel`

## Optional features to re-enable later
- **Festival feature flag:** Toggle `SHOW_FESTIVAL` in `src/data/siteConfig.js`.
- **Snipcart:** Re-add the Snipcart stylesheet/script to `public/index.html`, restore Snipcart buttons/attributes in Shop/Membership components, and reintroduce any cart UI you want to support.
