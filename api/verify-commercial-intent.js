import prisma from '../lib/prisma.js';
import { getCommercialRecord } from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';

const CHANNELS_BY_DIVISION=Object.freeze({
 '01':['B2C','B2B_APT'],'02':['B2B_APT','B2B_RE','B2B','B2G'],'03':['B2B_RE','B2B_APT','B2B'],'04':['B2B','B2B_RE','B2B_APT','B2G'],'05':['B2C','B2B_APT','B2B_RE','B2G'],'06':['B2B','B2B_RE','B2G'],'07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'08':['B2B_RE','B2B','B2G'],'09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'10':['B2C','B2B_APT','B2B_RE','B2B'],'11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'13':['B2B_APT','B2B_RE','B2B','B2G']
});
const json=(res,status,payload)=>res.status(status).json(payload);

export default async function handler(req,res){
 try{
  if(req.method==='GET'&&req.query?.catalog==='1'){
   const rows=await prisma.$queryRawUnsafe(`SELECT o.id AS "offerId",o.canonical_sku AS "serviceId",o.service_name AS name,LPAD(o.division::text,2,'0') AS division,s.service_family AS family,s.starting_price AS "baseCustomerPrice",COALESCE(s.public_price_display,s.price_note,CASE WHEN s.starting_price IS NULL THEN 'Request a quote' ELSE 'Starting at $'||s.starting_price::int END) AS "pricingLabel",s.pricing_type AS "pricingType",s.billing_cycle AS "billingCycle",s.resident_discount_eligible AS "residentDiscountEligible",o.commercial_object_type AS "offerType",o.commercial_offer_status AS "commercialOfferStatus",o.fulfillment_gate_status AS "fulfillmentGateStatus",o.pricing_rule_count AS "pricingRuleCount",o.market_rule_count AS "marketRuleCount",o.channel_availability_count AS "channelAvailabilityCount",o.authorized_provider_capability_count AS "authorizedProviderCapabilityCount",o.priced_channel_count AS "pricedChannelCount",o.ch01_a_priced AS "ch01APriced",o.ch01_b_priced AS "ch01BPriced" FROM public.dd_governed_service_offers o LEFT JOIN public.services s ON s.id=o.runtime_service_id ORDER BY o.division::int,o.canonical_sku,o.service_name`);
   return json(res,200,{success:true,count:rows.length,services:rows.map(row=>({...row,baseCustomerPrice:row.baseCustomerPrice==null?null:Number(row.baseCustomerPrice),orderableNow:row.commercialOfferStatus==='SELL_NOW'&&row.fulfillmentGateStatus==='READY',intakeAvailable:true}))});
  }
  if(req.method!=='POST')return json(res,405,{error:'This action is not available.'});
  const body=req.body||{};
  const serviceId=String(body.serviceId||'').trim();
  if(!serviceId)return json(res,400,{error:'Please choose a service first.'});
  const offerRows=await prisma.$queryRawUnsafe(`SELECT o.canonical_sku AS "serviceId",o.service_name AS name,LPAD(o.division::text,2,'0') AS division,o.commercial_offer_status AS "commercialOfferStatus",o.fulfillment_gate_status AS "fulfillmentGateStatus",s.starting_price AS "baseCustomerPrice",s.pricing_type AS model,s.billing_cycle AS "billingCycle",s.resident_discount_eligible AS "residentDiscountEligible",s.commercial_status AS status,s.id AS "runtimeServiceId" FROM public.dd_governed_service_offers o LEFT JOIN public.services s ON s.id=o.runtime_service_id WHERE o.canonical_sku=$1 ORDER BY CASE WHEN o.commercial_offer_status='SELL_NOW' THEN 0 WHEN o.commercial_offer_status='INTAKE_ONLY' THEN 1 ELSE 2 END LIMIT 1`,serviceId);
  const db=offerRows?.[0];
  const registryRecord=getCommercialRecord(serviceId);
  if(!db&&!registryRecord)return json(res,404,{error:'We could not find that service in the current catalog.'});
  const record=registryRecord||{serviceId:db.serviceId,name:db.name,division:db.division,model:String(db.model||'').toUpperCase(),baseCustomerPrice:db.baseCustomerPrice==null?null:Number(db.baseCustomerPrice),billingCycle:db.billingCycle,residentDiscountEligible:Boolean(db.residentDiscountEligible),status:db.status,intent:db.commercialOfferStatus,runtimeServiceId:db.runtimeServiceId};
  if(record.status&&record.status!=='CANONICAL_ACTIVE'&&db?.commercialOfferStatus==='PENDING_RECONCILIATION')return json(res,200,{success:true,serviceId,serviceName:record.name,frozenPriceSnapshot:null,checkoutEligible:false,message:'This service is in catalog review. We can take the request and confirm scope before payment.'});
  const channelType=String(body.channelType||'').trim();
  const allowed=CHANNELS_BY_DIVISION[record.division]||[];
  if(channelType&&!allowed.includes(channelType))return json(res,400,{error:'This service is not currently offered for the selected customer type. Choose another customer type or send us a general request.'});
  const isVerifiedResident=Boolean(body.isVerifiedCommunityResident===true&&body.communityId);
  let expectedPrice;
  if(registryRecord){expectedPrice=resolveCommercialPrice({baseServiceId:serviceId,isVerifiedResident,hasHeavySoilTier2:Boolean(body.hasHeavySoil),bedrooms:body.bedrooms==null?undefined:Number(body.bedrooms),bathrooms:body.bathrooms==null?undefined:Number(body.bathrooms),totalSquareFootage:body.totalSquareFootage==null?undefined:Number(body.totalSquareFootage)});}else{expectedPrice=record.baseCustomerPrice;if(isVerifiedResident&&record.residentDiscountEligible&&expectedPrice!=null)expectedPrice=Math.round(Number(expectedPrice)*.85*100)/100;}
  const type=String(record.model||'').toUpperCase();
  const quoteRequired=['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE'].includes(type)||expectedPrice==null;
  const orderableNow=db?.commercialOfferStatus==='SELL_NOW'&&db?.fulfillmentGateStatus==='READY';
  if(quoteRequired||!orderableNow)return json(res,200,{success:true,serviceId,serviceName:record.name,frozenPriceSnapshot:quoteRequired?null:Number(expectedPrice),checkoutEligible:false,message:'We can take the request now. A quote or verified fulfillment confirmation is required before payment.'});
  return json(res,200,{success:true,serviceId,serviceName:record.name,frozenPriceSnapshot:Number(expectedPrice),checkoutEligible:true,message:'Price confirmed for this request.'});
 }catch(error){console.error('Service verification failed:',error);return json(res,400,{error:'We could not confirm this service right now. Please try again or contact DANI DECLARES.'});}
}
