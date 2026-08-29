// DANI DECLARES LLC — COMMERCIAL REGISTRY AUTHORITY
// Current architecture: 5 official customer channels + CH01 resident subchannels.
// Customer pricing is canonical commercial data; provider economics remain private.

export const CHANNELS = Object.freeze({
  CH01_RESIDENT_CONCIERGE: 'CH01',
  CH02_PROPERTY_MANAGEMENT_APARTMENTS: 'CH02',
  CH03_REAL_ESTATE_OFFICES_BROKERAGES: 'CH03',
  CH04_BUSINESSES: 'CH04',
  CH05_GOVERNMENT_INSTITUTIONAL: 'CH05',
});

export const CH01_SUBCHANNELS = Object.freeze({
  CH01_A_REGULAR_RESIDENT: 'CH01-A',
  CH01_B_APARTMENT_RESIDENT: 'CH01-B',
});

export const CHANNEL_TYPES = Object.freeze({
  B2C_RETAIL: 'B2C_RETAIL',
  B2B_VOLUME: 'B2B_VOLUME',
  B2B2C_RESIDENT_PERK: 'B2B2C_RESIDENT_PERK',
  B2G_PROCUREMENT: 'B2G_PROCUREMENT',
});

export const COMMERCIAL_RELATIONSHIP_MODELS = Object.freeze({ B2C:'B2C', B2B:'B2B', B2B2C:'B2B2C', B2G:'B2G' });
export const RELATIONSHIP_TYPES = Object.freeze({ CUSTOMER:'CUSTOMER', BUSINESS_BUILD_CLIENT:'BUSINESS_BUILD_CLIENT', PROVIDER:'PROVIDER', SPECIALIST:'SPECIALIST', PARTNER:'PARTNER', SUBCONTRACTOR:'SUBCONTRACTOR', VENDOR:'VENDOR', REFERRAL_SOURCE:'REFERRAL_SOURCE', EMPLOYEE:'EMPLOYEE' });
export const NETWORK_ACCESS_LEVELS = Object.freeze({ NONE:'NONE', APPLICANT:'APPLICANT', VERIFIED:'VERIFIED', AUTHORIZED:'AUTHORIZED', PREFERRED:'PREFERRED', STRATEGIC:'STRATEGIC' });
export const PRICE_MODELS = Object.freeze({ FIXED_FLAT:'FIXED_FLAT', VARIABLE_SCALAR:'VARIABLE_SCALAR', RETAINER_SUITE:'RETAINER_SUITE', BESPOKE_SOW:'BESPOKE_SOW' });
export const STRIPE_MODES = Object.freeze({ DIRECT_LINK_MATCH:'DIRECT_LINK_MATCH', DYNAMIC_CHECKOUT:'DYNAMIC_CHECKOUT', FROZEN_ESTIMATE_CHECKOUT:'FROZEN_ESTIMATE_CHECKOUT', MANUAL_INVOICE:'MANUAL_INVOICE' });
export const PROVIDER_LANES = Object.freeze({ STAFF_DIRECT:'STAFF_DIRECT', SPECIALIST_NETWORK:'SPECIALIST_NETWORK', UNASSIGNED:'UNASSIGNED' });
export const COMMERCIAL_STATUS = Object.freeze({ CANONICAL_ACTIVE:'CANONICAL_ACTIVE', DEPRECATED_HISTORICAL:'DEPRECATED_HISTORICAL', PENDING_RECONCILIATION:'PENDING_RECONCILIATION' });

