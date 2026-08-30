import prisma from '../lib/prisma.js';
import { getCommercialRecord } from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';

const CHANNELS_BY_DIVISION=Object.freeze({
 '01':['B2C','B2B_APT'],'02':['B2B_APT','B2B_RE','B2B','B2G'],'03':['B2B_RE','B2B_APT','B2B'],'04':['B2B','B2B_RE','B2B_APT','B2G'],'05':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'06':['B2B','B2B_RE','B2G'],'07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'08':['B2B_RE','B2B','B2G'],'09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'10':['B2C','B2B_APT','B2B_RE','B2B'],'11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'13':['B2B_APT','B2B_RE','B2B','B2G']
});
const json=(res,status,payload)=>res.status(status).json(payload);

export default async function handler(req,res){
 try{
  if(req.method==='GET'&&req.query?.catalog==='1'){
   const rows=await prisma.$queryRawUnsafe(`SELECT s.sku AS "serviceId",s.name,LPAD(s.division_id::text,2,'0') AS division,s.service_family AS family,s.starting_price AS "baseCustomerPrice",COALESCE(s.price_note,CASE WHEN s.starting_price IS NULL THEN 'Request a quote' ELSE 'Starting at $'||s.starting_price::int END) AS "pricingLabel",s.pricing_type AS "pricingType",s.billing_cycle AS "billingCycle",s.resident_discount_eligible AS "residentDiscountEligible" FROM public.services s WHERE s.commercial_status='CANONICAL_ACTIVE' AND COALESCE(s.commercial_intent_status,'FULFILLMENT_GATED')='SELL_NOW' ORDER BY s.division_id,s.sort_order,s.name`);
   return json(res,200,{success:true,count:rows.length,services:rows.map(row=>({...row,baseCustomerPrice:row.baseCustomerPrice==null?null:Number(row.baseCustomerPrice)}))});
  }
  if(req.method!=='POST')return json(res,405,{error:'This action is not available.'});
  const body=req.body||{};
  const serviceId=String(body.serviceId||'').trim();
  if(!serviceId)return json(res,400,{error:'Please choose a service first.'});
  const registryRecord=getCommercialRecord(serviceId);
  let record=registryRecord;
  if(!record){
   const rows=await prisma.$queryRawUnsafe(`SELECT sku,name,LPAD(division_id::text,2,'0') AS division,starting_price,pricing_type,billing_cycle,resident_discount_eligible,commercial_status,commercial_intent_status FROM public.services WHERE sku=$1 LIMIT 1`,serviceId);
   const db=rows?.[0];
   if(db)record={serviceId:db.sku,name:db.name,division:db.division,model:String(db.pricing_type||'').toUpperCase(),baseCustomerPrice:db.starting_price==null?null:Number(db.starting_price),billingCycle:db.billing_cycle,residentDiscountEligible:Boolean(db.resident_discount_eligible),status:db.commercial_status,intent:db.commercial_intent_status};
  }
  if(!record||record.status!=='CANONICAL_ACTIVE'||(record.intent&&record.intent!=='SELL_NOW'))return json(res,404,{error:'This service is not currently available to request online.'});
  const channelType=String(body.channelType||'').trim();
  const allowed=CHANNELS_BY_DIVISION[record.division]||[];
  if(channelType&&!allowed.includes(channelType))return json(res,400,{error:'This service is not currently offered for the selected customer type. Choose another customer type or send us a general request.'});
  let expectedPrice;
  // Apartment-resident eligibility is intentionally not inferred from an untrusted client flag.
  // CH01-B requires a verified community relationship; until the request carries that verified
  // relationship, it cannot receive the CH01-B discount through this public endpoint.
  const isVerifiedResident=Boolean(body.isVerifiedCommunityResident===true && body.communityId);
  if(registryRecord){
   expectedPrice=resolveCommercialPrice({baseServiceId:serviceId,isVerifiedResident,hasHeavySoilTier2:Boolean(body.hasHeavySoil),bedrooms:body.bedrooms==null?undefined:Number(body.bedrooms),bathrooms:body.bathrooms==null?undefined:Number(body.bathrooms),totalSquareFootage:body.totalSquareFootage==null?undefined:Number(body.totalSquareFootage)});
  }else{
   expectedPrice=record.baseCustomerPrice;
   if(isVerifiedResident&&record.residentDiscountEligible&&expectedPrice!=null)expectedPrice=Math.round(Number(expectedPrice)*.85*100)/100;
  }
  const type=String(record.model||'').toUpperCase();
  const quoteRequired=['BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED'].includes(type)||expectedPrice==null;
  if(quoteRequired)return json(res,200,{success:true,serviceId,serviceName:record.name,frozenPriceSnapshot:null,checkoutEligible:false,message:'We received enough information to review this service. A quote is required before payment.'});
  return json(res,200,{success:true,serviceId,serviceName:record.name,frozenPriceSnapshot:Number(expectedPrice),checkoutEligible:true,message:'Price confirmed for this request.'});
 }catch(error){console.error('Service verification failed:',error);return json(res,400,{error:'We could not confirm this service right now. Please try again or contact DANI DECLARES.'});}
}
