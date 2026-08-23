// DANI DECLARES LLC — CHANNEL PRICING GATE
// Legacy numeric channel records are quarantined.
// See docs/legacy-pricing-quarantine-2026-08-23.md.

import { CHANNELS, PRICING_MODELS, TRANSACTION_TYPES } from './masterCatalog2026.js';

export { CHANNELS, PRICING_MODELS, TRANSACTION_TYPES };

export const CHANNEL_PRICING_POLICY = Object.freeze({
  [CHANNELS.DIRECT_B2C]: { channel: CHANNELS.DIRECT_B2C, pricingModel: PRICING_MODELS.B2C_RETAIL, publicPriceVisibility: 'HIDDEN_PENDING_RECONCILIATION', quoteBehavior: 'PENDING_RECONCILIATION' },
  [CHANNELS.BUSINESS_B2B]: { channel: CHANNELS.BUSINESS_B2B, pricingModel: PRICING_MODELS.B2B_VOLUME, publicPriceVisibility: 'HIDDEN', quoteBehavior: 'COMMERCIAL_SCOPE' },
  [CHANNELS.COMMUNITY_B2B2C]: { channel: CHANNELS.COMMUNITY_B2B2C, pricingModel: PRICING_MODELS.B2B2C_RESIDENT_PERK, publicPriceVisibility: 'HIDDEN', quoteBehavior: 'CONTRACT_PLUS_RESIDENT_PERK' },
  [CHANNELS.GOVERNMENT_B2G]: { channel: CHANNELS.GOVERNMENT_B2G, pricingModel: PRICING_MODELS.B2G_PROCUREMENT, publicPriceVisibility: 'HIDDEN', quoteBehavior: 'SOLICITATION_OR_CONTRACT' },
});

export const channelPricingMatrix = Object.freeze([]);
export const getChannelPricingRecord = () => null;
export const getChannelPricingRecords = () => [];
export const getPublicPricePresentation = () => null;
export default channelPricingMatrix;
