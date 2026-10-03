import { createClient } from '@supabase/supabase-js';
function admin(){const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null}
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/,'');const a=admin();if(!a||!token)return res.status(401).json({error:'Owner authorization required'});
 const {data:{user}}=await a.auth.getUser(token);if(!user)return res.status(401).json({error:'Owner authorization required'});
 const {data:id}=await a.from('dd_portal_identities').select('portal_role,is_active').eq('auth_user_id',user.id).eq('is_active',true).maybeSingle();
 if(String(id?.portal_role||'').toLowerCase()!=='owner')return res.status(403).json({error:'Owner authorization required'});
 const {recommendationId,decision}=req.body||{}; const d=String(decision||'').toUpperCase();
 if(!recommendationId||!['APPROVED','REJECTED'].includes(d))return res.status(400).json({error:'Recommendation and decision are required.'});
 const {data:row}=await a.from('dd_acquisition_spend_recommendations').select('*').eq('id',recommendationId).eq('source_system','THUMBTACK').single();
 if(!row)return res.status(404).json({error:'Recommendation not found.'});
 const {data,error}=await a.from('dd_acquisition_spend_recommendations').update({status:d,approved_at:d==='APPROVED'?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('id',recommendationId).select('*').single();
 if(error)return res.status(500).json({error:'Decision could not be recorded.'});
 return res.status(200).json({success:true,recommendation:data,externalMutationPerformed:false,note:d==='APPROVED'?'Approved for the owner to apply in Thumbtack; no external budget change was made automatically.':'Recommendation rejected; no external change was made.'});
}
