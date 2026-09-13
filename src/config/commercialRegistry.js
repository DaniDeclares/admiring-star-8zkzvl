// DANI DECLARES LLC — COMMERCIAL REGISTRY CONSTANTS
// Runtime commercial authority lives in Supabase governed-service controls.
// This module retains stable channel/model constants and compatibility helpers;
// it must not override runtime commercial status, pricing, fulfillment, or geography.

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
export const COMMERCIAL_STATUS = Object.freeze({ CANONICAL_ACTIVE:'CANONICAL_ACTIVE', DEPRECATED_HISTORICAL:'DEPRECATED_HISTORICAL', PENDING_RECONCILIATION:'PENDING_RECONCILIATION', FULFILLMENT_GATED:'FULFILLMENT_GATED', INTAKE_ONLY:'INTAKE_ONLY' });

// IMPORTANT: do not hard-code launch offers here. Supabase is the runtime
// commercial authority. These compatibility aliases intentionally fail closed
// until a caller supplies/loads a runtime governed record.
export const D01_LAUNCH_OFFERS = Object.freeze({});

export const masterCommercialRegistry = Object.freeze({
  architectureVersion:'2026-09-13-runtime-commercial-authority',
  geography:{ activeMarkets:[], nationalReady:false },
  channels:CHANNELS,
  ch01Subchannels:CH01_SUBCHANNELS,
  workerSide:'OWNER_OPERATOR',
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

export function getCommercialRecord() { return null; }
export function isCanonicalActive() { return false; }
export function getCustomerBasePrice() { return null; }
export function listCanonicalOffers() { return []; }
export default D01_LAUNCH_OFFERS;
