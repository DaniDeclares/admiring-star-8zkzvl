import crypto from 'crypto';
import { authenticatePortalRequest } from './_portalAuth.js';

const ENVIRONMENT = process.env.INTEGRATION_ENVIRONMENT || 'PRODUCTION';
const TOKEN_KEY_HEX = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY || '';
const CALLBACK_ORIGIN = 'https://danideclares.com';

function assertTokenKey() {
  if (!/^[0-9a-fA-F]{64}$/.test(TOKEN_KEY_HEX)) throw new Error('INTEGRATION_TOKEN_ENCRYPTION_KEY is missing or invalid.');
}

export function encryptSecret(value) {
  if (!value) return null;
  assertTokenKey();
  const key = Buffer.from(TOKEN_KEY_HEX, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map(part => part.toString('base64url')).join('.');
}

export function decryptSecret(payload) {
  if (!payload) return null;
  assertTokenKey();
  const [ivRaw, tagRaw, ciphertextRaw] = String(payload).split('.');
  if (!ivRaw || !tagRaw || !ciphertextRaw) throw new Error('Encrypted credential payload is malformed.');
  const key = Buffer.from(TOKEN_KEY_HEX, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivRaw, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextRaw, 'base64url')), decipher.final()]).toString('utf8');
}

export function randomToken(bytes = 32) { return crypto.randomBytes(bytes).toString('base64url'); }
export function sha256(value) { return crypto.createHash('sha256').update(String(value)).digest('hex'); }
export function pkceChallenge(verifier) { return crypto.createHash('sha256').update(String(verifier)).digest('base64url'); }
export function absoluteCallback(provider) { return CALLBACK_ORIGIN + '/api/integrations/' + provider + '/callback'; }

export async function requireStaff(req) {
  const context = await authenticatePortalRequest(req);
  if (context.error) {
    const error = new Error(context.error);
    error.status = context.status || 401;
    throw error;
  }
  if (!context.isStaff) {
    const error = new Error('Owner or staff authorization required.');
    error.status = 403;
    throw error;
  }
  return context;
}

export async function createOAuthState({ supabase, adapterCode, authUserId, codeVerifier = null }) {
  const state = randomToken(32);
  const stateHash = sha256(state);
  const verifierCiphertext = codeVerifier ? encryptSecret(codeVerifier) : null;
  const { error } = await supabase.from('dd_integration_oauth_states').insert({
    state_hash: stateHash,
    adapter_code: adapterCode,
    auth_user_id: authUserId,
    code_verifier_ciphertext: verifierCiphertext,
    environment: ENVIRONMENT,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (error) throw error;
  return state;
}

export async function consumeOAuthState({ supabase, state, adapterCode }) {
  if (!state) throw new Error('Missing OAuth state.');
  const { data, error } = await supabase.from('dd_integration_oauth_states').select('*').eq('state_hash', sha256(state)).eq('adapter_code', adapterCode).is('consumed_at', null).gt('expires_at', new Date().toISOString()).maybeSingle();
  if (error) throw error;
  if (!data) {
    const e = new Error('OAuth state is invalid or expired.'); e.status = 400; throw e;
  }
  const { error: consumeError } = await supabase.from('dd_integration_oauth_states').update({ consumed_at: new Date().toISOString() }).eq('id', data.id).is('consumed_at', null);
  if (consumeError) throw consumeError;
  return { ...data, code_verifier: data.code_verifier_ciphertext ? decryptSecret(data.code_verifier_ciphertext) : null };
}

export async function upsertConnection({ supabase, adapterCode, externalAccountId, authUserId, permissions, accessToken, refreshToken, tokenExpiresAt, metadata = {} }) {
  const encryptedAccess = accessToken ? encryptSecret(accessToken) : null;
  const encryptedRefresh = refreshToken ? encryptSecret(refreshToken) : null;
  const payload = {
    adapter_code: adapterCode,
    environment: ENVIRONMENT,
    external_account_id: externalAccountId,
    connection_status: 'CONNECTED',
    authorized_by: authUserId,
    permissions: permissions || [],
    access_token_ciphertext: encryptedAccess,
    refresh_token_ciphertext: encryptedRefresh,
    token_expires_at: tokenExpiresAt || null,
    token_metadata: metadata,
    last_error: null,
    updated_at: new Date().toISOString(),
  };
  const { data: existing, error: findError } = await supabase.from('dd_integration_connections').select('id').eq('adapter_code', adapterCode).eq('environment', ENVIRONMENT).eq('external_account_id', externalAccountId).maybeSingle();
  if (findError) throw findError;
  const query = existing
    ? supabase.from('dd_integration_connections').update(payload).eq('id', existing.id).select('id').single()
    : supabase.from('dd_integration_connections').insert(payload).select('id').single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function logIntegrationEvent({ supabase, adapterCode, connectionId, direction, eventType, externalEventId = null, status, daniEntityType = null, daniRecordId = null, payload = {}, errorMessage = null }) {
  const { error } = await supabase.from('dd_integration_event_log').insert({
    adapter_code: adapterCode,
    connection_id: connectionId || null,
    direction,
    event_type: eventType,
    external_event_id: externalEventId,
    dani_entity_type: daniEntityType,
    dani_record_id: daniRecordId,
    status,
    payload,
    error_message: errorMessage,
    processed_at: status === 'PROCESSED' ? new Date().toISOString() : null,
  });
  if (error) console.error('Integration event log failed:', error.message);
}

export { ENVIRONMENT };