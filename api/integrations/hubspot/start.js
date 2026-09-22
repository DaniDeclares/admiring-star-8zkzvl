import { absoluteCallback, createOAuthState, requireStaff } from '../../_integrationOAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const context = await requireStaff(req);
    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    const redirectUri = process.env.HUBSPOT_REDIRECT_URI || absoluteCallback('hubspot');
    if (!clientId || !clientSecret) return res.status(503).json({ success:false, error:'HUBSPOT_CREDENTIALS_NOT_CONFIGURED' });
    const state = await createOAuthState({ supabase:context.supabase, adapterCode:'HUBSPOT', authUserId:context.user.id });
    const scopes = [
      'oauth',
      'crm.objects.contacts.read','crm.objects.contacts.write',
      'crm.objects.companies.read','crm.objects.companies.write',
      'crm.objects.deals.read','crm.objects.deals.write'
    ];
    const params = new URLSearchParams({ client_id:clientId, redirect_uri:redirectUri, scope:scopes.join(' '), state });
    return res.status(200).json({ success:true, authorization_url:'https://app.hubspot.com/oauth/authorize?'+params.toString() });
  } catch (error) {
    console.error('HubSpot OAuth start failed:', error);
    return res.status(error.status || 500).json({ success:false, error:error.message || 'HUBSPOT_OAUTH_START_FAILED' });
  }
}