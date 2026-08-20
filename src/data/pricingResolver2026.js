import { getPricingEntry } from './pricingCanon.js';
import {
  PRICING_CHANNELS,
  PRICING_STATUS,
  SERVICE_PRICING_POLICY,
} from './canonicalPricing2026.js';

const CHANNEL_TO_CATALOG_CHANNEL = {
  [PRICING_CHANNELS.B2C]: '01 DIRECT (B2C)',
  [PRICING_CHANNELS.B2B]: '02 BUSINESS (B2B)',
  [PRICING_CHANNELS.B2B2C]: '03 COMMUNITY (B2B2C)',
  [PRICING_CHANNELS.B2G]: '04 GOVERNMENT (B2G)',
};

const LEGACY_STATUS_TO_CANONICAL = {
  LOCKED_2026: PRICING_STATUS.LOCKED,
  PROPOSED: PRICING_STATUS.PROPOSED,
  UNDEFINED: PRICING_STATUS.UNDEFINED,
  CUSTOM: PRICING_STATUS.CUSTOM,
};

const isChannelAllowed = (entry, channel) => {
  const catalogChannel = CHANNEL_TO_CATALOG_CHANNEL[channel];
  return Boolean(catalogChannel && entry?.customerChannels?.includes(catalogChannel));
};

/**
 * Resolve a service for a commercial channel.
 *
 * The resolver is deliberately conservative:
 * - it only returns a numeric amount already present in canonical catalog data;
 * - it rejects a service whose channel is not authorized;
 * - it blocks B2B property turnover IDs that are still under business audit;
 * - it never converts an undefined amount into a guessed price.
 */
export function resolvePricing(serviceId, { channel = PRICING_CHANNELS.B2C } = {}) {
  const entry = getPricingEntry(serviceId);

  if (!entry) {
    return {
      serviceId,
      channel,
      status: PRICING_STATUS.UNDEFINED,
      amount: null,
      label: 'Starting at / Quoted',
      reason: 'SERVICE_NOT_FOUND',
    };
  }

  if (!isChannelAllowed(entry, channel)) {
    return {
      serviceId: entry.offerId,
      channel,
      status: PRICING_STATUS.UNDEFINED,
      amount: null,
      label: 'Not offered through this channel',
      reason: 'CHANNEL_NOT_AUTHORIZED',
    };
  }

  const policy = SERVICE_PRICING_POLICY[entry.offerId];
  if (policy?.status === PRICING_STATUS.UNDEFINED) {
    return {
      serviceId: entry.offerId,
      channel,
      status: PRICING_STATUS.UNDEFINED,
      amount: null,
      label: 'Pricing under review',
      reason: 'BUSINESS_PRICING_RECONCILIATION_REQUIRED',
    };
  }

  const status = LEGACY_STATUS_TO_CANONICAL[entry.status] || PRICING_STATUS.UNDEFINED;

  if (entry.transactionType === 'CUSTOM_QUOTE') {
    return {
      serviceId: entry.offerId,
      channel,
      status: PRICING_STATUS.CUSTOM,
      amount: null,
      label: 'Custom Quote',
      reason: 'CUSTOM_QUOTE',
    };
  }

  const amount = typeof entry.workingBaselineRate === 'number'
    ? entry.workingBaselineRate
    : null;

  if (amount === null) {
    return {
      serviceId: entry.offerId,
      channel,
      status: PRICING_STATUS.UNDEFINED,
      amount: null,
      label: entry.startingPrice || 'Starting at / Quoted',
      reason: 'NO_NUMERIC_BASELINE',
    };
  }

  return {
    serviceId: entry.offerId,
    channel,
    status,
    amount,
    label: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
    unit: entry.unit || null,
    transactionType: entry.transactionType,
    wholesaleCost: typeof entry.wholesaleCost === 'number' ? entry.wholesaleCost : null,
  };
}

export function getCanonicalPrice(serviceId, channel) {
  return resolvePricing(serviceId, { channel }).amount;
}

export function getCanonicalPriceLabel(serviceId, channel) {
  return resolvePricing(serviceId, { channel }).label;
}

export { PRICING_CHANNELS };
