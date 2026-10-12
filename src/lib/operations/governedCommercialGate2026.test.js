import { resolveCH01CommercialSelection } from './governedCommercialGate2026.mjs';
// Checkout is implemented in the CommonJS server module, not the ESM resolver.
const { economicGateFromOffer, checkoutEligibility } = require('./governedCommercialGate2026.js');

jest.mock('../../../lib/prisma.js', () => ({
  __esModule: true,
  default: { $queryRawUnsafe: jest.fn() },
}));

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
    ch01LockedActivePricing: true,
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

  test.each(['ECONOMICS_NOT_RECONCILED', 'PAYMENT_LEDGER', 'RUNTIME_ACCURACY'])(
    'blocks LIVE_READY / SELL_NOW when independent gate %s is unresolved', (blockingGate) => {
      expect(checkoutEligibility(
        { ...readyOffer, blockingGate },
        { channel: 'CH01', subchannel: 'CH01-A' }
      )).toEqual({ eligible: false, reason: `SERVICE_BLOCKED:${blockingGate}`, price: null });
    }
  );

  test.each(['NONE', 'CLEARED', 'PASS'])(
    'allows canonical cleared blocker %s to proceed through other gates', (blockingGate) => {
      expect(checkoutEligibility({ ...readyOffer, blockingGate }, { channel: 'CH01', subchannel: 'CH01-A' }).eligible).toBe(true);
    }
  );
  test('unrecognized blocker fails closed', () => {
    expect(checkoutEligibility({ ...readyOffer, blockingGate: 'UNRECOGNIZED_GATE' }, { channel: 'CH01', subchannel: 'CH01-A' }).reason).toBe('SERVICE_BLOCKED:UNRECOGNIZED_GATE');
  });
  test('missing blocker retains existing permissive policy pending release contract review', () => {
    expect(checkoutEligibility({ ...readyOffer, blockingGate: null }, { channel: 'CH01', subchannel: 'CH01-A' }).eligible).toBe(true);
  });
  test.each(['HOLD', 'BLOCKED', 'INTAKE_ONLY'])(
    'rejects non-released state %s', (releaseState) => {
      expect(checkoutEligibility({ ...readyOffer, releaseState }, { channel: 'CH01', subchannel: 'CH01-A' }).eligible).toBe(false);
    }
  );
  test('quote-required offer cannot use direct checkout', () => {
    expect(checkoutEligibility({ ...readyOffer, pricingType: 'STARTING_AT' }, { channel: 'CH01', subchannel: 'CH01-A' }).reason).toBe('QUOTE_REQUIRED');
  });
  test('cleared blocker does not bypass economics, fulfillment, or channel checks', () => {
    const opts = { channel: 'CH01', subchannel: 'CH01-A' };
    expect(checkoutEligibility({ ...readyOffer, internalCost: 'PENDING_RECONCILIATION' }, opts).reason).toBe('ECONOMICS_NOT_RECONCILED');
    expect(checkoutEligibility({ ...readyOffer, fulfillmentGateStatus: 'HOLD' }, opts).reason).toBe('FULFILLMENT_NOT_READY');
    expect(checkoutEligibility({ ...readyOffer, commercialOfferStatus: 'HOLD' }, opts).reason).toBe('COMMERCIAL_NOT_SELL_NOW');
    expect(checkoutEligibility({ ...readyOffer, ch01LockedActivePricing: false }, opts).reason).toBe('CH01_CHANNEL_PRICING_NOT_LOCKED');
  });
  test('allows a fully released service through the legacy checkout gates', () => {
    expect(checkoutEligibility(
      readyOffer,
      { channel: 'CH01', subchannel: 'CH01-A' }
    ).eligible).toBe(true);
  });
});

// CI release-contract verification pass.

describe('CH01 canonical resolver controls', () => {
 test('requires a canonical service and front door before commercial resolution', async () => {
  expect((await resolveCH01CommercialSelection({})).reason).toBe('CH01_SERVICE_REQUIRED');
  expect((await resolveCH01CommercialSelection({serviceId:'DNI-01A-001'})).reason).toBe('CH01_FRONT_DOOR_REQUIRED');
 });
 test('rejects a caller-supplied resident subchannel that conflicts with verified status', async () => {
  const result=await resolveCH01CommercialSelection({serviceId:'DNI-01A-001',frontDoorCode:'CH01-F01',subchannelCode:'CH01-B',isVerifiedCommunityResident:false});
  expect(result.allowed).toBe(false);
  expect(result.reason).toBe('CH01_SUBCHANNEL_MISMATCH');
 });
});

const { getChannelFromRequest } = require('./governedCommercialGate2026.js');

describe('five-channel checkout routing integrity', () => {
  const request = (routing, extra = {}) => ({ property_details: { operationsRouting: routing, ...extra } });
  test.each([['B2C','CH01'],['B2B_APT','CH02'],['B2B_RE','CH03'],['B2B','CH04'],['B2G','CH05'],['GOV','CH05'],['GOVERNMENT','CH05'],['INSTITUTIONAL','CH05'],['PROCUREMENT','CH05']])('maps %s to %s', (input, expected) => {
    expect(getChannelFromRequest(request({ channel: input }))).toBe(expected);
  });
  test('government intent cannot be downgraded to commercial checkout', () => {
    expect(getChannelFromRequest(request({channel:'CH04'}, {commercialIntent:{channelCode:'B2G'}}))).toBe('CH05');
  });
  test('conflicting commercial channel identities fail closed', () => {
    expect(getChannelFromRequest(request({channel:'CH02',channelCode:'CH03'}))).toBeNull();
  });
  test('unknown routing identities fail closed', () => {
    expect(getChannelFromRequest(request({channel:'UNKNOWN'}))).toBeNull();
  });
  test('missing routing identities fail closed', () => {
    expect(getChannelFromRequest(request({}))).toBeNull();
  });
});

describe('government procurement payment hard stop', () => {
  test('CH05 cannot become public checkout eligible even when an offer is otherwise LIVE_READY', () => {
    const offer = { releaseState:'LIVE_READY', commercialOfferStatus:'SELL_NOW', fulfillmentGateStatus:'READY', pricingType:'FIXED', baseCustomerPrice:275, internalCost:'1 hr @ $75', marginEconomics:'AUDITED: margin 72.7%' };
    const result = checkoutEligibility(offer, { channel:'CH05', channelPricingType:'FIXED', channelPriceCents:27500, hasLockedActivePricing:true });
    expect(result).toEqual({eligible:false,reason:'GOVERNMENT_PROCUREMENT_NO_PUBLIC_CHECKOUT',price:null});
  });
});
