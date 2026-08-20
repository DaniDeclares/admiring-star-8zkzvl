import { resolvePricing, PRICING_CHANNELS } from '../../data/pricingResolver2026.js';

const RESOLVER_CHANNEL_BY_OPERATIONS_CHANNEL = Object.freeze({
  B2C: PRICING_CHANNELS.B2C,
  B2B_APT: PRICING_CHANNELS.B2B,
  B2B_RE: PRICING_CHANNELS.B2B,
  B2B: PRICING_CHANNELS.B2B,
  B2B2C: PRICING_CHANNELS.B2B2C,
  B2G: PRICING_CHANNELS.B2G,
});

const SNAPSHOT_VERSION = '2026.1';

/**
 * Connect a validated DDOS intake context to the canonical pricing resolver.
 *
 * The operations channel is preserved exactly for the quote ledger. The
 * pricing resolver receives its supported canonical channel (for example,
 * B2B_APT and B2B_RE both resolve through the shared B2B commercial boundary).
 * No channel is guessed and no pricing is invented here.
 */
export function connectRequestToPricing({
  channelType,
  serviceId,
  propertyDetails = {},
} = {}) {
  if (!channelType || !serviceId) {
    return {
      pricingStatus: 'UNRESOLVED_CONTEXT',
      resolvedChannel: channelType || null,
      reason: 'CHANNEL_AND_PRICING_SERVICE_ID_REQUIRED',
      snapshotVersion: SNAPSHOT_VERSION,
    };
  }

  const resolverChannel = RESOLVER_CHANNEL_BY_OPERATIONS_CHANNEL[channelType];

  if (!resolverChannel) {
    return {
      pricingStatus: 'UNRESOLVED_CONTEXT',
      resolvedChannel: channelType,
      reason: 'CHANNEL_NOT_SUPPORTED_BY_PRICING_RESOLVER',
      snapshotVersion: SNAPSHOT_VERSION,
    };
  }

  const resolution = resolvePricing(serviceId, { channel: resolverChannel });

  if (resolution.status === 'CUSTOM') {
    return {
      pricingStatus: 'CUSTOM_QUOTE_REQUIRED',
      resolvedChannel: channelType,
      resolverChannel,
      resolvedOfferId: resolution.serviceId,
      baseAmount: null,
      unit: resolution.unit || null,
      transactionType: resolution.transactionType || 'CUSTOM_QUOTE',
      reason: resolution.reason || 'CUSTOM_QUOTE',
      snapshotVersion: SNAPSHOT_VERSION,
      modifierContext: propertyDetails?.pricingModifierContext || null,
      disclaimerId: null,
    };
  }

  if (resolution.status === 'UNDEFINED') {
    return {
      pricingStatus: 'PRICING_UNDEFINED',
      resolvedChannel: channelType,
      resolverChannel,
      resolvedOfferId: resolution.serviceId,
      baseAmount: null,
      unit: resolution.unit || null,
      reason: resolution.reason || 'PRICING_UNDEFINED',
      snapshotVersion: SNAPSHOT_VERSION,
      modifierContext: propertyDetails?.pricingModifierContext || null,
      disclaimerId: null,
    };
  }

  return {
    pricingStatus: 'RESOLVED',
    resolvedChannel: channelType,
    resolverChannel,
    resolvedOfferId: resolution.serviceId,
    baseAmount: resolution.amount,
    unit: resolution.unit || null,
    transactionType: resolution.transactionType || null,
    wholesaleCost: resolution.wholesaleCost,
    snapshotVersion: SNAPSHOT_VERSION,
    modifierContext: propertyDetails?.pricingModifierContext || null,
    // The resolver does not currently expose disclaimer IDs. Keep this null
    // rather than inventing compliance metadata; a later compliance layer can
    // populate the field without changing the pricing arithmetic.
    disclaimerId: null,
  };
}

export { RESOLVER_CHANNEL_BY_OPERATIONS_CHANNEL, SNAPSHOT_VERSION };
