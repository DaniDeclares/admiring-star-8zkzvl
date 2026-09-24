import { absoluteCallback, createOAuthState, requireStaff } from '../../_integrationOAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const context = await requireStaff(req);
    const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
    const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI || absoluteCallback('notion');
    if (!clientId || !process.env.NOTION_OAUTH_CLIENT_SECRET) return res.status(503).json({ success:false, error:'NOTION_PUBLIC_OAUTH_NOT_CONFIGURED' });
    const state = await createOAuthState({ supabase: context.supabase, adapterCode:'NOTION', authUserId:context.user.id });
    const params = new URLSearchParams({ owner:'user', client_id:clientId, redirect_uri:redirectUri, response_type:'code', state });
    return res.status(200).json({ success:true, authorization_url:'https://api.notion.com/v1/oauth/authorize?' + params.toString() });
  } catch (error) {
    console.error('Notion OAuth start failed:', error);
    return res.status(error.status || 500).json({success:false,error:error.message||'NOTION_OAUTH_START_FAILED'});
  }
}