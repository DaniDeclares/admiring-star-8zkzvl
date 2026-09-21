import { absoluteCallback, consumeOAuthState, logIntegrationEvent, upsertConnection } from '../../_integrationOAuth.js';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');
  const supabase = adminClient();
  try {
    const { code, state, error: oauthError } = req.query || {};
    if (oauthError) return res.redirect('/portal/integrations?error=asana_' + encodeURIComponent(oauthError));
    const stateRow = await consumeOAuthState({ supabase, state, adapterCode: 'ASANA' });
    const clientId = process.env.ASANA_CLIENT_ID;
    const clientSecret = process.env.ASANA_CLIENT_SECRET;
    const redirectUri = process.env.ASANA_REDIRECT_URI || absoluteCallback('asana');
    if (!clientId || !clientSecret || !code) throw new Error('ASANA_OAUTH_CONFIGURATION_OR_CODE_MISSING');
    const tokenResponse = await fetch('https://app.asana.com/-/oauth_token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type:'authorization_code', client_id:clientId, client_secret:clientSecret, redirect_uri:redirectUri, code:String(code), code_verifier:String(stateRow.code_verifier || '') }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(token.error_description || token.error || 'ASANA_TOKEN_EXCHANGE_FAILED');
    const meResponse = await fetch('https://app.asana.com/api/1.0/users/me', { headers: { Authorization: 'Bearer ' + token.access_token } });
    const me = await meResponse.json();
    if (!meResponse.ok) throw new Error('ASANA_IDENTITY_READ_FAILED');
    const user = me.data || {};
    const workspace = Array.isArray(user.workspaces) ? user.workspaces[0] : null;
    const externalAccountId = workspace?.gid ? 'workspace:' + workspace.gid : 'user:' + user.gid;
    const connection = await upsertConnection({
      supabase, adapterCode:'ASANA', externalAccountId, authUserId:stateRow.auth_user_id,
      permissions:String(token.scope || '').split(' ').filter(Boolean), accessToken:token.access_token, refreshToken:token.refresh_token || null,
      tokenExpiresAt: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString() : null,
      metadata:{ user_gid:user.gid, user_name:user.name || null, workspace_gid:workspace?.gid || null, workspace_name:workspace?.name || null },
    });
    await logIntegrationEvent({supabase,adapterCode:'ASANA',connectionId:connection.id,direction:'INBOUND',eventType:'OAUTH_CONNECTED',status:'PROCESSED',payload:{externalAccountId}});
    return res.redirect('/portal/integrations?connected=asana');
  } catch (error) {
    console.error('Asana OAuth callback failed:', error);
    return res.redirect('/portal/integrations?error=asana_' + encodeURIComponent(error.message || 'oauth_failed'));
  }
}