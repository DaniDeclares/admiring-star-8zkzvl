// DANI DECLARES LLC — CURRENT PRICING GATE
// No legacy catalog or legacy pricing alias may supply a customer amount.
// See docs/legacy-pricing-quarantine-2026-08-23.md.

const DEFAULT_PRICE_LABEL = 'PENDING RECONCILIATION';

export const SERVICE_OFFER_MAP = Object.freeze({});

export function getPricingEntry() {
  return null;
}

export function getPriceValue() {
  return null;
}

export function getPriceLabel() {
  return DEFAULT_PRICE_LABEL;
}

export const formatCurrency = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
