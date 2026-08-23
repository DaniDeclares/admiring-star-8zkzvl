// DANI DECLARES LLC — MASTER CATALOG COMPATIBILITY SHIM
// The authoritative Phase 0 catalog lives in
// ../config/canonicalCatalogRegistry.js.
//
// This module remains only for compatibility with legacy imports. It contains
// no prices, no provider economics, no legacy package values, and no alternate
// channel taxonomy.

import {
  COMPANY_WIDE_CATALOG,
  COMMERCIAL_OBJECT_TYPES,
  CHANNELS,
  LIFECYCLE_STATES,
  MARKETS,
} from '../config/canonicalCatalogRegistry.js';

export const TRANSACTION_TYPES = Object.freeze({
  REQUEST: 'REQUEST',
  QUOTE: 'QUOTE',
  PURCHASE: 'PURCHASE',
  CONTRACT: 'CONTRACT',
});

export const PRICING_MODELS = Object.freeze({
  FIXED: 'FIXED',
  CONFIGURED: 'CONFIGURED',
  STARTING_AT: 'STARTING_AT',
  SOW: 'SOW',
  CONTRACT: 'CONTRACT',
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
});

export { CHANNELS, MARKETS, COMMERCIAL_OBJECT_TYPES, LIFECYCLE_STATES };

// Compatibility aliases. No numeric or executable legacy catalog is exposed.
export const catalog = Object.freeze(COMPANY_WIDE_CATALOG);
export const MASTER_CATALOG_2026 = catalog;
