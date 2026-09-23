import { createClient } from '@supabase/supabase-js';
import prisma from '../../../lib/prisma.js';


function queryRaw(strings, ...values) {
  let sql = '';
  for (let i = 0; i < strings.length; i += 1) {
    sql += strings[i];
    if (i < values.length) sql += `${i + 1}`;
  }
  return prisma.$queryRawUnsafe(sql, ...values);
}

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
  return INTAKE_TO_CHANNEL[channelType] || String(channel || '').trim();
}

export async function getGovernedCommercialOffer(serviceId) {
  const rows = await queryRaw`
    SELECT
      o.canonical_sku AS "serviceId",
      o.service_name AS name,
      LPAD(o.division::text, 2, '0') AS division,
      o.commercial_offer_status AS "commercialOfferStatus",
      o.fulfillment_gate_status AS "fulfillmentGateStatus",
      o.channel_availability_count AS "channelAvailabilityCount",
      o.authorized_provider_capability_count AS "authorizedProviderCapabilityCount",
      o.priced_channel_count AS "pricedChannelCount",
      o.ch01_a_priced AS "ch01APriced",
      o.ch01_b_priced AS "ch01BPriced",
      c1p.base_price_cents AS "ch01LockedPricingCents",
      (c1p.base_price_cents IS NOT NULL) AS "ch01LockedActivePricing",
      c1b.price_override_cents AS "ch01BLockedPricingCents",
      (c1b.price_override_cents IS NOT NULL AND c1b.price_override_cents > 0) AS "ch01LockedActiveSubchannelPricing",
      m.internal_cost AS "internalCost",
      m.margin_economics AS "marginEconomics",
      s.id AS "runtimeServiceId",
      s.pricing_type AS "pricingType",
      s.billing_cycle AS "billingCycle",
      s.starting_price AS "baseCustomerPrice",
      s.public_price_low AS "publicPriceLow",
      s.public_price_high AS "publicPriceHigh",
      s.resident_discount_eligible AS "residentDiscountEligible",
      rc.release_state AS "releaseState",
      rc.blocking_gate AS "blockingGate"
    FROM public.dd_governed_service_offers o
    JOIN public.services s ON s.id = o.runtime_service_id
    LEFT JOIN public.dd_service_release_contract_v1 rc ON rc.canonical_sku = o.canonical_sku
    LEFT JOIN LATERAL (
      SELECT m.internal_cost, m.margin_economics
      FROM public.dd_master_service_universe m
      WHERE m.canonical_sku = o.canonical_sku
        AND m.lifecycle_status = 'CANONICAL_ACTIVE'
      ORDER BY m.updated_at DESC
      LIMIT 1
    ) m ON true
    LEFT JOIN LATERAL (
      SELECT p.base_price_cents
      FROM public.dd_service_pricing_rules p
      WHERE p.service_id = o.runtime_service_id
        AND p.channel_code = 'CH01'
        AND p.status = 'ACTIVE'
        AND p.lock_status = 'LOCKED'
      ORDER BY p.effective_date DESC NULLS LAST, p.updated_at DESC, p.id DESC
      LIMIT 1
    ) c1p ON true
    LEFT JOIN LATERAL (
      SELECT mp.price_override_cents
      FROM public.dd_service_market_pricing_rules mp
      WHERE mp.service_id = o.runtime_service_id
        AND mp.channel_code = 'CH01'
        AND mp.subchannel_code = 'CH01-B'
        AND mp.status = 'ACTIVE'
        AND mp.price_override_cents IS NOT NULL
        AND mp.price_override_cents > 0
      ORDER BY mp.updated_at DESC, mp.id DESC
      LIMIT 1
    ) c1b ON true
    WHERE o.canonical_sku = ${serviceId}
      AND o.commercial_offer_status <> 'DO_NOT_SELL'
    ORDER BY CASE o.commercial_offer_status WHEN 'SELL_NOW' THEN 0 WHEN 'INTAKE_ONLY' THEN 1 ELSE 2 END,
             o.updated_at DESC, o.canonical_sku ASC
    LIMIT 1
  `;
  return rows[0] || null;
}

export function isQuoteRequired(offer) {
  return QUOTE_REQUIRED_MODELS.has(String(offer?.pricingType || '').toUpperCase())
    || offer?.baseCustomerPrice == null;
}

