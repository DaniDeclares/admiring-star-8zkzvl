import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { nextStateAfterPayment, assertTransition } from '../src/lib/operations/workflowStateMachines2026.js';
import { reconcileStripePayment } from '../src/lib/operations/accountingReconciliation2026.js';
import { publishPaymentReconciled } from '../src/lib/operations/eventBroker2026.js';
import { getGovernedCommercialOffer } from '../src/lib/operations/governedCommercialGate2026.js';

const secretKey=process.env.STRIPE_SECRET_KEY;
const webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;
const stripe=secretKey?new Stripe(secretKey):null;
export const config={api:{bodyParser:false}};
async function getRawBody(req){const chunks=[];for await(const chunk of req)chunks.push(typeof chunk==='string'?Buffer.from(chunk):chunk);return Buffer.concat(chunks);}
function readChannel(propertyDetails){return propertyDetails?.operationsRouting?.channelType||propertyDetails?.operationsRouting?.channel||null;}
function money(value){return Number(Number(value||0).toFixed(2));}

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!stripe||!webhookSecret){console.error('Stripe webhooks unconfigured: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.');return res.status(500).json({error:'Stripe webhook configuration missing'});}
 let event;
 try{const rawBody=await getRawBody(req);event=stripe.webhooks.constructEvent(rawBody,req.headers['stripe-signature'],webhookSecret);}catch(err){console.error('Stripe Webhook Signature Verification Failed:',err.message);return res.status(400).send('Webhook Signature Error');}
 if(event.type!=='checkout.session.completed')return res.status(200).json({received:true});
 const session=event.data.object,requestId=session.metadata?.request_id,changeOrderId=session.metadata?.change_order_id;
 if(requestId){
  try{
   const serviceId=String(session.metadata?.service_id||'').trim();
   const offer=await getGovernedCommercialOffer(serviceId);
   if(!offer||offer.commercialOfferStatus!=='SELL_NOW'||offer.fulfillmentGateStatus!=='READY')return res.status(422).json({error:'Payment references a commercial offer that is no longer eligible for direct checkout.'});
   const result=await prisma.$transaction(async tx=>{
    const existing=await tx.$queryRaw`select id,invoice_id from public.dd_payment_events where provider_event_id=${event.id} limit 1`;
    if(existing.length)return {status:'IDEMPOTENT_REPLAY',paymentEventId:existing[0].id,invoiceId:existing[0].invoice_id};
    // PostgreSQL advisory transaction lock serializes duplicate deliveries for this request.
    await tx.$executeRaw`select pg_advisory_xact_lock(hashtextextended(${requestId}, 0))`;
    const request=await tx.serviceRequest.findUnique({where:{id:requestId}});
    if(!request)throw new Error(`ServiceRequest ${requestId} not found`);
    const channel=readChannel(request.property_details);
    if(channel!=='B2C')throw new Error(`Payment webhook cannot auto-create a job for channel ${channel||'UNKNOWN'}`);
    const frozenSnapshot=Number(request.property_details?.commercialIntent?.frozenPriceSnapshot),paidAmount=money(Number(session.amount_total||0)/100);
    if(!Number.isFinite(frozenSnapshot)||frozenSnapshot<=0)throw new Error('Paid request has no valid frozen commercial price snapshot.');
    if(money(frozenSnapshot)!==paidAmount)throw new Error('Payment amount does not match the frozen commercial price.');
    const metadataServiceId=request.property_details?.commercialIntent?.serviceId||request.property_details?.pricingServiceId;
    if(String(metadataServiceId||'')!==serviceId)throw new Error('Payment service metadata does not match the submitted service request.');
    const currentState=String(request.status||'new').toUpperCase();
    assertTransition('B2C',currentState,'PAID');
    assertTransition('B2C','PAID',nextStateAfterPayment('B2C'));
    let job=await tx.dd_jobs.findFirst({where:{service_request_id:request.id},select:{id:true,public_reference:true,work_order_id:true}});
    if(!job){
     const estimate=await tx.dd_estimates.findFirst({where:{service_request_id:request.id},orderBy:{created_at:'desc'},select:{id:true,division_slug:true}});
     if(!estimate)throw new Error(`No frozen estimate found for paid request ${request.id}`);
     job=await tx.dd_jobs.create({data:{estimate_id:estimate.id,lead_id:request.leadId||null,service_request_id:request.id,division_slug:estimate.division_slug||'concierge',job_title:request.service_needed||request.service_category||'Dani Declares Service',job_status:'new',location_address:request.location_address||null,scope_summary:request.request_details||null},select:{id:true,public_reference:true,work_order_id:true}});
    }
    if(!job.work_order_id){
     const workOrderNumber=`DDWO-${job.public_reference}`;
     // Owner-first default: only auto-assign when exactly one active org holds a real
     // authorized capability for this service. Ambiguous or zero matches are left
     // unassigned rather than guessed at, and no provider_pay_amount is ever invented here.
     const capabilityHolders=await tx.$queryRaw`
      select distinct pc.provider_org_id
      from public.dd_provider_capabilities pc
      join public.dd_provider_organizations po on po.id=pc.provider_org_id
      where pc.service_id=${offer.runtimeServiceId}::uuid and pc.is_authorized=true and po.is_active=true
     `;
     let primaryProviderId=null;
     if(capabilityHolders.length===1){
      const providerRow=await tx.$queryRaw`select id from public.dd_providers where org_id=${capabilityHolders[0].provider_org_id}::uuid limit 1`;
      if(providerRow.length)primaryProviderId=providerRow[0].id;
     }
     const inserted=await tx.$queryRaw`
      insert into public.dd_work_orders (
       work_order_number,service_request_id,lead_id,service_id,offer_sku,canonical_sku,
       service_name,service_address,scope_notes,customer_price,status,target_channel,primary_provider_id
      ) values (
       ${workOrderNumber},${request.id}::uuid,${request.leadId||null},${offer.runtimeServiceId}::uuid,
       ${offer.serviceId},${offer.serviceId},${offer.name},${request.location_address||null},
       ${request.request_details||null},${frozenSnapshot},'INSTANTIATED','CH01',${primaryProviderId}::uuid
      )
      on conflict (work_order_number) do nothing
      returning id
     `;
     const workOrderId=inserted[0]?.id||(await tx.$queryRaw`select id from public.dd_work_orders where work_order_number=${workOrderNumber} limit 1`)[0].id;
     job=await tx.dd_jobs.update({where:{id:job.id},data:{work_order_id:workOrderId},select:{id:true,public_reference:true,work_order_id:true}});
    }
    const reconciliation=await reconcileStripePayment(event,tx);
    await tx.serviceRequest.update({where:{id:request.id},data:{status:'job_created'}});
    // Queued on the same transaction as the reconciliation it describes: either both commit
    // together, or a failure here rolls back the job/status/reconciliation too, so a Stripe
    // retry starts clean instead of silently losing the notification behind an idempotent replay.
    await publishPaymentReconciled(reconciliation,tx);
    return {status:'RECONCILED',job,reconciliation};
   });
   if(result.status==='IDEMPOTENT_REPLAY')return res.status(200).json({received:true,idempotent:true});
   console.log(`B2C payment accepted; request ${requestId} -> job ${result.job.public_reference}.`);
  }catch(error){console.error('Failed to transition/reconcile paid B2C request:',error.message);return res.status(500).json({error:'Payment received but operational/accounting transition failed'});}
 }else if(changeOrderId){
  try{
   await prisma.$transaction(async tx=>{const reconciliation=await reconcileStripePayment(event,tx);await publishPaymentReconciled(reconciliation,tx);});
  }catch(dbErr){console.error('Failed to reconcile change-order payment:',dbErr.message);return res.status(500).json({error:'Payment received but change-order reconciliation failed'});}
 }
 return res.status(200).json({received:true});
}
