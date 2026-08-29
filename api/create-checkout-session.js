import Stripe from 'stripe';
import prisma from '../lib/prisma.js';
import { getCommercialRecord, isCanonicalActive } from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';

const stripe=process.env.STRIPE_SECRET_KEY?new Stripe(process.env.STRIPE_SECRET_KEY):null;
const json=(res,status,payload)=>res.status(status).json(payload);
const siteOrigin=req=>`${req.headers['x-forwarded-proto']||'https'}://${req.headers['x-forwarded-host']||req.headers.host}`;
const CHANNELS_BY_DIVISION={
 '01':['B2C','B2B_APT'],'02':['B2B_APT','B2B_RE','B2B','B2G'],'03':['B2B_RE','B2B_APT','B2B'],'04':['B2B','B2B_RE','B2B_APT','B2G'],'05':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'06':['B2B','B2B_RE','B2G'],'07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'08':['B2B_RE','B2B','B2G'],'09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'10':['B2C','B2B_APT','B2B_RE','B2B'],'11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'13':['B2B_APT','B2B_RE','B2B','B2G']
};

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Checkout only accepts submitted service requests.'});
 if(!stripe)return json(res,500,{error:'Secure checkout is temporarily unavailable. Please contact DANI DECLARES.'});
 try{
  const body=req.body||{};
  const serviceId=String(body.serviceId||'').trim(),requestId=String(body.requestId||'').trim(),email=String(body.email||'').trim(),channelType=String(body.channelType||'B2C').trim();
  const isApartmentResident=Boolean(body.isResident)&&String(body.subchannelCode||'')==='CH01-B';
  if(!requestId||!email||!serviceId)return json(res,400,{error:'Please complete the service request before payment.'});

  const registryRecord=getCommercialRecord(serviceId);
  let record=registryRecord;
  if(!record){
    const rows=await prisma.$queryRawUnsafe(`SELECT sku,name,LPAD(division_id::text,2,'0') AS division,starting_price,pricing_type,billing_cycle,resident_discount_eligible,commercial_status FROM public.services WHERE sku=$1 LIMIT 1`,serviceId);
    const db=rows?.[0];
    if(db)record={serviceId:db.sku,name:db.name,division:db.division,baseCustomerPrice:db.starting_price==null?null:Number(db.starting_price),pricingType:db.pricing_type,billingCycle:db.billing_cycle,residentDiscountEligible:Boolean(db.resident_discount_eligible),status:db.commercial_status};
  }
  if(!record||record.status!=='CANONICAL_ACTIVE'||(registryRecord&&!isCanonicalActive(registryRecord)))return json(res,404,{error:'This service is not currently available for online payment.'});
  const allowed=CHANNELS_BY_DIVISION[record.division]||[];
  if(channelType&&!allowed.includes(channelType))return json(res,400,{error:'This service is not currently offered for the selected customer type. Please submit a general request and we’ll help you find the right option.'});

  let amount=null;
  let recurring=false;
  if(registryRecord){
    amount=resolveCommercialPrice({baseServiceId:serviceId,isVerifiedResident:isApartmentResident,hasHeavySoilTier2:false});
    recurring=record.billingCycle==='month';
  }else{
    const type=String(record.pricingType||'').toUpperCase();
    const directTypes=['FIXED','FIXED_FLAT','FLAT','PER_VISIT','PER_ITEM','PER_HOUR'];
    if(!directTypes.includes(type)||record.baseCustomerPrice==null)return json(res,400,{error:'This service needs a quote before payment. Your request is saved and we’ll follow up with the price.'});
    amount=Number(record.baseCustomerPrice);
    if(isApartmentResident&&record.residentDiscountEligible)amount=Math.round(amount*.85*100)/100;
    recurring=record.billingCycle==='month';
  }
  if(!Number.isFinite(amount)||amount<=0)return json(res,400,{error:'This service needs a quote before payment. Your request is saved and we’ll follow up with the price.'});

  const session=await stripe.checkout.sessions.create({
    mode:recurring?'subscription':'payment',
    customer_email:email,
    line_items:[{price_data:{currency:'usd',unit_amount:Math.round(amount*100),product_data:{name:record.name,metadata:{service_id:serviceId}},...(recurring?{recurring:{interval:'month'}}:{})},quantity:1}],
    metadata:{request_id:requestId,service_id:serviceId,channel:channelType,subchannel:String(body.subchannelCode||'')},
    payment_intent_data:recurring?undefined:{metadata:{request_id:requestId,service_id:serviceId}},
    success_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&paid=1&request_id=${encodeURIComponent(requestId)}`,
    cancel_url:`${siteOrigin(req)}/request-service?service=${encodeURIComponent(serviceId)}&canceled=1&request_id=${encodeURIComponent(requestId)}`
  });
  return json(res,200,{success:true,url:session.url});
 }catch(error){console.error('Stripe checkout creation failed:',error);return json(res,500,{error:'Secure checkout could not be opened. Please try again or contact DANI DECLARES.'})}
}
