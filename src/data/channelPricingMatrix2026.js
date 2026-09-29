// DANI DECLARES LLC — CHANNEL PRICING MATRIX
// Channels are commercial/customer relationships. Geography is a separate
// pricing dimension and never creates a new channel.

export const CHANNELS = Object.freeze({ CH01:'CH01', CH02:'CH02', CH03:'CH03', CH04:'CH04', CH05:'CH05' });

export const CHANNEL_DEFINITIONS = Object.freeze({
  CH01: { id:'CH01', name:'Resident Concierge', pricingStatus:'MARKET_CALCULATED', residentBenefit:'15% on qualifying canonical services only' },
  CH02: { id:'CH02', name:'Property Management & Apartments', pricingStatus:'MARKET_CALCULATED', residentBenefit:'NONE' },
  CH03: { id:'CH03', name:'Real Estate Offices & Brokerages', pricingStatus:'MARKET_CALCULATED', residentBenefit:'NONE' },
  CH04: { id:'CH04', name:'Businesses', pricingStatus:'MARKET_CALCULATED', residentBenefit:'NONE' },
  CH05: { id:'CH05', name:'Government & Institutional Procurement', pricingStatus:'CONTRACT_OR_SOLICITATION', residentBenefit:'NONE' },
});

export const COMMERCIAL_MODELS = Object.freeze(['B2C','B2B','B2B2C','B2G']);

export const channelPricingMatrix = Object.freeze([]);

export function getChannelPricingRecord({ channelCode } = {}) {
  return CHANNEL_DEFINITIONS[channelCode] || null;
}

export function getChannelPricingRecords() { return Object.values(CHANNEL_DEFINITIONS); }

// Public presentation is intentionally delegated to the canonical pricing
// resolver once an approved SKU + market profile + scope are supplied.
export function getPublicPricePresentation({ calculatedPrice, status='APPROVED' } = {}) {
  if (!Number.isFinite(calculatedPrice)) return null;
  return { price: calculatedPrice, status };
}

export default channelPricingMatrix;
