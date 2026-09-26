import { createClient } from '@supabase/supabase-js';

const LIMIT = 50;
const clean = (v) => typeof v === 'string' ? v.trim() : '';
const json = (res,status,body) => res.status(status).json(body);

function clients() {
  const productionUrl = clean(process.env.PRODUCTION_SUPABASE_URL || process.env.SUPABASE_URL);
  const productionKey = clean(process.env.PRODUCTION_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  const testerUrl = clean(process.env.TESTER_SUPABASE_URL);
  const testerKey = clean(process.env.TESTER_SUPABASE_SERVICE_ROLE_KEY);
  if (!productionUrl || !productionKey || !testerUrl || !testerKey) {
    throw new Error('Cross-environment Supabase credentials are incomplete');
  }
  return {
    production: createClient(productionUrl, productionKey, { auth:{ persistSession:false, autoRefreshToken:false } }),
    tester: createClient(testerUrl, testerKey, { auth:{ persistSession:false, autoRefreshToken:false } })
  };
}

async function transportProductionLearning(production,tester) {
  const { data: receipts, error } = await production.from('dd_environment_bridge_receipts')
    .select('id,bridge_key,artifact_key,source_state')
    .eq('direction','PRODUCTION_TO_TESTER').eq('artifact_type','LEARNING_EVIDENCE').eq('bridge_status','QUEUED')
    .order('created_at',{ascending:true}).limit(LIMIT);
  if (error) throw error;
  let delivered=0;
  for (const r of receipts || []) {
    const s=r.source_state || {};
    const payload={
      evidence_key:'PROD_BRIDGE:'+r.artifact_key,
      evidence_origin:'PRODUCTION_ENVIRONMENT_BRIDGE',
      domain:s.domain || 'UNCLASSIFIED',
      source_system:'PRODUCTION_SUPABASE',
      source_reference:s.source_reference || r.artifact_key,
      observation:s.observation || 'Production learning evidence transported to Tester for governed revalidation.',
      evidence_payload:{...(s.evidence_payload||{}),bridge_key:r.bridge_key,source_environment:'PRODUCTION',production_authority:false},
      authority_class:'EVIDENCE_ONLY',
      requires_new_test:Boolean(s.requires_new_test),
      status:'NEW'
    };
    const { error: upsertError }=await tester.from('dd_learning_evidence_intake').upsert(payload,{onConflict:'evidence_key'});
    if (upsertError) throw upsertError;
    const { error: receiptError }=await production.from('dd_environment_bridge_receipts').update({
      bridge_status:'DELIVERED',reconciled_at:new Date().toISOString(),
      target_state:{intended_action:'CREATE_OR_REFRESH_TESTER_RESEARCH_EVIDENCE',tester_evidence_key:payload.evidence_key,production_authority:false}
    }).eq('id',r.id).eq('bridge_status','QUEUED');
    if (receiptError) throw receiptError;
    delivered++;
  }
  return delivered;
}

async function transportTesterPromotions(tester,production) {
  const { data: receipts, error } = await tester.from('dd_environment_bridge_receipts')
    .select('id,bridge_key,artifact_key,source_state')
    .eq('direction','TESTER_TO_PRODUCTION').eq('artifact_type','PROMOTION_CANDIDATE').eq('bridge_status','QUEUED')
    .order('created_at',{ascending:true}).limit(LIMIT);
  if (error) throw error;
  let delivered=0;
  for (const r of receipts || []) {
    const s=r.source_state || {};
    const payload={
      candidate_key:r.artifact_key,
      component_domain:s.component_domain || 'UNCLASSIFIED',
      component_name:s.component_name || r.artifact_key,
      source_environment:'TESTER',
      target_environment:'PRODUCTION',
      source_reference:s.source_reference || r.bridge_key,
      classification:s.classification || 'REVIEW_REQUIRED',
      proof_status:s.proof_status || 'NOT_RUN',
      dependency_status:s.dependency_status || 'NOT_RUN',
      security_status:s.security_status || 'NOT_RUN',
      production_diff_status:s.production_diff_status || 'NOT_RUN',
      rollback_status:s.rollback_status || 'NOT_DEFINED',
      owner_approval_status:'NOT_REQUESTED',
      production_verification_status:'NOT_RUN',
      blocking_reason:s.blocking_reason || null,
      evidence:{...(s.evidence||{}),bridge_key:r.bridge_key,tester_authority_over_production:false,transported_from_tester:true}
    };
    const { error: upsertError }=await production.from('dd_promotion_candidates').upsert(payload,{onConflict:'candidate_key'});
    if (upsertError) throw upsertError;
    const { error: receiptError }=await tester.from('dd_environment_bridge_receipts').update({
      bridge_status:'DELIVERED',reconciled_at:new Date().toISOString(),
      target_state:{intended_action:'PRODUCTION_PREFLIGHT_AND_PROMOTION_RECONCILIATION',production_candidate_key:r.artifact_key,tester_authority_over_production:false}
    }).eq('id',r.id).eq('bridge_status','QUEUED');
    if (receiptError) throw receiptError;
    delivered++;
  }
  return delivered;
}

export default async function handler(req,res) {
  if (req.method!=='POST') { res.setHeader('Allow','POST'); return json(res,405,{success:false,error:'Method not allowed'}); }
  const expected=clean(process.env.CRON_SECRET);
  const supplied=clean(req.headers.authorization).replace(/^Bearer\s+/i,'');
  if (!expected || supplied!==expected) return json(res,401,{success:false,error:'Unauthorized'});
  try {
    const {production,tester}=clients();
    const productionToTester=await transportProductionLearning(production,tester);
    const testerToProduction=await transportTesterPromotions(tester,production);
    return json(res,200,{success:true,productionToTester,testerToProduction,productionRuntimeMutation:false,pricingMutation:false,providerAuthorizationMutation:false,moneyMovement:false,externalContact:false});
  } catch(error) {
    return json(res,500,{success:false,error:error?.message || 'Environment bridge transport failed'});
  }
}
