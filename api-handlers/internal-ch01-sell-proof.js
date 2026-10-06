import Stripe from 'stripe';
import { Readable } from 'node:stream';
import { createClient } from '@supabase/supabase-js';
import intakeHandler from './intake-webhook.js';
import stripeWebhookHandler from './stripe-webhook.js';
import { checkoutEligibility, getGovernedCommercialOffer } from '../src/lib/operations/governedCommercialGate2026.js';
import { ensureOwnerDirectCheckoutEconomics } from '../src/lib/operations/ownerDirectCheckout2026.js';

const SKU='DNI-01A-001';
const TESTER_PROJECT_REF='okvepooyxurujcwgfoju';
const FRONT_DOOR='CH01-F01';

function capturedResponse(){
  return {
    statusCode:200,
    body:null,
    status(code){this.statusCode=code;return this;},
    json(payload){this.body=payload;return payload;},
    send(payload){this.body=payload;return payload;}
  };
}

function assert(condition,message){
  if(!condition) throw new Error(message);
}

function testerOnly(){
  if(process.env.VERCEL_ENV!=='preview') return false;
  const raw=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL||'';
  try{return new URL(raw).hostname.startsWith(TESTER_PROJECT_REF+'.');}catch{return false;}
}

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(!testerOnly()) return res.status(404).json({error:'Not found'});

  const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!url||!key||!webhookSecret) return res.status(503).json({error:'Tester proof runtime is not fully configured.'});

  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const sourceSha=String(process.env.VERCEL_GIT_COMMIT_SHA||'').trim();
  const deploymentId=String(process.env.VERCEL_DEPLOYMENT_ID||process.env.VERCEL_URL||'').trim();
  if(!sourceSha) return res.status(503).json({error:'Tester proof requires an exact source SHA.'});
  const proofKey=`CH01_SELL_DNI_01A_001:${sourceSha}`;

  const {data:existing}=await admin.from('dd_lifecycle_payment_proof_receipts')
    .select('*').eq('proof_key',proofKey).maybeSingle();
  if(existing) return res.status(200).json({status:'PASS',idempotent:true,receipt:existing});

  const offer=await getGovernedCommercialOffer(SKU);
  assert(offer?.serviceId===SKU,'Governed DNI-01A-001 offer is missing.');
  assert(offer.releaseState==='LIVE_READY','Release contract is not LIVE_READY; proof refuses to bypass release governance.');

  // Prove the checkout gate that would apply after owner-authorized offer activation,
  // without mutating the currently fail-closed offer or creating a real Stripe session.
  const checkoutGate=checkoutEligibility(
    {...offer,commercialOfferStatus:'SELL_NOW',fulfillmentGateStatus:'READY'},
    {channel:'CH01',subchannel:'CH01-A',isVerifiedCommunityResident:false,hasLockedActivePricing:true}
  );
  assert(checkoutGate.eligible===true,'Post-activation checkout gate is not eligible: '+checkoutGate.reason);
  assert(Number(checkoutGate.price)===140,'Governed checkout price is not $140.');

  const intakeReq={
    method:'POST',
    headers:{},
    __daniTesterProof:true,
    body:{
      name:'Synthetic CH01 SELL Proof',
      phone:'555-0100',
      category:'Home, Pet, Plant & Household Support',
      serviceType:'Resident Refresh — Standard Maintenance Clean',
      pricingServiceId:SKU,
      channelType:'B2C',
      locationAddress:'100 Synthetic Proof Way',
      locationCity:'Atlanta',
      locationState:'GA',
      locationZip:'30300',
      timeline:'TESTER_ONLY',
      frontDoorCode:FRONT_DOOR,
      commercialIntent:{serviceId:SKU,subchannelCode:'CH01-A'},
      details:`SYNTHETIC TESTER ONLY — CH01 SELL proof ${sourceSha}`
    }
  };
  const intakeRes=capturedResponse();
  await intakeHandler(intakeReq,intakeRes);
  assert(intakeRes.statusCode===200&&intakeRes.body?.requestId,'Canonical intake writer failed: '+JSON.stringify(intakeRes.body));
  assert(intakeRes.body.paymentPending===true,'Canonical intake did not freeze a payment-pending request.');
  const requestId=intakeRes.body.requestId;

  const [{data:request,error:requestError},{data:estimate0,error:estimateError}]=await Promise.all([
    admin.from('service_requests').select('*').eq('id',requestId).single(),
    admin.from('dd_estimates').select('*').eq('service_request_id',requestId).order('created_at',{ascending:false}).limit(1).single()
  ]);
  if(requestError) throw requestError;
  if(estimateError) throw estimateError;
  assert(Number(estimate0.estimated_total)===140,'Frozen estimate is not $140.');
  assert(estimate0.estimate_status==='approved','Frozen estimate is not approved.');

  const economics=await ensureOwnerDirectCheckoutEconomics(admin,{estimate:estimate0,offer,request,amount:140});
  assert(economics.ready===true,'Owner-direct checkout economics are not ready: '+String(economics.reason||'UNKNOWN'));

  const {data:estimate,error:estimateReloadError}=await admin.from('dd_estimates')
    .select('*').eq('id',estimate0.id).single();
  if(estimateReloadError) throw estimateReloadError;

  const eventId=`evt_test_ch01_sell_${sourceSha.slice(0,24)}`;
  const paymentIntent=`pi_test_ch01_sell_${sourceSha.slice(0,24)}`;
  const event={
    id:eventId,
    object:'event',
    type:'checkout.session.completed',
    livemode:false,
    data:{object:{
      id:`cs_test_ch01_sell_${sourceSha.slice(0,24)}`,
      object:'checkout.session',
      livemode:false,
      payment_status:'paid',
      status:'complete',
      amount_total:14000,
      amount_subtotal:14000,
      currency:'usd',
      payment_intent:paymentIntent,
      metadata:{
        request_id:requestId,
        service_id:SKU,
        estimate_id:estimate.id,
        canonical_sku:SKU,
        channel:'CH01',
        subchannel:'CH01-A',
        payment_type:'FULL_PAYMENT',
        full_estimate_amount:'140',
        deposit_due:'140',
        balance_due:'0'
      }
    }}
  };
  const payload=JSON.stringify(event);
  const signer=new Stripe(process.env.STRIPE_SECRET_KEY||'sk_test_dani_internal_proof');
  const signature=signer.webhooks.generateTestHeaderString({payload,secret:webhookSecret});
  const webhookReq=Readable.from([Buffer.from(payload)]);
  webhookReq.method='POST';
  webhookReq.headers={'stripe-signature':signature};
  webhookReq.__daniTesterProof=true;
  const webhookRes=capturedResponse();
  await stripeWebhookHandler(webhookReq,webhookRes);
  assert(webhookRes.statusCode===200,'Canonical payment reconciliation failed: '+JSON.stringify(webhookRes.body));

  const [{data:job,error:jobError},{data:payment,error:paymentError},{data:estimateAfter,error:estimateAfterError}]=await Promise.all([
    admin.from('dd_jobs').select('id,service_request_id,estimate_id,work_order_id,job_status').eq('service_request_id',requestId).order('created_at',{ascending:false}).limit(1).single(),
    admin.from('dd_payment_events').select('id,provider_event_id,request_id,job_id,payment_status,amount_received,currency').eq('provider_event_id',eventId).single(),
    admin.from('dd_estimates').select('id,economics_status,active_economics_snapshot_id,assignment_readiness_status').eq('id',estimate.id).single()
  ]);
  if(jobError) throw jobError;
  if(paymentError) throw paymentError;
  if(estimateAfterError) throw estimateAfterError;
  assert(job.service_request_id===requestId,'Created job is missing canonical service_request_id linkage.');
  assert(job.estimate_id===estimate.id,'Created job is missing frozen estimate linkage.');
  assert(Boolean(job.work_order_id),'Created job is missing work-order linkage.');
  assert(payment.request_id===requestId&&payment.job_id===job.id,'Payment event is not linked to request/job.');
  assert(payment.payment_status==='SUCCEEDED'&&Number(payment.amount_received)===140,'Synthetic payment event did not reconcile exactly $140.');

  let assignmentOfferCount=0;
  if(estimateAfter.economics_status==='PASS'&&estimateAfter.active_economics_snapshot_id){
    const {count,error}=await admin.from('dd_estimate_assignment_offers')
      .select('id',{count:'exact',head:true}).eq('estimate_id',estimate.id);
    if(error) throw error;
    assignmentOfferCount=count||0;
    assert(assignmentOfferCount>0,'Economics PASS did not activate any frozen assignment offers.');
  }

  const assertions={
    canonical_sku:SKU,
    source_sha:sourceSha,
    deployment_id:deploymentId,
    release_state:offer.releaseState,
    persisted_offer_status:offer.commercialOfferStatus,
    persisted_fulfillment_status:offer.fulfillmentGateStatus,
    checkout_activation_simulated_only:true,
    checkout_gate_reason:checkoutGate.reason,
    checkout_price:checkoutGate.price,
    request_id:requestId,
    estimate_id:estimate.id,
    job_id:job.id,
    work_order_id:job.work_order_id,
    payment_event_id:payment.id,
    economics_status:estimateAfter.economics_status,
    assignment_readiness_status:estimateAfter.assignment_readiness_status,
    assignment_offer_count:assignmentOfferCount,
    production_mutation:false,
    money_action:false,
    external_payment_attempted:false,
    external_contact:false,
    provider_authorization:false
  };

  const {data:receipt,error:receiptError}=await admin.from('dd_lifecycle_payment_proof_receipts').insert({
    proof_key:proofKey,
    status:'PASS',
    assertions,
    synthetic_payment_event_id:payment.id,
    external_payment_attempted:false,
    money_moved:false,
    external_contact:false,
    production_mutation:false
  }).select('*').single();
  if(receiptError) throw receiptError;

  return res.status(200).json({status:'PASS',idempotent:false,receipt,assertions});
}
