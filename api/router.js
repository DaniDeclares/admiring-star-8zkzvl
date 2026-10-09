// Single Vercel Function entrypoint for every DANI /api route.
//
// Vercel Hobby caps a non-Next.js deployment at 12 functions, and DANI has
// 32 handlers. vercel.json rewrites /api/:path* here; each handler keeps its
// own module in api-handlers/ and is loaded on demand, so one handler's import
// failure cannot take down the others. Netlify adapters import the same
// modules, so both rails run identical handler code.

export const ROUTES = {
  'acquisition/thumbtack-spend-decision': () => import('../api-handlers/acquisition/thumbtack-spend-decision.js'),
  'acquisition/thumbtack-spend-recommendation': () => import('../api-handlers/acquisition/thumbtack-spend-recommendation.js'),
  'appointment-response': () => import('../api-handlers/appointment-response.js'),
  'contract-acquisition': () => import('../api-handlers/contract-acquisition.js'),
  'contracting-period': () => import('../api-handlers/contracting-period.js'),
  'create-checkout-session': () => import('../api-handlers/create-checkout-session.js'),
  'intake-webhook': () => import('../api-handlers/intake-webhook.js'),
  'internal-ch01-sell-proof': () => import('../api-handlers/internal-ch01-sell-proof.js'),
  'integrations/asana/callback': () => import('../api-handlers/integrations/asana/callback.js'),
  'integrations/asana/start': () => import('../api-handlers/integrations/asana/start.js'),
  'integrations/gmail/sync': () => import('../api-handlers/integrations/gmail/sync.js'),
  'integrations/google/callback': () => import('../api-handlers/integrations/google/callback.js'),
  'integrations/google/start': () => import('../api-handlers/integrations/google/start.js'),
  'integrations/hubspot/callback': () => import('../api-handlers/integrations/hubspot/callback.js'),
  'integrations/hubspot/start': () => import('../api-handlers/integrations/hubspot/start.js'),
  'integrations/notion/callback': () => import('../api-handlers/integrations/notion/callback.js'),
  'integrations/notion/start': () => import('../api-handlers/integrations/notion/start.js'),
  'integrations/quickbooks/callback': () => import('../api-handlers/integrations/quickbooks/callback.js'),
  'integrations/quickbooks/start': () => import('../api-handlers/integrations/quickbooks/start.js'),
  'integrations/shopify-release-auth': () => import('../api-handlers/integrations/shopify-release-auth.js'),
  'integrations/shopify/media-release': () => import('../api-handlers/integrations/shopify/media-release.js'),
  'integrations/status': () => import('../api-handlers/integrations/status.js'),
  'integrations/thumbtack/webhook': () => import('../api-handlers/integrations/thumbtack/webhook.js'),
  'partner-inquiry': () => import('../api-handlers/partner-inquiry.js'),
  'portal-fulfillment-dispatch': () => import('../api-handlers/portal-fulfillment-dispatch.js'),
  'portal-operations': () => import('../api-handlers/portal-operations.js'),
  'process-outbox': () => import('../api-handlers/process-outbox.js'),
  'process-provider-routing': () => import('../api-handlers/process-provider-routing.js'),
  'provider-accounting': () => import('../api-handlers/provider-accounting.js'),
  'provider-routing': () => import('../api-handlers/provider-routing.js'),
  'provider-support-recovery': () => import('../api-handlers/provider-support-recovery.js'),
  'research-lead-worker': () => import('../api-handlers/research-lead-worker.js'),
  'service-subscriptions': () => import('../api-handlers/service-subscriptions.js'),
  'stripe-webhook': () => import('../api-handlers/stripe-webhook.js'),
  'stripe/fetch-balance': () => import('../api-handlers/stripe/fetch-balance.js'),
  'verify-commercial-intent': () => import('../api-handlers/verify-commercial-intent.js')
};

// Public paths the portal calls that netlify.toml mapped to differently named
// handlers. Keeping them here makes both rails answer the same URLs.
export const ALIASES = {
  'portal-fulfillment': 'portal-fulfillment-dispatch',
  'portal-dispatch': 'provider-routing'
};

export const ROUTE_PARAM = '__dani_route';

export function resolveRoute(req) {
  const fromQuery = req.query?.[ROUTE_PARAM];
  let route = Array.isArray(fromQuery) ? fromQuery.join('/') : fromQuery;
  if (!route) {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    route = pathname.replace(/^\/api\/?/, '');
  }
  route = String(route || '').replace(/^\/+|\/+$/g, '').replace(/\.js$/, '');
  route = ALIASES[route] || route;
  return Object.prototype.hasOwnProperty.call(ROUTES, route) ? route : null;
}

// Vercel compiles the ESM handlers to CommonJS, so import() can return the
// module namespace with the real default one level deeper.
export function handlerFrom(mod) {
  if (typeof mod?.default === 'function') return mod.default;
  if (typeof mod?.default?.default === 'function') return mod.default.default;
  if (typeof mod === 'function') return mod;
  return null;
}

// Stripe signature checks read the raw request stream, so the router never
// touches req.body; the handler sees the request exactly as Vercel delivered it.
export const config = { api: { bodyParser: false } };

export default async function router(req, res) {
  const route = resolveRoute(req);
  if (req.query && ROUTE_PARAM in req.query) delete req.query[ROUTE_PARAM];
  if (!route) return res.status(404).json({ error: 'Not found' });
  const handler = handlerFrom(await ROUTES[route]());
  if (!handler) return res.status(500).json({ error: 'Route handler unavailable' });
  return handler(req, res);
}
