import {
  COMMERCIAL_RELATIONSHIP_MODELS,
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

  test('B2B2C is a commercial model, not an official channel', () => {
    expect(routeIntake({ channelType: 'B2B2C' })).toEqual(
      expect.objectContaining({
        channel: null,
        source: 'invalid_commercial_model_as_channel',
        reason: 'COMMERCIAL_MODEL_IS_NOT_CHANNEL',
        workflow: INTAKE_WORKFLOWS.MANUAL_REVIEW,
        initialState: REQUEST_STATES.NEW,
      })
    );
  });

  test('B2B2C never falls through to property-management category fallback', () => {
    expect(routeIntake({ channelType: 'B2B2C', category: 'PROPERTY_OPERATIONS' })).toEqual(
      expect.objectContaining({
        channel: null,
        source: 'invalid_commercial_model_as_channel',
        reason: 'COMMERCIAL_MODEL_IS_NOT_CHANNEL',
        workflow: INTAKE_WORKFLOWS.MANUAL_REVIEW,
      })
    );
  });

  test('B2B2C may be attached to a valid channel as relationship metadata', () => {
    expect(
      buildIntakeRoutingContext({
        channelType: OPERATIONS_CHANNELS.B2B_APT,
        commercialModel: COMMERCIAL_RELATIONSHIP_MODELS.B2B2C,
      })
    ).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.B2B_APT,
        commercialModel: COMMERCIAL_RELATIONSHIP_MODELS.B2B2C,
        workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
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
      buildIntakeRoutingContext({ channelType: OPERATIONS_CHANNELS.B2B_RE, subchannelCode: 'CH01-B' })
    ).toEqual({
      channel: OPERATIONS_CHANNELS.B2B_RE,
      channelSource: 'explicit',
      channelReason: null,
      workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
      initialState: REQUEST_STATES.PROPOSAL_PENDING,
      requiresPricingResolution: true,
      requiresProposal: true,
      requiresSowReview: false,
      commercialModel: null,
      subchannel: 'CH01-B',
    });
  });
});


describe('canonical five-channel governance', () => {
  test('semantic operational channels remain distinct', () => {
    expect(new Set(Object.values(OPERATIONS_CHANNELS)).size).toBe(5);
    expect(OPERATIONS_CHANNELS.B2C).not.toBe(OPERATIONS_CHANNELS.B2B_APT);
    expect(OPERATIONS_CHANNELS.B2B_APT).not.toBe(OPERATIONS_CHANNELS.B2B_RE);
    expect(OPERATIONS_CHANNELS.B2B_RE).not.toBe(OPERATIONS_CHANNELS.B2B);
    expect(OPERATIONS_CHANNELS.B2B).not.toBe(OPERATIONS_CHANNELS.B2G);
  });

  test('CH01-B remains relationship metadata rather than a sixth top-level channel', () => {
    const context = buildIntakeRoutingContext({
      channelType: OPERATIONS_CHANNELS.B2C,
      commercialModel: COMMERCIAL_RELATIONSHIP_MODELS.B2B2C,
      subchannelCode: 'CH01-B',
    });
    expect(context.channel).toBe(OPERATIONS_CHANNELS.B2C);
    expect(context.commercialModel).toBe(COMMERCIAL_RELATIONSHIP_MODELS.B2B2C);
    expect(context.subchannel).toBe('CH01-B');
  });
});
