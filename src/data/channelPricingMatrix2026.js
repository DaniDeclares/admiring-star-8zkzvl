import { catalog } from './masterCatalog2026.js';
import { CHANNELS, PRICING_MODELS, TRANSACTION_TYPES } from './masterCatalog2026.js';

/**
 * DANI DECLARES — Channel Pricing Matrix 2026
 *
 * One service record can serve multiple channels, but its commercial treatment
 * is channel-specific. This is a governance/presentation layer only.
 *
 * IMPORTANT: legacy master-catalog numbers are NOT commercial authority for
 * B2B or B2B2C. Those channels must resolve against their own contract/perk
 * records. Government pricing is never numeric here.
 */

export const CHANNEL_PRICING_POLICY = Object.freeze({
  [CHANNELS.DIRECT_B2C]: Object.freeze({
    channel: CHANNELS.DIRECT_B2C,
    pricingModel: PRICING_MODELS.B2C_RETAIL,
    publicPriceVisibility: 'PUBLIC',
    quoteBehavior: 'RETAIL_RATE',
    residentDiscountAllowed: true,
    stripeEligible: true,
  }),
  [CHANNELS.BUSINESS_B2B]: Object.freeze({
    channel: CHANNELS.BUSINESS_B2B,
    pricingModel: PRICING_MODELS.B2B_VOLUME,
    publicPriceVisibility: 'LIMITED',
    quoteBehavior: 'COMMERCIAL_SCOPE',
    residentDiscountAllowed: false,
    stripeEligible: true,
  }),
  [CHANNELS.COMMUNITY_B2B2C]: Object.freeze({
    channel: CHANNELS.COMMUNITY_B2B2C,
    pricingModel: PRICING_MODELS.B2B2C_RESIDENT_PERK,
    publicPriceVisibility: 'RESIDENT_FACING_ONLY',
    quoteBehavior: 'CONTRACT_PLUS_RESIDENT_PERK',
    residentDiscountAllowed: true,
    stripeEligible: true,
  }),
  [CHANNELS.GOVERNMENT_B2G]: Object.freeze({
    channel: CHANNELS.GOVERNMENT_B2G,
    pricingModel: PRICING_MODELS.B2G_PROCUREMENT,
    publicPriceVisibility: 'HIDDEN',
    quoteBehavior: 'SOLICITATION_OR_CONTRACT',
    residentDiscountAllowed: false,
    stripeEligible: false,
  }),
});

/**
 * Returns every catalog service with its channel-specific commercial treatment.
 * The same offerId remains canonical across channels.
 *
 * B2B and B2B2C deliberately return null numeric price fields here. A legacy
 * `workingBaselineRate` is not a valid substitute for a commercial contract
 * price or a resident perk price.
 */
export const channelPricingMatrix = catalog.flatMap((service) =>
  (service.customerChannels || []).map((channel) => {
    const policy = CHANNEL_PRICING_POLICY[channel];
    const isB2C = channel === CHANNELS.DIRECT_B2C;

    return {
      serviceId: service.offerId,
      serviceName: service.offerName,
      pillar: service.pillar,
      department: service.department,
      channel,
      pricingModel: policy?.pricingModel || null,
      transactionType: service.transactionType || TRANSACTION_TYPES.CUSTOM_QUOTE,
      publicPriceVisibility: policy?.publicPriceVisibility || 'HIDDEN',
      publicPrice: isB2C ? service.startingPrice ?? null : null,
      workingBaselineRate: isB2C ? service.workingBaselineRate ?? null : null,
      commercialBaselineRate: null,
      residentPerkEligible: channel === CHANNELS.COMMUNITY_B2B2C,
      governmentPricing: channel === CHANNELS.GOVERNMENT_B2G ? 'SOLICITATION_OR_CONTRACT' : null,
      quoteRequired: channel !== CHANNELS.DIRECT_B2C,
      residentDiscountAllowed: policy?.residentDiscountAllowed === true,
      stripeEligible: policy?.stripeEligible === true,
      status: service.status,
    };
  })
);

export const getChannelPricingRecord = (serviceId, channel) =>
  channelPricingMatrix.find(
    (record) => record.serviceId === serviceId && record.channel === channel
  ) || null;

export const getChannelPricingRecords = (serviceId) =>
  channelPricingMatrix.filter((record) => record.serviceId === serviceId);

/**
 * Public presentation guard. Government pages never receive numeric pricing,
 * B2B never inherits B2C pricing, and B2B2C never substitutes retail pricing
 * for property contract economics.
 */
export const getPublicPricePresentation = (serviceId, channel) => {
  const record = getChannelPricingRecord(serviceId, channel);
  if (!record) return null;

  if (channel === CHANNELS.GOVERNMENT_B2G) {
    return {
      serviceId,
      channel,
      label: 'Contract / Solicitation Pricing',
      amount: null,
      quoteRequired: true,
    };
  }

  if (channel === CHANNELS.BUSINESS_B2B) {
    return {
      serviceId,
      channel,
      label: 'Commercial Quote',
      amount: null,
      quoteRequired: true,
    };
  }

  if (channel === CHANNELS.COMMUNITY_B2B2C) {
    return {
      serviceId,
      channel,
      label: 'Resident Program Pricing',
      amount: null,
      quoteRequired: true,
    };
  }

  return {
    serviceId,
    channel,
    label: record.publicPrice || 'Starting at / Quoted',
    amount: record.workingBaselineRate,
    quoteRequired: false,
  };
};

export default channelPricingMatrix;
