// DANI DECLARES LLC — CUSTOMER PRICING GOVERNANCE GATE
// Numeric customer pricing remains frozen while the company-wide catalog is
// reconciled. Legacy numeric values are evidence only and never fallbacks.

export const PRICING_STATUS = Object.freeze({
  LOCKED: 'LOCKED',
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
  APPROVED: 'APPROVED',
  CUSTOM: 'CUSTOM',
  CONTRACT_ONLY: 'CONTRACT_ONLY',
  UNAVAILABLE: 'UNAVAILABLE',
});

export const PRICING_CHANNELS = Object.freeze({
  CH01: 'CH01',
  CH02: 'CH02',
  CH03: 'CH03',
  CH04: 'CH04',
  CH05: 'CH05',
  CH06: 'CH06',
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
  CONFIGURED: 'CONFIGURED',
  CUSTOM_QUOTE: 'CUSTOM_QUOTE',
  SOW: 'SOW',
});

// Intentionally empty until service-level reconciliation authorizes records.
export const SERVICE_PRICING_POLICY = Object.freeze({});
export const MODIFIERS = Object.freeze({});

export const DISCOUNT_POLICY = Object.freeze({
  CH01: '15% discount on qualifying canonical services only; exclusions remain subject to the approved commercial record.',
  CH02: 'Standard direct-resident pricing after reconciliation.',
  CH03: 'Property-management/commercial terms after reconciliation.',
  CH04: 'Real-estate/listing terms after reconciliation.',
  CH05: 'Business/commercial terms after reconciliation.',
  CH06: 'Government/institutional pricing is solicitation or contract specific.',
});

export const SCOPE_SHIELD_POLICY = Object.freeze({
  visualBaseline: true,
  fourCornerPhotos: true,
  noSilentScopeExpansion: true,
  clientApprovalBeforeModifier: true,
});
