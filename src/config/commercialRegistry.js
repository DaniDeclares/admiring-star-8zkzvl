// DANI DECLARES LLC — COMMERCIAL REGISTRY AUTHORITY
// Current architecture lock: 5 customer channels + capability-network worker side.
// CH01 contains resident subchannels; these are routing segments, not additional official channels.
// Legacy commercial models remain below channel level and must not be treated as channels.

export const CHANNELS = Object.freeze({
  CH01_RESIDENT_CONCIERGE: 'CH01',
  CH02_PROPERTY_MANAGEMENT_APARTMENTS: 'CH02',
  CH03_REAL_ESTATE_OFFICES_BROKERAGES: 'CH03',
  CH04_BUSINESSES: 'CH04',
  CH05_GOVERNMENT_INSTITUTIONAL: 'CH05',
});

// CH01 Resident Concierge subchannels. These do not create new official channels.
export const CH01_SUBCHANNELS = Object.freeze({
  CH01A_HOME_CLEANING: '01A',
  CH01B_PET_CARE: '01B',
  CH01D_HOUSEHOLD_CONCIERGE: '01D',
  CH01E_MOVE_TRANSITION: '01E',
  CH01F_SEASONAL: '01F',
  CH01G_HOUSEHOLD_PROGRAMS: '01G',
});

export const CHANNEL_TYPES = Object.freeze({
  B2C_RETAIL: 'B2C_RETAIL',
  B2B_VOLUME: 'B2B_VOLUME',
  B2B2C_RESIDENT_PERK: 'B2B2C_RESIDENT_PERK',
  B2G_PROCUREMENT: 'B2G_PROCUREMENT',
});

// Commercial models describe economics/relationships; they are NOT customer channels.
export const COMMERCIAL_RELATIONSHIP_MODELS = Object.freeze({
  B2C: 'B2C',
  B2B: 'B2B',
  B2B2C: 'B2B2C',
  B2G: 'B2G',
});

export const RELATIONSHIP_TYPES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  BUSINESS_BUILD_CLIENT: 'BUSINESS_BUILD_CLIENT',
  PROVIDER: 'PROVIDER',
  SPECIALIST: 'SPECIALIST',
  PARTNER: 'PARTNER',
  SUBCONTRACTOR: 'SUBCONTRACTOR',
  VENDOR: 'VENDOR',
  REFERRAL_SOURCE: 'REFERRAL_SOURCE',
  EMPLOYEE: 'EMPLOYEE',
});

export const NETWORK_ACCESS_LEVELS = Object.freeze({
  NONE: 'NONE',
  APPLICANT: 'APPLICANT',
  VERIFIED: 'VERIFIED',
  AUTHORIZED: 'AUTHORIZED',
  PREFERRED: 'PREFERRED',
  STRATEGIC: 'STRATEGIC',
});

export const PRICE_MODELS = Object.freeze({
  FIXED_FLAT: 'FIXED_FLAT',
  VARIABLE_SCALAR: 'VARIABLE_SCALAR',
  RETAINER_SUITE: 'RETAINER_SUITE',
  BESPOKE_SOW: 'BESPOKE_SOW',
});

export const STRIPE_MODES = Object.freeze({
  DIRECT_LINK_MATCH: 'DIRECT_LINK_MATCH',
  FROZEN_ESTIMATE_CHECKOUT: 'FROZEN_ESTIMATE_CHECKOUT',
  MANUAL_INVOICE: 'MANUAL_INVOICE',
});

export const PROVIDER_LANES = Object.freeze({
  NAWFSIDE: 'NAWFSIDE',
  CASS: 'CASS',
  STAFF_DIRECT: 'STAFF_DIRECT',
  SPECIALIST_NETWORK: 'SPECIALIST_NETWORK',
  UNASSIGNED: 'UNASSIGNED',
});

export const COMMERCIAL_STATUS = Object.freeze({
  CANONICAL_ACTIVE: 'CANONICAL_ACTIVE',
  DEPRECATED_HISTORICAL: 'DEPRECATED_HISTORICAL',
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
});

export const masterCommercialRegistry = Object.freeze({
  architectureVersion: '2026-08-27',
  geography: 'GA',
  channels: CHANNELS,
  ch01Subchannels: CH01_SUBCHANNELS,
  workerSide: 'CAPABILITY_NETWORK',
  networkAccessIsEntitlement: true,
  workIsNotGuaranteed: true,
  commercialModels: COMMERCIAL_RELATIONSHIP_MODELS,
});

export const providerCommercialGovernance = Object.freeze({
  commercialAuthority: 'DANI_DECLARES',
  pricingAuthority: 'AGREEMENT_DEFINED',
  marketingAuthority: 'AGREEMENT_DEFINED',
  customerRelationshipAuthority: 'AGREEMENT_DEFINED',
  skuAuthorizationRequired: true,
  credentialVerificationRequired: true,
  insuranceVerificationRequiredWhenApplicable: true,
});

export function getCommercialRecord() { return null; }
export function isCanonicalActive(record) { return record?.status === COMMERCIAL_STATUS.CANONICAL_ACTIVE; }
export function getCustomerBasePrice() { return null; }
export function listCanonicalOffers() { return []; }
