import { createClient } from '@supabase/supabase-js';

const LIMIT = 50;
const clean = (v) => typeof v === 'string' ? v.trim() : '';

function clients() {
  const productionUrl = clean(process.env.SUPABASE_URL);
  const productionKey = clean(process.env.PRODUCTION_SUPABASE_SECRET_KEY);
  const testerUrl = 'https://okvepooyxurujcwgfoju.supabase.co';
  const testerKey = clean(process.env.TESTER_SUPABASE_SECRET_KEY);
  if (!productionUrl || !productionKey || !testerUrl || !testerKey) {
    throw new Error('Cross-environment Supabase secret credentials are incomplete');
  }
  return {
    production: createClient(productionUrl, productionKey, { auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false} }),
    tester: createClient(testerUrl, testerKey, { auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false} })
  };
}

async function productionToTester(production,tester) {
  const {data,error}=await production.from('dd_environment_bridge_receipts')
    .select('id,bridge_key,artifact_key,source_state')
    .eq('direction','PRODUCTION_TO_TESTER').eq('artifact_type','LEARNING_EVIDENCE').eq('bridge_status','QUEUED')
    .order('created_at',{ascending:true}).limit(LIMIT);
  if(error) throw error;
  let delivered=0;
  for(const r of data||[]) {
    const s=r.source_state||{};
    const payload={
      evidence_key:'PROD_BRIDGE:'+r.artifact_key,
      evidence_origin:'PRODUCTION_ENVIRONMENT_BRIDGE',
      domain:s.domain||'UNCLASSIFIED',
      source_system:'PRODUCTION_SUPABASE',
      source_reference:s.source_reference||r.artifact_key,
      observation:s.observation||'Production learning transported to Tester for governed revalidation.',
      evidence_payload:{...(s.evidence_payload||{}),bridge_key:r.bridge_key,source_environment:'PRODUCTION',production_authority:false},
      authority_class:'EVIDENCE_ONLY',
      requires_new_test:Boolean(s.requires_new_test),
      status:'NEW'
    };
    const up=await tester.from('dd_learning_evidence_intake').upsert(payload,{onConflict:'evidence_key'});
    if(up.error) throw up.error;
    const ack=await production.from('dd_environment_bridge_receipts').update({
      bridge_status:'DELIVERED',reconciled_at:new Date().toISOString(),
      target_state:{tester_evidence_key:payload.evidence_key,production_authority:false}
    }).eq('id',r.id).eq('bridge_status','QUEUED');
    if(ack.error) throw ack.error;
    delivered++;
  }
  return delivered;
}

async function testerToProduction(tester,production) {
  const {data,error}=await tester.from('dd_environment_bridge_receipts')
    .select('id,bridge_key,artifact_key,source_state')
    .eq('direction','TESTER_TO_PRODUCTION').eq('artifact_type','PROMOTION_CANDIDATE').eq('bridge_status','QUEUED')
    .order('created_at',{ascending:true}).limit(LIMIT);
  if(error) throw error;
  let delivered=0;
  for(const r of data||[]) {
    const s=r.source_state||{};
    const payload={
      candidate_key:r.artifact_key,
      component_domain:s.component_domain||'UNCLASSIFIED',
      component_name:s.component_name||r.artifact_key,
      source_environment:'TESTER',target_environment:'PRODUCTION',
      source_reference:s.source_reference||r.bridge_key,
      classification:s.classification||'REVIEW_REQUIRED',
      proof_status:s.proof_status||'NOT_RUN',dependency_status:s.dependency_status||'NOT_RUN',
      security_status:s.security_status||'NOT_RUN',production_diff_status:s.production_diff_status||'NOT_RUN',
      rollback_status:s.rollback_status||'NOT_DEFINED',
      owner_approval_status:'NOT_REQUESTED',production_verification_status:'NOT_RUN',
      blocking_reason:s.blocking_reason||null,
      evidence:{...(s.evidence||{}),bridge_key:r.bridge_key,tester_authority_over_production:false,transported_from_tester:true}
    };
    const up=await production.from('dd_promotion_candidates').upsert(payload,{onConflict:'candidate_key',ignoreDuplicates:true});
    if(up.error) throw up.error;
    const ack=await tester.from('dd_environment_bridge_receipts').update({
      bridge_status:'DELIVERED',reconciled_at:new Date().toISOString(),
      target_state:{production_candidate_key:r.artifact_key,tester_authority_over_production:false}
    }).eq('id',r.id).eq('bridge_status','QUEUED');
    if(ack.error) throw ack.error;
    delivered++;
  }
  return delivered;
}

export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).json({success:false,error:'Method not allowed'});
  const expected=clean(process.env.CRON_SECRET);
  const supplied=clean(req.headers.authorization).replace(/^Bearer\s+/i,'');
  if(!expected || supplied!==expected) return res.status(401).json({success:false,error:'Unauthorized'});
  try {
    const {production,tester}=clients();
    const preflight = req.query?.preflight === '1' || req.body?.preflight === true;
    if (preflight) {
      const [prodProbe,testProbe] = await Promise.all([
        production.from('dd_environment_bridge_receipts').select('id',{count:'exact',head:true}).limit(1),
        tester.from('dd_environment_bridge_receipts').select('id',{count:'exact',head:true}).limit(1)
      ]);
      if (prodProbe.error) throw prodProbe.error;
      if (testProbe.error) throw testProbe.error;
      return res.status(200).json({
        success:true,mode:'PREFLIGHT',productionReachable:true,testerReachable:true,
        productionReceiptCount:prodProbe.count,testerReceiptCount:testProbe.count,
        transported:0,productionRuntimeMutation:false,pricingMutation:false,
        providerAuthorizationMutation:false,moneyMovement:false,externalContact:false
      });
    }
    return res.status(200).json({
      success:true,mode:'TRANSPORT',
      productionToTester:await productionToTester(production,tester),
      testerToProduction:await testerToProduction(tester,production),
      productionRuntimeMutation:false,pricingMutation:false,providerAuthorizationMutation:false,
      moneyMovement:false,externalContact:false
    });
  } catch(error) {
    return res.status(500).json({success:false,error:error?.message||'Environment bridge failed'});
  }
}
