// DANI DECLARES LLC — LEGACY CATALOG RUNTIME SHIM
// Historical numeric catalog quarantined on 2026-08-23.
// See docs/legacy-pricing-quarantine-2026-08-23.md.

export const TRANSACTION_TYPES = Object.freeze({
  FIXED_PRICE: 'FIXED_PRICE',
  STARTING_AT: 'STARTING_AT',
  CUSTOM_QUOTE: 'CUSTOM_QUOTE',
  DEPOSIT: 'DEPOSIT',
  REQUEST_BOOK: 'REQUEST_BOOK',
  CONTRACT_PROCUREMENT: 'CONTRACT_PROCUREMENT',
});

export const PRICING_MODELS = Object.freeze({
  B2C_RETAIL: 'B2C_RETAIL',
  B2B_VOLUME: 'B2B_VOLUME',
  B2B2C_RESIDENT_PERK: 'B2B2C_RESIDENT_PERK',
  B2G_PROCUREMENT: 'B2G_PROCUREMENT',
  CUSTOM_PROJECT: 'CUSTOM_PROJECT',
});

export const CHANNELS = Object.freeze({
  DIRECT_B2C: '01 DIRECT (B2C)',
  BUSINESS_B2B: '02 BUSINESS (B2B)',
  COMMUNITY_B2B2C: '03 COMMUNITY (B2B2C)',
  GOVERNMENT_B2G: '04 GOVERNMENT (B2G)',
});

// Intentionally empty: legacy records are no longer executable pricing.
export const catalog = Object.freeze([]);
export const MASTER_CATALOG_2026 = catalog;
