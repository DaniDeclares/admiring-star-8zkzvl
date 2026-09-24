import { consumeOAuthState, logIntegrationEvent, upsertConnection } from '../../_integrationOAuth.js';
import { createClient } from '@supabase/supabase-js';

function adminClient(){
 const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error('Server Supabase configuration is missing.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).send('Method not allowed');
 const supabase=adminClient();
 try{
  const {code,state,realmId,error:oauthError}=req.query||{};
  if(oauthError)return res.redirect('/portal/integrations?error=quickbooks_'+encodeURIComponent(oauthError));
  if(!realmId)throw new Error('QUICKBOOKS_REALM_ID_MISSING');
  const stateRow=await consumeOAuthState({supabase,state,adapterCode:'QUICKBOOKS_ONLINE'});
  const clientId=process.env.QUICKBOOKS_CLIENT_ID; const clientSecret=process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri=process.env.QUICKBOOKS_REDIRECT_URI||'https://danideclares.com/api/integrations/quickbooks/callback';
  if(!clientId||!clientSecret||!code)throw new Error('QUICKBOOKS_OAUTH_CONFIGURATION_OR_CODE_MISSING');
  const basic=Buffer.from(clientId+':'+clientSecret).toString('base64');
  const tokenResponse=await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded',Authorization:'Basic '+basic},body:new URLSearchParams({grant_type:'authorization_code',code:String(code),redirect_uri:redirectUri})});
  const token=await tokenResponse.json();
  if(!tokenResponse.ok)throw new Error(token.error||'QUICKBOOKS_TOKEN_EXCHANGE_FAILED');
  const environment=String(process.env.QUICKBOOKS_ENVIRONMENT||'sandbox').toLowerCase();
  const apiHost=environment==='production'?'https://quickbooks.api.intuit.com':'https://sandbox-quickbooks.api.intuit.com';
  const companyResponse=await fetch(apiHost+'/v3/company/'+encodeURIComponent(realmId)+'/companyinfo/'+encodeURIComponent(realmId),{headers:{Accept:'application/json',Authorization:'Bearer '+token.access_token}});
  const company=await companyResponse.json();
  if(!companyResponse.ok)throw new Error('QUICKBOOKS_COMPANY_READ_FAILED');
  const companyInfo=company.CompanyInfo||{};
  const connection=await upsertConnection({supabase,adapterCode:'QUICKBOOKS_ONLINE',externalAccountId:'realm:'+realmId,authUserId:stateRow.auth_user_id,permissions:['com.intuit.quickbooks.accounting'],accessToken:token.access_token,refreshToken:token.refresh_token||null,tokenExpiresAt:token.expires_in?new Date(Date.now()+Number(token.expires_in)*1000).toISOString():null,metadata:{realm_id:String(realmId),company_name:companyInfo.CompanyName||null,environment}});
  await logIntegrationEvent({supabase,adapterCode:'QUICKBOOKS_ONLINE',connectionId:connection.id,direction:'INBOUND',eventType:'OAUTH_CONNECTED',status:'PROCESSED',payload:{realmId:String(realmId),environment,companyName:companyInfo.CompanyName||null}});
  return res.redirect('/portal/integrations?connected=quickbooks');
 }catch(error){
  console.error('QuickBooks OAuth callback failed:',error);
  return res.redirect('/portal/integrations?error=quickbooks_'+encodeURIComponent(error.message||'oauth_failed'));
 }
}