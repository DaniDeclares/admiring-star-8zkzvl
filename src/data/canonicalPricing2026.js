// DANI DECLARES LLC — Canonical Pricing Spine metadata
// PR A: shared pricing architecture for B2C, B2B, B2B2C and B2G.
// IMPORTANT: This file defines pricing structure and governance. It does not
// invent unresolved rates. Unresolved amounts remain explicitly undefined.

export const PRICING_STATUS = {
  LOCKED: 'LOCKED',
  PROPOSED: 'PROPOSED',
  UNDEFINED: 'UNDEFINED',
  CUSTOM: 'CUSTOM',
  DISCARDED: 'DISCARDED',
};

export const PRICING_CHANNELS = {
  B2C: 'B2C',
  B2B: 'B2B',
  B2B2C: 'B2B2C',
  B2G: 'B2G',
};

export const PRICING_UNITS = {
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
};

export const PRICING_METHODS = {
  FLAT: 'FLAT',
  PER_UNIT: 'PER_UNIT',
  PERCENT: 'PERCENT',
  CUSTOM_QUOTE: 'CUSTOM_QUOTE',
};

/**
 * Governance metadata for the canonical catalog.
 *
 * Existing masterCatalog2026.js remains the legacy numeric catalog during
 * reconciliation. Do not copy disputed numbers here merely to make a page
 * render. PR B will establish the authoritative B2B property rates.
 */
export const SERVICE_PRICING_POLICY = {
  '02-TO1': {
    serviceId: '02-TO1',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    unit: PRICING_UNITS.PER_UNIT,
    status: PRICING_STATUS.UNDEFINED,
    note: 'B2B Standard Turn pricing requires reconciliation against the business pricing specification before becoming canonical.',
  },
  '02-TO2': {
    serviceId: '02-TO2',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    unit: PRICING_UNITS.PER_UNIT,
    status: PRICING_STATUS.UNDEFINED,
    note: 'B2B Standard Turn pricing requires reconciliation against the business pricing specification before becoming canonical.',
  },
  '02-TO3': {
    serviceId: '02-TO3',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    unit: PRICING_UNITS.PER_UNIT,
    status: PRICING_STATUS.UNDEFINED,
    note: 'Additional-bedroom and turnover scope rules are pending PR B validation.',
  },
};

export const MODIFIERS = {
  B2B_ADDITIONAL_BEDROOM: {
    modifierId: 'B2B_ADDITIONAL_BEDROOM',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.FLAT,
    amount: null,
    status: PRICING_STATUS.UNDEFINED,
    trigger: 'additional bedroom beyond the base service scope',
    fieldMetric: 'bedroom count',
    documentationRequired: true,
  },
  B2B_ADDITIONAL_BATHROOM: {
    modifierId: 'B2B_ADDITIONAL_BATHROOM',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.FLAT,
    amount: null,
    status: PRICING_STATUS.UNDEFINED,
    trigger: 'additional bathroom beyond the base service scope',
    fieldMetric: 'bathroom count',
    documentationRequired: true,
  },
  B2B_EXCESS_DEBRIS: {
    modifierId: 'B2B_EXCESS_DEBRIS',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.PER_UNIT,
    amount: null,
    status: PRICING_STATUS.UNDEFINED,
    trigger: 'loose debris exceeds one 33-gallon contractor bag',
    fieldMetric: '33-gallon bag count',
    documentationRequired: true,
    scopeShield: true,
  },
  B2B_SPECIAL_HANDLING: {
    modifierId: 'B2B_SPECIAL_HANDLING',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.PER_ITEM,
    amount: null,
    status: PRICING_STATUS.UNDEFINED,
    trigger: 'bulk or specialty item requiring handling outside standard turn scope',
    fieldMetric: 'predefined item category',
    documentationRequired: true,
    scopeShield: true,
  },
  B2B_HEAVY_SOIL: {
    modifierId: 'B2B_HEAVY_SOIL',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.CUSTOM_QUOTE,
    amount: null,
    status: PRICING_STATUS.UNDEFINED,
    trigger: 'soil condition materially exceeds standard-turn labor allowance',
    fieldMetric: 'condition evidence plus tracked labor variance',
    documentationRequired: true,
    scopeShield: true,
  },
  B2B_PET_MESS: {
    modifierId: 'B2B_PET_MESS',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.CUSTOM_QUOTE,
    amount: null,
    status: PRICING_STATUS.UNDEFINED,
    trigger: 'pet waste, urine, contamination, or treatment beyond routine hair removal',
    fieldMetric: 'photo condition evidence and treatment requirement',
    documentationRequired: true,
    scopeShield: true,
  },
  B2B_SECOND_TRIP: {
    modifierId: 'B2B_SECOND_TRIP',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.FLAT,
    amount: 85,
    status: PRICING_STATUS.LOCKED,
    trigger: 'second arrival required because the original work cannot proceed or complete for a documented site/work-order condition',
    fieldMetric: 'dispatch count and timestamped cause',
    documentationRequired: true,
    scopeShield: true,
  },
  B2B_ACCESS_WAIT: {
    modifierId: 'B2B_ACCESS_WAIT',
    channels: [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C],
    pricingMethod: PRICING_METHODS.FLAT,
    amount: 85,
    status: PRICING_STATUS.LOCKED,
    trigger: 'crew must wait more than 15 minutes for required site access or site readiness',
    fieldMetric: 'timestamped wait duration',
    documentationRequired: true,
    scopeShield: true,
  },
};

export const DISCOUNT_POLICY = {
  B2C: 'Apply only discounts explicitly marked eligible by the canonical service record.',
  B2B: 'Do not inherit B2C resident discounts. B2B pricing is commercial/contractual and may use volume, scope, term, or negotiated pricing only when explicitly configured.',
  B2B2C: 'Separate the business/client contract price from any resident-facing perk. Do not substitute a resident discount for the B2B contract price.',
  B2G: 'No consumer or resident discount logic. Government pricing is solicitation/contract specific unless a procurement record explicitly establishes a fixed rate.',
};

export const SCOPE_SHIELD_POLICY = {
  visualBaseline: true,
  fourCornerPhotos: true,
  noSilentScopeExpansion: true,
  clientApprovalBeforeModifier: true,
  standardDebrisCapacity: 'one 33-gallon contractor bag',
  secondTripFee: 85,
  accessWaitThresholdMinutes: 15,
};