export function resolveGovernedPrice(offer, { channel, subchannel, isVerifiedCommunityResident } = {}) {
  if (!offer || isQuoteRequired(offer)) return null;
  let price = offer.baseCustomerPrice == null ? null : Number(offer.baseCustomerPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  // CH01-B is the apartment/complex-resident subchannel gated behind a real
  // property invitation (see checkoutEligibility above) -- the discount
  // belongs to that verified tier, not the unverified general-public CH01-A
  // tier. This previously checked CH01-A, which handed every unverified
  // shopper the discount while verified community residents got none.
  if (channel === 'CH01' && subchannel === 'CH01-B' && isVerifiedCommunityResident && offer.residentDiscountEligible) {
    price = Math.round(price * 0.85 * 100) / 100;
  }
  return money(price);
}

export async function getChannelGovernanceDecision(serviceId, channel) {
  if (!serviceId || !channel) {
    return { allowed: false, reason: 'CHANNEL_REQUIRED' };
  }

  const rows = await queryRaw`
    SELECT
      a.disposition,
      a.proposed_front_door AS "proposedFrontDoor",
      a.cross_channel_review AS "crossChannelReview",
      ca.eligibility_status AS "availabilityStatus",
      pr.pricing_type AS "channelPricingType",
      EXISTS (
        SELECT 1
        FROM public.dd_service_pricing_rules pr
        WHERE pr.service_id = o.runtime_service_id
          AND pr.channel_code = ${channel}
          AND pr.status = 'ACTIVE'
          AND pr.lock_status = 'LOCKED'
      ) AS "hasLockedActivePricing"
    FROM public.dd_ch02_service_adjudication a
    JOIN public.dd_governed_service_offers o
      ON o.canonical_sku = a.sku
     AND o.commercial_offer_status <> 'DO_NOT_SELL'
    LEFT JOIN public.dd_service_channel_availability ca
      ON ca.service_id = o.runtime_service_id
     AND ca.channel_code = a.channel_code
    LEFT JOIN LATERAL (
      SELECT pricing_type
      FROM public.dd_service_pricing_rules
      WHERE service_id = o.runtime_service_id
        AND channel_code = ${channel}
        AND status = 'ACTIVE'
        AND lock_status = 'LOCKED'
      ORDER BY effective_date DESC NULLS LAST, updated_at DESC
      LIMIT 1
    ) pr ON true
    WHERE a.channel_code = ${channel}
      AND a.sku = ${serviceId}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) {
    return { allowed: false, reason: 'CHANNEL_GOVERNANCE_NOT_FOUND' };
  }
  if (row.disposition !== 'FRONT_DOOR_CANDIDATE') {
    return { allowed: false, reason: `CH02_ADJUDICATION_${row.disposition}` };
  }
  if (row.crossChannelReview) {
    return { allowed: false, reason: 'CH02_CROSS_CHANNEL_REVIEW' };
  }
  if (!['ACTIVE', 'ELIGIBLE'].includes(String(row.availabilityStatus || '').toUpperCase())) {
    return { allowed: false, reason: 'CH02_CHANNEL_NOT_AVAILABLE' };
  }
  if (!row.hasLockedActivePricing) {
    return { allowed: false, reason: 'CH02_CHANNEL_PRICING_NOT_LOCKED' };
  }

  return {
    allowed: true,
    reason: 'CH02_GOVERNANCE_CLEARED',
    frontDoor: row.proposedFrontDoor,
    pricingType: row.channelPricingType || null,
  };
}

export async function resolveGovernedChannelPrice(offer, { channel, subchannel, isVerifiedCommunityResident } = {}) {
  if (!offer) return null;
  if (channel === 'CH01' && subchannel === 'CH01-B') {
    const rows = await queryRaw`
      SELECT price_override_cents
      FROM public.dd_service_market_pricing_rules
      WHERE service_id = ${offer.runtimeServiceId}
        AND channel_code = 'CH01'
        AND subchannel_code = 'CH01-B'
        AND status = 'ACTIVE'
        AND price_override_cents IS NOT NULL
        AND price_override_cents > 0
      ORDER BY updated_at DESC NULLS LAST, id DESC
      LIMIT 1
    `;
    const cents = rows[0]?.price_override_cents == null ? null : Number(rows[0].price_override_cents);
    if (!Number.isFinite(cents) || cents <= 0) return null;
    return money(cents / 100);
  }
  if (channel === 'CH01' && subchannel === 'CH01-A') {
    const rows = await queryRaw`
      SELECT base_price_cents
      FROM public.dd_service_pricing_rules
      WHERE service_id = ${offer.runtimeServiceId}
        AND channel_code = 'CH01'
        AND status = 'ACTIVE'
        AND lock_status = 'LOCKED'
      ORDER BY effective_date DESC NULLS LAST, updated_at DESC, id DESC
      LIMIT 1
    `;
    const cents = rows[0]?.base_price_cents == null ? null : Number(rows[0].base_price_cents);
    if (!Number.isFinite(cents) || cents <= 0) return null;
    return money(cents / 100);
  }
  if (channel !== 'CH02') return resolveGovernedPrice(offer, { channel, subchannel, isVerifiedCommunityResident });
  const rows = await queryRaw`
    SELECT base_price_cents
    FROM public.dd_service_pricing_rules
    WHERE service_id = ${offer.runtimeServiceId}
      AND channel_code = ${channel}
      AND status = 'ACTIVE'
      AND lock_status = 'LOCKED'
    ORDER BY effective_date DESC NULLS LAST, updated_at DESC, id DESC
    LIMIT 1
  `;
  const cents = rows[0]?.base_price_cents == null ? null : Number(rows[0].base_price_cents);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return money(cents / 100);
}

export function checkoutEligibility(offer, { channel, subchannel, isVerifiedCommunityResident, channelPricingType, hasLockedActivePricing, hasLockedActiveSubchannelPricing } = {}) {
  if (!offer) return { eligible: false, reason: 'NO_GOVERNED_OFFER', price: null };
  if (offer.releaseState !== 'LIVE_READY') return { eligible: false, reason: `SERVICE_NOT_LIVE_READY:${offer.blockingGate || 'RELEASE_CONTRACT'}`, price: null };
  if (offer.commercialOfferStatus !== 'SELL_NOW') return { eligible: false, reason: 'COMMERCIAL_NOT_SELL_NOW', price: null };
  if (offer.fulfillmentGateStatus !== 'READY') return { eligible: false, reason: 'FULFILLMENT_NOT_READY', price: null };
  if (isQuoteRequired(offer)) return { eligible: false, reason: 'QUOTE_REQUIRED', price: null };
  if (channel === 'CH02' && QUOTE_REQUIRED_MODELS.has(String(channelPricingType || '').toUpperCase())) {
    return { eligible: false, reason: 'CH02_CHANNEL_QUOTE_REQUIRED', price: null };
  }
  const economics = economicGateFromOffer(offer);
  if (!economics.cleared) return { eligible: false, reason: economics.reason, price: null, marginPercent: economics.marginPercent };
  if (!channel) return { eligible: false, reason: 'CHANNEL_REQUIRED', price: null };
  if (channel === 'CH01' && !['CH01-A', 'CH01-B'].includes(subchannel)) {
    return { eligible: false, reason: 'RESIDENT_SUBCHANNEL_REQUIRED', price: null };
  }
  // CH01-B (apartment/complex resident discount) is only ever eligible for
  // direct checkout once the caller has proven community membership -- i.e.
  // dd_portal_identities.organization_id was set by consuming a real property
  // invite (see dd_consume_apartment_resident_invite_impl), never by a client
  // simply claiming it. isVerifiedCommunityResident must be derived server-side
  // from that identity, not trusted from an unauthenticated request body.
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

// Shared by every endpoint that needs to know if the caller is a verified
// CH01-B (apartment/complex resident) shopper. These endpoints are reachable
// without an account (a shopper can price-check before signing up), so the
// discount can never be taken on the client's word -- it must be re-derived
// from a real session and dd_portal_identities.organization_id, which is only
// ever set by consuming a real property invite. No bearer token, an invalid
// one, or no matching verified identity all mean "not verified", never an
// error thrown back to the caller.
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
  // buildIntakeRoutingContext() stores the OPERATIONS_CHANNELS-style value
  // (e.g. 'B2C') under `channel`, not `channelType` -- there is no
  // `channelType` key on this object. normalizeChannel's first argument is
  // the one it looks up in INTAKE_TO_CHANNEL, so it must be `routing.channel`
  // here, not a nonexistent `routing.channelType`. Passing them the old way
  // meant this always fell through to the raw unmapped value (e.g. 'B2C'
  // instead of 'CH01'), so create-checkout-session's `channel !== 'CH01'`
  // check rejected every single request unconditionally.
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

  const rows = await queryRaw`
    SELECT
      a.sku AS "serviceId",
      a.service_id AS "runtimeServiceId",
      a.service_name AS "adjudicatedServiceName",
      a.front_door_code AS "frontDoorCode",
      a.subchannel_scope AS "subchannelScope",
      a.disposition,
      a.customer_visible_candidate AS "customerVisibleCandidate",
      o.service_name AS name,
      o.commercial_offer_status AS "commercialOfferStatus",
      o.fulfillment_gate_status AS "fulfillmentGateStatus",
      o.ch01_a_priced AS "ch01APriced",
      o.ch01_b_priced AS "ch01BPriced",
      s.pricing_type AS "pricingType",
      s.billing_cycle AS "billingCycle",
      s.resident_discount_eligible AS "residentDiscountEligible",
      s.commercial_status AS "serviceCommercialStatus",
      rc.release_state AS "releaseState",
      rc.blocking_gate AS "blockingGate",
      pr.base_price_cents AS "basePriceCents",
      pr.lock_status AS "pricingLockStatus",
      pr.status AS "pricingStatus",
      c1b.price_override_cents AS "subchannelPriceOverrideCents",
      (c1b.price_override_cents IS NOT NULL AND c1b.price_override_cents > 0) AS "subchannelPricingActive"
    FROM public.dd_ch01_service_adjudication a
    JOIN public.dd_channel_front_doors fd
      ON fd.channel_code = 'CH01'
     AND fd.front_door_code = a.front_door_code
     AND fd.status = 'LOCKED'
    JOIN public.dd_governed_service_offers o
      ON o.canonical_sku = a.sku
     AND o.commercial_offer_status <> 'DO_NOT_SELL'
    JOIN public.services s
      ON s.id = o.runtime_service_id
     AND s.id = a.service_id
    LEFT JOIN public.dd_service_release_contract_v1 rc
      ON rc.canonical_sku = o.canonical_sku
    LEFT JOIN LATERAL (
      SELECT base_price_cents, lock_status, status
      FROM public.dd_service_pricing_rules
      WHERE service_id = o.runtime_service_id
        AND channel_code = 'CH01'
        AND status = 'ACTIVE'
        AND lock_status = 'LOCKED'
      ORDER BY effective_date DESC NULLS LAST, updated_at DESC, id DESC
      LIMIT 1
    ) pr ON true
    LEFT JOIN LATERAL (
      SELECT price_override_cents
      FROM public.dd_service_market_pricing_rules
      WHERE service_id = o.runtime_service_id
        AND channel_code = 'CH01'
        AND subchannel_code = 'CH01-B'
        AND status = 'ACTIVE'
        AND price_override_cents IS NOT NULL
        AND price_override_cents > 0
      ORDER BY updated_at DESC NULLS LAST, id DESC
      LIMIT 1
    ) c1b ON true
    WHERE a.channel_code = 'CH01'
      AND a.status = 'LOCKED'
      AND a.sku = ${canonicalSku}
      AND a.front_door_code = ${frontDoor}
      AND a.customer_visible_candidate = true
      AND a.disposition IN ('FRONT_DOOR', 'CONTROLLED_QUOTE')
      AND a.subchannel_scope @> ARRAY[${subchannel}]::text[]
    ORDER BY a.updated_at DESC, a.id ASC
  `;

  if (rows.length === 0) {
    return { allowed: false, reason: 'CH01_CANONICAL_SERVICE_NOT_AUTHORIZED_FOR_FRONT_DOOR' };
  }
  if (rows.length > 1) {
    return { allowed: false, reason: 'CH01_CANONICAL_SERVICE_RESOLUTION_AMBIGUOUS' };
  }

  const row = rows[0];
  const pricingCents = subchannel === 'CH01-B'
    ? (row.subchannelPriceOverrideCents == null ? null : Number(row.subchannelPriceOverrideCents))
    : (row.basePriceCents == null ? null : Number(row.basePriceCents));
  const pricingLocked = subchannel === 'CH01-B'
    ? row.subchannelPricingActive === true
    : row.pricingStatus === 'ACTIVE' && row.pricingLockStatus === 'LOCKED';
  const price = Number.isFinite(pricingCents) && pricingCents > 0
    ? (subchannel === 'CH01-B'
      ? money(pricingCents / 100)
      : resolveGovernedPrice(
        {
          baseCustomerPrice: pricingCents / 100,
          residentDiscountEligible: Boolean(row.residentDiscountEligible),
          pricingType: row.pricingType,
        },
        { channel: 'CH01', subchannel, isVerifiedCommunityResident },
      ))
    : null;

  return {
    allowed: true,
    reason: 'CH01_CANONICAL_SERVICE_RESOLVED',
    serviceId: row.serviceId,
    runtimeServiceId: row.runtimeServiceId,
    serviceName: row.name || row.adjudicatedServiceName,
    frontDoorCode: row.frontDoorCode,
    subchannel,
    disposition: row.disposition,
    pricingType: row.pricingType || null,
    billingCycle: row.billingCycle || null,
    commercialOfferStatus: row.commercialOfferStatus,
    fulfillmentGateStatus: row.fulfillmentGateStatus,
    releaseState: row.releaseState || null,
    blockingGate: row.blockingGate || null,
    ch01APriced: Boolean(row.ch01APriced),
    ch01BPriced: Boolean(row.ch01BPriced),
    pricingLocked,
    hasLockedActivePricing: subchannel === 'CH01-A' ? pricingLocked : true,
    hasLockedActiveSubchannelPricing: subchannel === 'CH01-B' ? pricingLocked : true,
    price,
  };
}

