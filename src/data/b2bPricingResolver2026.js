// DANI DECLARES LLC — PR B B2B commercial resolver
// B2B/B2B2C/B2G offers resolve only through an explicit commercial subchannel.
// Proposed and undefined prices never become customer-facing amounts.

import { PRICING_CHANNELS, PRICING_STATUS } from './canonicalPricing2026';
import { getB2BOffer } from './b2bCommercialCatalog2026';
import { getB2BEnterprisePackage } from './b2bEnterprisePackages2026';
import { getPricingDisclaimers } from './pricingDisclaimers2026';
import { B2B_MODIFIERS_2026, canStackModifiers } from './b2bModifierMatrix2026';
import { isOfferAllowedForSubchannel } from './b2bChannelPolicy2026';

const normalizeChannels = (offer) => (Array.isArray(offer.channels) ? offer.channels : [offer.channel]);
const requiresSubchannel = (channel) => [PRICING_CHANNELS.B2B, PRICING_CHANNELS.B2B2C, PRICING_CHANNELS.B2G].includes(channel);
const subchannelMatchesChannel = (channel, subchannel) => {
  if (channel === PRICING_CHANNELS.B2B) return ['B2B_APT', 'B2B_RE', 'B2B_SHARED'].includes(subchannel);
  if (channel === PRICING_CHANNELS.B2B2C) return subchannel === 'B2B2C';
  if (channel === PRICING_CHANNELS.B2G) return subchannel === 'B2G';
  return true;
};

const fail = (offerId, channel, commercialSubchannel, reason, disclaimers = []) => ({
  offerId, channel, commercialSubchannel, status: PRICING_STATUS.UNDEFINED, amount: null,
  label: 'Pricing / Scope Review Required', reason, disclaimers,
});

export function resolveB2BOffer(offerId, { channel = PRICING_CHANNELS.B2B, commercialSubchannel = null, modifierIds = [], modifierContext = {} } = {}) {
  const offer = getB2BOffer(offerId) || getB2BEnterprisePackage(offerId);
  if (!offer) return fail(offerId, channel, commercialSubchannel, 'OFFER_NOT_FOUND');
  const disclaimers = getPricingDisclaimers(offer.disclaimerIds);

  if (!normalizeChannels(offer).includes(channel)) return fail(offerId, channel, commercialSubchannel, 'CHANNEL_NOT_AUTHORIZED', disclaimers);
  if (requiresSubchannel(channel) && !commercialSubchannel) return fail(offerId, channel, commercialSubchannel, 'SUBCHANNEL_REQUIRED', disclaimers);
  if (commercialSubchannel && !subchannelMatchesChannel(channel, commercialSubchannel)) return fail(offerId, channel, commercialSubchannel, 'SUBCHANNEL_CHANNEL_MISMATCH', disclaimers);
  if (commercialSubchannel && !isOfferAllowedForSubchannel(offerId, commercialSubchannel)) return fail(offerId, channel, commercialSubchannel, 'SUBCHANNEL_NOT_AUTHORIZED', disclaimers);

  const unknownModifier = modifierIds.find((id) => !B2B_MODIFIERS_2026[id]);
  if (unknownModifier) return fail(offerId, channel, commercialSubchannel, 'UNKNOWN_MODIFIER', disclaimers);
  const unsupportedModifier = modifierIds.find((id) => !offer.modifierIds?.includes(id));
  if (unsupportedModifier) return fail(offerId, channel, commercialSubchannel, 'MODIFIER_NOT_APPLICABLE_TO_OFFER', disclaimers);
  if (!canStackModifiers(modifierIds)) return fail(offerId, channel, commercialSubchannel, 'INCOMPATIBLE_MODIFIERS', disclaimers);
  const invalidModifierChannel = modifierIds.find((id) => !B2B_MODIFIERS_2026[id].channels.includes(channel));
  if (invalidModifierChannel) return fail(offerId, channel, commercialSubchannel, 'MODIFIER_CHANNEL_NOT_AUTHORIZED', disclaimers);

  const hasUndefinedModifier = modifierIds.some((id) => B2B_MODIFIERS_2026[id].status === PRICING_STATUS.UNDEFINED);
  if (offer.status === PRICING_STATUS.UNDEFINED || hasUndefinedModifier) {
    return fail(offerId, channel, commercialSubchannel, offer.status === PRICING_STATUS.UNDEFINED ? 'PRICING_UNDEFINED_PENDING' : 'MODIFIER_UNDEFINED_PENDING', disclaimers);
  }
  if (offer.status === PRICING_STATUS.PROPOSED) return fail(offerId, channel, commercialSubchannel, 'PRICING_PROPOSED_PENDING', disclaimers);

  if (offer.status === PRICING_STATUS.CUSTOM || offer.pricingModel === 'CUSTOM' || offer.pricingModel === 'SOW_CONTRACT') {
    return { offerId, channel, commercialSubchannel, status: PRICING_STATUS.CUSTOM, amount: null, label: offer.priceRange ? 'Custom Quote / Contract Range' : 'Custom Quote', priceRange: offer.priceRange || null, reason: 'CUSTOM_SCOPE', disclaimers };
  }

  if (offer.priceRange && offer.baseRate == null) {
    return { offerId, channel, commercialSubchannel, status: offer.status, amount: null, label: 'Contract Range', priceRange: offer.priceRange, pricingModel: offer.pricingModel, disclaimers };
  }

  let amount = offer.baseRate;
  for (const modifierId of modifierIds) {
    const modifier = B2B_MODIFIERS_2026[modifierId];
    if (modifier.pricingMethod === 'FLAT') amount += modifier.amount;
    if (modifier.pricingMethod === 'PERCENT') {
      const materialCost = Number(modifierContext.materialCost);
      if (!Number.isFinite(materialCost) || materialCost < 0) return fail(offerId, channel, commercialSubchannel, 'MODIFIER_CONTEXT_REQUIRED', disclaimers);
      amount += materialCost * modifier.amount;
    }
  }

  return { offerId, channel, commercialSubchannel, status: offer.status, amount, unit: offer.unit, label: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`, pricingModel: offer.pricingModel, disclaimers };
}

export function getB2BPrice(offerId, channel = PRICING_CHANNELS.B2B, commercialSubchannel = null, options = {}) {
  return resolveB2BOffer(offerId, { channel, commercialSubchannel, ...options }).amount;
}

export function getB2BPriceLabel(offerId, channel = PRICING_CHANNELS.B2B, commercialSubchannel = null, options = {}) {
  return resolveB2BOffer(offerId, { channel, commercialSubchannel, ...options }).label;
}
