import { createClient } from '@supabase/supabase-js';
import prisma from '../lib/prisma.js';
import { checkoutEligibility, getChannelGovernanceDecision, resolveGovernedChannelPrice, getGovernedCommercialOffer, normalizeChannel, resolveGovernedPrice, resolveVerifiedCommunity, resolveCH01CommercialSelection } from '../src/lib/operations/governedCommercialGate2026.js';

const CHANNELS_BY_DIVISION=Object.freeze({'01':['B2C','B2B_APT'],'02':['B2B_APT','B2B_RE','B2B','B2G'],'03':['B2B_RE','B2B_APT','B2B'],'04':['B2B','B2B_RE','B2B_APT','B2G'],'05':['B2C','B2B_APT','B2B_RE','B2G'],'06':['B2B','B2B_RE','B2G'],'07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'08':['B2B_RE','B2B','B2G'],'09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'10':['B2C','B2B_APT','B2B_RE','B2B'],'11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'13':['B2B_APT','B2B_RE','B2B','B2G']});
const json=(res,status,payload)=>res.status(status).json(payload);
const adminClient=()=>{const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('COMMERCIAL_DATABASE_UNAVAILABLE');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});};


const specialRows=async()=>{
 const db=adminClient();
 const [{data:specials,error:se},{data:masters,error:me}]=await Promise.all([
  db.from('danis_specials_offers').select('service_id,service_name,family,unit,price,market,active').eq('active',true).order('service_id'),
  db.from('dd_master_service_universe').select('canonical_sku,service_name,legacy_ids_aliases,updated_at').eq('lifecycle_status','CANONICAL_ACTIVE').order('updated_at',{ascending:false})
 ]);
 if(se)throw se;if(me)throw me;
 const ms=masters||[];
 return (specials||[]).map(s=>{const m=ms.find(x=>(x.legacy_ids_aliases||'').split(/[;,]/).map(v=>v.trim()).includes(s.service_id))||ms.find(x=>(x.service_name||'').trim().toLowerCase()===(s.service_name||'').trim().toLowerCase());return {legacyServiceId:s.service_id,legacyName:s.service_name,family:s.family,unit:s.unit,price:s.price,market:s.market,active:s.active,canonicalSku:m?.canonical_sku||null,canonicalName:m?.service_name||null};});
};

const governedCatalog=async()=>{
 const db=adminClient();
 const {data:offers,error:oe}=await db.from('dd_governed_service_offers').select('canonical_sku,service_name,division,commercial_offer_status,fulfillment_gate_status,pricing_rule_count,market_rule_count,channel_availability_count,authorized_provider_capability_count,priced_channel_count,ch01_a_priced,ch01_b_priced,runtime_service_id').in('commercial_offer_status',['SELL_NOW','INTAKE_ONLY']).order('division').order('service_name');
 if(oe)throw oe;
 const runtimeIds=[...new Set((offers||[]).map(x=>x.runtime_service_id).filter(Boolean))];
 const skus=[...new Set((offers||[]).map(x=>x.canonical_sku).filter(Boolean))];
 const [servicesQ,releasesQ,mastersQ]=await Promise.all([
  runtimeIds.length?db.from('services').select('id,service_family,description,starting_price,public_price_low,public_price_high,public_price_display,pricing_type,billing_cycle,resident_discount_eligible,commercial_status').in('id',runtimeIds):Promise.resolve({data:[],error:null}),
  skus.length?db.from('dd_service_release_contract_v1').select('canonical_sku,release_state,blocking_gate').in('canonical_sku',skus):Promise.resolve({data:[],error:null}),
  skus.length?db.from('dd_master_service_universe').select('canonical_sku,internal_cost,margin_economics,updated_at').in('canonical_sku',skus).eq('lifecycle_status','CANONICAL_ACTIVE').order('updated_at',{ascending:false}):Promise.resolve({data:[],error:null})
 ]);
 for(const q of [servicesQ,releasesQ,mastersQ])if(q.error)throw q.error;
 const byService=new Map((servicesQ.data||[]).map(x=>[x.id,x]));
 const byRelease=new Map((releasesQ.data||[]).map(x=>[x.canonical_sku,x]));
 const byMaster=new Map();for(const x of mastersQ.data||[])if(!byMaster.has(x.canonical_sku))byMaster.set(x.canonical_sku,x);
 return (offers||[]).filter(o=>o.runtime_service_id&&byService.has(o.runtime_service_id)).map(o=>{const s=byService.get(o.runtime_service_id),rc=byRelease.get(o.canonical_sku)||{},m=byMaster.get(o.canonical_sku)||{};return {serviceId:o.canonical_sku,name:o.service_name,division:String(o.division||'').padStart(2,'0'),commercialOfferStatus:o.commercial_offer_status,fulfillmentGateStatus:o.fulfillment_gate_status,pricingRuleCount:o.pricing_rule_count,marketRuleCount:o.market_rule_count,channelAvailabilityCount:o.channel_availability_count,authorizedProviderCapabilityCount:o.authorized_provider_capability_count,pricedChannelCount:o.priced_channel_count,ch01APriced:o.ch01_a_priced,ch01BPriced:o.ch01_b_priced,family:s.service_family,description:s.description,baseCustomerPrice:s.starting_price,publicPriceLow:s.public_price_low,publicPriceHigh:s.public_price_high,publicPriceDisplay:s.public_price_display,model:s.pricing_type,billingCycle:s.billing_cycle,residentDiscountEligible:s.resident_discount_eligible,status:s.commercial_status,runtimeServiceId:o.runtime_service_id,releaseState:rc.release_state,blockingGate:rc.blocking_gate,internalCost:m.internal_cost,marginEconomics:m.margin_economics,ch01LockedActivePricing:o.ch01_a_priced};});
};

