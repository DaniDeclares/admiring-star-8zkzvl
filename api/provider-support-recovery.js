import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
function adminClient(){const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Server Supabase configuration is missing.');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
const digest=value=>crypto.createHash('sha256').update(String(value||'')).digest('hex');
async function sendRecoveryEmail(to, link) {
 const apiKey=process.env.RESEND_API_KEY, from=process.env.RESEND_FROM_EMAIL||process.env.NOTIFICATION_FROM_EMAIL;
 if(!apiKey||!from) throw new Error('Recovery email service is unavailable.');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject:'DANI DECLARES | Secure Provider Account Recovery',html:`<p>We received a request to recover your DANI DECLARES provider portal account.</p><p><a href="${link}">Choose a new password</a></p><p>This DANI link is valid for 30 minutes and is used only after you submit your new password. If you did not request this, ignore this email.</p>`})});
 if(!response.ok) throw new Error(`RECOVERY_EMAIL_${response.status}`);
}
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
 const action=String(req.body?.action||'complete');
 const admin=adminClient();
 if(action==='request'){
  const email=String(req.body?.email||'').trim().toLowerCase();
  const generic={success:true,message:'If an active provider account exists, a secure recovery email has been sent.'};
  if(!email||!email.includes('@')) return res.status(200).json(generic);
  try{
   const {data:users,error:userError}=await admin.auth.admin.listUsers({page:1,perPage:1000}); if(userError)throw userError;
   const user=users?.users?.find(item=>String(item.email||'').toLowerCase()===email); if(!user)return res.status(200).json(generic);
   const {data:identity,error:identityError}=await admin.from('dd_portal_identities').select('id,is_active').eq('auth_user_id',user.id).eq('is_active',true).maybeSingle();
   if(identityError)throw identityError;if(!identity)return res.status(200).json(generic);
   const cutoff=new Date(Date.now()-10*60*1000).toISOString();
   const {data:recent}=await admin.from('dd_portal_recovery_tokens').select('id').eq('auth_user_id',user.id).is('used_at',null).gt('created_at',cutoff).maybeSingle();
   if(recent)return res.status(200).json(generic);
   const raw=crypto.randomBytes(32).toString('base64url');
   const {error:insertError}=await admin.from('dd_portal_recovery_tokens').insert({auth_user_id:user.id,token_hash:digest(raw),expires_at:new Date(Date.now()+30*60*1000).toISOString()}); if(insertError)throw insertError;
   const site=(process.env.SITE_URL||'https://danideclares.com').replace(/\/$/,'');
   await sendRecoveryEmail(email,`${site}/portal/support-recovery?token=${encodeURIComponent(raw)}`);
   return res.status(200).json(generic);
  }catch(error){console.error('provider-support-recovery-request',error?.message||error);return res.status(200).json(generic);}
 }
 const token=String(req.body?.token||'').trim(),password=String(req.body?.password||'');
 if(token.length<32||password.length<8)return res.status(400).json({error:'This recovery request is invalid.'});
 try{
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