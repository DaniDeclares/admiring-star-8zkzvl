import { authenticatePortalRequest } from '../_portalAuth.js';

const SHOP = 'v0dqbe-j1.myshopify.com';
const SHOPIFY_TIMEOUT_MS = 10000;
const API_VERSION = '2026-07';

function reply(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(data);
}

// Read-only, owner-gated authentication smoke test. Never return tokens,
// client credentials, Shopify response bodies, or secret-bearing URLs.
export default async function shopifyReleaseAuth(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return reply(res, 405, { ok: false, code: 'METHOD_NOT_ALLOWED' });
  }

  let auth;
  try {
    auth = await authenticatePortalRequest(req);
  } catch {
    return reply(res, 503, { ok: false, code: 'PORTAL_AUTH_UNAVAILABLE' });
  }
  if (auth.error) return reply(res, auth.status || 401, { ok: false, code: 'UNAUTHORIZED' });
  if (auth.role !== 'owner' || auth.governedRole !== 'OWNER_OPERATOR') {
    return reply(res, 403, { ok: false, code: 'OWNER_ONLY' });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return reply(res, 503, { ok: false, code: 'SHOPIFY_CONFIG_MISSING' });
  }

  try {
    const tokenResponse = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      signal: AbortSignal.timeout(SHOPIFY_TIMEOUT_MS),
    });
    if (!tokenResponse.ok) {
      return reply(res, 424, {
        ok: false,
        code: 'SHOPIFY_CLIENT_CREDENTIALS_REJECTED',
        httpStatus: tokenResponse.status,
        fallback: 'SHOPIFY_AUTHORIZATION_CODE_FLOW_REQUIRED',
      });
    }
    const tokenPayload = await tokenResponse.json();
    if (!tokenPayload || typeof tokenPayload.access_token !== 'string' || !tokenPayload.access_token) {
      return reply(res, 424, { ok: false, code: 'SHOPIFY_TOKEN_MISSING' });
    }

    const probe = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': tokenPayload.access_token,
      },
      body: JSON.stringify({ query: '{ shop { myshopifyDomain } }' }),
      signal: AbortSignal.timeout(SHOPIFY_TIMEOUT_MS),
    });
    // Shopify may return a non-JSON gateway error; never echo its body.
    const result = await probe.json().catch(() => null);
    const returnedShop = result?.data?.shop?.myshopifyDomain;
    if (!probe.ok || !result || result.errors?.length || returnedShop !== SHOP) {
      return reply(res, 424, {
        ok: false,
        code: 'SHOPIFY_GRAPHQL_PROBE_FAILED',
        httpStatus: probe.status,
        shopMatches: returnedShop === SHOP,
      });
    }
    return reply(res, 200, {
      ok: true,
      code: 'SHOPIFY_AUTHENTICATED',
      shop: SHOP,
      scope: 'read-only-smoke',
      productsWritten: 0,
      filesWritten: 0,
    });
  } catch {
    return reply(res, 502, { ok: false, code: 'SHOPIFY_CONNECTION_FAILED' });
  }
}
