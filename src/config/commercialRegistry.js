// DANI DECLARES LLC — COMMERCIAL REGISTRY RUNTIME SHIM
// Historical customer prices were removed from runtime authority on 2026-08-23.
// See docs/legacy-pricing-quarantine-2026-08-23.md.

export const CHANNEL_TYPES = Object.freeze({
  B2C_RETAIL: 'B2C_RETAIL',
  B2B_VOLUME: 'B2B_VOLUME',
  B2B2C_RESIDENT_PERK: 'B2B2C_RESIDENT_PERK',
  B2G_PROCUREMENT: 'B2G_PROCUREMENT',
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
  UNASSIGNED: 'UNASSIGNED',
});

export const COMMERCIAL_STATUS = Object.freeze({
  CANONICAL_ACTIVE: 'CANONICAL_ACTIVE',
  DEPRECATED_HISTORICAL: 'DEPRECATED_HISTORICAL',
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
});

// Intentionally empty. New records must be promoted through the current
// Master Operating Architecture after reconciliation.
export const masterCommercialRegistry = Object.freeze({});

export const providerCommercialGovernance = Object.freeze({});

export function getCommercialRecord() { return null; }
export function isCanonicalActive() { return false; }
export function getCustomerBasePrice() { return null; }
export function listCanonicalOffers() { return []; }
