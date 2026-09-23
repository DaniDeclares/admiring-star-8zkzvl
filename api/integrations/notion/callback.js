import { absoluteCallback, consumeOAuthState, logIntegrationEvent, upsertConnection } from '../../_integrationOAuth.js';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } });
}

export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).send('Method not allowed');
  const supabase=adminClient();
  try{
    const {code,state,error:oauthError}=req.query||{};
    if(oauthError)return res.redirect('/portal/integrations?error=notion_'+encodeURIComponent(oauthError));
    const stateRow=await consumeOAuthState({supabase,state,adapterCode:'NOTION'});
    const clientId=process.env.NOTION_OAUTH_CLIENT_ID;
    const clientSecret=process.env.NOTION_OAUTH_CLIENT_SECRET;
    const redirectUri=process.env.NOTION_OAUTH_REDIRECT_URI||absoluteCallback('notion');
    if(!clientId||!clientSecret||!code)throw new Error('NOTION_OAUTH_CONFIGURATION_OR_CODE_MISSING');
    const basic=Buffer.from(clientId+':'+clientSecret).toString('base64');
    const tokenResponse=await fetch('https://api.notion.com/v1/oauth/token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',Authorization:'Basic '+basic},body:JSON.stringify({grant_type:'authorization_code',code:String(code),redirect_uri:redirectUri})});
    const token=await tokenResponse.json();
    if(!tokenResponse.ok)throw new Error(token.error||'NOTION_TOKEN_EXCHANGE_FAILED');
    if(!token.access_token||!token.workspace_id)throw new Error('NOTION_AUTHORIZATION_RESPONSE_INCOMPLETE');
    const connection=await upsertConnection({supabase,adapterCode:'NOTION',externalAccountId:'workspace:'+token.workspace_id,authUserId:stateRow.auth_user_id,permissions:[],accessToken:token.access_token,refreshToken:token.refresh_token||null,tokenExpiresAt:null,metadata:{workspace_id:token.workspace_id,workspace_name:token.workspace_name||null,bot_id:token.bot_id||null,owner:token.owner||null}});
    await logIntegrationEvent({supabase,adapterCode:'NOTION',connectionId:connection.id,direction:'INBOUND',eventType:'OAUTH_CONNECTED',status:'PROCESSED',payload:{workspace_id:token.workspace_id}});
    return res.redirect('/portal/integrations?connected=notion');
  }catch(error){
    console.error('Notion OAuth callback failed:',error);
    return res.redirect('/portal/integrations?error=notion_'+encodeURIComponent(error.message||'oauth_failed'));
  }
}