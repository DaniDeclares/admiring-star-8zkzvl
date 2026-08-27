// DANI DECLARES LLC — NATIONAL PRICING ENGINE
// Purpose: calculate location-aware customer pricing from universal SKUs.
// A market is data, not a SKU and not a customer channel.

export const MARKET_TIERS = Object.freeze({
  T1: 'CORE_CALIBRATION',
  T2: 'STANDARD_METRO',
  T3: 'HIGH_COST_METRO',
  T4: 'PREMIUM_METRO',
  T5: 'RURAL_OR_LOW_DENSITY',
  CUSTOM: 'CUSTOM_VALIDATION'
});

export const INITIAL_CALIBRATION_MARKETS = Object.freeze([
  'JONESBORO_GA','TUCKER_GA','STONE_MOUNTAIN_GA','CHAMBLEE_GA','BROOKHAVEN_GA','MIDTOWN_ATLANTA_GA','BUCKHEAD_ATLANTA_GA'
]);

export const NATIONAL_MARKET_PROFILE = Object.freeze({
  required: [
    'zip','city','county','state','metro','marketTier',
    'laborFactor','demandFactor','competitionFactor','travelFactor',
    'parkingFactor','accessFactor','costOfLivingFactor','providerCapacityFactor',
    'regulatoryProfile','effectiveDate','sourceStatus'
  ],
  sourceStatus: ['RESEARCHED','CALIBRATED','PROVISIONAL','CUSTOM_VALIDATION_REQUIRED']
});

export function normalizeMarketProfile(profile = {}) {
  const required = NATIONAL_MARKET_PROFILE.required;
  const missing = required.filter(key => profile[key] === undefined || profile[key] === null || profile[key] === '');
  if (missing.length) throw new Error(`Incomplete market profile: ${missing.join(', ')}`);
  return Object.freeze({ ...profile });
}

export function marketFactor(profile) {
  const p = normalizeMarketProfile(profile);
  const values = [p.laborFactor,p.demandFactor,p.competitionFactor,p.costOfLivingFactor,p.providerCapacityFactor]
    .map(Number);
  if (values.some(v => !Number.isFinite(v) || v <= 0)) throw new Error('Invalid market factors');
  // Geographical economics are blended rather than multiplied blindly.
  const factor = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(factor * 10000) / 10000;
}

export function travelCharge({ distanceMiles = 0, includedMiles = 15, ratePerMile = 2.5 } = {}) {
  const excess = Math.max(0, Number(distanceMiles) - includedMiles);
  return Math.round(excess * ratePerMile * 100) / 100;
}

export function calculateNationalPrice({ sku, channelCode, basePrice, marketProfile, channelFactor=1, scopeFactor=1, distanceMiles=0, condition=0, rushRate=0, materials=0, access=0, parking=0, discountRate=0, minimumPrice=0 } = {}) {
  if (!sku || !channelCode) throw new Error('SKU and channelCode are required');
  const mf = marketFactor(marketProfile);
  const travel = travelCharge({ distanceMiles });
  const marketBase = Number(basePrice) * mf * Number(channelFactor) * Number(scopeFactor);
  if (![marketBase, travel, condition, materials, access, parking].every(Number.isFinite)) throw new Error('Invalid pricing input');
  const subtotal = (marketBase + travel + Number(condition) + Number(materials) + Number(access) + Number(parking)) * (1 + Number(rushRate));
  const customerPrice = Math.max(Number(minimumPrice), subtotal * (1 - Number(discountRate)));
  return {
    sku,
    channelCode,
    market: { zip: marketProfile.zip, city: marketProfile.city, state: marketProfile.state, metro: marketProfile.metro, tier: marketProfile.marketTier },
    marketFactor: mf,
    travel,
    customerPrice: Math.round(customerPrice * 100) / 100,
    priceStatus: marketProfile.sourceStatus === 'CUSTOM_VALIDATION_REQUIRED' ? 'CUSTOM_VALIDATION_REQUIRED' : 'CALCULATED',
  };
}
