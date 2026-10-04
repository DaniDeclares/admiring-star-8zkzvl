const { evaluateChannelGovernanceDecision } = require('./governedCommercialGate2026');

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
      pricing: { pricing_type: 'FIXED' },
    })).resolves.toEqual({
      allowed: true,
      reason: 'CH02_GOVERNANCE_CLEARED',
      frontDoor: 'CH02-F01',
      pricingType: 'FIXED',
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
