import { createOAuthState, requireStaff } from '../../_integrationOAuth.js';

export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{
  const context=await requireStaff(req);
  const clientId=process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret=process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri=process.env.QUICKBOOKS_REDIRECT_URI||'https://danideclares.com/api/integrations/quickbooks/callback';
  if(!clientId||!clientSecret)return res.status(503).json({success:false,error:'QUICKBOOKS_CREDENTIALS_NOT_CONFIGURED'});
  const state=await createOAuthState({supabase:context.supabase,adapterCode:'QUICKBOOKS_ONLINE',authUserId:context.user.id});
  const params=new URLSearchParams({client_id:clientId,redirect_uri:redirectUri,response_type:'code',scope:'com.intuit.quickbooks.accounting',state});
  return res.status(200).json({success:true,authorization_url:'https://appcenter.intuit.com/connect/oauth2?'+params.toString()});
 }catch(error){
  console.error('QuickBooks OAuth start failed:',error);
  return res.status(error.status||500).json({success:false,error:error.message||'QUICKBOOKS_OAUTH_START_FAILED'});
 }
}