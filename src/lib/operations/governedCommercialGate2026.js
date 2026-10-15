const ECONOMIC_MARGIN_FLOOR_PERCENT = 50;

function parseEconomicMarginPercent(value) {
  const matches = String(value || '').match(/(?:\(|=|margin\s*)\s*(-?\d+(?:\.\d+)?)\s*%/gi) || [];
  if (!matches.length) return null;
  const last = matches[matches.length - 1].match(/(-?\d+(?:\.\d+)?)\s*%/);
  return last ? Number(last[1]) : null;
}

function economicGateFromOffer(offer) {
  const cost = String(offer?.internalCost || '').trim();
  const economics = String(offer?.marginEconomics || '').trim();
  if (!cost || !economics) return { cleared: false, reason: 'ECONOMICS_NOT_RECONCILED', marginPercent: null };
  const unresolved = /PENDING_RECONCILIATION|DRAFT|NOT AN AUDITED|NEEDS DANIELLE|PRICE MISMATCH|FLAGGED, NOT RESOLVED|PROVISIONAL|PLANNING ASSUMPTION/i;
  if (unresolved.test(cost) || unresolved.test(economics)) {
    return { cleared: false, reason: 'ECONOMICS_NOT_RECONCILED', marginPercent: parseEconomicMarginPercent(economics) };
  }
  const marginPercent = parseEconomicMarginPercent(economics);
  if (marginPercent == null) return { cleared: false, reason: 'ECONOMICS_MARGIN_UNVERIFIABLE', marginPercent: null };
  if (marginPercent < ECONOMIC_MARGIN_FLOOR_PERCENT) return { cleared: false, reason: 'ECONOMICS_BELOW_50_MARGIN_FLOOR', marginPercent };
  return { cleared: true, reason: 'ECONOMICS_CLEARED', marginPercent };
}

const QUOTE_REQUIRED_MODELS = new Set([
  'BESPOKE_SOW','SOW','SOW_PROCUREMENT','QUOTE','STARTING_AT','CONFIGURED','VARIABLE_QUOTE',
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

function normalizeChannel(channelType, channel) {
  const normalizedType = String(channelType || '').trim().toUpperCase();
  if (['GOV', 'GOVERNMENT', 'INSTITUTIONAL', 'PROCUREMENT', 'PUBLIC_SECTOR'].includes(normalizedType)) return 'CH05';
  return INTAKE_TO_CHANNEL[normalizedType] || String(channel || '').trim().toUpperCase();
}

function isQuoteRequired(offer) {
  return QUOTE_REQUIRED_MODELS.has(String(offer?.pricingType || '').toUpperCase()) || offer?.baseCustomerPrice == null;
}

function resolveGovernedPrice(offer, { channel, subchannel, isVerifiedCommunityResident } = {}) {
  if (!offer || isQuoteRequired(offer)) return null;
  let price = offer.baseCustomerPrice == null ? null : Number(offer.baseCustomerPrice);
  if (!Number.isFinite(price) || price <= 0) return null;
  if (channel === 'CH01' && subchannel === 'CH01-B' && isVerifiedCommunityResident && offer.residentDiscountEligible) {
    price = Math.round(price * 0.85 * 100) / 100;
  }
  return money(price);
}

function checkoutEligibility(offer, { channel, subchannel, isVerifiedCommunityResident, channelPricingType, channelPriceCents, hasLockedActivePricing, hasLockedActiveSubchannelPricing } = {}) {
  if (channel === 'CH05') return { eligible: false, reason: 'GOVERNMENT_PROCUREMENT_NO_PUBLIC_CHECKOUT', price: null };
  if (!offer) return { eligible: false, reason: 'NO_GOVERNED_OFFER', price: null };
  if (offer.releaseState !== 'LIVE_READY') return { eligible: false, reason: `SERVICE_NOT_LIVE_READY:${offer.blockingGate || 'RELEASE_CONTRACT'}`, price: null };
  // LIVE_READY may use a null blocker to mean no independent hold. A populated
  // unresolved blocker must still fail closed and can never be overridden by the label.
  const blocker = String(offer.blockingGate || '').trim().toUpperCase();
  if (blocker && !['NONE', 'CLEARED', 'PASS'].includes(blocker)) {
    return { eligible: false, reason: `SERVICE_BLOCKED:${blocker}`, price: null };
  }
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
  if (channel === 'CH01' && !['CH01-A', 'CH01-B'].includes(subchannel)) return { eligible: false, reason: 'RESIDENT_SUBCHANNEL_REQUIRED', price: null };
  if (channel === 'CH01' && subchannel === 'CH01-B' && !isVerifiedCommunityResident) return { eligible: false, reason: 'COMMUNITY_RESIDENT_VERIFICATION_REQUIRED', price: null };
  if (channel === 'CH01' && subchannel === 'CH01-A' && offer.ch01LockedActivePricing !== true && hasLockedActivePricing !== true) return { eligible: false, reason: 'CH01_CHANNEL_PRICING_NOT_LOCKED', price: null };
  if (channel === 'CH01' && subchannel === 'CH01-B' && offer.ch01LockedActiveSubchannelPricing !== true && hasLockedActiveSubchannelPricing !== true) return { eligible: false, reason: 'CH01_B_PRICING_NOT_GOVERNED', price: null };
  if (channel !== 'CH01' && Number(offer.channelAvailabilityCount || 0) <= 0) return { eligible: false, reason: 'NO_CHANNEL_AVAILABILITY', price: null };
  if (channel !== 'CH01' && Number(offer.pricedChannelCount || 0) <= 0) return { eligible: false, reason: 'NO_PRICED_CHANNEL', price: null };
  if (Number(offer.authorizedProviderCapabilityCount || 0) <= 0) return { eligible: false, reason: 'NO_AUTHORIZED_PROVIDER_CAPABILITY', price: null };
  return { eligible: true, reason: 'READY_FOR_DIRECT_CHECKOUT', price: resolveGovernedPrice(offer, { channel, subchannel, isVerifiedCommunityResident }), marginPercent: economics.marginPercent };
}

function getChannelFromRequest(request) {
  const routing = request?.property_details?.operationsRouting || {};
  const signals = [routing.channel, routing.channelCode, request?.property_details?.commercialIntent?.channelCode, request?.property_details?.channelType].filter(Boolean).map(value => normalizeChannel(value, value));
  if (signals.includes('CH05')) return 'CH05'; // Procurement cannot be downgraded into a public checkout channel.
  const canonical = signals.filter(value => /^CH0[1-5]$/.test(value));
  if (new Set(canonical).size > 1) return null; // Contradictory channel identities fail closed.
  if (signals.some(value => !/^CH0[1-5]$/.test(value))) return null; // Unknown routing identities cannot authorize checkout.
  return canonical[0] || null;
}

let modulePromise;
async function implementation() {
  if (!modulePromise) modulePromise = import('./governedCommercialGate2026.mjs');
  return modulePromise;
}

async function getGovernedCommercialOffer(...args) {
  return (await implementation()).getGovernedCommercialOffer(...args);
}
async function evaluateChannelGovernanceDecision(...args) {
  return (await implementation()).evaluateChannelGovernanceDecision(...args);
}
async function getChannelGovernanceDecision(...args) {
  return (await implementation()).getChannelGovernanceDecision(...args);
}
async function resolveGovernedChannelPrice(...args) {
  return (await implementation()).resolveGovernedChannelPrice(...args);
}
async function resolveVerifiedCommunity(...args) {
  return (await implementation()).resolveVerifiedCommunity(...args);
}
async function resolveCH01CommercialSelection(...args) {
  return (await implementation()).resolveCH01CommercialSelection(...args);
}

module.exports = {
  economicGateFromOffer,
  checkoutEligibility,
  normalizeChannel,
  resolveGovernedPrice,
  isQuoteRequired,
  getChannelFromRequest,
  getGovernedCommercialOffer,
  evaluateChannelGovernanceDecision,
  getChannelGovernanceDecision,
  resolveGovernedChannelPrice,
  resolveVerifiedCommunity,
  resolveCH01CommercialSelection,
};
