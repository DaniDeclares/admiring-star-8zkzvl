import { createClient } from '@supabase/supabase-js';
import prisma from '../lib/prisma.js';
import { checkoutEligibility, getChannelGovernanceDecision, resolveGovernedChannelPrice, getGovernedCommercialOffer, normalizeChannel, resolveGovernedPrice, resolveVerifiedCommunity, resolveCH01CommercialSelection } from '../src/lib/operations/governedCommercialGate2026.js';

const CHANNELS_BY_DIVISION=Object.freeze({'01':['B2C','B2B_APT'],'02':['B2B_APT','B2B_RE','B2B','B2G'],'03':['B2B_RE','B2B_APT','B2B'],'04':['B2B','B2B_RE','B2B_APT','B2G'],'05':['B2C','B2B_APT','B2B_RE','B2G'],'06':['B2B','B2B_RE','B2G'],'07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'08':['B2B_RE','B2B','B2G'],'09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'10':['B2C','B2B_APT','B2B_RE','B2B'],'11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'13':['B2B_APT','B2B_RE','B2B','B2G']});
const json=(res,status,payload)=>res.status(status).json(payload);
const adminClient=()=>{const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('COMMERCIAL_DATABASE_UNAVAILABLE');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});};


const specialRows=async()=>prisma.$queryRawUnsafe(`
 SELECT s.service_id AS "legacyServiceId", s.service_name AS "legacyName", s.family,
        s.unit, s.price, s.market, s.active,
        m.canonical_sku AS "canonicalSku", m.service_name AS "canonicalName"
 FROM public.danis_specials_offers s
 LEFT JOIN LATERAL (
   SELECT m.canonical_sku, m.service_name
   FROM public.dd_master_service_universe m
   WHERE m.lifecycle_status='CANONICAL_ACTIVE'
     AND (EXISTS (SELECT 1 FROM regexp_split_to_table(coalesce(m.legacy_ids_aliases,''),'[;,]') a WHERE trim(a)=s.service_id)
       OR lower(trim(s.service_name))=lower(trim(m.service_name)))
   ORDER BY CASE WHEN EXISTS (SELECT 1 FROM regexp_split_to_table(coalesce(m.legacy_ids_aliases,''),'[;,]') a WHERE trim(a)=s.service_id) THEN 0 ELSE 1 END, m.updated_at DESC
   LIMIT 1
 ) m ON true
 WHERE s.active=true ORDER BY s.service_id`);

const governedCatalog=async()=>prisma.$queryRawUnsafe(`
 SELECT o.canonical_sku AS "serviceId", o.service_name AS name, LPAD(o.division::text,2,'0') AS division,
        o.commercial_offer_status AS "commercialOfferStatus", o.fulfillment_gate_status AS "fulfillmentGateStatus",
        o.pricing_rule_count AS "pricingRuleCount", o.market_rule_count AS "marketRuleCount",
        o.channel_availability_count AS "channelAvailabilityCount", o.authorized_provider_capability_count AS "authorizedProviderCapabilityCount",
        o.priced_channel_count AS "pricedChannelCount", o.ch01_a_priced AS "ch01APriced", o.ch01_b_priced AS "ch01BPriced",
        s.service_family AS family, s.description, s.starting_price AS "baseCustomerPrice", s.public_price_low AS "publicPriceLow",
        s.public_price_high AS "publicPriceHigh", s.public_price_display AS "publicPriceDisplay", s.pricing_type AS model,
        s.billing_cycle AS "billingCycle", s.resident_discount_eligible AS "residentDiscountEligible", s.commercial_status AS status,
        s.id AS "runtimeServiceId",
        rc.release_state AS "releaseState", rc.blocking_gate AS "blockingGate",
        m.internal_cost AS "internalCost", m.margin_economics AS "marginEconomics",
        o.ch01_a_priced AS "ch01LockedActivePricing"
 FROM public.dd_governed_service_offers o JOIN public.services s ON s.id=o.runtime_service_id
 LEFT JOIN public.dd_service_release_contract_v1 rc ON rc.canonical_sku=o.canonical_sku
 LEFT JOIN LATERAL (
   SELECT m.internal_cost, m.margin_economics
   FROM public.dd_master_service_universe m
   WHERE m.canonical_sku=o.canonical_sku
     AND m.lifecycle_status='CANONICAL_ACTIVE'
   ORDER BY m.updated_at DESC
   LIMIT 1
 ) m ON true
 WHERE o.commercial_offer_status IN ('SELL_NOW','INTAKE_ONLY') ORDER BY o.division, o.service_name`);

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
   const [rows,specials,frontDoors]=await Promise.all([
     governedCatalog(),
     specialRows(),
     (async()=>{const {data,error}=await adminClient().from('dd_channel_front_doors').select('channel_code,front_door_code,front_door_name,audience,customer_promise,primary_triggers,required_context,public_navigation_order').eq('status','LOCKED').order('channel_code').order('public_navigation_order');if(error)throw error;return (data||[]).map(x=>({channelCode:x.channel_code,frontDoorCode:x.front_door_code,frontDoorName:x.front_door_name,audience:x.audience,customerPromise:x.customer_promise,primaryTriggers:x.primary_triggers,requiredContext:x.required_context,navigationOrder:x.public_navigation_order}));})()
   ]);
   const byCanonical=new Map(),unmapped=[];
   for(const s of specials){if(s.canonicalSku){if(!byCanonical.has(s.canonicalSku))byCanonical.set(s.canonicalSku,[]);byCanonical.get(s.canonicalSku).push(s);}else unmapped.push(s);}
   const services=rows.map(s=>{const gate=checkoutEligibility(s,{channel:'CH01',subchannel:'CH01-A'});return {...s,market:'GA',checkoutEligible:gate.eligible,intakeAvailable:true,approvedSpecialOfferCount:(byCanonical.get(s.serviceId)||[]).length,approvedSpecialOffers:(byCanonical.get(s.serviceId)||[])};});
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
}catch(error){console.error('Service verification failed:',error);return json(res,400,{error:'We could not confirm this service right now. Please try again or contact DANI DECLARES.'});}}
