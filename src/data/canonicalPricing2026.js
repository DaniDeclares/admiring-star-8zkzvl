// DANI DECLARES LLC — CANONICAL PRICING GOVERNANCE
// Universal pricing rules. Customer price is governed by canonical commercial
// records and market/channel rules; provider economics never determine price.

export const PRICING_STATUS = Object.freeze({ LOCKED:'LOCKED', PENDING_RECONCILIATION:'PENDING_RECONCILIATION', APPROVED:'APPROVED', CUSTOM:'CUSTOM', CONTRACT_ONLY:'CONTRACT_ONLY', UNAVAILABLE:'UNAVAILABLE' });
export const PRICING_CHANNELS = Object.freeze({ CH01:'CH01', CH02:'CH02', CH03:'CH03', CH04:'CH04', CH05:'CH05' });
export const PRICING_UNITS = Object.freeze({ PER_UNIT:'PER_UNIT', PER_HOUR:'PER_HOUR', PER_ITEM:'PER_ITEM', PER_VISIT:'PER_VISIT', PER_SIGNATURE:'PER_SIGNATURE', PER_PACKAGE:'PER_PACKAGE', PER_EVENT:'PER_EVENT', PER_MONTH:'PER_MONTH', STARTING_AT:'STARTING_AT', CUSTOM_QUOTE:'CUSTOM_QUOTE' });
export const PRICING_METHODS = Object.freeze({ FLAT:'FLAT', PER_UNIT:'PER_UNIT', PERCENT:'PERCENT', CONFIGURED:'CONFIGURED', CUSTOM_QUOTE:'CUSTOM_QUOTE', SOW:'SOW', MARKET_CALCULATED:'MARKET_CALCULATED' });
export const PRICING_COMPONENTS = Object.freeze({ BASE_ECONOMICS:'BASE_ECONOMICS', MARKET_ADJUSTMENT:'MARKET_ADJUSTMENT', TRAVEL:'TRAVEL', CONDITION:'CONDITION', RUSH:'RUSH', MATERIALS:'MATERIALS', ACCESS:'ACCESS', PARKING:'PARKING', SPECIAL_EQUIPMENT:'SPECIAL_EQUIPMENT', CHANNEL:'CHANNEL', DISCOUNT:'DISCOUNT', TAX:'TAX', GOVERNMENT_FEE:'GOVERNMENT_FEE' });
export const DISCOUNT_POLICY = Object.freeze({
  CH01:'15% discount on qualifying canonical Resident Concierge services only; pass-through costs, government/statutory charges, materials, and non-discountable severe-condition charges are excluded.',
  CH02:'Property Management & Apartments pricing is a separate commercial relationship; do not inherit regular-resident pricing.',
  CH03:'Real Estate Offices & Brokerages pricing is governed by SKU, scope, market and agreement.',
  CH04:'Business pricing is governed by SKU, scope, market and agreement.',
  CH05:'Government & Institutional Procurement pricing is governed by contract, solicitation or approved quote.',
});
export const GLOBAL_PRICING_RULES = Object.freeze({ jurisdiction:'GA_SC_CURRENT', activeStates:['GA','SC'], nationalReady:true, includedTravelMiles:15, travelRatePerOneWayMile:2.5, b2bMinimumDispatch:85, materialsMarkupRate:0.10, rush24HourRate:0.25, marketPriceMustBeValidated:true, providerCostSeparateFromCustomerPrice:true, marginGuardRequired:true, scopeApprovalRequired:true });
export const MARKET_ENGINE_FIELDS = Object.freeze(['zip','city','county','state','metro','marketTier','laborFactor','demandFactor','competitionFactor','travelFactor','parkingFactor','accessFactor','costOfLivingFactor','providerCapacityFactor','regulatoryProfile','effectiveDate','sourceStatus']);
export const SCOPE_SHIELD_POLICY = Object.freeze({ visualBaseline:true, fourCornerPhotos:true, noSilentScopeExpansion:true, clientApprovalBeforeModifier:true });
export const SERVICE_PRICING_POLICY = Object.freeze({});
export const MODIFIERS = Object.freeze({});
export function calculateCustomerPrice({ basePrice, marketFactor=1, channelFactor=1, scopeFactor=1, travel=0, condition=0, rushRate=0, materials=0, access=0, parking=0, discountRate=0, minimumPrice=0 }) {
  if(!Number.isFinite(basePrice)||basePrice<0) throw new Error('Invalid basePrice');
  const marketBase=basePrice*marketFactor*channelFactor*scopeFactor;
  const additive=travel+condition+materials+access+parking;
  const preDiscount=(marketBase+additive)*(1+rushRate);
  const discounted=preDiscount*(1-discountRate);
  return Math.max(minimumPrice,Math.round(discounted*100)/100);
}