const governedService=async(serviceId)=>getGovernedCommercialOffer(serviceId);

const legacySpecial=async(serviceId)=>{
 const rows=await prisma.$queryRawUnsafe(`
   SELECT s.service_id AS "legacyServiceId", s.service_name AS "legacyName", s.family, s.unit, s.price, s.market, m.canonical_sku AS "canonicalSku"
   FROM public.danis_specials_offers s
   LEFT JOIN LATERAL (
     SELECT m.canonical_sku FROM public.dd_master_service_universe m
     WHERE m.lifecycle_status='CANONICAL_ACTIVE'
       AND (EXISTS (SELECT 1 FROM regexp_split_to_table(coalesce(m.legacy_ids_aliases,''),'[;,]') a WHERE trim(a)=s.service_id)
         OR lower(trim(s.service_name))=lower(trim(m.service_name)))
     ORDER BY CASE WHEN EXISTS (SELECT 1 FROM regexp_split_to_table(coalesce(m.legacy_ids_aliases,''),'[;,]') a WHERE trim(a)=s.service_id) THEN 0 ELSE 1 END, m.updated_at DESC LIMIT 1
   ) m ON true WHERE s.service_id=$1 AND s.active=true LIMIT 1`,serviceId);
 return rows[0]||null;
};

export default async function handler(req,res){try{
 if(req.method==='GET'&&req.query?.catalog==='1'){
   const requestedChannel=normalizeChannel(String(req.query?.channelType||'').trim(),req.query?.channel);
   const requestedSubchannel=String(req.query?.subchannel||'').trim();
   const [rows,specials,frontDoors]=await Promise.all([
     governedCatalog(),
     specialRows(),
     (async()=>{const {data,error}=await adminClient().from('dd_channel_front_doors').select('channel_code,front_door_code,front_door_name,audience,customer_promise,primary_triggers,required_context,public_navigation_order').eq('status','LOCKED').order('channel_code').order('public_navigation_order');if(error)throw error;return (data||[]).map(x=>({channelCode:x.channel_code,frontDoorCode:x.front_door_code,frontDoorName:x.front_door_name,audience:x.audience,customerPromise:x.customer_promise,primaryTriggers:x.primary_triggers,requiredContext:x.required_context,navigationOrder:x.public_navigation_order}));})()
   ]);
   const byCanonical=new Map(),unmapped=[];
   for(const s of specials){if(s.canonicalSku){if(!byCanonical.has(s.canonicalSku))byCanonical.set(s.canonicalSku,[]);byCanonical.get(s.canonicalSku).push(s);}else unmapped.push(s);}
   const services=rows.map(s=>{const gate=checkoutEligibility(s,{channel:requestedChannel,subchannel:requestedSubchannel});return {...s,market:'GA',checkoutEligible:gate.eligible,checkoutGateReason:gate.reason,intakeAvailable:true,approvedSpecialOfferCount:(byCanonical.get(s.serviceId)||[]).length,approvedSpecialOffers:(byCanonical.get(s.serviceId)||[])};});
   return json(res,200,{success:true,count:services.length,services,frontDoors,approvedLegacyOfferCount:unmapped.length,approvedLegacyOffers:unmapped});
 }
 if(req.method!=='POST')return json(res,405,{error:'This action is not available.'});
 const body=req.body||{},serviceId=String(body.serviceId||'').trim();
 if(!serviceId)return json(res,400,{error:'Please choose a service first.'});
 let db=await governedService(serviceId);
 const special=await legacySpecial(serviceId);
 if(!db&&special?.canonicalSku)db=await governedService(special.canonicalSku);
 if(!db){if(!special)return json(res,404,{error:'That service is not available in the governed or approved legacy commercial catalog.'});return json(res,200,{success:true,serviceId:special.legacyServiceId,serviceName:special.legacyName,legacySource:'DANI_SPECIALS_APPROVED',frozenPriceSnapshot:special.price==null?null:Number(special.price),checkoutEligible:false,intakeAvailable:true,message:'This owner-approved DANI Specials offer is preserved and available for intake. Canonical service mapping is still required before checkout.'});}
 const channelType=String(body.channelType||'').trim(),allowed=CHANNELS_BY_DIVISION[db.division]||[];
 if(channelType&&!allowed.includes(channelType))return json(res,400,{error:'This service is not currently offered for the selected customer type.'});
 const channel=normalizeChannel(channelType,body.channel);
 const { verified: isVerifiedResident } = await resolveVerifiedCommunity(req);
 const requestedFrontDoor=String(body.frontDoorCode||'').trim();
 let subchannel=String(body.subchannelCode||'').trim();
 let channelGovernance={allowed:true,reason:'LEGACY_CHANNEL_GATE'};
 let canonicalSelection=null;
 if(channel==='CH01'){
   canonicalSelection=await resolveCH01CommercialSelection({
     serviceId:db.serviceId,
     frontDoorCode:requestedFrontDoor,
     subchannelCode:subchannel,
     isVerifiedCommunityResident:isVerifiedResident
   });
   if(!canonicalSelection.allowed){
     return json(res,409,{success:false,serviceId:db.serviceId,serviceName:db.name,checkoutEligible:false,intakeAvailable:false,frozenPriceSnapshot:null,message:'This resident service is not currently authorized for the selected starting point.',gateReason:canonicalSelection.reason});
   }
   subchannel=canonicalSelection.subchannel;
 }else if(channel==='CH02'){
   channelGovernance=await getChannelGovernanceDecision(db.serviceId,channel);
 }
 if(!channelGovernance.allowed){
   return json(res,409,{success:false,serviceId:db.serviceId,serviceName:db.name,checkoutEligible:false,intakeAvailable:false,frozenPriceSnapshot:null,message:'This service is not currently available through the selected property-management service path.',gateReason:channelGovernance.reason});
 }
 const gate=checkoutEligibility(db,{channel,subchannel,isVerifiedCommunityResident:isVerifiedResident,channelPricingType:channelGovernance.pricingType});
 const expectedPrice=canonicalSelection?.price ?? await resolveGovernedChannelPrice(db,{channel,subchannel,isVerifiedCommunityResident:isVerifiedResident});
 if(!gate.eligible)return json(res,200,{success:true,serviceId:db.serviceId,serviceName:db.name,legacySource:special?'DANI_SPECIALS_APPROVED':null,frontDoorCode:canonicalSelection?.frontDoorCode||requestedFrontDoor||null,subchannelCode:subchannel||null,frozenPriceSnapshot:gate.reason==='QUOTE_REQUIRED'?null:expectedPrice,checkoutEligible:false,intakeAvailable:true,message:'We can take the request now. A quote or verified fulfillment confirmation is required before payment.',gateReason:gate.reason});
 return json(res,200,{success:true,serviceId:db.serviceId,serviceName:db.name,legacySource:special?'DANI_SPECIALS_APPROVED':null,frontDoorCode:canonicalSelection?.frontDoorCode||requestedFrontDoor||null,subchannelCode:subchannel||null,frozenPriceSnapshot:expectedPrice,checkoutEligible:true,intakeAvailable:true,message:'Price confirmed for this request.'});
}catch(error){console.error('Service verification failed:',error);const diagnosticCode=String(error?.code||error?.name||'UNKNOWN_RUNTIME_ERROR').replace(/[^A-Za-z0-9_-]/g,'').slice(0,64);return json(res,400,{error:'We could not confirm this service right now. Please try again or contact DANI DECLARES.',diagnosticCode});}}
