export const OPERATIONS_CHANNELS = Object.freeze({
  CH01: 'CH01',
  CH02: 'CH02',
  CH03: 'CH03',
  CH04: 'CH04',
  CH05: 'CH05',
});

export const INTAKE_CHANNEL_TYPES = Object.freeze({
  B2C: 'B2C',
  B2B_APT: 'B2B_APT',
  B2B_RE: 'B2B_RE',
  B2B: 'B2B',
  B2G: 'B2G',
});

export const COMMERCIAL_MODELS = Object.freeze({
  B2C: 'B2C',
  B2B: 'B2B',
  B2B2C: 'B2B2C',
  B2G: 'B2G',
});

export const INTAKE_WORKFLOWS = Object.freeze({
  INSTANT_BOOKING: 'INSTANT_BOOKING',
  B2B_PROPOSAL: 'B2B_PROPOSAL',
  B2G_SOW: 'B2G_SOW',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
});

export const REQUEST_STATES = Object.freeze({
  NEW: 'NEW',
  ROUTED: 'ROUTED',
  QUOTE_PENDING: 'QUOTE_PENDING',
  PROPOSAL_PENDING: 'PROPOSAL_PENDING',
  SOW_REVIEW: 'SOW_REVIEW',
});

const INTAKE_TO_OFFICIAL_CHANNEL = Object.freeze({
  B2C: OPERATIONS_CHANNELS.CH01,
  B2B_APT: OPERATIONS_CHANNELS.CH02,
  B2B_RE: OPERATIONS_CHANNELS.CH03,
  B2B: OPERATIONS_CHANNELS.CH04,
  B2G: OPERATIONS_CHANNELS.CH05,
});

const CATEGORY_TO_CHANNEL = Object.freeze({
  FESTIVAL_EVENTS: OPERATIONS_CHANNELS.CH01,
  MARKETPLACE: OPERATIONS_CHANNELS.CH01,
  CONCIERGE_COURIER: OPERATIONS_CHANNELS.CH01,
  PROPERTY_OPERATIONS: OPERATIONS_CHANNELS.CH02,
  BUSINESS_SOLUTIONS: OPERATIONS_CHANNELS.CH04,
  PRINT_STUDIO: OPERATIONS_CHANNELS.CH04,
  REAL_ESTATE: OPERATIONS_CHANNELS.CH03,
  GOVERNMENT: OPERATIONS_CHANNELS.CH05,
  GOVERNMENT_CONTRACTING: OPERATIONS_CHANNELS.CH05,
});

const WORKFLOW_BY_CHANNEL = Object.freeze({
  [OPERATIONS_CHANNELS.CH01]: INTAKE_WORKFLOWS.INSTANT_BOOKING,
  [OPERATIONS_CHANNELS.CH02]: INTAKE_WORKFLOWS.B2B_PROPOSAL,
  [OPERATIONS_CHANNELS.CH03]: INTAKE_WORKFLOWS.B2B_PROPOSAL,
  [OPERATIONS_CHANNELS.CH04]: INTAKE_WORKFLOWS.B2B_PROPOSAL,
  [OPERATIONS_CHANNELS.CH05]: INTAKE_WORKFLOWS.B2G_SOW,
});

const INITIAL_STATE_BY_WORKFLOW = Object.freeze({
  [INTAKE_WORKFLOWS.INSTANT_BOOKING]: REQUEST_STATES.ROUTED,
  [INTAKE_WORKFLOWS.B2B_PROPOSAL]: REQUEST_STATES.PROPOSAL_PENDING,
  [INTAKE_WORKFLOWS.B2G_SOW]: REQUEST_STATES.SOW_REVIEW,
  [INTAKE_WORKFLOWS.MANUAL_REVIEW]: REQUEST_STATES.NEW,
});

const VALID_CHANNELS = new Set(Object.values(OPERATIONS_CHANNELS));
const VALID_COMMERCIAL_MODELS = new Set(Object.values(COMMERCIAL_MODELS));

