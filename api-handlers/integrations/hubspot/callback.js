import { absoluteCallback, consumeOAuthState, logIntegrationEvent, upsertConnection } from '../../_integrationOAuth.js';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth:{ persistSession:false, autoRefreshToken:false } });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');
  const supabase = adminClient();
  try {
    const { code, state, error:oauthError } = req.query || {};
    if (oauthError) return res.redirect('/portal/integrations?error=hubspot_'+encodeURIComponent(oauthError));
    const stateRow = await consumeOAuthState({ supabase, state, adapterCode:'HUBSPOT' });
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    const redirectUri = process.env.HUBSPOT_REDIRECT_URI || absoluteCallback('hubspot');
    if (!clientId || !clientSecret || !code) throw new Error('HUBSPOT_OAUTH_CONFIGURATION_OR_CODE_MISSING');
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({ grant_type:'authorization_code', client_id:clientId, client_secret:clientSecret, redirect_uri:redirectUri, code:String(code) }),
    });
    const token = await tokenResponse.json();
    if (!tokenResponse.ok) throw new Error(token.message || token.error || 'HUBSPOT_TOKEN_EXCHANGE_FAILED');
    const infoResponse = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/'+encodeURIComponent(token.access_token));
    const info = await infoResponse.json();
    if (!infoResponse.ok) throw new Error(info.message || 'HUBSPOT_IDENTITY_READ_FAILED');
    const hubId = info.hub_id || info.hubId;
    if (!hubId) throw new Error('HUBSPOT_PORTAL_ID_MISSING');
    const permissions = Array.isArray(info.scopes) ? info.scopes : [];
    const connection = await upsertConnection({
      supabase, adapterCode:'HUBSPOT', externalAccountId:'hub:'+hubId, authUserId:stateRow.auth_user_id,
      permissions, accessToken:token.access_token, refreshToken:token.refresh_token || null,
      tokenExpiresAt:token.expires_in ? new Date(Date.now()+Number(token.expires_in)*1000).toISOString() : null,
      metadata:{ hub_id:String(hubId), user_id:info.user_id ? String(info.user_id) : null, user:info.user || null },
    });
    await logIntegrationEvent({supabase,adapterCode:'HUBSPOT',connectionId:connection.id,direction:'INBOUND',eventType:'OAUTH_CONNECTED',status:'PROCESSED',payload:{externalAccountId:'hub:'+hubId}});
    return res.redirect('/portal/integrations?connected=hubspot');
  } catch (error) {
    console.error('HubSpot OAuth callback failed:', error);
    return res.redirect('/portal/integrations?error=hubspot_'+encodeURIComponent(error.message || 'oauth_failed'));
  }
}