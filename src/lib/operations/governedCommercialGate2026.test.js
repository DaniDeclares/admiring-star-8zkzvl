jest.mock('../../../lib/prisma.js', () => ({ __esModule: true, default: {} }));

import { economicGateFromOffer, checkoutEligibility } from './governedCommercialGate2026';

describe('economic checkout gate', () => {
  test('blocks missing economics', () => {
    expect(economicGateFromOffer({
      internalCost: 'PENDING_RECONCILIATION',
      marginEconomics: 'PENDING_RECONCILIATION',
    }).reason).toBe('ECONOMICS_NOT_RECONCILED');
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
    expect(checkoutEligibility({...readyOffer, releaseState:'HOLD', blockingGate:'RUNTIME_ACCURACY'}, {channel:'CH01',subchannel:'CH01-A'}).reason)
      .toBe('SERVICE_NOT_LIVE_READY:RUNTIME_ACCURACY');
  });

  test('allows a fully released service through the legacy checkout gates', () => {
    expect(checkoutEligibility(readyOffer, {channel:'CH01',subchannel:'CH01-A'}).eligible).toBe(true);
  });
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
