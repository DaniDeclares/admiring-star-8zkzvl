import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { nextStateAfterPayment, assertTransition } from '../src/lib/operations/workflowStateMachines2026.js';
import { reconcileStripePayment } from '../src/lib/operations/accountingReconciliation2026.js';
import { publishPaymentReconciled } from '../src/lib/operations/eventBroker2026.js';
import { getGovernedCommercialOffer, resolveCH01CommercialSelection } from '../src/lib/operations/governedCommercialGate2026.js';
import { captureServer } from '../src/lib/posthogAnalyticsServer.js';

const secretKey=process.env.STRIPE_SECRET_KEY;
const webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;
const stripe=secretKey?new Stripe(secretKey):null;
const QUOTE_PRICING_TYPES=new Set(['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE']);
export const config={api:{bodyParser:false}};
async function getRawBody(req){const chunks=[];for await(const chunk of req)chunks.push(typeof chunk==='string'?Buffer.from(chunk):chunk);return Buffer.concat(chunks);}
function readChannel(propertyDetails){return propertyDetails?.operationsRouting?.channelType||propertyDetails?.operationsRouting?.channel||null;}
function money(value){return Number(Number(value||0).toFixed(2));}
const GOOGLE_ROUTES_ENDPOINT='https://routes.googleapis.com/directions/v2:computeRoutes';
async function finalizeProposedProviderRoutes(db,estimateId){
 const key=process.env.GOOGLE_MAPS_ROUTES_API_KEY;
 if(!estimateId)return {resolved:0,held:'ESTIMATE_REQUIRED'};
 if(!key){console.warn('Provider route offers held: GOOGLE_MAPS_ROUTES_API_KEY is not configured.');return {resolved:0,held:'ROUTES_API_KEY_MISSING'};}
 const offers=await db.$queryRaw`
  select ao.id,pa.dispatch_latitude origin_lat,pa.dispatch_longitude origin_lng,sr.service_latitude destination_lat,sr.service_longitude destination_lng
  from public.dd_estimate_assignment_offers ao join public.dd_estimates e on e.id=ao.estimate_id join public.service_requests sr on sr.id=e.service_request_id
  join lateral (select dispatch_latitude,dispatch_longitude from public.dd_provider_applications where provider_id=ao.provider_id and dispatch_location_verified_at is not null order by case when application_status='APPROVED' then 0 else 1 end,updated_at desc limit 1) pa on true
  where ao.estimate_id=${estimateId}::uuid and ao.assignment_type='PROVIDER' and ao.status='PROPOSED' and sr.service_latitude is not null and sr.service_longitude is not null and sr.jurisdiction_verified_at is not null
 `;
 let resolved=0,held=0;
 for(const offer of offers){
  try{
   const response=await fetch(GOOGLE_ROUTES_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'routes.distanceMeters,routes.duration'},body:JSON.stringify({origin:{location:{latLng:{latitude:Number(offer.origin_lat),longitude:Number(offer.origin_lng)}}},destination:{location:{latLng:{latitude:Number(offer.destination_lat),longitude:Number(offer.destination_lng)}}},travelMode:'DRIVE',routingPreference:'TRAFFIC_AWARE',computeAlternativeRoutes:false,units:'IMPERIAL'})});
   if(!response.ok){held++;console.error('Google Routes provider routing failed',response.status,await response.text());continue;}
   const body=await response.json(),meters=Number(body?.routes?.[0]?.distanceMeters);
   if(!Number.isFinite(meters)||meters<0){held++;continue;}
   const miles=Math.round((meters/1609.344)*100)/100;
   await db.$queryRaw`select public.dd_finalize_provider_route_offer(${offer.id}::uuid,${miles}::numeric,'GOOGLE_ROUTES_API') as result`;
   resolved++;
  }catch(error){held++;console.error('Provider route finalization held:',error.message);}
 }
 return {resolved,held};
}

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!stripe||!webhookSecret){console.error('Stripe webhooks unconfigured: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.');return res.status(500).json({error:'Stripe webhook configuration missing'});}
 let event;
 try{const rawBody=await getRawBody(req);event=stripe.webhooks.constructEvent(rawBody,req.headers['stripe-signature'],webhookSecret);}catch(err){console.error('Stripe Webhook Signature Verification Failed:',err.message);return res.status(400).send('Webhook Signature Error');}
 const subscriptionEventTypes=new Set(['customer.subscription.updated','customer.subscription.deleted']);
 if(subscriptionEventTypes.has(event.type)){
  const subscription=event.data.object;
  try{
   await prisma.$executeRaw`
    update public.dd_service_subscriptions
    set subscription_status=${String(subscription.status||event.type).toUpperCase()},
        stripe_customer_id=${typeof subscription.customer==='string'?subscription.customer:subscription.customer?.id||null},
        current_period_end=${subscription.current_period_end?new Date(subscription.current_period_end*1000).toISOString():null}::timestamptz,
        canceled_at=${subscription.canceled_at?new Date(subscription.canceled_at*1000).toISOString():event.type==='customer.subscription.deleted'?new Date().toISOString():null}::timestamptz,
        updated_at=now()
    where stripe_subscription_id=${subscription.id}
   `;
   return res.status(200).json({received:true,subscriptionLifecycle:true});
  }catch(error){console.error('Failed to reconcile subscription lifecycle:',error.message);return res.status(500).json({error:'Subscription lifecycle reconciliation failed'});}
 }
 const invoiceEventTypes=new Set(['invoice.finalized','invoice.sent','invoice.paid','invoice.payment_failed','invoice.voided','invoice.marked_uncollectible']);
 if(invoiceEventTypes.has(event.type)){
  const invoice=event.data.object;
  try{
   const localInvoice=await prisma.$queryRaw`
    select id,estimate_id,invoice_status,total_amount,balance_due
    from public.dd_invoices
    where stripe_invoice_id=${invoice.id}
    limit 1
   `;
   let row=localInvoice?.[0];
   if(!row&&invoice.subscription){
    const subscriptionId=typeof invoice.subscription==='string'?invoice.subscription:invoice.subscription?.id;
    const subRows=await prisma.$queryRaw`
      select id,service_request_id,estimate_id,canonical_sku,first_payment_verified_at
      from public.dd_service_subscriptions where stripe_subscription_id=${subscriptionId} limit 1
    `;
    const sub=subRows?.[0];
    if(sub){
     await prisma.$executeRaw`
       update public.dd_service_subscriptions
       set latest_stripe_invoice_id=${invoice.id},
           stripe_customer_id=${typeof invoice.customer==='string'?invoice.customer:invoice.customer?.id||null},
           subscription_status=${event.type==='invoice.paid'?'ACTIVE_PAID':event.type==='invoice.payment_failed'?'PAYMENT_FAILED':String(invoice.status||'OPEN').toUpperCase()},
           first_payment_verified_at=case when ${event.type}='invoice.paid' then coalesce(first_payment_verified_at,now()) else first_payment_verified_at end,
           updated_at=now()
       where id=${sub.id}::uuid
     `;
     if(event.type==='invoice.paid'&&!sub.first_payment_verified_at){
      const paidRequest=await prisma.serviceRequest.findUnique({where:{id:sub.service_request_id}});
      const paidEstimate=sub.estimate_id?await prisma.dd_estimates.findUnique({where:{id:sub.estimate_id}}):null;
      if(!paidRequest||!paidEstimate)throw new Error('Paid subscription is missing its governed request or estimate.');
      const expected=money(Number(paidEstimate.estimated_total)),received=money(Number(invoice.amount_paid||0)/100);
      if(expected<=0||expected!==received)throw new Error('Paid subscription invoice does not match the frozen monthly estimate.');
      let job=await prisma.dd_jobs.findFirst({where:{service_request_id:paidRequest.id},orderBy:{created_at:'desc'}});
      if(!job) job=await prisma.dd_jobs.create({data:{estimate_id:paidEstimate.id,lead_id:paidRequest.leadId||null,service_request_id:paidRequest.id,division_slug:paidEstimate.division_slug||'concierge',job_title:paidRequest.service_needed||paidRequest.service_category||'Dani Declares Membership',job_status:'new',location_address:paidRequest.location_address||null,scope_summary:paidRequest.request_details||null}});
      await prisma.serviceRequest.update({where:{id:paidRequest.id},data:{status:'job_created'}});
      await prisma.$executeRaw`
       insert into public.dd_payment_events(provider_event_id,provider_payment_id,request_id,job_id,event_type,payment_status,amount_received,currency,raw_metadata)
       values(${event.id},${invoice.payment_intent||invoice.id},${paidRequest.id}::uuid,${job.id}::uuid,${event.type},'SUCCEEDED',${received},${invoice.currency||'usd'},${JSON.stringify(invoice.metadata||{})}::jsonb)
       on conflict(provider_event_id) do nothing
      `;
      if(paidEstimate.economics_status==='PASS'&&paidEstimate.active_economics_snapshot_id){ await prisma.$queryRaw`select public.dd_activate_paid_estimate_assignments(${paidEstimate.id}::uuid) as routing`; await finalizeProposedProviderRoutes(prisma,paidEstimate.id); }
     }
     return res.status(200).json({received:true,subscriptionInvoice:true,status:event.type});
    }
   }
   if(!row)return res.status(200).json({received:true,unmappedInvoice:true});
   const statusMap={
    'invoice.paid':'paid',
    'invoice.voided':'void',
    'invoice.marked_uncollectible':'uncollectible',
    'invoice.finalized':'open',
    'invoice.sent':'open',
    'invoice.payment_failed':'open'
   };
   const nextStatus=statusMap[event.type]||row.invoice_status;
   const paidAt=event.type==='invoice.paid'?(invoice.status_transitions?.paid_at?new Date(invoice.status_transitions.paid_at*1000).toISOString():new Date().toISOString()):null;
   await prisma.$transaction(async tx=>{
    const prior=await tx.$queryRaw`select id from public.dd_payment_events where provider_event_id=${event.id} limit 1`;
    if(prior.length)return;
    await tx.$executeRaw`
      update public.dd_invoices
      set invoice_status=${nextStatus},
          stripe_invoice_status=${invoice.status||nextStatus},
          hosted_invoice_url=${invoice.hosted_invoice_url||null},
          stripe_payment_link=${invoice.hosted_invoice_url||null},
          balance_due=${Number(invoice.amount_remaining||0)/100},
          stripe_invoice_paid_at=${paidAt},
          stripe_invoice_last_event_at=now(),
          updated_at=now()
      where id=${row.id}::uuid
    `;
    if(event.type==='invoice.paid'){
      let paymentJob = null;
      let paymentEstimate = null;
      let paymentRequest = null;
      if(row.estimate_id){
        paymentEstimate = await tx.dd_estimates.findUnique({where:{id:row.estimate_id}});
        if(paymentEstimate?.service_request_id){
          paymentRequest = await tx.serviceRequest.findUnique({where:{id:paymentEstimate.service_request_id}});
        }
      }
      const channel = readChannel(paymentRequest?.property_details);
      if(paymentEstimate && paymentRequest && channel === 'B2B_APT'){
        const approvedTotal = Number(paymentEstimate.estimated_total || 0);
        const paidAmount = Number(invoice.amount_paid || invoice.total || 0) / 100;
        if(!Number.isFinite(approvedTotal) || approvedTotal <= 0) throw new Error('Paid CH02 invoice has no valid approved estimate total.');
        if(money(approvedTotal) !== money(paidAmount)) throw new Error('CH02 invoice payment does not match the frozen approved estimate.');
        paymentJob = await tx.dd_jobs.findFirst({where:{service_request_id:paymentRequest.id},orderBy:{created_at:'desc'}});
        if(!paymentJob){
          const lineItems = paymentEstimate.intake_answers?.pricingSnapshot?.lineItems || paymentEstimate.intake_answers?.lineItems || [];
          const primaryName = lineItems[0]?.serviceName || paymentRequest.service_needed || paymentRequest.service_category || 'Property Operations';
          paymentJob = await tx.dd_jobs.create({
            data:{
              estimate_id:paymentEstimate.id,
              lead_id:paymentRequest.leadId || null,
              service_request_id:paymentRequest.id,
              division_slug:paymentEstimate.division_slug || 'propertyops',
              job_title:primaryName,
              job_status:'new',
              location_address:paymentRequest.location_address || paymentEstimate.location_address || null,
              scope_summary:paymentEstimate.client_notes || paymentRequest.request_details || null,
              organization_id:paymentRequest.organization_id || null
            }
          });
        }
        await tx.dd_invoices.update({where:{id:row.id},data:{job_id:paymentJob.id,invoice_status:'paid',balance_due:0,updated_at:new Date()}});
        await tx.serviceRequest.update({where:{id:paymentRequest.id},data:{status:'job_created'}});
      }
      const paymentEvent = await tx.$queryRaw`
        insert into public.dd_payment_events
          (provider_event_id,provider_payment_id,request_id,job_id,invoice_id,event_type,payment_status,amount_received,currency,raw_metadata)
        values
          (${event.id},${invoice.payment_intent||invoice.id},${paymentRequest?.id||null},${paymentJob?.id||null},${row.id}::uuid,${event.type},'SUCCEEDED',
           ${Number(invoice.amount_paid||0)/100},${invoice.currency||'usd'},${JSON.stringify(invoice.metadata||{})}::jsonb)
        returning id
      `;
      if(paymentEstimate?.economics_status==='PASS' && paymentEstimate?.active_economics_snapshot_id){
        await tx.$queryRaw`select public.dd_activate_paid_estimate_assignments(${paymentEstimate.id}::uuid) as routing`;
      }
      if(paymentJob){
        await publishPaymentReconciled({
          paymentEventId: paymentEvent[0].id,
          invoiceId: row.id,
          jobId: paymentJob.id,
          finalTotal: Number(paymentEstimate.estimated_total || 0),
          captured: Number(invoice.amount_paid || 0) / 100,
          balanceDue: 0
        },tx);
      }
    }
   });
   if(event.type==='invoice.paid'&&row.estimate_id) await finalizeProposedProviderRoutes(prisma,row.estimate_id);
   return res.status(200).json({received:true,reconciled:true,invoiceId:row.id,status:nextStatus});
  }catch(error){
   console.error('Failed to reconcile Stripe invoice event:',error.message);
   return res.status(500).json({error:'Stripe invoice event received but reconciliation failed'});
  }
 }
 if(event.type!=='checkout.session.completed')return res.status(200).json({received:true});
 const session=event.data.object,requestId=session.metadata?.request_id,changeOrderId=session.metadata?.change_order_id,paymentType=String(session.metadata?.payment_type||'FULL_PAYMENT').toUpperCase();
 if(requestId&&paymentType==='SUBSCRIPTION'){
  try{
   const subscriptionId=typeof session.subscription==='string'?session.subscription:session.subscription?.id||null;
   if(!subscriptionId)throw new Error('Subscription Checkout completed without a subscription id.');
   await prisma.$executeRaw`
    update public.dd_service_subscriptions
    set stripe_subscription_id=${subscriptionId},
        stripe_customer_id=${typeof session.customer==='string'?session.customer:session.customer?.id||null},
        subscription_status='AWAITING_FIRST_INVOICE_PAYMENT',
        updated_at=now()
    where service_request_id=${requestId}::uuid and canonical_sku=${String(session.metadata?.canonical_sku||session.metadata?.service_id||'')}
   `;
   return res.status(200).json({received:true,subscriptionCheckout:true,fulfillmentDeferred:true});
  }catch(error){console.error('Failed to bind subscription checkout:',error.message);return res.status(500).json({error:'Subscription checkout received but lifecycle binding failed'});}
 }
 if(requestId&&paymentType==='BALANCE_PAYMENT'){
  try{const reconciliation=await prisma.$transaction(async tx=>{const rec=await reconcileStripePayment(event,tx);await publishPaymentReconciled(rec,tx);return rec;});return res.status(200).json({received:true,reconciled:true,paymentType,balanceDue:reconciliation.balanceDue});}
  catch(error){console.error('Failed to reconcile balance payment:',error.message);return res.status(500).json({error:'Balance payment received but reconciliation failed'});}
 }
 if(requestId){
  try{
   const serviceId=String(session.metadata?.service_id||'').trim();
   const requestForResolution=await prisma.serviceRequest.findUnique({where:{id:requestId}});
   if(!requestForResolution)throw new Error(`ServiceRequest ${requestId} not found`);
   const resolutionDetails=requestForResolution.property_details||{};
   const resolutionSubchannel=String(resolutionDetails?.commercialIntent?.subchannelCode||resolutionDetails?.operationsRouting?.subchannelCode||'').trim();
   const resolutionFrontDoor=String(resolutionDetails?.commercialIntent?.frontDoorCode||resolutionDetails?.frontDoorCode||'').trim();
   const canonicalSelection=await resolveCH01CommercialSelection({
    serviceId,
    frontDoorCode:resolutionFrontDoor,
    subchannelCode:resolutionSubchannel,
    isVerifiedCommunityResident:resolutionSubchannel==='CH01-B'
   });
   if(!canonicalSelection.allowed)throw new Error(`CH01 canonical resolution failed: ${canonicalSelection.reason}`);
   const offer=await getGovernedCommercialOffer(canonicalSelection.serviceId);
   if(!offer||offer.commercialOfferStatus!=='SELL_NOW'||offer.fulfillmentGateStatus!=='READY')return res.status(422).json({error:'Payment references a commercial offer that is no longer eligible for checkout.'});
   const quoteRequired=QUOTE_PRICING_TYPES.has(String(offer.pricingType||'').toUpperCase());
   const result=await prisma.$transaction(async tx=>{
    const existing=await tx.$queryRaw`select id,invoice_id from public.dd_payment_events where provider_event_id=${event.id} limit 1`;
    if(existing.length)return {status:'IDEMPOTENT_REPLAY',paymentEventId:existing[0].id,invoiceId:existing[0].invoice_id};
    // PostgreSQL advisory transaction lock serializes duplicate deliveries for this request.
    await tx.$executeRaw`select pg_advisory_xact_lock(hashtextextended(${requestId}, 0))`;
    const request=await tx.serviceRequest.findUnique({where:{id:requestId}});
    if(!request)throw new Error(`ServiceRequest ${requestId} not found`);
    const channel=readChannel(request.property_details);
    if(channel!=='B2C')throw new Error(`Payment webhook cannot auto-create a job for channel ${channel||'UNKNOWN'}`);
    const estimate=await tx.dd_estimates.findFirst({where:{service_request_id:request.id},orderBy:{created_at:'desc'}});
    if(!estimate)throw new Error(`No frozen estimate found for paid request ${request.id}`);
    if(session.metadata?.estimate_id&&String(session.metadata.estimate_id)!==String(estimate.id))throw new Error('Payment estimate metadata does not match the current frozen estimate.');
    const frozenSnapshot=Number(request.property_details?.commercialIntent?.frozenPriceSnapshot),approvedTotal=money(Number(estimate.estimated_total)),paidAmount=money(Number(session.amount_total||0)/100);
    if(!Number.isFinite(approvedTotal)||approvedTotal<=0)throw new Error('Paid request has no valid approved estimate total.');
    if(session.metadata?.full_estimate_amount&&money(Number(session.metadata.full_estimate_amount))!==approvedTotal)throw new Error('Payment metadata does not match the approved estimate total.');
    if(!quoteRequired){
      if(!Number.isFinite(frozenSnapshot)||frozenSnapshot<=0)throw new Error('Paid direct-checkout request has no valid frozen commercial price snapshot.');
      if(approvedTotal!==money(frozenSnapshot))throw new Error('Frozen request price does not match the approved estimate total.');
    }
    if(paymentType==='INITIAL_PAYMENT'){
      const expectedDeposit=money(Number(estimate.deposit_due));
      if(!quoteRequired)throw new Error('Initial payment is only valid for an approved quote.');
      if(estimate.economics_status!=='PASS'||!['PENDING_PAYMENT','READY'].includes(String(estimate.assignment_readiness_status||'').toUpperCase()))throw new Error('Initial payment cannot be accepted for a commercially unresolved quote.');
      if(expectedDeposit<=0||expectedDeposit>=approvedTotal)throw new Error('Approved quote has no valid partial initial payment.');
      if(expectedDeposit!==paidAmount)throw new Error('Initial payment amount does not match the frozen deposit due.');
    }else{
      if(approvedTotal!==paidAmount)throw new Error('Full payment amount does not match the approved estimate total.');
      if(!quoteRequired&&canonicalSelection.price!=null&&money(Number(canonicalSelection.price))!==approvedTotal)throw new Error('Paid request no longer matches the authoritative CH01 commercial price.');
    }
    const metadataServiceId=request.property_details?.commercialIntent?.serviceId||request.property_details?.pricingServiceId;
    if(String(metadataServiceId||'')!==canonicalSelection.serviceId)throw new Error('Payment service metadata does not match the authoritative CH01 service resolution.');
    if(String(request.property_details?.frontDoorCode||request.property_details?.commercialIntent?.frontDoorCode||'')!==canonicalSelection.frontDoorCode)throw new Error('Payment front door does not match the authoritative CH01 service resolution.');
    const currentState=String(request.status||'new').toUpperCase();
    assertTransition('B2C',currentState,'PAID');
    assertTransition('B2C','PAID',nextStateAfterPayment('B2C'));
    let job=await tx.dd_jobs.findFirst({where:{service_request_id:request.id},select:{id:true,public_reference:true,work_order_id:true}});
    if(!job){
     job=await tx.dd_jobs.create({data:{estimate_id:estimate.id,lead_id:request.leadId||null,service_request_id:request.id,division_slug:estimate.division_slug||'concierge',job_title:request.service_needed||request.service_category||'Dani Declares Service',job_status:'new',location_address:request.location_address||null,scope_summary:request.request_details||null},select:{id:true,public_reference:true,work_order_id:true}});
    }
    if(!job.work_order_id){
     const workOrderNumber=`DDWO-${job.public_reference}`;
     // NOTE (2026-09-15): dd_work_orders is forward-looking FOS infrastructure, not the
     // production dispatch authority -- dd_jobs is. Nothing reads primary_provider_id back
     // out of this table today (dd_route_work_order and every portal ignore it). Don't build
     // new dispatch/portal features against this table piecemeal; see the COMMENT ON TABLE
     // for dd_jobs/dd_work_orders for the full boundary decision.
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
    let routingActivation=null;
    if(estimate.economics_status==='PASS' && estimate.active_economics_snapshot_id){
      [routingActivation]=await tx.$queryRaw`select public.dd_activate_paid_estimate_assignments(${estimate.id}::uuid) as routing`;
    }
    await tx.serviceRequest.update({where:{id:request.id},data:{status:'job_created'}});
    if(routingActivation?.routing){
      console.log('Paid-first fulfillment routing activated',routingActivation.routing);
    }
    // Queued on the same transaction as the reconciliation it describes: either both commit
    // together, or a failure here rolls back the job/status/reconciliation too, so a Stripe
    // retry starts clean instead of silently losing the notification behind an idempotent replay.
    await publishPaymentReconciled(reconciliation,tx);
    return {status:'RECONCILED',job,reconciliation,estimateId:estimate.id};
   });
   if(result.status==='IDEMPOTENT_REPLAY')return res.status(200).json({received:true,idempotent:true});
   await finalizeProposedProviderRoutes(prisma,result.estimateId);
   await captureServer('payment_completed',{request_id:requestId,service_id:serviceId,payment_state:'completed',transaction_status:result.status,job_reference:result.job?.public_reference||undefined,route:'/api/stripe-webhook'});
   console.log(`B2C payment accepted; request ${requestId} -> job ${result.job.public_reference}.`);
  }catch(error){await captureServer('payment_reconciliation_failed',{request_id:requestId,service_id:String(session.metadata?.service_id||'').trim()||undefined,error_type:'operational_transition',route:'/api/stripe-webhook'});console.error('Failed to transition/reconcile paid B2C request:',error.message);return res.status(500).json({error:'Payment received but operational/accounting transition failed'});}
 }else if(changeOrderId){
  try{
   await prisma.$transaction(async tx=>{const reconciliation=await reconcileStripePayment(event,tx);await publishPaymentReconciled(reconciliation,tx);});
  }catch(dbErr){console.error('Failed to reconcile change-order payment:',dbErr.message);return res.status(500).json({error:'Payment received but change-order reconciliation failed'});}
 }
 return res.status(200).json({received:true});
}
