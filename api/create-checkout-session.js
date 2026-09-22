import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { checkoutEligibility, getGovernedCommercialOffer, getChannelFromRequest, resolveVerifiedCommunity, resolveCH01CommercialSelection } from '../src/lib/operations/governedCommercialGate2026.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const json = (res,status,payload)=>res.status(status).json(payload);
const siteOrigin = req=>`${req.headers['x-forwarded-proto']||'https'}://${req.headers['x-forwarded-host']||req.headers.host}`;
const VALID_CH01_SUBCHANNELS=new Set(['CH01-A','CH01-B']);
const QUOTE_PRICING_TYPES=new Set(['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE']);

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Checkout only accepts submitted service requests.'});
 if(!stripe)return json(res,500,{error:'Secure checkout is temporarily unavailable. Please contact DANI DECLARES.'});
 try{
  const body=req.body||{};
  const requestId=String(body.requestId||'').trim(), serviceId=String(body.serviceId||'').trim(), email=String(body.email||'').trim();
  if(!requestId||!serviceId||!email)return json(res,400,{error:'Please complete the service request before payment.'});
  const request=await prisma.serviceRequest.findUnique({where:{id:requestId}});
  if(!request)return json(res,404,{error:'The service request could not be found. Please submit the request again.'});
  if(String(request.status||'').toLowerCase()!=='payment_pending')return json(res,409,{error:'This request is not currently awaiting payment.'});
  const channel=getChannelFromRequest(request);
  if(channel!=='CH01')return json(res,400,{error:'Online checkout is currently limited to Resident Concierge requests.'});
  const intent=request.property_details?.commercialIntent||{};
  const requestedServiceId=String(intent.serviceId||request.property_details?.pricingServiceId||'').trim();
  if(requestedServiceId!==serviceId)return json(res,422,{error:'Payment service does not match the submitted service request.'});
  const requestedSubchannel=String(intent.subchannelCode||request.property_details?.operationsRouting?.subchannelCode||body.subchannelCode||'').trim();
  if(requestedSubchannel && !VALID_CH01_SUBCHANNELS.has(requestedSubchannel))return json(res,400,{error:'Please select a valid resident subchannel before payment.'});
  const frontDoorCode=String(intent.frontDoorCode||request.property_details?.frontDoorCode||'').trim();
  const { verified: isVerifiedCommunityResident } = await resolveVerifiedCommunity(req);
  const canonicalSelection=await resolveCH01CommercialSelection({
   serviceId,
   frontDoorCode,
   subchannelCode:requestedSubchannel,
   isVerifiedCommunityResident
  });
  if(!canonicalSelection.allowed)return json(res,409,{error:'This resident service is not currently authorized for payment through the submitted starting point.',reason:canonicalSelection.reason});
  const subchannel=canonicalSelection.subchannel;
  const offer=await getGovernedCommercialOffer(canonicalSelection.serviceId);
  const quoteRequired=QUOTE_PRICING_TYPES.has(String(offer?.pricingType||'').toUpperCase());
  const gate=checkoutEligibility(offer,{channel,subchannel,isVerifiedCommunityResident});
  if(!gate.eligible&&!(quoteRequired&&gate.reason==='QUOTE_REQUIRED'))return json(res,409,{error:'This service is not currently eligible for online payment.',reason:gate.reason});
  const estimate=await prisma.dd_estimates.findFirst({where:{service_request_id:request.id},orderBy:{created_at:'desc'},select:{id:true,estimated_total:true,deposit_due:true,estimate_status:true,economics_status:true,assignment_readiness_status:true}});
  if(!estimate)return json(res,422,{error:'No frozen estimate was found for this payment request.'});
  const frozenAmount=Number(estimate.estimated_total),governedAmount=Number(gate.price);
  if(!Number.isFinite(frozenAmount)||frozenAmount<=0)return json(res,422,{error:'The frozen estimate total could not be securely verified before payment.'});
  if(!quoteRequired&&(!Number.isFinite(governedAmount)||governedAmount<=0||Math.round(frozenAmount*100)!==Math.round(governedAmount*100)))return json(res,409,{error:'The frozen request price no longer matches the governed commercial price. Payment has been blocked and the request needs reconciliation.'});
  if(String(estimate.estimate_status||'').toLowerCase()!=='approved')return json(res,409,{error:'The estimate is not approved for payment.'});
  if(quoteRequired&&(estimate.economics_status!=='PASS'||estimate.assignment_readiness_status!=='READY'))return json(res,409,{error:'The quote is not commercially ready for initial payment.'});
  const depositDue=Number(estimate.deposit_due);
  const initialPayment=quoteRequired&&Number.isFinite(depositDue)&&depositDue>0&&depositDue<frozenAmount;
  const paymentAmount=initialPayment?depositDue:frozenAmount;
  const paymentType=initialPayment?'INITIAL_PAYMENT':'FULL_PAYMENT';
  const recurring=String(offer.billingCycle||'').toLowerCase()==='month';
  const paymentMetadata={request_id:requestId,service_id:serviceId,estimate_id:estimate.id,channel,subchannel,payment_type:paymentType,full_estimate_amount:String(frozenAmount),deposit_due:String(initialPayment?depositDue:frozenAmount),balance_due:String(Math.max(frozenAmount-paymentAmount,0))};
  const params={mode:recurring?'subscription':'payment',customer_email:email,line_items:[{price_data:{currency:'usd',unit_amount:Math.round(paymentAmount*100),product_data:{name:initialPayment?`${offer.name} — Initial Payment`:offer.name,metadata:paymentMetadata},...(recurring?{recurring:{interval:'month'}}:{})},quantity:1}],metadata:paymentMetadata,...(recurring?{}:{payment_intent_data:{metadata:paymentMetadata}}),success_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&paid=1&request_id=${encodeURIComponent(requestId)}`,cancel_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&canceled=1&request_id=${encodeURIComponent(requestId)}`};
  const session=await stripe.checkout.sessions.create(params,{idempotencyKey:`dani-checkout:${requestId}:${paymentType}`});
  return json(res,200,{success:true,url:session.url,sessionId:session.id});
 }catch(error){console.error('Stripe checkout creation failed:',error);return json(res,500,{error:'Secure checkout could not be opened. Please try again or contact DANI DECLARES.'});}
}
