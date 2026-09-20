import {
  COMMERCIAL_MODELS,
  INTAKE_CHANNEL_TYPES,
  INTAKE_WORKFLOWS,
  OPERATIONS_CHANNELS,
  REQUEST_STATES,
  buildIntakeRoutingContext,
  resolveCommercialModel,
  resolveIntakeChannel,
  routeIntake,
} from './intakeRouting2026';

describe('DDOS intake routing', () => {
  test('official CH01 routes to instant booking and defaults to B2C', () => {
    expect(routeIntake({ channelType: OPERATIONS_CHANNELS.CH01 })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.CH01,
        commercialModel: COMMERCIAL_MODELS.B2C,
        source: 'explicit',
        workflow: INTAKE_WORKFLOWS.INSTANT_BOOKING,
        initialState: REQUEST_STATES.ROUTED,
      })
    );
  });

  test('legacy B2B_APT intake type resolves to official CH02', () => {
    expect(routeIntake({ channelType: INTAKE_CHANNEL_TYPES.B2B_APT })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.CH02,
        commercialModel: COMMERCIAL_MODELS.B2B,
        workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
        initialState: REQUEST_STATES.PROPOSAL_PENDING,
        requiresProposal: true,
      })
    );
  });

  test('real estate intake resolves to official CH03', () => {
    expect(routeIntake({ channelType: INTAKE_CHANNEL_TYPES.B2B_RE })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.CH03,
        commercialModel: COMMERCIAL_MODELS.B2B,
        workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
        requiresProposal: true,
      })
    );
  });

  test('government intake resolves to official CH05 and SOW review', () => {
    expect(routeIntake({ channelType: INTAKE_CHANNEL_TYPES.B2G })).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.CH05,
        commercialModel: COMMERCIAL_MODELS.B2G,
        workflow: INTAKE_WORKFLOWS.B2G_SOW,
        initialState: REQUEST_STATES.SOW_REVIEW,
        requiresSowReview: true,
        requiresProposal: false,
      })
    );
  });

  test('B2B2C is never accepted as an intake channel', () => {
    expect(resolveIntakeChannel({ channelType: COMMERCIAL_MODELS.B2B2C })).toEqual({
      channel: null,
      source: 'invalid_commercial_model_as_channel',
      reason: 'COMMERCIAL_MODEL_IS_NOT_CHANNEL',
    });
  });

  test('B2B2C is retained as a commercial model on the CH02 organization-side relationship', () => {
    expect(
      routeIntake({
        channelType: OPERATIONS_CHANNELS.CH02,
        commercialModel: COMMERCIAL_MODELS.B2B2C,
      })
    ).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.CH02,
        commercialModel: COMMERCIAL_MODELS.B2B2C,
        workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
      })
    );
  });

  test('CH01-B is resident experience context, not a sixth channel', () => {
    expect(
      buildIntakeRoutingContext({
        channelType: OPERATIONS_CHANNELS.CH01,
        subchannel: 'CH01-B',
      })
    ).toEqual(
      expect.objectContaining({
        channel: OPERATIONS_CHANNELS.CH01,
        commercialModel: COMMERCIAL_MODELS.B2C,
        subchannel: 'CH01-B',
      })
    );
  });

  test('commercial model can be resolved independently from channel', () => {
    expect(
      resolveCommercialModel({
        channel: OPERATIONS_CHANNELS.CH02,
        commercialModel: COMMERCIAL_MODELS.B2B2C,
      })
    ).toBe(COMMERCIAL_MODELS.B2B2C);
  });

  test('legacy category can safely fall back to official CH02', () => {
    expect(resolveIntakeChannel({ category: 'PROPERTY_OPERATIONS' })).toEqual({
      channel: OPERATIONS_CHANNELS.CH02,
      source: 'category_fallback',
      reason: 'LEGACY_CATEGORY_FALLBACK',
    });
  });

  test('unknown category does not silently become CH01', () => {
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

  test('routing context preserves channel, commercial model and resident subchannel separately', () => {
    expect(
      buildIntakeRoutingContext({
        channelType: OPERATIONS_CHANNELS.CH02,
        commercialModel: COMMERCIAL_MODELS.B2B2C,
        subchannel: 'CH01-B',
      })
    ).toEqual({
      channel: OPERATIONS_CHANNELS.CH02,
      channelSource: 'explicit',
      channelReason: null,
      commercialModel: COMMERCIAL_MODELS.B2B2C,
      subchannel: 'CH01-B',
      workflow: INTAKE_WORKFLOWS.B2B_PROPOSAL,
      initialState: REQUEST_STATES.PROPOSAL_PENDING,
      requiresPricingResolution: true,
      requiresProposal: true,
      requiresSowReview: false,
    });
  });
});
