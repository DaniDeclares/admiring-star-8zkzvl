const { checkoutEligibility, evaluateChannelGovernanceDecision, normalizeChannel } = require('./governedCommercialGate2026');

const readyOffer = {
  releaseState: 'LIVE_READY',
  blockingGate: null,
  commercialOfferStatus: 'SELL_NOW',
  fulfillmentGateStatus: 'READY',
  pricingType: 'FIXED',
  baseCustomerPrice: 125,
  internalCost: '$50',
  marginEconomics: 'margin 60%',
  channelAvailabilityCount: 1,
  pricedChannelCount: 1,
  authorizedProviderCapabilityCount: 1,
};

describe('normalizeChannel', () => {
  test('canonicalizes direct channel input before authority and pricing lookup', () => {
    expect(normalizeChannel('', ' ch03 ')).toBe('CH03');
    expect(normalizeChannel(' b2b_re ', 'CH01')).toBe('CH03');
  });
});

describe('evaluateChannelGovernanceDecision', () => {
  test.each(['CH03', 'CH04', 'CH05'])(
    '%s uses exact service-channel availability without CH02 adjudication',
    async channel => {
      await expect(evaluateChannelGovernanceDecision({
        channel,
        adjudication: null,
        availability: { eligibility_status: 'ACTIVE' },
        pricing: null,
      })).resolves.toEqual({
        allowed: true,
        reason: `${channel}_GOVERNANCE_CLEARED`,
        frontDoor: null,
        pricingType: null,
        channelPriceCents: null,
      });
    }
  );

  test.each(['CH03', 'CH04', 'CH05'])(
    '%s fails closed when exact availability is pending or absent',
    async channel => {
      await expect(evaluateChannelGovernanceDecision({
        channel,
        availability: { eligibility_status: 'PENDING' },
      })).resolves.toEqual({
        allowed: false,
        reason: `${channel}_CHANNEL_NOT_AVAILABLE`,
      });
      await expect(evaluateChannelGovernanceDecision({ channel })).resolves.toEqual({
        allowed: false,
        reason: `${channel}_CHANNEL_NOT_AVAILABLE`,
      });
    }
  );

  test('CH02 keeps its existing adjudication and locked-pricing gates', async () => {
    await expect(evaluateChannelGovernanceDecision({
      channel: 'CH02',
      adjudication: {
        disposition: 'FRONT_DOOR_CANDIDATE',
        proposed_front_door: 'CH02-F01',
        cross_channel_review: false,
      },
      availability: { eligibility_status: 'ELIGIBLE' },
      pricing: { pricing_type: 'FIXED', base_price_cents: 12500 },
    })).resolves.toEqual({
      allowed: true,
      reason: 'CH02_GOVERNANCE_CLEARED',
      frontDoor: 'CH02-F01',
      pricingType: 'FIXED',
      channelPriceCents: 12500,
    });

    await expect(evaluateChannelGovernanceDecision({
      channel: 'CH02',
      availability: { eligibility_status: 'ACTIVE' },
      pricing: { pricing_type: 'FIXED' },
    })).resolves.toEqual({
      allowed: false,
      reason: 'CHANNEL_GOVERNANCE_NOT_FOUND',
    });
  });

  test('unsupported channels fail closed', async () => {
    await expect(evaluateChannelGovernanceDecision({
      channel: 'CH06',
      availability: { eligibility_status: 'ACTIVE' },
    })).resolves.toEqual({
      allowed: false,
      reason: 'CHANNEL_GOVERNANCE_NOT_SUPPORTED',
    });
  });
});

describe('non-CH01 direct checkout pricing', () => {
  test.each(['CH02', 'CH03', 'CH04', 'CH05'])(
    '%s keeps intake open but blocks direct checkout without exact locked channel pricing',
    channel => {
      expect(checkoutEligibility(readyOffer, { channel, channelPricingType: null })).toEqual({
        eligible: false,
        reason: `${channel}_CHANNEL_PRICING_NOT_LOCKED`,
        price: null,
      });
    }
  );

  test.each(['CH02', 'CH03', 'CH04', 'CH05'])(
    '%s routes quote-only exact channel pricing away from direct checkout',
    channel => {
      expect(checkoutEligibility(readyOffer, { channel, channelPricingType: 'QUOTE' })).toEqual({
        eligible: false,
        reason: `${channel}_CHANNEL_QUOTE_REQUIRED`,
        price: null,
      });
    }
  );

  test.each(['CH02', 'CH03', 'CH04', 'CH05'])(
    '%s blocks direct checkout when exact locked pricing has no positive amount',
    channel => {
      expect(checkoutEligibility(readyOffer, { channel, channelPricingType: 'FIXED', channelPriceCents: null })).toEqual({
        eligible: false,
        reason: `${channel}_CHANNEL_PRICE_INVALID`,
        price: null,
      });
      expect(checkoutEligibility(readyOffer, { channel, channelPricingType: 'FIXED', channelPriceCents: 0 })).toEqual({
        eligible: false,
        reason: `${channel}_CHANNEL_PRICE_INVALID`,
        price: null,
      });
    }
  );

  test.each(['CH03', 'CH04', 'CH05'])(
    '%s permits the direct-checkout gate only when exact channel pricing has a positive direct price',
    channel => {
      expect(checkoutEligibility(readyOffer, { channel, channelPricingType: 'FIXED', channelPriceCents: 12500 })).toMatchObject({
        eligible: true,
        reason: 'READY_FOR_DIRECT_CHECKOUT',
      });
    }
  );
});
