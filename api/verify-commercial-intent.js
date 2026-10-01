import { createClient } from '@supabase/supabase-js';
import { checkoutEligibility, getChannelGovernanceDecision, resolveGovernedChannelPrice, getGovernedCommercialOffer, normalizeChannel, resolveGovernedPrice, resolveVerifiedCommunity, resolveCH01CommercialSelection } from '../src/lib/operations/governedCommercialGate2026.js';

const CHANNELS_BY_DIVISION=Object.freeze({'01':['B2C','B2B_APT'],'02':['B2B_APT','B2B_RE','B2B','B2G'],'03':['B2B_RE','B2B_APT','B2B'],'04':['B2B','B2B_RE','B2B_APT','B2G'],'05':['B2C','B2B_APT','B2B_RE','B2G'],'06':['B2B','B2B_RE','B2G'],'07':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'08':['B2B_RE','B2B','B2G'],'09':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'10':['B2C','B2B_APT','B2B_RE','B2B'],'11':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'12':['B2C','B2B_APT','B2B_RE','B2B','B2G'],'13':['B2B_APT','B2B_RE','B2B','B2G']});
const json=(res,status,payload)=>res.status(status).json(payload);
const adminClient=()=>{const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('COMMERCIAL_DATABASE_UNAVAILABLE');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});};


const readPublicTable=async(table,select='*')=>{
 const {data,error}=await adminClient().from(table).select(select);
 if(error)throw error;
 return data||[];
};

const specialRows=async()=>{
 const [specials,masters]=await Promise.all([
   readPublicTable('danis_specials_offers','service_id,service_name,family,unit,price,market,active'),
   readPublicTable('dd_master_service_universe','canonical_sku,service_name,lifecycle_status,legacy_ids_aliases,updated_at')
 ]);
 const activeMasters=masters.filter(m=>m.lifecycle_status==='CANONICAL_ACTIVE');
 return specials.filter(s=>s.active).map(s=>{
   const aliases=activeMasters.filter(m=>String(m.legacy_ids_aliases||'').split(/[;,]/).map(v=>v.trim()).includes(s.service_id));
   const names=activeMasters.filter(m=>String(m.service_name||'').trim().toLowerCase()===String(s.service_name||'').trim().toLowerCase());
   const candidates=aliases.length?aliases:names;
   candidates.sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0));
   const m=candidates[0];
   return {legacyServiceId:s.service_id,legacyName:s.service_name,family:s.family,unit:s.unit,price:s.price,market:s.market,active:s.active,canonicalSku:m?.canonical_sku||null,canonicalName:m?.service_name||null};
 }).sort((a,b)=>String(a.legacyServiceId).localeCompare(String(b.legacyServiceId)));
};

const governedCatalog=async()=>{
 const [offers,services,contracts,masters]=await Promise.all([
   readPublicTable('dd_governed_service_offers','canonical_sku,service_name,division,commercial_offer_status,fulfillment_gate_status,pricing_rule_count,market_rule_count,channel_availability_count,authorized_provider_capability_count,priced_channel_count,ch01_a_priced,ch01_b_priced,runtime_service_id'),
   readPublicTable('services','id,service_family,description,starting_price,public_price_low,public_price_high,public_price_display,pricing_type,billing_cycle,resident_discount_eligible,commercial_status'),
   readPublicTable('dd_service_release_contract_v1','canonical_sku,release_state,blocking_gate'),
   readPublicTable('dd_master_service_universe','canonical_sku,internal_cost,margin_economics,lifecycle_status,updated_at')
 ]);
 const servicesById=new Map(services.map(s=>[s.id,s]));
 const contractsBySku=new Map(contracts.map(c=>[c.canonical_sku,c]));
 const masterBySku=new Map();
 for(const m of masters.filter(m=>m.lifecycle_status==='CANONICAL_ACTIVE')){
   const current=masterBySku.get(m.canonical_sku);
   if(!current||new Date(m.updated_at||0)>new Date(current.updated_at||0))masterBySku.set(m.canonical_sku,m);
 }
 return offers
   .filter(o=>['SELL_NOW','INTAKE_ONLY'].includes(o.commercial_offer_status))
   .map(o=>{
     const s=servicesById.get(o.runtime_service_id)||{};
     const rc=contractsBySku.get(o.canonical_sku)||{};
     const m=masterBySku.get(o.canonical_sku)||{};
     return {
       serviceId:o.canonical_sku,name:o.service_name,division:String(o.division).padStart(2,'0'),
       commercialOfferStatus:o.commercial_offer_status,fulfillmentGateStatus:o.fulfillment_gate_status,
       pricingRuleCount:o.pricing_rule_count,marketRuleCount:o.market_rule_count,
       channelAvailabilityCount:o.channel_availability_count,
       authorizedProviderCapabilityCount:o.authorized_provider_capability_count,
       pricedChannelCount:o.priced_channel_count,ch01APriced:o.ch01_a_priced,ch01BPriced:o.ch01_b_priced,
       family:s.service_family,description:s.description,baseCustomerPrice:s.starting_price,
       publicPriceLow:s.public_price_low,publicPriceHigh:s.public_price_high,publicPriceDisplay:s.public_price_display,
       model:s.pricing_type,billingCycle:s.billing_cycle,residentDiscountEligible:s.resident_discount_eligible,
       status:s.commercial_status,runtimeServiceId:o.runtime_service_id,
       releaseState:rc.release_state||null,blockingGate:rc.blocking_gate||null,
       internalCost:m.internal_cost||null,marginEconomics:m.margin_economics||null,
       ch01LockedActivePricing:o.ch01_a_priced
     };
   })
   .sort((a,b)=>a.division.localeCompare(b.division)||a.name.localeCompare(b.name));
};
const governedService=async(serviceId)=>getGovernedCommercialOffer(serviceId);