// These are the owner-approved D01 offers activated for immediate commercial launch.
// Prices are customer prices, not provider payouts. The five offers use explicit
// fixed/starting anchors; additional channel/location variants remain governed separately.
const D01_LAUNCH_OFFERS = Object.freeze({
  'DNI-01A-009': { serviceId:'DNI-01A-009', name:'Bin Sanitation', division:'01', channel:'B2C_RETAIL', model:'FIXED_FLAT', baseCustomerPrice:59, pricingLabel:'Starting at $59', residentDiscountEligible:false, allowedModifiers:[], stripeExecutionMode:'DYNAMIC_CHECKOUT', providerIsolationLane:'STAFF_DIRECT', status:'CANONICAL_ACTIVE' },
  'DNI-01A-010': { serviceId:'DNI-01A-010', name:'Odor Neutralization', division:'01', channel:'B2C_RETAIL', model:'FIXED_FLAT', baseCustomerPrice:99, pricingLabel:'Starting at $99', residentDiscountEligible:false, allowedModifiers:[], stripeExecutionMode:'DYNAMIC_CHECKOUT', providerIsolationLane:'STAFF_DIRECT', status:'CANONICAL_ACTIVE' },
  'DNI-01C-001': { serviceId:'DNI-01C-001', name:'Indoor Plant Care', division:'01', channel:'B2C_RETAIL', model:'RETAINER_SUITE', baseCustomerPrice:149, pricingLabel:'Starting at $149/month', billingCycle:'month', residentDiscountEligible:false, allowedModifiers:[], stripeExecutionMode:'DYNAMIC_CHECKOUT', providerIsolationLane:'SPECIALIST_NETWORK', status:'CANONICAL_ACTIVE' },
  'DNI-01D-002': { serviceId:'DNI-01D-002', name:'Home Watch / Household Absence Check', division:'01', channel:'B2C_RETAIL', model:'FIXED_FLAT', baseCustomerPrice:65, pricingLabel:'Starting at $65/visit', residentDiscountEligible:false, allowedModifiers:[], stripeExecutionMode:'DYNAMIC_CHECKOUT', providerIsolationLane:'STAFF_DIRECT', status:'CANONICAL_ACTIVE', recurringOffer:{ amount:149, interval:'month', label:'Basic recurring Home Watch — $149/month' } },
  'DNI-01D-004': { serviceId:'DNI-01D-004', name:'Event / Party Home Preparation & Reset', division:'01', channel:'B2C_RETAIL', model:'FIXED_FLAT', baseCustomerPrice:175, pricingLabel:'Starting at $175', residentDiscountEligible:false, allowedModifiers:[], stripeExecutionMode:'DYNAMIC_CHECKOUT', providerIsolationLane:'STAFF_DIRECT', status:'CANONICAL_ACTIVE' },
});

export const masterCommercialRegistry = Object.freeze({
  architectureVersion:'2026-08-29',
  // Commercial activation is currently Georgia-only. Other states remain expansion
  // architecture until separately cleared through commercial, pricing, fulfillment,
  // and compliance gates.
  geography:{ activeMarkets:['GA'], nationalReady:false },
  channels:CHANNELS,
  ch01Subchannels:CH01_SUBCHANNELS,
  workerSide:'CAPABILITY_NETWORK',
  networkAccessIsEntitlement:true,
  workIsNotGuaranteed:true,
  commercialModels:COMMERCIAL_RELATIONSHIP_MODELS,
  launchOffers:D01_LAUNCH_OFFERS,
});

export const providerCommercialGovernance = Object.freeze({
  commercialAuthority:'DANI_DECLARES',
  pricingAuthority:'OWNER_DELEGATED_MARKET_RESEARCH',
  marketingAuthority:'DANI_DECLARES',
  customerRelationshipAuthority:'DANI_DECLARES',
  skuAuthorizationRequired:true,
  credentialVerificationRequired:true,
  insuranceVerificationRequiredWhenApplicable:true,
});

export function getCommercialRecord(serviceId) { return D01_LAUNCH_OFFERS[String(serviceId || '').trim()] || null; }
export function isCanonicalActive(recordOrServiceId) {
  const record = typeof recordOrServiceId === 'string' ? getCommercialRecord(recordOrServiceId) : recordOrServiceId;
  return record?.status === COMMERCIAL_STATUS.CANONICAL_ACTIVE;
}
export function getCustomerBasePrice(serviceId) { return getCommercialRecord(serviceId)?.baseCustomerPrice ?? null; }
export function listCanonicalOffers() { return Object.values(D01_LAUNCH_OFFERS); }
export default D01_LAUNCH_OFFERS;
