export const OPERATIONS_CHANNELS = Object.freeze({
  B2C: 'B2C',
  B2B_APT: 'B2B_APT',
  B2B_RE: 'B2B_RE',
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

const CATEGORY_TO_CHANNEL = Object.freeze({
  FESTIVAL_EVENTS: OPERATIONS_CHANNELS.B2C,
  MARKETPLACE: OPERATIONS_CHANNELS.B2C,
  CONCIERGE_COURIER: OPERATIONS_CHANNELS.B2C,
  PROPERTY_OPERATIONS: OPERATIONS_CHANNELS.B2B_APT,
  BUSINESS_SOLUTIONS: OPERATIONS_CHANNELS.B2B,
  PRINT_STUDIO: OPERATIONS_CHANNELS.B2B,
  REAL_ESTATE: OPERATIONS_CHANNELS.B2B_RE,
  GOVERNMENT: OPERATIONS_CHANNELS.B2G,
  GOVERNMENT_CONTRACTING: OPERATIONS_CHANNELS.B2G,
});

const WORKFLOW_BY_CHANNEL = Object.freeze({
  [OPERATIONS_CHANNELS.B2C]: INTAKE_WORKFLOWS.INSTANT_BOOKING,
  [OPERATIONS_CHANNELS.B2B_APT]: INTAKE_WORKFLOWS.B2B_PROPOSAL,
  [OPERATIONS_CHANNELS.B2B_RE]: INTAKE_WORKFLOWS.B2B_PROPOSAL,
  [OPERATIONS_CHANNELS.B2B]: INTAKE_WORKFLOWS.B2B_PROPOSAL,
  [OPERATIONS_CHANNELS.B2B2C]: INTAKE_WORKFLOWS.B2B_PROPOSAL,
  [OPERATIONS_CHANNELS.B2G]: INTAKE_WORKFLOWS.B2G_SOW,
});

const INITIAL_STATE_BY_WORKFLOW = Object.freeze({
  [INTAKE_WORKFLOWS.INSTANT_BOOKING]: REQUEST_STATES.ROUTED,
  [INTAKE_WORKFLOWS.B2B_PROPOSAL]: REQUEST_STATES.PROPOSAL_PENDING,
  [INTAKE_WORKFLOWS.B2G_SOW]: REQUEST_STATES.SOW_REVIEW,
  [INTAKE_WORKFLOWS.MANUAL_REVIEW]: REQUEST_STATES.NEW,
});

const VALID_CHANNELS = new Set(Object.values(OPERATIONS_CHANNELS));

/**
 * Resolve an intake channel without guessing from free-form request details.
 * Explicit channel wins. Category is only a controlled fallback for legacy
 * callers that have not yet been upgraded to send channelType.
 */
export function resolveIntakeChannel({ channelType, category } = {}) {
  if (channelType && VALID_CHANNELS.has(channelType)) {
    return {
      channel: channelType,
      source: 'explicit',
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

  return {
    channel: null,
    source: 'unresolved',
    reason: 'CHANNEL_REQUIRED',
  };
}

/**
 * Map a validated channel to its operational state machine.
 */
export function routeIntake({ channelType, category } = {}) {
  const resolved = resolveIntakeChannel({ channelType, category });

  if (!resolved.channel) {
    return {
      ...resolved,
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
    workflow: route.workflow,
    initialState: route.initialState,
    requiresPricingResolution: route.requiresPricingResolution,
    requiresProposal: route.requiresProposal,
    requiresSowReview: route.requiresSowReview,
  };
}

export { CATEGORY_TO_CHANNEL };
