import Stripe from 'stripe';
import { getCommercialRecord, isCanonicalActive } from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const json = (res, status, payload) => res.status(status).json(payload);
const siteOrigin = (req) => `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
const INTAKE_TO_CHANNEL = Object.freeze({B2C:'CH01',B2B_APT:'CH02',B2B_RE:'CH03',B2B:'CH04',B2G:'CH05'});
const OFFER_ALLOWED_CHANNELS = Object.freeze({'DNI-01A-009':['CH01'],'DNI-01A-010':['CH01'],'DNI-01C-001':['CH01'],'DNI-01D-002':['CH01'],'DNI-01D-004':['CH01']});
const VALID_CH01_SUBCHANNELS = new Set(['CH01-A','CH01-B']);

export default async function handler(req,res) {
 if(req.method!=='POST') return json(res,405,{error:'Checkout only accepts submitted service requests.'});
 if(!stripe) return json(res,500,{error:'Secure checkout is temporarily unavailable. Please contact DANI DECLARES.'});
 try{
  const body=req.body||{};
  const serviceId=String(body.serviceId||'').trim(), requestId=String(body.requestId||'').trim(), email=String(body.email||'').trim();
  const intakeChannel=String(body.channelType||'').trim(), channel=INTAKE_TO_CHANNEL[intakeChannel]||String(body.channel||'').trim(), subchannel=String(body.subchannelCode||'').trim();
  if(!requestId||!email||!serviceId||!channel) return json(res,400,{error:'Please complete the service request before payment.'});
  if(!['CH01','CH02','CH03','CH04','CH05'].includes(channel)) return json(res,400,{error:'Please select a valid customer channel before payment.'});
  if(channel==='CH01') {
   if(!VALID_CH01_SUBCHANNELS.has(subchannel)) return json(res,400,{error:'Please select a valid resident subchannel before payment.'});
  } else if(subchannel) {
   return json(res,400,{error:'Resident subchannels are only valid for Resident Concierge requests.'});
  }
  // CH01-B is never discounted from an untrusted browser flag. It requires a verified
  // community relationship, which is intentionally not accepted as a client assertion here.
  if(channel==='CH01'&&subchannel==='CH01-B') return json(res,400,{error:'Apartment-resident pricing requires verified community eligibility. Please submit your request and we will confirm your resident benefit before payment.'});
  const record=getCommercialRecord(serviceId);
  if(!record||!isCanonicalActive(record)) return json(res,404,{error:'This service is not currently available for online payment.'});
  const allowedChannels=OFFER_ALLOWED_CHANNELS[serviceId]||[];
  if(!allowedChannels.includes(channel)) return json(res,400,{error:'This service is not currently offered through the selected customer channel. Please submit a general request and we’ll help you find the right option.'});
  const amount=resolveCommercialPrice({baseServiceId:serviceId,isVerifiedResident:channel==='CH01'&&subchannel==='CH01-A'&&body.isResident===true,hasHeavySoilTier2:false});
  if(!Number.isFinite(amount)||amount<=0) return json(res,400,{error:'This service needs a quote before payment. Your request is saved and we’ll follow up with the price.'});
  const recurring=record.billingCycle==='month';
  const session=await stripe.checkout.sessions.create({mode:recurring?'subscription':'payment',customer_email:email,line_items:[{price_data:{currency:'usd',unit_amount:Math.round(amount*100),product_data:{name:record.name,metadata:{service_id:serviceId,channel,subchannel}},...(recurring?{recurring:{interval:'month'}}:{})},quantity:1}],metadata:{request_id:requestId,service_id:serviceId,channel,subchannel,commercial_relationship:record.channel},payment_intent_data:recurring?undefined:{metadata:{request_id:requestId,service_id:serviceId,channel,subchannel}},success_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&paid=1&request_id=${encodeURIComponent(requestId)}`,cancel_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&canceled=1&request_id=${encodeURIComponent(requestId)}`});
  return json(res,200,{success:true,url:session.url});
 }catch(error){console.error('Stripe checkout creation failed:',error);return json(res,500,{error:'Secure checkout could not be opened. Please try again or contact DANI DECLARES.'});}
}
