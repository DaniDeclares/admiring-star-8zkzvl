import { createClient } from '@supabase/supabase-js';
import prisma from '../../../lib/prisma.js';

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
  const rows = await prisma.$queryRaw`
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
      s.id AS "runtimeServiceId",
      s.pricing_type AS "pricingType",
      s.billing_cycle AS "billingCycle",
      s.starting_price AS "baseCustomerPrice",
      s.public_price_low AS "publicPriceLow",
      s.public_price_high AS "publicPriceHigh",
      s.resident_discount_eligible AS "residentDiscountEligible",
      EXISTS (
        SELECT 1
        FROM public.dd_master_service_universe m
        WHERE m.canonical_sku = o.canonical_sku
          AND m.lifecycle_status = 'CANONICAL_ACTIVE'
          AND lower(coalesce(m.fulfillment_lane, '')) LIKE 'dani direct%'
          AND NOT EXISTS (
            SELECT 1
            FROM public.dd_service_capability_requirements r
            WHERE r.canonical_sku = o.canonical_sku
              AND r.required = true
          )
      ) AS "ownerFulfillmentEligible"
    FROM public.dd_governed_service_offers o
    JOIN public.services s ON s.id = o.runtime_service_id
    WHERE o.canonical_sku = ${serviceId}
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
  if (channel === 'CH01' && subchannel === 'CH01-B' && isVerifiedCommunityResident && offer.residentDiscountEligible) {
    price = Math.round(price * 0.85 * 100) / 100;
  }
  return money(price);
}

export function checkoutEligibility(offer, { channel, subchannel, isVerifiedCommunityResident } = {}) {
  if (!offer) return { eligible: false, reason: 'NO_GOVERNED_OFFER', price: null };
  if (offer.commercialOfferStatus !== 'SELL_NOW') return { eligible: false, reason: 'COMMERCIAL_NOT_SELL_NOW', price: null };
  if (offer.fulfillmentGateStatus !== 'READY') return { eligible: false, reason: 'FULFILLMENT_NOT_READY', price: null };
  if (isQuoteRequired(offer)) return { eligible: false, reason: 'QUOTE_REQUIRED', price: null };
  if (!channel) return { eligible: false, reason: 'CHANNEL_REQUIRED', price: null };
  if (channel === 'CH01' && !['CH01-A', 'CH01-B'].includes(subchannel)) {
    return { eligible: false, reason: 'RESIDENT_SUBCHANNEL_REQUIRED', price: null };
  }
  if (channel === 'CH01' && subchannel === 'CH01-B' && !isVerifiedCommunityResident) {
    return { eligible: false, reason: 'COMMUNITY_RESIDENT_VERIFICATION_REQUIRED', price: null };
  }
  if (channel === 'CH01' && !offer.ch01APriced) {
    return { eligible: false, reason: 'CH01_A_NOT_PRICED', price: null };
  }
  if (channel !== 'CH01' && Number(offer.channelAvailabilityCount || 0) <= 0) {
    return { eligible: false, reason: 'NO_CHANNEL_AVAILABILITY', price: null };
  }
  if (channel !== 'CH01' && Number(offer.pricedChannelCount || 0) <= 0) {
    return { eligible: false, reason: 'NO_PRICED_CHANNEL', price: null };
  }
  const ownerFulfillmentEligible = Boolean(offer.ownerFulfillmentEligible);
  if (!ownerFulfillmentEligible && Number(offer.authorizedProviderCapabilityCount || 0) <= 0) {
    return { eligible: false, reason: 'NO_AUTHORIZED_PROVIDER_CAPABILITY', price: null };
  }
  return {
    eligible: true,
    reason: ownerFulfillmentEligible ? 'READY_FOR_OWNER_FULFILLMENT' : 'READY_FOR_DIRECT_CHECKOUT',
    price: resolveGovernedPrice(offer, { channel, subchannel, isVerifiedCommunityResident }),
  };
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
