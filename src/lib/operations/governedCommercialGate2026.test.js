jest.mock('../../../lib/prisma.js', () => ({ __esModule: true, default: {} }));

import { economicGateFromOffer, checkoutEligibility } from './governedCommercialGate2026';

describe('economic checkout gate', () => {
  test('blocks missing economics', () => {
    expect(economicGateFromOffer({
      internalCost: 'PENDING_RECONCILIATION',
      marginEconomics: 'PENDING_RECONCILIATION',
    }).reason).toBe('ECONOMICS_NOT_RECONCILED');
  });

  test('blocks draft economics even when the draft margin exceeds 50%', () => {
    expect(economicGateFromOffer({
      internalCost: 'DRAFT: 3 hrs @ $30/hr = $90',
      marginEconomics: 'DRAFT: price $250 - draft cost $90 = $160 (64.0%)',
    }).reason).toBe('ECONOMICS_NOT_RECONCILED');
  });

  test('blocks a verified economics record below the 50% floor', () => {
    expect(economicGateFromOffer({
      internalCost: '1 hrs @ $75/hr = $75.00.',
      marginEconomics: 'AUDITED: price $149 - cost $75 = $74 (49.7%)',
    }).reason).toBe('ECONOMICS_BELOW_50_MARGIN_FLOOR');
  });

  test('clears verified economics at or above the 50% floor', () => {
    const result = economicGateFromOffer({
      internalCost: '1 hrs @ $75/hr = $75.00.',
      marginEconomics: 'AUDITED: price $150 - cost $75 = $75 (50.0%)',
    });
    expect(result.cleared).toBe(true);
    expect(result.marginPercent).toBe(50);
  });

  test('does not treat a price-only RESOLVED note as economically audited', () => {
    expect(economicGateFromOffer({
      internalCost: '1 hrs @ $75/hr = $75.00.',
      marginEconomics: 'RESOLVED 2026-09-18: price corrected. Still a draft hour estimate, not an audited figure. (49.7%)',
    }).reason).toBe('ECONOMICS_NOT_RECONCILED');
  });
});

describe('LIVE_READY checkout release gate', () => {
  const readyOffer = {
    releaseState: 'LIVE_READY',
    blockingGate: 'NONE',
    commercialOfferStatus: 'SELL_NOW',
    fulfillmentGateStatus: 'READY',
    pricingType: 'FIXED',
    baseCustomerPrice: 140,
    internalCost: 'AUDITED: $50.00',
    marginEconomics: 'AUDITED: price $140 - cost $50 = $90 (64.3%)',
    ch01APriced: true,
    channelAvailabilityCount: 1,
    pricedChannelCount: 1,
    authorizedProviderCapabilityCount: 1,
  };

  test('blocks a service that is not LIVE_READY even when legacy commercial gates pass', () => {
    expect(checkoutEligibility(
      { ...readyOffer, releaseState: 'HOLD', blockingGate: 'RUNTIME_ACCURACY' },
      { channel: 'CH01', subchannel: 'CH01-A' }
    ).reason).toBe('SERVICE_NOT_LIVE_READY:RUNTIME_ACCURACY');
  });

  test('allows a fully released service through the legacy checkout gates', () => {
    expect(checkoutEligibility(
      readyOffer,
      {
        channel: 'CH01',
        subchannel: 'CH01-A',
        hasLockedActivePricing: true,
        hasLockedActiveSubchannelPricing: false,
      }
    ).eligible).toBe(true);
  });
});

// CI release-contract verification pass.


const ch01ReadyOffer = {
  releaseState: 'LIVE_READY',
  blockingGate: 'NONE',
  commercialOfferStatus: 'SELL_NOW',
  fulfillmentGateStatus: 'READY',
  pricingType: 'FIXED',
  baseCustomerPrice: 140,
  internalCost: 'AUDITED: $50.00',
  marginEconomics: 'AUDITED: price $140 - cost $50 = $90 (64.3%)',
  ch01APriced: true,
  channelAvailabilityCount: 1,
  pricedChannelCount: 1,
  authorizedProviderCapabilityCount: 1,
};

describe('CH01 channel pricing governance', () => {
  test('blocks CH01-A when exact channel pricing is not locked', () => {
    expect(checkoutEligibility(
      ch01ReadyOffer,
      {
        channel: 'CH01',
        subchannel: 'CH01-A',
        hasLockedActivePricing: false,
        hasLockedActiveSubchannelPricing: false,
      }
    ).reason).toBe('CH01_CHANNEL_PRICING_NOT_LOCKED');
  });

  test('requires verification before CH01-B pricing can be used', () => {
    expect(checkoutEligibility(
      ch01ReadyOffer,
      {
        channel: 'CH01',
        subchannel: 'CH01-B',
        isVerifiedCommunityResident: false,
        hasLockedActivePricing: true,
        hasLockedActiveSubchannelPricing: true,
      }
    ).reason).toBe('COMMUNITY_RESIDENT_VERIFICATION_REQUIRED');
  });

  test('blocks verified CH01-B when no explicit subchannel price is governed', () => {
    expect(checkoutEligibility(
      ch01ReadyOffer,
      {
        channel: 'CH01',
        subchannel: 'CH01-B',
        isVerifiedCommunityResident: true,
        hasLockedActivePricing: true,
        hasLockedActiveSubchannelPricing: false,
      }
    ).reason).toBe('CH01_B_PRICING_NOT_GOVERNED');
  });

  test('allows verified CH01-B only with explicit subchannel pricing', () => {
    expect(checkoutEligibility(
      ch01ReadyOffer,
      {
        channel: 'CH01',
        subchannel: 'CH01-B',
        isVerifiedCommunityResident: true,
        hasLockedActivePricing: true,
        hasLockedActiveSubchannelPricing: true,
      }
    ).eligible).toBe(true);
  });

  test('keeps variable-quote CH01 work on intake rather than direct checkout', () => {
    expect(checkoutEligibility(
      { ...ch01ReadyOffer, pricingType: 'VARIABLE_QUOTE' },
      {
        channel: 'CH01',
        subchannel: 'CH01-A',
        hasLockedActivePricing: false,
        hasLockedActiveSubchannelPricing: false,
      }
    ).reason).toBe('QUOTE_REQUIRED');
  });
});
