// DANI DECLARES LLC — PRICING GOVERNANCE GATE
// Numeric customer pricing is intentionally frozen pending reconciliation.
// See docs/legacy-pricing-quarantine-2026-08-23.md.

export const PRICING_STATUS = Object.freeze({
  LOCKED: 'LOCKED',
  PROPOSED: 'PROPOSED',
  UNDEFINED: 'UNDEFINED',
  CUSTOM: 'CUSTOM',
  DISCARDED: 'DISCARDED',
});

export const PRICING_CHANNELS = Object.freeze({
  B2C: 'B2C',
  B2B: 'B2B',
  B2B2C: 'B2B2C',
  B2G: 'B2G',
});

export const PRICING_UNITS = Object.freeze({
  PER_UNIT: 'PER_UNIT',
  PER_HOUR: 'PER_HOUR',
  PER_ITEM: 'PER_ITEM',
  PER_VISIT: 'PER_VISIT',
  PER_SIGNATURE: 'PER_SIGNATURE',
  PER_PACKAGE: 'PER_PACKAGE',
  PER_EVENT: 'PER_EVENT',
  PER_MONTH: 'PER_MONTH',
  STARTING_AT: 'STARTING_AT',
  CUSTOM_QUOTE: 'CUSTOM_QUOTE',
});

export const PRICING_METHODS = Object.freeze({
  FLAT: 'FLAT',
  PER_UNIT: 'PER_UNIT',
  PERCENT: 'PERCENT',
  CUSTOM_QUOTE: 'CUSTOM_QUOTE',
});

export const SERVICE_PRICING_POLICY = Object.freeze({});
export const MODIFIERS = Object.freeze({});

export const DISCOUNT_POLICY = Object.freeze({
  B2C: 'No numeric discount is executable until the service record is canonical.',
  B2B: 'No B2C resident discount inheritance.',
  B2B2C: 'Contract price and resident benefit remain separate records.',
  B2G: 'Government pricing is solicitation/contract specific.',
});

export const SCOPE_SHIELD_POLICY = Object.freeze({
  visualBaseline: true,
  fourCornerPhotos: true,
  noSilentScopeExpansion: true,
  clientApprovalBeforeModifier: true,
});
