import prisma from '../lib/prisma.js';
import { getCommercialRecord } from '../src/config/commercialRegistry';
import { resolveCommercialPrice } from '../src/lib/operations/masterCommercialResolver';

const CHANNELS_BY_DIVISION = Object.freeze({
  '01':['B2C','B2B_APT'],'02':['B2B_APT','B2B_RE','B2B','B2G'],'03':['B2B_RE','B2B_APT','B2B'],'04':['B2B','B2B_RE','B2B_APT','B2G'],'05':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'06':['B2B','B2B_RE','B2G'],'07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'08':['B2B_RE','B2B','B2G'],'09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'10':['B2C','B2B_APT','B2B_RE','B2B'],'11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'13':['B2B_APT','B2B_RE','B2B','B2G'],
});
const json=(res,status,payload)=>res.status(status).json(payload);

export default async function handler(req,res){
 try{
  if(req.method==='GET'&&req.query?.catalog==='1'){
   const rows=await prisma.$queryRawUnsafe(`SELECT s.sku AS "serviceId",s.name,LPAD(s.division_id::text,2,'0') AS division,s.service_family AS family,s.starting_price AS "baseCustomerPrice",COALESCE(s.price_note,CASE WHEN s.starting_price IS NULL THEN 'Quote' ELSE 'Starting at $'||s.starting_price::int END) AS "pricingLabel",s.pricing_type AS "pricingType",s.billing_cycle AS "billingCycle",s.resident_discount_eligible AS "residentDiscountEligible",s.commercial_status AS status FROM public.services s WHERE s.commercial_status='CANONICAL_ACTIVE' ORDER BY s.division_id,s.sort_order,s.name`);
   return json(res,200,{success:true,count:rows.length,services:rows.map(row=>({...row,baseCustomerPrice:row.baseCustomerPrice==null?null:Number(row.baseCustomerPrice)}))});
  }
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  const body=req.body||{}; const serviceId=String(body.serviceId||'').trim(); if(!serviceId)return json(res,400,{error:'A canonical service ID is required.'});
  const registryRecord=getCommercialRecord(serviceId); let record=registryRecord;
  if(!record){const rows=await prisma.$queryRawUnsafe(`SELECT sku,name,starting_price,base_price_cents,pricing_type,billing_cycle,resident_discount_eligible,commercial_status,canonical_notes FROM public.services WHERE sku=$1 LIMIT 1`,serviceId);const db=rows?.[0];if(db)record={serviceId:db.sku,name:db.name,division:String(serviceId).slice(4,6),model:db.pricing_type==='SOW'||db.pricing_type==='SOW_PROCUREMENT'?'BESPOKE_SOW':'FIXED_FLAT',baseCustomerPrice:db.starting_price==null?null:Number(db.starting_price),billingCycle:db.billing_cycle,residentDiscountEligible:Boolean(db.resident_discount_eligible),stripeExecutionMode:db.pricing_type==='SOW'||db.pricing_type==='SOW_PROCUREMENT'?'MANUAL_INVOICE':'DYNAMIC_CHECKOUT',providerIsolationLane:'SPECIALIST_NETWORK',status:db.commercial_status,canonicalNotes:db.canonical_notes};}
  if(!record||record.status!=='CANONICAL_ACTIVE')return json(res,404,{error:'Security Block: Targeted service is unavailable or deprecated.'});
  const channelType=String(body.channelType||'').trim(); const allowed=CHANNELS_BY_DIVISION[record.division]||[];
  if(channelType&&!allowed.includes(channelType))return json(res,403,{error:`Channel eligibility blocked: ${serviceId} is not currently offered through ${channelType}.`,serviceId,allowedChannels:allowed});
  const expectedPrice=registryRecord?resolveCommercialPrice({baseServiceId:serviceId,isVerifiedResident:Boolean(body.isResident),hasHeavySoilTier2:Boolean(body.hasHeavySoil),bedrooms:body.bedrooms==null?undefined:Number(body.bedrooms),bathrooms:body.bathrooms==null?undefined:Number(body.bathrooms),totalSquareFootage:body.totalSquareFootage==null?undefined:Number(body.totalSquareFootage)}):record.baseCustomerPrice;
  if(record.model==='BESPOKE_SOW'||expectedPrice==null)return json(res,200,{success:true,commercialStatus:'QUOTE_REQUIRED',serviceId,serviceName:record.name,frozenPriceSnapshot:null,executionMode:record.stripeExecutionMode,targetFulfillmentLane:record.providerIsolationLane,message:'Commercial authority validated; customer price requires SOW/quote review.'});
  return json(res,200,{success:true,commercialStatus:'CANONICAL_ACTIVE',serviceId,serviceName:record.name,frozenPriceSnapshot:Number(expectedPrice),executionMode:record.stripeExecutionMode,targetFulfillmentLane:record.providerIsolationLane,providerEconomics:'PRIVATE_WORK_ORDER_ONLY',message:'Commercial Authority Validated. Safe to snapshot estimate row.'});
 }catch(error){console.error('Commercial intent verification failed:',error);return json(res,400,{error:'Commercial validation rejected.',details:error.message});}
}
