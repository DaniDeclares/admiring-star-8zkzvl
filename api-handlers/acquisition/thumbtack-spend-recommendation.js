import prisma from '../../lib/prisma.js';
import { createClient } from '@supabase/supabase-js';

const ACTIVE_CLEANER_SERVICES=[
 'Carpet cleaning','Commercial carpet cleaning','Commercial cleaning','Floor cleaning','Floor polishing',
 'Garage, basement or attic cleaning','Home organizing','House cleaning','Rug cleaning','Tile and grout cleaning'
];

function admin(){
 const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 return url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}):null;
}
async function staff(req){
 const token=String(req.headers.authorization||'').replace(/^Bearer\s+/,''); if(!token)return null;
 const a=admin(); if(!a)return null; const {data:{user}}=await a.auth.getUser(token); if(!user)return null;
 const {data}=await a.from('dd_portal_identities').select('portal_role,is_active').eq('auth_user_id',user.id).eq('is_active',true).maybeSingle();
 return data&&['owner','admin','staff'].includes(String(data.portal_role||'').toLowerCase())?user:null;
}
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!await staff(req))return res.status(401).json({error:'Staff authorization required'});
 const {service,currentWeeklyBudget,recommendedWeeklyBudget,recommendationType='HOLD',rationale='',evidence={}}=req.body||{};
 if(!ACTIVE_CLEANER_SERVICES.includes(service))return res.status(400).json({error:'Service is not in the owner-confirmed active Thumbtack cleaner set.'});
 const type=String(recommendationType).toUpperCase();
 if(!['INCREASE','DECREASE','PAUSE','HOLD','REACTIVATE'].includes(type))return res.status(400).json({error:'Invalid recommendation type'});
 const current=Number(currentWeeklyBudget||0),recommended=Number(recommendedWeeklyBudget||0);
 if(type==='INCREASE'&&recommended<=current)return res.status(400).json({error:'An increase must be above the current budget.'});
 const a=admin(); const {data,error}=await a.from('dd_acquisition_spend_recommendations').insert({
  source_system:'THUMBTACK',source_service:service,recommendation_type:type,current_weekly_budget:current,
  recommended_weekly_budget:recommended,evidence,rationale,status:'PROPOSED',requires_owner_approval:true
 }).select('*').single();
 if(error)return res.status(500).json({error:'Recommendation could not be recorded.'});
 return res.status(200).json({success:true,recommendation:data,externalMutationPerformed:false,ownerApprovalRequired:true});
}
