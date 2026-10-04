import { createClient } from '@supabase/supabase-js';

const ECONOMIC_MARGIN_FLOOR_PERCENT = 50;

function parseEconomicMarginPercent(value) {
  const matches = String(value || '').match(/(?:\(|=|margin\s*)\s*(-?\d+(?:\.\d+)?)\s*%/gi) || [];
  if (!matches.length) return null;
  const last = matches[matches.length - 1].match(/(-?\d+(?:\.\d+)?)\s*%/);
  return last ? Number(last[1]) : null;
}

export function economicGateFromOffer(offer) {
  const cost = String(offer?.internalCost || '').trim();
  const economics = String(offer?.marginEconomics || '').trim();
  if (!cost || !economics) return { cleared: false, reason: 'ECONOMICS_NOT_RECONCILED', marginPercent: null };
  const unresolved = /PENDING_RECONCILIATION|DRAFT|NOT AN AUDITED|NEEDS DANIELLE|PRICE MISMATCH|FLAGGED, NOT RESOLVED|PROVISIONAL|PLANNING ASSUMPTION/i;
  if (unresolved.test(cost) || unresolved.test(economics)) {
    return { cleared: false, reason: 'ECONOMICS_NOT_RECONCILED', marginPercent: parseEconomicMarginPercent(economics) };
  }
  const marginPercent = parseEconomicMarginPercent(economics);
  if (marginPercent == null) return { cleared: false, reason: 'ECONOMICS_MARGIN_UNVERIFIABLE', marginPercent: null };
  if (marginPercent < ECONOMIC_MARGIN_FLOOR_PERCENT) {
    return { cleared: false, reason: 'ECONOMICS_BELOW_50_MARGIN_FLOOR', marginPercent };
  }
  return { cleared: true, reason: 'ECONOMICS_CLEARED', marginPercent };
}

const QUOTE_REQUIRED_MODELS = new Set([
  'BESPOKE_SOW',
  'SOW',
  'SOW_PROCUREMENT',
  'QUOTE',
  'STARTING_AT',
  'CONFIGURED',
  'VARIABLE_QUOTE',
]);

const INTAKE_TO_CHANNEL = Object.freeze({
  B2C: 'CH01',
  B2B_APT: 'CH02',
  B2B_RE: 'CH03',
  B2B: 'CH04',
  B2G: 'CH05',
});

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

export function normalizeChannel(channelType, channel) {
  const normalizedType = String(channelType || '').trim().toUpperCase();
  return INTAKE_TO_CHANNEL[normalizedType] || String(channel || '').trim().toUpperCase();
}

export async function getGovernedCommercialOffer(serviceId) {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: offer } = await admin.from('dd_governed_service_offers').select('canonical_sku,service_name,division,commercial_offer_status,fulfillment_gate_status,channel_availability_count,authorized_provider_capability_count,priced_channel_count,ch01_a_priced,ch01_b_priced,runtime_service_id,updated_at').eq('canonical_sku',serviceId).neq('commercial_offer_status','DO_NOT_SELL').order('updated_at',{ascending:false}).limit(1).maybeSingle();
  if (!offer) return null;
  const [{ data: service }, { data: release }, { data: master }, { data: pricing }, { data: subPricing }] = await Promise.all([
    admin.from('services').select('id,pricing_type,billing_cycle,starting_price,public_price_low,public_price_high,resident_discount_eligible').eq('id',offer.runtime_service_id).maybeSingle(),
    admin.from('dd_service_release_contract_v1').select('release_state,blocking_gate').eq('canonical_sku',serviceId).maybeSingle(),
    admin.from('dd_master_service_universe').select('internal_cost,margin_economics').eq('canonical_sku',serviceId).eq('lifecycle_status','CANONICAL_ACTIVE').order('updated_at',{ascending:false}).limit(1).maybeSingle(),
    admin.from('dd_service_pricing_rules').select('base_price_cents').eq('service_id',offer.runtime_service_id).eq('channel_code','CH01').eq('status','ACTIVE').eq('lock_status','LOCKED').order('effective_date',{ascending:false}).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle(),
    admin.from('dd_service_market_pricing_rules').select('price_override_cents').eq('service_id',offer.runtime_service_id).eq('channel_code','CH01').eq('subchannel_code','CH01-B').eq('status','ACTIVE').gt('price_override_cents',0).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle()
  ]);
  return { serviceId:offer.canonical_sku, name:offer.service_name, division:String(offer.division).padStart(2,'0'), commercialOfferStatus:offer.commercial_offer_status, fulfillmentGateStatus:offer.fulfillment_gate_status, channelAvailabilityCount:offer.channel_availability_count, authorizedProviderCapabilityCount:offer.authorized_provider_capability_count, pricedChannelCount:offer.priced_channel_count, ch01APriced:offer.ch01_a_priced, ch01BPriced:offer.ch01_b_priced, ch01LockedPricingCents:pricing?.base_price_cents ?? null, ch01LockedActivePricing:pricing?.base_price_cents != null, ch01BLockedPricingCents:subPricing?.price_override_cents ?? null, ch01LockedActiveSubchannelPricing:Number(subPricing?.price_override_cents || 0)>0, internalCost:master?.internal_cost ?? null, marginEconomics:master?.margin_economics ?? null, runtimeServiceId:offer.runtime_service_id, pricingType:service?.pricing_type, billingCycle:service?.billing_cycle, baseCustomerPrice:service?.starting_price, publicPriceLow:service?.public_price_low, publicPriceHigh:service?.public_price_high, residentDiscountEligible:service?.resident_discount_eligible, releaseState:release?.release_state || null, blockingGate:release?.blocking_gate || null };
}
export function isQuoteRequired(offer) {
  return QUOTE_REQUIRED_MODELS.has(String(offer?.pricingType || '').toUpperCase())
    || offer?.baseCustomerPrice == null;
}

