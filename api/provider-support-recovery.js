import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
function adminClient(){const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Server Supabase configuration is missing.');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
const digest=value=>crypto.createHash('sha256').update(String(value||'')).digest('hex');
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
 const token=String(req.body?.token||'').trim(),password=String(req.body?.password||'');
 if(token.length<32||password.length<8)return res.status(400).json({error:'This recovery request is invalid.'});
 try{
  const admin=adminClient();
  const {data:recovery,error:lookupError}=await admin.from('dd_portal_recovery_tokens').select('id,auth_user_id,expires_at,used_at').eq('token_hash',digest(token)).is('used_at',null).gt('expires_at',new Date().toISOString()).maybeSingle();
  if(lookupError)throw lookupError;if(!recovery)return res.status(410).json({error:'This recovery link has expired or was already used.'});
  const {data:identity,error:identityError}=await admin.from('dd_portal_identities').select('id,is_active').eq('auth_user_id',recovery.auth_user_id).eq('is_active',true).maybeSingle();
  if(identityError)throw identityError;if(!identity)return res.status(403).json({error:'This portal account is not active.'});
  const {error:updateError}=await admin.auth.admin.updateUserById(recovery.auth_user_id,{password,user_metadata:{password_changed_at:new Date().toISOString()}});
  if(updateError)throw updateError;
  const {error:consumeError}=await admin.from('dd_portal_recovery_tokens').update({used_at:new Date().toISOString()}).eq('id',recovery.id).is('used_at',null);
  if(consumeError)throw consumeError;
  return res.status(200).json({success:true});
 }catch(error){console.error('provider-support-recovery',error?.message||error);return res.status(500).json({error:'Password recovery could not be completed. Please contact DANI DECLARES support.'});}
}