/**
 * Resolve an official DANI channel without guessing from free-form request details.
 * Explicit intake channel wins. Category is only a controlled fallback for legacy
 * callers that have not yet been upgraded to send an official channel.
 *
 * B2C/B2B/B2B2C/B2G are commercial relationship/economic models, not channels.
 * In particular, B2B2C must never become a sixth intake channel.
 */
export function resolveIntakeChannel({ channelType, category } = {}) {
  if (channelType && VALID_CHANNELS.has(channelType)) {
    return { channel: channelType, source: 'explicit', reason: null };
  }

  if (channelType && VALID_COMMERCIAL_MODELS.has(channelType)) {
    return {
      channel: null,
      source: 'invalid_commercial_model_as_channel',
      reason: 'COMMERCIAL_MODEL_IS_NOT_CHANNEL',
    };
  }

  if (channelType && INTAKE_TO_OFFICIAL_CHANNEL[channelType]) {
    return {
      channel: INTAKE_TO_OFFICIAL_CHANNEL[channelType],
      source: 'explicit_intake_type',
      reason: null,
    };
  }

  if (category && CATEGORY_TO_CHANNEL[category]) {
    return {
      channel: CATEGORY_TO_CHANNEL[category],
      source: 'category_fallback',
      reason: 'LEGACY_CATEGORY_FALLBACK',
    };
  }

  return { channel: null, source: 'unresolved', reason: 'CHANNEL_REQUIRED' };
}

/**
 * Resolve the commercial relationship/economic model independently of channel.
 * This is metadata, not a routing channel.
 */
export function resolveCommercialModel({ commercialModel, channel } = {}) {
  if (commercialModel && VALID_COMMERCIAL_MODELS.has(commercialModel)) return commercialModel;
  if (channel === OPERATIONS_CHANNELS.CH01) return COMMERCIAL_MODELS.B2C;
  if ([OPERATIONS_CHANNELS.CH02, OPERATIONS_CHANNELS.CH03, OPERATIONS_CHANNELS.CH04].includes(channel)) return COMMERCIAL_MODELS.B2B;
  if (channel === OPERATIONS_CHANNELS.CH05) return COMMERCIAL_MODELS.B2G;
  return null;
}

export function routeIntake({ channelType, category, commercialModel } = {}) {
  const resolved = resolveIntakeChannel({ channelType, category });

  if (!resolved.channel) {
    return {
      ...resolved,
      commercialModel: resolveCommercialModel({ commercialModel, channel: null }),
      workflow: INTAKE_WORKFLOWS.MANUAL_REVIEW,
      initialState: REQUEST_STATES.NEW,
      requiresPricingResolution: false,
      requiresProposal: false,
      requiresSowReview: false,
    };
  }

  const workflow = WORKFLOW_BY_CHANNEL[resolved.channel];

  return {
    ...resolved,
    commercialModel: resolveCommercialModel({ commercialModel, channel: resolved.channel }),
    workflow,
    initialState: INITIAL_STATE_BY_WORKFLOW[workflow],
    requiresPricingResolution: workflow !== INTAKE_WORKFLOWS.MANUAL_REVIEW,
    requiresProposal: workflow === INTAKE_WORKFLOWS.B2B_PROPOSAL,
    requiresSowReview: workflow === INTAKE_WORKFLOWS.B2G_SOW,
  };
}

export function buildIntakeRoutingContext(payload = {}) {
  const route = routeIntake(payload);

  return {
    channel: route.channel,
    channelSource: route.source,
    channelReason: route.reason,
    commercialModel: route.commercialModel,
    subchannel: payload.subchannel || null,
    workflow: route.workflow,
    initialState: route.initialState,
    requiresPricingResolution: route.requiresPricingResolution,
    requiresProposal: route.requiresProposal,
    requiresSowReview: route.requiresSowReview,
  };
}

export { CATEGORY_TO_CHANNEL, INTAKE_TO_OFFICIAL_CHANNEL };
