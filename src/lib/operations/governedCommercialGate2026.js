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
      s.resident_discount_eligible AS "residentDiscountEligible"
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

export function resolveGovernedPrice(offer, { channel, subchannel } = {}) {
  if (!offer || isQuoteRequired(offer)) return null;
  let price = offer.baseCustomerPrice == null ? null : Number(offer.baseCustomerPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (channel === 'CH01' && subchannel === 'CH01-A' && offer.residentDiscountEligible) {
    price = Math.round(price * 0.85 * 100) / 100;
  }
  return money(price);
}

export function checkoutEligibility(offer, { channel, subchannel } = {}) {
  if (!offer) return { eligible: false, reason: 'NO_GOVERNED_OFFER', price: null };
  if (offer.commercialOfferStatus !== 'SELL_NOW') return { eligible: false, reason: 'COMMERCIAL_NOT_SELL_NOW', price: null };
  if (offer.fulfillmentGateStatus !== 'READY') return { eligible: false, reason: 'FULFILLMENT_NOT_READY', price: null };
  if (isQuoteRequired(offer)) return { eligible: false, reason: 'QUOTE_REQUIRED', price: null };
  if (!channel) return { eligible: false, reason: 'CHANNEL_REQUIRED', price: null };
  if (channel === 'CH01' && !['CH01-A', 'CH01-B'].includes(subchannel)) {
    return { eligible: false, reason: 'RESIDENT_SUBCHANNEL_REQUIRED', price: null };
  }
  if (channel === 'CH01' && subchannel === 'CH01-B') {
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
  if (Number(offer.authorizedProviderCapabilityCount || 0) <= 0) {
    return { eligible: false, reason: 'NO_AUTHORIZED_PROVIDER_CAPABILITY', price: null };
  }
  return { eligible: true, reason: 'READY_FOR_DIRECT_CHECKOUT', price: resolveGovernedPrice(offer, { channel, subchannel }) };
}

export function getChannelFromRequest(request) {
  const routing = request?.property_details?.operationsRouting || {};
  return normalizeChannel(routing.channelType, routing.channel);
}
