// DANI DECLARES LLC — B2B COMMERCIAL CATALOG GATE
// Legacy B2B numeric records are quarantined pending full reconciliation.
// See docs/legacy-pricing-quarantine-2026-08-23.md.

import { PRICING_STATUS } from './canonicalPricing2026';

export const B2B_OFFER_STATUS = Object.freeze({
  LOCKED: PRICING_STATUS.LOCKED,
  PROPOSED: PRICING_STATUS.PROPOSED,
  UNDEFINED_PENDING: PRICING_STATUS.UNDEFINED,
  CUSTOM_QUOTE: PRICING_STATUS.CUSTOM,
  DISCONTINUED: PRICING_STATUS.DISCARDED,
});

export const B2B_COMMERCIAL_CATALOG_2026 = Object.freeze({});
export const getAllB2BOffers = () => [];
export const getB2BOffer = () => null;
export const getB2BOffersByChannel = () => [];