export function resolveGovernedPrice(offer, { channel, subchannel, isVerifiedCommunityResident } = {}) {
  if (!offer || isQuoteRequired(offer)) return null;
  let price = offer.baseCustomerPrice == null ? null : Number(offer.baseCustomerPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (channel === 'CH01' && subchannel === 'CH01-B' && isVerifiedCommunityResident && offer.residentDiscountEligible) {
    price = Math.round(price * 0.85 * 100) / 100;
  }
  return money(price);
}

export function evaluateChannelGovernanceDecision({ channel, adjudication, availability, pricing } = {}) {
  const channelCode=String(channel||'').trim().toUpperCase();
  if (!['CH02','CH03','CH04','CH05'].includes(channelCode)) {
    return {allowed:false,reason:'CHANNEL_GOVERNANCE_NOT_SUPPORTED'};
  }
  if (!['ACTIVE','ELIGIBLE'].includes(String(availability?.eligibility_status||'').toUpperCase())) {
    return {allowed:false,reason:channelCode+'_CHANNEL_NOT_AVAILABLE'};
  }
  const channelPriceCents=pricing?.base_price_cents == null ? null : Number(pricing.base_price_cents);
  if (channelCode!=='CH02') {
    return {allowed:true,reason:channelCode+'_GOVERNANCE_CLEARED',frontDoor:null,pricingType:pricing?.pricing_type||null,channelPriceCents};
  }
  if (!adjudication) return {allowed:false,reason:'CHANNEL_GOVERNANCE_NOT_FOUND'};
  if (adjudication.disposition!=='FRONT_DOOR_CANDIDATE') return {allowed:false,reason:'CH02_ADJUDICATION_'+adjudication.disposition};
  if (adjudication.cross_channel_review) return {allowed:false,reason:'CH02_CROSS_CHANNEL_REVIEW'};
  if (!pricing) return {allowed:false,reason:'CH02_CHANNEL_PRICING_NOT_LOCKED'};
  return {allowed:true,reason:'CH02_GOVERNANCE_CLEARED',frontDoor:adjudication.proposed_front_door,pricingType:pricing.pricing_type||null,channelPriceCents};
}

export async function getChannelGovernanceDecision(serviceId, channel) {
  if (!serviceId || !channel) return { allowed:false, reason:'CHANNEL_REQUIRED' };
  const channelCode=String(channel).trim().toUpperCase();
  const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { allowed:false, reason:'COMMERCIAL_DATABASE_UNAVAILABLE' };
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const { data: offer }=await admin.from('dd_governed_service_offers').select('runtime_service_id').eq('canonical_sku',serviceId).neq('commercial_offer_status','DO_NOT_SELL').limit(1).maybeSingle();
  if (!offer) return { allowed:false, reason:'CHANNEL_GOVERNANCE_NOT_FOUND' };
  const adjudicationQuery=channelCode==='CH02'
    ? admin.from('dd_ch02_service_adjudication').select('disposition,proposed_front_door,cross_channel_review').eq('channel_code','CH02').eq('sku',serviceId).maybeSingle()
    : Promise.resolve({data:null});
  const [{data:adjudication},{data:availability},{data:pricing}]=await Promise.all([
    adjudicationQuery,
    admin.from('dd_service_channel_availability').select('eligibility_status').eq('service_id',offer.runtime_service_id).eq('channel_code',channelCode).maybeSingle(),
    admin.from('dd_service_pricing_rules').select('pricing_type,base_price_cents,status,lock_status').eq('service_id',offer.runtime_service_id).eq('channel_code',channelCode).eq('status','ACTIVE').eq('lock_status','LOCKED').order('effective_date',{ascending:false}).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle()
  ]);
  return evaluateChannelGovernanceDecision({channel:channelCode,adjudication,availability,pricing});
}
export async function resolveGovernedChannelPrice(offer,{channel,subchannel,isVerifiedCommunityResident}={}) {
  if (!offer) return null;
  const url=process.env.SUPABASE_URL||process.env.REACT_APP_SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  if(channel==='CH01'&&subchannel==='CH01-B'){const {data}=await admin.from('dd_service_market_pricing_rules').select('price_override_cents').eq('service_id',offer.runtimeServiceId).eq('channel_code','CH01').eq('subchannel_code','CH01-B').eq('status','ACTIVE').gt('price_override_cents',0).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle();const cents=Number(data?.price_override_cents||0);return Number.isFinite(cents)&&cents>0?money(cents/100):null;}
  if(channel==='CH01'&&subchannel==='CH01-A'){const {data}=await admin.from('dd_service_pricing_rules').select('base_price_cents').eq('service_id',offer.runtimeServiceId).eq('channel_code','CH01').eq('status','ACTIVE').eq('lock_status','LOCKED').order('effective_date',{ascending:false}).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle();const cents=Number(data?.base_price_cents||0);return Number.isFinite(cents)&&cents>0?money(cents/100):null;}
  if(['CH02','CH03','CH04','CH05'].includes(channel)){const {data}=await admin.from('dd_service_pricing_rules').select('pricing_type,base_price_cents').eq('service_id',offer.runtimeServiceId).eq('channel_code',channel).eq('status','ACTIVE').eq('lock_status','LOCKED').order('effective_date',{ascending:false}).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle();if(!data||QUOTE_REQUIRED_MODELS.has(String(data.pricing_type||'').toUpperCase()))return null;const cents=Number(data.base_price_cents||0);return Number.isFinite(cents)&&cents>0?money(cents/100):null;}
  return resolveGovernedPrice(offer,{channel,subchannel,isVerifiedCommunityResident});
}
export function checkoutEligibility(offer, { channel, subchannel, isVerifiedCommunityResident, channelPricingType, channelPriceCents, hasLockedActivePricing, hasLockedActiveSubchannelPricing } = {}) {
  if (!offer) return { eligible: false, reason: 'NO_GOVERNED_OFFER', price: null };
  if (offer.releaseState !== 'LIVE_READY') return { eligible: false, reason: `SERVICE_NOT_LIVE_READY:${offer.blockingGate || 'RELEASE_CONTRACT'}`, price: null };
  if (offer.commercialOfferStatus !== 'SELL_NOW') return { eligible: false, reason: 'COMMERCIAL_NOT_SELL_NOW', price: null };
  if (offer.fulfillmentGateStatus !== 'READY') return { eligible: false, reason: 'FULFILLMENT_NOT_READY', price: null };
  if (isQuoteRequired(offer)) return { eligible: false, reason: 'QUOTE_REQUIRED', price: null };
  if (['CH02','CH03','CH04','CH05'].includes(channel)) {
    if (!channelPricingType) return { eligible: false, reason: `${channel}_CHANNEL_PRICING_NOT_LOCKED`, price: null };
    if (QUOTE_REQUIRED_MODELS.has(String(channelPricingType).toUpperCase())) return { eligible: false, reason: `${channel}_CHANNEL_QUOTE_REQUIRED`, price: null };
    const lockedChannelPriceCents = Number(channelPriceCents);
    if (!Number.isFinite(lockedChannelPriceCents) || lockedChannelPriceCents <= 0) {
      return { eligible: false, reason: `${channel}_CHANNEL_PRICE_INVALID`, price: null };
    }
  }
  const economics = economicGateFromOffer(offer);
  if (!economics.cleared) return { eligible: false, reason: economics.reason, price: null, marginPercent: economics.marginPercent };
  if (!channel) return { eligible: false, reason: 'CHANNEL_REQUIRED', price: null };
  if (channel === 'CH01' && !['CH01-A', 'CH01-B'].includes(subchannel)) {
    return { eligible: false, reason: 'RESIDENT_SUBCHANNEL_REQUIRED', price: null };
  }
  if (channel === 'CH01' && subchannel === 'CH01-B' && !isVerifiedCommunityResident) {
    return { eligible: false, reason: 'COMMUNITY_RESIDENT_VERIFICATION_REQUIRED', price: null };
  }
  if (channel === 'CH01' && subchannel === 'CH01-A' && offer.ch01LockedActivePricing !== true && hasLockedActivePricing !== true) {
    return { eligible: false, reason: 'CH01_CHANNEL_PRICING_NOT_LOCKED', price: null };
  }
  if (channel === 'CH01' && subchannel === 'CH01-B' && offer.ch01LockedActiveSubchannelPricing !== true && hasLockedActiveSubchannelPricing !== true) {
    return { eligible: false, reason: 'CH01_B_PRICING_NOT_GOVERNED', price: null };
  }
  if (channel !== 'CH01' && Number(offer.channelAvailabilityCount || 0) <= 0) {
    return { eligible: false, reason: 'NO_CHANNEL_AVAILABILITY', price: null };
  }
  if (channel !== 'CH01' && Number(offer.pricedChannelCount || 0) <= 0) {
    return { eligible: false, reason: 'NO_PRICED_CHANNEL', price: null };
  }
  if (Number(offer.authorizedProviderCapabilityCount || 0) <= 0) {
    return { eligible: false, reason: 'NO_AUTHORIZED_PROVIDER_CAPABILITY', price: null };
  }
  return { eligible: true, reason: 'READY_FOR_DIRECT_CHECKOUT', price: resolveGovernedPrice(offer, { channel, subchannel, isVerifiedCommunityResident }), marginPercent: economics.marginPercent };
}

export async function resolveVerifiedCommunity(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return { verified: false, communityId: null };
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { verified: false, communityId: null };
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return { verified: false, communityId: null };
  const { data: identity } = await admin.from('dd_portal_identities').select('organization_id, portal_role').eq('auth_user_id', user.id).eq('is_active', true).maybeSingle();
  if (!identity || identity.portal_role !== 'resident' || !identity.organization_id) return { verified: false, communityId: null };
  return { verified: true, communityId: identity.organization_id };
}

export function getChannelFromRequest(request) {
  const routing = request?.property_details?.operationsRouting || {};
  return normalizeChannel(routing.channel, routing.channel);
}

export async function resolveCH01CommercialSelection({
  serviceId,
  frontDoorCode,
  subchannelCode,
  isVerifiedCommunityResident = false,
} = {}) {
  const canonicalSku = String(serviceId || '').trim();
  const frontDoor = String(frontDoorCode || '').trim();
  const suppliedSubchannel = String(subchannelCode || '').trim();
  if (!canonicalSku) return { allowed: false, reason: 'CH01_SERVICE_REQUIRED' };
  if (!frontDoor) return { allowed: false, reason: 'CH01_FRONT_DOOR_REQUIRED' };

  const derivedSubchannel = isVerifiedCommunityResident ? 'CH01-B' : 'CH01-A';
  if (suppliedSubchannel && suppliedSubchannel !== derivedSubchannel) {
    return { allowed: false, reason: 'CH01_SUBCHANNEL_MISMATCH' };
  }
  const subchannel = derivedSubchannel;
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { allowed: false, reason: 'CH01_DATABASE_UNAVAILABLE' };
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const [{ data: door }, { data: adjudications }] = await Promise.all([
    admin.from('dd_channel_front_doors').select('front_door_code').eq('channel_code','CH01').eq('front_door_code',frontDoor).eq('status','LOCKED').maybeSingle(),
    admin.from('dd_ch01_service_adjudication').select('sku,service_id,service_name,front_door_code,subchannel_scope,disposition,customer_visible_candidate,updated_at,id').eq('channel_code','CH01').eq('status','LOCKED').eq('sku',canonicalSku).eq('front_door_code',frontDoor).eq('customer_visible_candidate',true).in('disposition',['FRONT_DOOR','CONTROLLED_QUOTE']).contains('subchannel_scope',[subchannel]).order('updated_at',{ascending:false}).order('id',{ascending:true}),
  ]);
  if (!door || !adjudications?.length) return { allowed:false, reason:'CH01_CANONICAL_SERVICE_NOT_AUTHORIZED_FOR_FRONT_DOOR' };
  if (adjudications.length > 1) return { allowed:false, reason:'CH01_CANONICAL_SERVICE_RESOLUTION_AMBIGUOUS' };
  const a=adjudications[0];

  const { data: offer } = await admin.from('dd_governed_service_offers').select('canonical_sku,runtime_service_id,service_name,commercial_offer_status,fulfillment_gate_status,ch01_a_priced,ch01_b_priced').eq('canonical_sku',canonicalSku).neq('commercial_offer_status','DO_NOT_SELL').maybeSingle();
  if (!offer || offer.runtime_service_id !== a.service_id) return { allowed:false, reason:'CH01_CANONICAL_SERVICE_NOT_AUTHORIZED_FOR_FRONT_DOOR' };
  const [{ data: service }, { data: release }, { data: pricing }, { data: subPricing }] = await Promise.all([
    admin.from('services').select('pricing_type,billing_cycle,resident_discount_eligible,commercial_status').eq('id',offer.runtime_service_id).maybeSingle(),
    admin.from('dd_service_release_contract_v1').select('release_state,blocking_gate').eq('canonical_sku',canonicalSku).maybeSingle(),
    admin.from('dd_service_pricing_rules').select('base_price_cents,lock_status,status,effective_date,updated_at,id').eq('service_id',offer.runtime_service_id).eq('channel_code','CH01').eq('status','ACTIVE').eq('lock_status','LOCKED').order('effective_date',{ascending:false}).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle(),
    admin.from('dd_service_market_pricing_rules').select('price_override_cents,updated_at,id').eq('service_id',offer.runtime_service_id).eq('channel_code','CH01').eq('subchannel_code','CH01-B').eq('status','ACTIVE').gt('price_override_cents',0).order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(1).maybeSingle(),
  ]);
  const pricingCents=subchannel==='CH01-B'?Number(subPricing?.price_override_cents||0):Number(pricing?.base_price_cents||0);
  const pricingLocked=subchannel==='CH01-B'?pricingCents>0:pricing?.status==='ACTIVE'&&pricing?.lock_status==='LOCKED';
  const price=pricingCents>0?(subchannel==='CH01-B'?money(pricingCents/100):resolveGovernedPrice({baseCustomerPrice:pricingCents/100,residentDiscountEligible:Boolean(service?.resident_discount_eligible),pricingType:service?.pricing_type},{channel:'CH01',subchannel,isVerifiedCommunityResident})):null;
  return {allowed:true,reason:'CH01_CANONICAL_SERVICE_RESOLVED',serviceId:canonicalSku,runtimeServiceId:offer.runtime_service_id,serviceName:offer.service_name||a.service_name,frontDoorCode:frontDoor,subchannel,disposition:a.disposition,pricingType:service?.pricing_type||null,billingCycle:service?.billing_cycle||null,commercialOfferStatus:offer.commercial_offer_status,fulfillmentGateStatus:offer.fulfillment_gate_status,releaseState:release?.release_state||null,blockingGate:release?.blocking_gate||null,ch01APriced:Boolean(offer.ch01_a_priced),ch01BPriced:Boolean(offer.ch01_b_priced),pricingLocked,hasLockedActivePricing:subchannel==='CH01-A'?pricingLocked:true,hasLockedActiveSubchannelPricing:subchannel==='CH01-B'?pricingLocked:true,price};
}
