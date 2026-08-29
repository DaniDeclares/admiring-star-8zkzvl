import Stripe from 'stripe';
import { getCommercialRecord, isCanonicalActive } from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';
const stripe=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
const json=(res,status,payload)=>res.status(status).json(payload);
const siteOrigin=req=>`${req.headers['x-forwarded-proto']||'https'}://${req.headers['x-forwarded-host']||req.headers.host}`;
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});if(!stripe)return json(res,500,{error:'Stripe checkout is not configured.'});
 try{const body=req.body||{};const serviceId=String(body.serviceId||'').trim();const requestId=String(body.requestId||'').trim();const email=String(body.email||'').trim();const channelType=String(body.channelType||'B2C').trim();const record=getCommercialRecord(serviceId);
  if(!requestId||!email||!record||!isCanonicalActive(record))return json(res,400,{error:'A valid canonical service request is required before payment.'});
  if(record.channel!=='B2C_RETAIL'||channelType!=='B2C')return json(res,400,{error:'This offer is not directly purchasable through the resident checkout path. Submit the request for commercial review instead.'});
  const amount=resolveCommercialPrice({baseServiceId:serviceId,isVerifiedResident:false,hasHeavySoilTier2:false});if(!Number.isFinite(amount)||amount<=0)return json(res,400,{error:'This service requires quote/SOW handling and cannot be charged directly.'});
  const recurring=record.billingCycle==='month'?{interval:'month'}:null;const session=await stripe.checkout.sessions.create({mode:recurring?'subscription':'payment',customer_email:email,line_items:[{price_data:{currency:'usd',unit_amount:Math.round(amount*100),product_data:{name:record.name,description:record.pricingLabel,metadata:{service_id:record.serviceId,division:record.division}},...(recurring?{recurring}:{})},quantity:1}],metadata:{request_id:requestId,service_id:record.serviceId,channel:'CH01',commercial_status:record.status},payment_intent_data:recurring?undefined:{metadata:{request_id:requestId,service_id:record.serviceId}},success_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&paid=1&request_id=${encodeURIComponent(requestId)}`,cancel_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&canceled=1&request_id=${encodeURIComponent(requestId)}`});
  return json(res,200,{success:true,sessionId:session.id,url:session.url,amount,serviceId});
 }catch(error){console.error('Canonical Stripe checkout creation failed:',error);return json(res,500,{error:'Unable to create secure checkout session.'})}}
