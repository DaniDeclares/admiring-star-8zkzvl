import {
  INTAKE_WORKFLOWS,
  OPERATIONS_CHANNELS,
  REQUEST_STATES,
  buildIntakeRoutingContext,
  resolveIntakeChannel,
  routeIntake,
} from './intakeRouting2026';

describe('DDOS intake routing', () => {
  test('explicit B2C routes to instant booking', () => {
    expect(routeIntake({ channelType: OPERATIONS_CHANNELS.B2C })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.B2C,
        source: 'explicit',
        workflow: INTAKE_WORKFLOWS.INSTANT_BOOKING,
        initialState: REQUEST_STATES.ROUTED,
        requiresPricingResolution: true,
        requiresProposal: false,
        requiresSowReview: false,
      })
    );
  });

  test('apartment property requests route to B2B proposal flow', () => {
    expect(routeIntake({ channelType: OPERATIONS_CHANNELS.B2B_APT })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.B2B_APT,
        workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
        initialState: REQUEST_STATES.PROPOSAL_PENDING,
        requiresProposal: true,
      })
    );
  });

  test('real estate requests route to the same B2B proposal state machine', () => {
    expect(routeIntake({ channelType: OPERATIONS_CHANNELS.B2B_RE })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.B2B_RE,
        workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
        requiresProposal: true,
      })
    );
  });

  test('government requests route to SOW review, never instant checkout', () => {
    expect(routeIntake({ channelType: OPERATIONS_CHANNELS.B2G })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.B2G,
        workflow: INTAKE_WORKFLOWS.B2G_SOW,
        initialState: REQUEST_STATES.SOW_REVIEW,
        requiresSowReview: true,
        requiresProposal: false,
      })
    );
  });

  test('legacy category can safely fall back to a controlled channel', () => {
    expect(resolveIntakeChannel({ category: 'PROPERTY_OPERATIONS' })).toEqual({
      channel: OPERATIONS_CHANNELS.B2B_APT,
      source: 'category_fallback',
      reason: 'LEGACY_CATEGORY_FALLBACK',
    });
  });

  test('unknown category does not silently become B2C', () => {
    expect(routeIntake({ category: 'UNKNOWN_CATEGORY' })).toEqual(
      expect.objectContaining({
        channel: null,
        source: 'unresolved',
        workflow: INTAKE_WORKFLOWS.MANUAL_REVIEW,
        initialState: REQUEST_STATES.NEW,
        requiresPricingResolution: false,
      })
    );
  });

  test('routing context is safe to persist alongside a request', () => {
    expect(
      buildIntakeRoutingContext({ channelType: OPERATIONS_CHANNELS.B2B_RE })
    ).toEqual({
      channel: OPERATIONS_CHANNELS.B2B_RE,
      channelSource: 'explicit',
      channelReason: null,
      workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
      initialState: REQUEST_STATES.PROPOSAL_PENDING,
      requiresPricingResolution: true,
      requiresProposal: true,
      requiresSowReview: false,
    });
  });
});
