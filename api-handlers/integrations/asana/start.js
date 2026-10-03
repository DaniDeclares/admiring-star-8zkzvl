import { absoluteCallback, createOAuthState, pkceChallenge, randomToken, requireStaff } from '../../_integrationOAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const context = await requireStaff(req);
    const clientId = process.env.ASANA_CLIENT_ID;
    const clientSecret = process.env.ASANA_CLIENT_SECRET;
    const redirectUri = process.env.ASANA_REDIRECT_URI || absoluteCallback('asana');
    if (!clientId || !clientSecret) return res.status(503).json({ success: false, error: 'ASANA_CREDENTIALS_NOT_CONFIGURED' });
    const verifier = randomToken(48);
    const state = await createOAuthState({ supabase: context.supabase, adapterCode: 'ASANA', authUserId: context.user.id, codeVerifier: verifier });
    const params = new URLSearchParams({
      client_id: clientId, redirect_uri: redirectUri, response_type: 'code', state,
      code_challenge_method: 'S256', code_challenge: pkceChallenge(verifier),
      scope: 'projects:read tasks:read tasks:write users:read',
    });
    return res.status(200).json({ success: true, authorization_url: 'https://app.asana.com/-/oauth_authorize?' + params.toString() });
  } catch (error) {
    console.error('Asana OAuth start failed:', error);
    return res.status(error.status || 500).json({ success: false, error: error.message || 'ASANA_OAUTH_START_FAILED' });
  }
}