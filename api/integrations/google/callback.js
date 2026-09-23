import { absoluteCallback, consumeOAuthState, logIntegrationEvent, upsertConnection } from '../../_integrationOAuth.js';
import { createClient } from '@supabase/supabase-js';

function adminClient(){
 const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key) throw new Error('Server Supabase configuration is missing.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
const ADAPTER_SCOPES={
 GMAIL:['https://www.googleapis.com/auth/gmail.modify'],
 GOOGLE_CALENDAR:['https://www.googleapis.com/auth/calendar'],
 GOOGLE_DRIVE:['https://www.googleapis.com/auth/drive.file'],
};
export default async function handler(req,res){
 if(req.method!=='GET') return res.status(405).send('Method not allowed');
 const supabase=adminClient();
 try{
  const {code,state,error:oauthError}=req.query||{};
  if(oauthError) return res.redirect('/portal/integrations?error=google_'+encodeURIComponent(oauthError));
  const stateRow=await consumeOAuthState({supabase,state,adapterCode:'GOOGLE_DRIVE'});
  const clientId=process.env.GOOGLE_CLIENT_ID, clientSecret=process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri=process.env.GOOGLE_REDIRECT_URI||absoluteCallback('google');
  if(!clientId||!clientSecret||!code) throw new Error('GOOGLE_OAUTH_CONFIGURATION_OR_CODE_MISSING');
  const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'authorization_code',client_id:clientId,client_secret:clientSecret,redirect_uri:redirectUri,code:String(code),code_verifier:String(stateRow.code_verifier||'')})});
  const token=await tokenResponse.json(); if(!tokenResponse.ok) throw new Error(token.error_description||token.error||'GOOGLE_TOKEN_EXCHANGE_FAILED');
  const meResponse=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:'Bearer '+token.access_token}});
  const me=await meResponse.json(); if(!meResponse.ok||!me.sub) throw new Error('GOOGLE_IDENTITY_READ_FAILED');
  const granted=String(token.scope||'').split(' ').filter(Boolean);
  const expires=token.expires_in?new Date(Date.now()+Number(token.expires_in)*1000).toISOString():null;
  for(const [adapterCode,required] of Object.entries(ADAPTER_SCOPES)){
   if(!required.every(s=>granted.includes(s))) continue;
   const connection=await upsertConnection({supabase,adapterCode,externalAccountId:'google:'+me.sub,authUserId:stateRow.auth_user_id,permissions:granted,accessToken:token.access_token,refreshToken:token.refresh_token||null,tokenExpiresAt:expires,metadata:{email:me.email||null,name:me.name||null,google_subject:me.sub}});
   await logIntegrationEvent({supabase,adapterCode,connectionId:connection.id,direction:'INBOUND',eventType:'OAUTH_CONNECTED',status:'PROCESSED',payload:{google_subject:me.sub}});
  }
  return res.redirect('/portal/integrations?connected=google');
 }catch(error){console.error('Google OAuth callback failed:',error);return res.redirect('/portal/integrations?error=google_'+encodeURIComponent(error.message||'oauth_failed'));}
}