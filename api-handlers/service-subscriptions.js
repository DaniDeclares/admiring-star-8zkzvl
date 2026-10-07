import Stripe from 'stripe';
import createCheckoutSession from './create-checkout-session.js';
import { finalizeProposedProviderRoutes } from './stripe-webhook.js';
import prisma from '../lib/prisma.js';
import { authenticatePortalRequest } from './_portalAuth.js';
import { getChannelFromRequest, getGovernedCommercialOffer } from '../src/lib/operations/governedCommercialGate2026.js';
import { validateRecurringTerms, ownsRecurringRequest, allowanceBalance, hasPeriodEndCancellation } from '../src/lib/operations/recurringServiceLifecycle2026.js';
const stripe=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
const fail=(res,status,error)=>res.status(status).json({success:false,error});
export default async function handler(req,res){
 try{
  const ctx=await authenticatePortalRequest(req);
  if(ctx.error)return fail(res,ctx.status,ctx.error);
  if(!['GET','POST'].includes(req.method))return fail(res,405,'Method not allowed');
  let body=req.body;
  if(req.method==='POST'&&!body){
   if(!String(req.headers['content-type']||'').startsWith('application/json'))return fail(res,415,'JSON submission required');
   let raw='';for await(const chunk of req){raw+=chunk.toString();if(Buffer.byteLength(raw)>32768)return fail(res,413,'Submission is too large');}
   try{body=JSON.parse(raw)}catch{return fail(res,400,'Invalid JSON submission')}
  }
  body=body||{};const sb=ctx.supabase;
  if(req.method==='GET'){
   let query=sb.from('service_requests').select('id,lead_id,organization_id');
   if(!ctx.isStaff){
    if(['customer','resident'].includes(ctx.role)&&ctx.identity?.entity_id)query=query.eq('lead_id',ctx.identity.entity_id);
    else if(['property_manager','procurement'].includes(ctx.role)&&ctx.identity?.organization_id)query=query.eq('organization_id',ctx.identity.organization_id);
    else return fail(res,403,'Customer or organization account required');
   }
   const requests=await query.limit(500);if(requests.error)throw requests.error;
   if(!requests.data.length)return res.json({success:true,subscriptions:[],terms:[],candidates:[]});
   const ids=requests.data.map(r=>r.id);
   const subscriptions=await sb.from('dd_service_subscriptions').select('id,canonical_sku,estimate_id,first_payment_verified_at,service_request_id,subscription_status,current_period_end,canceled_at,cancel_at_period_end').in('service_request_id',ids);
   const estimates=await sb.from('dd_estimates').select('id,client_name,service_request_id,estimated_total,estimate_status,economics_status,intake_answers').in('service_request_id',ids);
   if(subscriptions.error||estimates.error)throw subscriptions.error||estimates.error;
   const terms=estimates.data.length?await sb.from('dd_service_subscription_terms').select('id,estimate_id,canonical_sku,monthly_amount_cents,terms,accepted_at').in('estimate_id',estimates.data.map(e=>e.id)):{data:[]};
   if(terms.error)throw terms.error;
   const rows=[];
   for(const sub of subscriptions.data){
    const cycles=await sb.from('dd_service_subscription_cycles').select('id,period_start,period_end,terms_snapshot,fulfillment_status,job_id').eq('subscription_id',sub.id).order('period_start',{ascending:false}).limit(12);
    if(cycles.error)throw cycles.error;
    for(const cycle of cycles.data){
     const usage=await sb.from('dd_service_subscription_usage').select('allowance_key,quantity').eq('cycle_id',cycle.id);if(usage.error)throw usage.error;
     cycle.allowances=allowanceBalance(cycle.terms_snapshot,usage.data);
    }
    rows.push({...sub,cycles:cycles.data});
   }
   let candidates=[];
   if(ctx.isStaff){
    const monthly=await sb.from('services').select('sku,name').eq('billing_cycle','MONTHLY');if(monthly.error)throw monthly.error;
    const masters=monthly.data.length?await sb.from('dd_master_service_universe').select('canonical_sku,commercial_object_type,scope,exclusions').in('canonical_sku',monthly.data.map(s=>s.sku)):{data:[]};if(masters.error)throw masters.error;
    candidates=estimates.data.filter(e=>String(e.estimate_status).toLowerCase()==='approved'&&monthly.data.some(s=>s.sku===e.intake_answers?.serviceSku)).map(e=>{const master=masters.data.find(m=>m.canonical_sku===e.intake_answers.serviceSku);return {id:e.id,clientName:e.client_name,requestId:e.service_request_id,amountCents:Math.round(Number(e.estimated_total)*100),sku:e.intake_answers.serviceSku,channel:e.intake_answers.channelCode,objectType:master?.commercial_object_type,scope:master?.scope||'',exclusions:master?.exclusions||'',economicsStatus:e.economics_status};});
   }
   return res.json({success:true,subscriptions:rows,terms:terms.data,candidates});
  }
  if(body.action==='approve_terms'){
   if(!ctx.isStaff||ctx.role!=='owner')return fail(res,403,'Owner approval required');
   const estimate=await sb.from('dd_estimates').select('id,service_request_id,estimate_status,estimated_total,intake_answers').eq('id',body.estimateId).single();if(estimate.error)throw estimate.error;
   if(estimate.data.estimate_status.toLowerCase()!=='approved')return fail(res,409,'Approve the scoped estimate first');
   const request=await sb.from('service_requests').select('*').eq('id',estimate.data.service_request_id).single();if(request.error)throw request.error;
   const terms=validateRecurringTerms(body.terms);
   if(terms.channel!==getChannelFromRequest(request.data)||terms.channel!==estimate.data.intake_answers?.channelCode)return fail(res,409,'Exact request channel required');
   const sku=estimate.data.intake_answers?.serviceSku;
   if(!sku)return fail(res,409,'Canonical estimate service identity required');
   const service=await sb.from('services').select('id,sku,billing_cycle').eq('sku',sku).single();if(service.error)throw service.error;
   if(request.data.service_id&&request.data.service_id!==service.data.id)return fail(res,409,'Estimate service differs from the request');
   if(!['MONTH','MONTHLY'].includes(String(service.data.billing_cycle).toUpperCase()))return fail(res,409,'Canonical monthly service required');
   const master=await sb.from('dd_master_service_universe').select('commercial_object_type').eq('canonical_sku',service.data.sku).single();if(master.error)throw master.error;
   if(master.data.commercial_object_type!==terms.objectType)return fail(res,409,'Preserve the canonical commercial object type');
   // Insert-only: accepted/frozen terms cannot be silently overwritten.
   const result=await sb.from('dd_service_subscription_terms').insert({estimate_id:body.estimateId,canonical_sku:service.data.sku,terms,monthly_amount_cents:Math.round(Number(estimate.data.estimated_total)*100),approved_by:ctx.user.id}).select('id').single();if(result.error)throw result.error;
   return res.json({success:true,termsId:result.data.id});
  }
  if(body.action==='accept_terms'){
   if(ctx.isStaff)return fail(res,403,'Customer acceptance required');
   const term=await sb.from('dd_service_subscription_terms').select('*').eq('id',body.termsId).single();if(term.error)throw term.error;
   const estimate=await sb.from('dd_estimates').select('service_request_id').eq('id',term.data.estimate_id).single();if(estimate.error)throw estimate.error;
   const request=await sb.from('service_requests').select('lead_id,organization_id').eq('id',estimate.data.service_request_id).single();if(request.error)throw request.error;
   if(!ownsRecurringRequest(ctx,request.data))return fail(res,403,'This agreement belongs to another account');
   const result=await sb.from('dd_service_subscription_terms').update({accepted_by:ctx.user.id,accepted_at:new Date().toISOString()}).eq('id',body.termsId).is('accepted_at',null);if(result.error)throw result.error;
   return res.json({success:true});
  }
  if(body.action==='start_checkout'){
   if(ctx.isStaff)return fail(res,403,'Customer checkout required');
   const term=await sb.from('dd_service_subscription_terms').select('*').eq('id',body.termsId).single();if(term.error)throw term.error;
   if(!term.data.accepted_at)return fail(res,409,'Accept the recurring agreement first');
   const estimate=await sb.from('dd_estimates').select('service_request_id').eq('id',term.data.estimate_id).single();if(estimate.error)throw estimate.error;
   const request=await sb.from('service_requests').select('*').eq('id',estimate.data.service_request_id).single();if(request.error)throw request.error;
   if(!ownsRecurringRequest(ctx,request.data))return fail(res,403,'This agreement belongs to another account');
   const serviceId=request.data.property_details?.commercialIntent?.serviceId||request.data.property_details?.pricingServiceId;
   const channel=getChannelFromRequest(request.data);
   req.body={requestId:request.data.id,serviceId,email:ctx.user.email};
   // Server-only authorization marker. This cannot be supplied by the public checkout request:
   // it is created only after authenticated customer ownership + accepted owner-approved recurring terms.
   req.daniRecurringAgreement={
    termsId:term.data.id,
    estimateId:term.data.estimate_id,
    requestId:request.data.id,
    serviceId,
    channel
   };
   // Reuse the canonical release, exact-channel pricing, economics and Stripe cancellation gates.
   return createCheckoutSession(req,res);
  }
  const sub=await sb.from('dd_service_subscriptions').select('*').eq('id',body.subscriptionId).single();if(sub.error)throw sub.error;
  const request=await sb.from('service_requests').select('lead_id,organization_id').eq('id',sub.data.service_request_id).single();if(request.error)throw request.error;
  if(!ownsRecurringRequest(ctx,request.data))return fail(res,403,'This subscription belongs to another account');
  if(body.action==='manage_billing'){
   if(ctx.isStaff)return fail(res,403,'Customer billing access required');
   if(!stripe||!sub.data.stripe_customer_id)return fail(res,409,'Billing management is not available yet');
   const origin=process.env.PUBLIC_SITE_URL||'https://danideclares.com';
   const configurationId=process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID;
   if(!configurationId)return fail(res,409,'Billing management needs configuration review');
   const config=await stripe.billingPortal.configurations.retrieve(configurationId);
   if(!hasPeriodEndCancellation(config))return fail(res,409,'Billing management terms need review');
   const related=await sb.from('dd_service_subscriptions').select('service_request_id').eq('stripe_customer_id',sub.data.stripe_customer_id);if(related.error)throw related.error;
   for(const item of related.data){const linked=await sb.from('service_requests').select('lead_id,organization_id').eq('id',item.service_request_id).single();if(linked.error||!ownsRecurringRequest(ctx,linked.data))return fail(res,403,'Shared billing account requires review');}
   const session=await stripe.billingPortal.sessions.create({customer:sub.data.stripe_customer_id,configuration:configurationId,return_url:`${origin}/portal/customer/payments`});
   return res.json({success:true,url:session.url});
  }
  if(body.action==='record_usage'){
   if(!ctx.isStaff)return fail(res,403,'Staff review required');
   const cycle=await sb.from('dd_service_subscription_cycles').select('id,job_id').eq('id',body.cycleId).eq('subscription_id',sub.data.id).single();if(cycle.error)throw cycle.error;
   if(!Number.isFinite(body.quantity)||body.quantity<=0)return fail(res,422,'Positive usage quantity required');
   const result=await sb.from('dd_service_subscription_usage').insert({cycle_id:cycle.data.id,job_id:cycle.data.job_id,allowance_key:body.allowanceKey,quantity:body.quantity,recorded_by:ctx.user.id});if(result.error)throw result.error;
   const completed=await sb.from('dd_service_subscription_cycles').update({fulfillment_status:'COMPLETED'}).eq('id',cycle.data.id);if(completed.error)throw completed.error;
   return res.json({success:true,overageBehavior:'QUOTE_REQUIRED'});
  }
  if(body.action==='release_cycle'){
   if(!ctx.isStaff)return fail(res,403,'Staff review required');
   if(!stripe)throw new Error('STRIPE_VERIFICATION_REQUIRED');
   const live=await stripe.subscriptions.retrieve(sub.data.stripe_subscription_id);
   if(live.status!=='active')throw new Error('SUBSCRIPTION_NOT_ACTIVE');
   const offer=await getGovernedCommercialOffer(sub.data.canonical_sku);
   if(offer?.releaseState!=='LIVE_READY'||offer.commercialOfferStatus!=='SELL_NOW'||offer.fulfillmentGateStatus!=='READY')throw new Error('COMMERCIAL_RELEASE_REQUIRED');
   const result=await prisma.$transaction(async tx=>{
    await tx.$executeRaw`select pg_advisory_xact_lock(hashtextextended(${sub.data.stripe_subscription_id},0))`;
    const rows=await tx.$queryRaw`select * from public.dd_service_subscription_cycles where id=${body.cycleId}::uuid and subscription_id=${sub.data.id}::uuid for update`;
    const cycle=rows[0];if(cycle && new Date(cycle.period_end)<=new Date())throw new Error('PAID_PERIOD_EXPIRED');
    if(!cycle)throw new Error('CYCLE_REQUIRED');if(cycle.job_id)return {jobId:cycle.job_id,replay:true};
    const estimate=await tx.dd_estimates.findUnique({where:{id:body.estimateId}});
    if(!estimate||estimate.id===sub.data.estimate_id||estimate.service_request_id!==sub.data.service_request_id||estimate.intake_answers?.serviceSku!==sub.data.canonical_sku||estimate.intake_answers?.channelCode!==cycle.terms_snapshot.channel||estimate.estimate_status.toLowerCase()!=='approved'||estimate.economics_status!=='PASS'||!estimate.active_economics_snapshot_id||Math.round(Number(estimate.estimated_total)*100)!==cycle.amount_paid_cents)throw new Error('FRESH_APPROVED_CYCLE_ECONOMICS_REQUIRED');
    const used=await tx.$queryRaw`select id from public.dd_service_subscription_cycles where estimate_id=${estimate.id}::uuid limit 1`;if(used.length)throw new Error('CYCLE_ESTIMATE_ALREADY_USED');
    const parent=await tx.serviceRequest.findUnique({where:{id:sub.data.service_request_id}});
    const job=await tx.dd_jobs.create({data:{estimate_id:estimate.id,lead_id:parent.leadId,organization_id:parent.organizationId,service_request_id:parent.id,division_slug:estimate.division_slug,job_title:parent.service_needed||'Recurring service',job_status:'new',scope_summary:cycle.terms_snapshot.scope,location_address:parent.location_address}});
    await tx.$executeRaw`update public.dd_service_subscription_cycles set estimate_id=${estimate.id}::uuid,job_id=${job.id}::uuid,fulfillment_status='READY' where id=${cycle.id}::uuid`;
    await tx.$executeRaw`update public.dd_payment_events set job_id=${job.id}::uuid where raw_metadata->>'cycle_id'=${cycle.id} and upper(payment_status)='SUCCEEDED'`;
    await tx.$queryRaw`select public.dd_activate_paid_estimate_assignments(${estimate.id}::uuid) as routing`;
    return {jobId:job.id};
   });
   if(!result.replay)await finalizeProposedProviderRoutes(prisma,body.estimateId);
   return res.json({success:true,...result});
  }
  return fail(res,400,'Unknown subscription action');
 }catch(error){console.error('Recurring service operation held:',error.message);return fail(res,409,'Recurring service operation requires review.');}
}
