import { absoluteCallback, createOAuthState, pkceChallenge, randomToken, requireStaff } from '../../_integrationOAuth.js';

const GOOGLE_SCOPES = [
  'openid','email','profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.file',
];

export default async function handler(req,res){
 if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
 try{
  const context=await requireStaff(req);
  const clientId=process.env.GOOGLE_CLIENT_ID;
  const clientSecret=process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri=process.env.GOOGLE_REDIRECT_URI || absoluteCallback('google');
  if(!clientId||!clientSecret) return res.status(503).json({success:false,error:'GOOGLE_CREDENTIALS_NOT_CONFIGURED'});
  const verifier=randomToken(48);
  const state=await createOAuthState({supabase:context.supabase,adapterCode:'GOOGLE_DRIVE',authUserId:context.user.id,codeVerifier:verifier});
  const params=new URLSearchParams({
   client_id:clientId,redirect_uri:redirectUri,response_type:'code',state,
   code_challenge_method:'S256',code_challenge:pkceChallenge(verifier),
   scope:GOOGLE_SCOPES.join(' '),access_type:'offline',prompt:'consent',include_granted_scopes:'true'
  });
  return res.status(200).json({success:true,authorization_url:'https://accounts.google.com/o/oauth2/v2/auth?'+params.toString()});
 }catch(error){return res.status(error.status||500).json({success:false,error:error.message||'GOOGLE_OAUTH_START_FAILED'});}
}