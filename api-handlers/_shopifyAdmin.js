// Shopify Admin API access for DANI's SHOPIFY integration adapter.
//
// Credentials live only in Vercel environment variables (SHOPIFY_CLIENT_ID,
// SHOPIFY_CLIENT_SECRET) or, for the authorization-code fallback, encrypted in
// dd_integration_connections. Tokens are never logged or returned to callers.

import { createClient } from '@supabase/supabase-js';
import { decryptSecret, ENVIRONMENT, logIntegrationEvent } from './_integrationOAuth.js';

export const SHOPIFY_ADAPTER = 'SHOPIFY';
export const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-07';
export const SHOPIFY_SHOP = String(process.env.SHOPIFY_SHOP || 'v0dqbe-j1').replace(/\.myshopify\.com$/, '');
// The DANI Product Release app is limited to these scopes. Anything broader is
// treated as a configuration error, not a convenience.
export const ALLOWED_SCOPES = ['write_products', 'write_files', 'read_products', 'read_files'];

let cachedToken = null; // { token, expiresAt, grant }

export function adminSupabase() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function externalAccountId(shop = SHOPIFY_SHOP) {
  return `shop:${shop}`;
}

async function clientCredentialsToken(shop) {
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret });
  const response = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.access_token) {
    const error = new Error(`SHOPIFY_CLIENT_CREDENTIALS_REJECTED:${response.status}:${json.error || json.errors || 'unknown'}`);
    error.code = 'CLIENT_CREDENTIALS_REJECTED';
    throw error;
  }
  return { token: json.access_token, expiresAt: Date.now() + (Number(json.expires_in) || 86399) * 1000, grant: 'CLIENT_CREDENTIALS', scope: json.scope || '' };
}

async function storedConnectionToken(supabase, shop) {
  const { data, error } = await supabase.from('dd_integration_connections')
    .select('id,access_token_ciphertext,connection_status')
    .eq('adapter_code', SHOPIFY_ADAPTER).eq('environment', ENVIRONMENT).eq('external_account_id', externalAccountId(shop))
    .maybeSingle();
  if (error) throw error;
  if (!data?.access_token_ciphertext || data.connection_status !== 'CONNECTED') return null;
  return { token: decryptSecret(data.access_token_ciphertext), expiresAt: Infinity, grant: 'AUTHORIZATION_CODE', scope: '' };
}

export async function getShopifyAccess({ supabase, shop = SHOPIFY_SHOP } = {}) {
  if (cachedToken && cachedToken.shop === shop && cachedToken.expiresAt - 60_000 > Date.now()) return cachedToken;
  let ccError = null;
  try {
    const cc = await clientCredentialsToken(shop);
    if (cc) { cachedToken = { ...cc, shop }; return cachedToken; }
  } catch (error) {
    ccError = error;
  }
  const stored = supabase ? await storedConnectionToken(supabase, shop) : null;
  if (stored) { cachedToken = { ...stored, shop }; return cachedToken; }
  const error = new Error(ccError ? ccError.message : 'SHOPIFY_NOT_CONFIGURED');
  error.code = ccError ? ccError.code : 'NOT_CONFIGURED';
  error.status = 503;
  throw error;
}

export async function shopifyGraphQL({ supabase, query, variables = {}, shop = SHOPIFY_SHOP }) {
  const access = await getShopifyAccess({ supabase, shop });
  const response = await fetch(`https://${shop}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Shopify-Access-Token': access.token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.errors) {
    const error = new Error(`SHOPIFY_GRAPHQL_FAILED:${response.status}:${JSON.stringify(json.errors || json).slice(0, 400)}`);
    error.status = response.status === 401 || response.status === 403 ? 502 : 500;
    throw error;
  }
  return { data: json.data, grant: access.grant };
}

export function userErrorsOf(payload) {
  const errors = payload?.userErrors || payload?.mediaUserErrors || [];
  return errors.length ? errors.map(e => `${(e.field || []).join('.')}: ${e.message}`).join('; ') : null;
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function isCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers?.authorization === `Bearer ${secret}` || req.headers?.['x-cron-secret'] === secret;
}

const CONNECTION_QUERY = `query DaniShopifyConnection {
  shop { myshopifyDomain }
  currentAppInstallation { accessScopes { handle } app { title } }
}`;

// Proves the grant, fails closed on scopes broader than the release rail needs,
// and records the connection in DANI's existing registry. Called before any
// Shopify write. The owner-only smoke at /api/integrations/shopify-release-auth
// remains the read-only credential check; this is the per-run gate.
export async function ensureShopifyConnection({ supabase, authorizedBy = null }) {
  const { data, grant } = await shopifyGraphQL({ supabase, query: CONNECTION_QUERY });
  const scopes = (data?.currentAppInstallation?.accessScopes || []).map(scope => scope.handle).sort();
  const excess = scopes.filter(scope => !ALLOWED_SCOPES.includes(scope));
  const shopDomain = data?.shop?.myshopifyDomain || null;
  const shopMismatch = shopDomain !== `${SHOPIFY_SHOP}.myshopify.com`;
  const lastError = excess.length ? `EXCESS_SCOPES:${excess.join(',')}` : (shopMismatch ? 'SHOP_MISMATCH' : null);
  const now = new Date().toISOString();
  const row = {
    adapter_code: SHOPIFY_ADAPTER,
    environment: ENVIRONMENT,
    external_account_id: externalAccountId(),
    connection_status: lastError ? 'ERROR' : 'CONNECTED',
    permissions: scopes,
    secret_reference: grant === 'CLIENT_CREDENTIALS' ? 'vercel-env:SHOPIFY_CLIENT_ID,SHOPIFY_CLIENT_SECRET' : 'dd_integration_connections:access_token_ciphertext',
    last_sync_at: now,
    last_error: lastError,
    metadata: { grant, shop: shopDomain, app: data?.currentAppInstallation?.app?.title || null },
    updated_at: now,
  };
  if (authorizedBy) row.authorized_by = authorizedBy;
  const { data: existing, error: findError } = await supabase.from('dd_integration_connections').select('id')
    .eq('adapter_code', SHOPIFY_ADAPTER).eq('environment', ENVIRONMENT).eq('external_account_id', row.external_account_id).maybeSingle();
  if (findError) throw findError;
  const write = existing
    ? supabase.from('dd_integration_connections').update(row).eq('id', existing.id).select('id').single()
    : supabase.from('dd_integration_connections').insert(row).select('id').single();
  const { data: connection, error: writeError } = await write;
  if (writeError) throw writeError;
  await logIntegrationEvent({ supabase, adapterCode: SHOPIFY_ADAPTER, connectionId: connection.id, direction: 'OUTBOUND', eventType: 'CONNECTION_VERIFIED', status: lastError ? 'FAILED' : 'PROCESSED', payload: { grant, scopes }, errorMessage: lastError });
  if (lastError) {
    const error = new Error(lastError);
    error.status = 409;
    error.code = excess.length ? 'SHOPIFY_EXCESS_SCOPES' : 'SHOPIFY_SHOP_MISMATCH';
    throw error;
  }
  return { connectionId: connection.id, grant, scopes };
}