const legacySpecial=async(serviceId)=>{
 const [specials,masters]=await Promise.all([
   readPublicTable('danis_specials_offers','service_id,service_name,family,unit,price,market,active'),
   readPublicTable('dd_master_service_universe','canonical_sku,service_name,lifecycle_status,legacy_ids_aliases,updated_at')
 ]);
 const active=specials.filter(x=>x.active&&x.service_id===serviceId);
 const master=masters.filter(x=>x.lifecycle_status==='CANONICAL_ACTIVE');
 const row=active[0];
 if(!row)return null;
 const aliases=master.filter(m=>String(m.legacy_ids_aliases||'').split(/[;,]/).map(v=>v.trim()).includes(row.service_id));
 const names=master.filter(m=>String(m.service_name||'').trim().toLowerCase()===String(row.service_name||'').trim().toLowerCase());
 const candidates=(aliases.length?aliases:names).sort((a,b)=>new Date(b.updated_at||0)-new Date(a.updated_at||0));
 return {legacyServiceId:row.service_id,legacyName:row.service_name,family:row.family,unit:row.unit,price:row.price,market:row.market,active:row.active,canonicalSku:candidates[0]?.canonical_sku||null};
};

export default async function handler(req,res){let catalogStage='init';try{
 if(req.method==='GET'&&req.query?.catalog==='1'){
   catalogStage='normalize';
   const requestedChannel=normalizeChannel(String(req.query?.channelType||'').trim(),req.query?.channel);
   const requestedSubchannel=String(req.query?.subchannel||'').trim();
   catalogStage='governedCatalog';
   const rows=await governedCatalog();
   catalogStage='specialRows';
   const specials=await specialRows();
   catalogStage='frontDoors';
   const {data:frontDoorRows,error:frontDoorError}=await adminClient().from('dd_channel_front_doors').select('channel_code,front_door_code,front_door_name,audience,customer_promise,primary_triggers,required_context,public_navigation_order').eq('status','LOCKED').order('channel_code').order('public_navigation_order');
   if(frontDoorError)throw frontDoorError;
   const frontDoors=(frontDoorRows||[]).map(x=>({channelCode:x.channel_code,frontDoorCode:x.front_door_code,frontDoorName:x.front_door_name,audience:x.audience,customerPromise:x.customer_promise,primaryTriggers:x.primary_triggers,requiredContext:x.required_context,navigationOrder:x.public_navigation_order}));
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
}catch(error){console.error('Service verification failed:',error);const preview=req.method==='GET'&&req.query?.catalog==='1'&&(req.netlifyContext==='deploy-preview'||req.netlifyContext==='branch-deploy');return json(res,400,{error:'We could not confirm this service right now. Please try again or contact DANI DECLARES.',...(preview?{debugStage:catalogStage,debugError:String(error?.message||error)}:{})});}}
