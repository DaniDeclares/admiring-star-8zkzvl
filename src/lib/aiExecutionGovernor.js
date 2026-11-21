/**
 * Deterministic routing and shadow resource policy for DANI's existing Intent-to-Outcome Engine.
 *
 * Not an agent, scheduler, queue, model registry, or authority. Worker selection still
 * comes from verified capability evidence in Tester dd_integration_operating_registry.
 */
export const EXECUTION_TIERS = Object.freeze({
  DETERMINISTIC: 'DETERMINISTIC',
  BOUNDED_WORKER: 'BOUNDED_WORKER',
  GENERAL_REASONING: 'GENERAL_REASONING',
  FRONTIER_REVIEW: 'FRONTIER_REVIEW',
});

// Conservative per-inference ceilings. These are advisory/shadow values, not vendor
// prices or guarantees. Provider usage is evaluated only when a worker returns it.
export const RESOURCE_CEILINGS = Object.freeze({
  [EXECUTION_TIERS.DETERMINISTIC]: Object.freeze({ inputTokens: 0, outputTokens: 0, modelCalls: 0, wallTimeMs: 30000 }),
  [EXECUTION_TIERS.BOUNDED_WORKER]: Object.freeze({ inputTokens: 8000, outputTokens: 2000, modelCalls: 1, wallTimeMs: 60000 }),
  [EXECUTION_TIERS.GENERAL_REASONING]: Object.freeze({ inputTokens: 24000, outputTokens: 4000, modelCalls: 1, wallTimeMs: 120000 }),
  [EXECUTION_TIERS.FRONTIER_REVIEW]: Object.freeze({ inputTokens: 40000, outputTokens: 6000, modelCalls: 1, wallTimeMs: 180000 }),
});

const OWNER_GATED_ACTIONS = new Set([
  'DEBT_COMMITMENT', 'INVESTMENT_COMMITMENT', 'INVENTORY_PURCHASE', 'OUTBOUND_MESSAGE',
  'PRICING_CHANGE', 'MONEY_MOVEMENT', 'LEGAL_CLAIM', 'COMPLIANCE_CLAIM', 'PRODUCTION_MUTATION',
]);
const FRONTIER_RISKS = new Set([
  'SECURITY_BOUNDARY', 'ARCHITECTURE', 'DATA_AUTHORITY_CONFLICT', 'FAILED_VERIFICATION', 'PRODUCTION_INCIDENT',
]);
const BOUNDED_KINDS = new Set([
  'CLASSIFY', 'EXTRACT', 'FORMAT', 'HASH_COMPARE', 'KNOWN_TEST_RUN', 'KNOWN_RECONCILIATION', 'MECHANICAL_EDIT',
]);
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function validUsageNumber(value) { return Number.isFinite(value) && value >= 0; }
const RESOURCE_USAGE_FIELDS = Object.freeze(['inputTokens', 'outputTokens', 'modelCalls', 'wallTimeMs', 'costUsd']);

function normalizeResourceLimits(defaults, overrides) {
  const limits = { ...defaults };
  const invalidOverrides = [];
  if (overrides !== undefined && overrides !== null) {
    if (typeof overrides !== 'object' || Array.isArray(overrides)) {
      invalidOverrides.push('resourceLimits');
    } else {
      for (const [field, value] of Object.entries(overrides)) {
        if (!RESOURCE_USAGE_FIELDS.includes(field) || !validUsageNumber(value)) invalidOverrides.push(field);
        else limits[field] = value;
      }
    }
  }
  return { limits, invalidOverrides };
}

/** Compares normalized provider usage with configured limits. Missing/invalid metrics are never zero. */
export function evaluateResourceUsage({ route, usage = {} } = {}) {
  if (!route) throw new Error('route is required');
  const limits = route.resourceGovernance?.limits || RESOURCE_CEILINGS[route.tier] || {};
  const requiredFields = RESOURCE_USAGE_FIELDS.filter((field) => validUsageNumber(limits[field]));
  const exceeded = [];
  const observed = {};
  const missing = [];
  const invalid = [];
  for (const field of RESOURCE_USAGE_FIELDS) {
    const value = usage?.[field];
    if (value === undefined || value === null) {
      if (requiredFields.includes(field)) missing.push(field);
      continue;
    }
    if (!validUsageNumber(value)) {
      invalid.push(field);
      continue;
    }
    observed[field] = value;
    if (validUsageNumber(limits[field]) && value > limits[field]) exceeded.push(field);
  }
  const status = exceeded.length ? 'EXCEEDED'
    : invalid.length ? 'INVALID'
    : missing.length === requiredFields.length ? 'UNKNOWN'
    : missing.length ? 'PARTIAL'
    : 'WITHIN_LIMITS';
  const nextAction = status === 'EXCEEDED' ? 'HOLD_AND_REVIEW_RESOURCE_OVERRUN'
    : status === 'INVALID' || status === 'PARTIAL' || status === 'UNKNOWN'
      ? 'CONTINUE_WITH_USAGE_GAP'
      : 'CONTINUE_EXISTING_VERIFICATION';
  return {
    mode: 'SHADOW',
    status,
    observed,
    missing,
    invalid,
    limits,
    exceeded,
    measurementComplete: missing.length === 0 && invalid.length === 0,
    retryAllowed: false,
    nextAction,
  };
}

/** Advisory pre-build validation: no side effects and never grants release authority. */
export function evaluateDemandValidation(input = {}) {
  const evidence = Array.isArray(input.paidDemandEvidence) ? input.paidDemandEvidence.filter(Boolean) : [];
  const costsKnown = Number.isFinite(input.expectedPrice) && Number.isFinite(input.variableCost);
  const contribution = costsKnown ? input.expectedPrice - input.variableCost : null;
  const risks = [];
  if (!evidence.length) risks.push('paid demand unverified');
  if (!costsKnown) risks.push('unit economics unverified');
  if (contribution !== null && contribution <= 0) risks.push('nonpositive contribution');
  if (input.fulfillmentVerified !== true) risks.push('fulfillment unverified');
  if (input.authorityResolved !== true) risks.push('commercial authority unresolved');
  const decision = input.authorityResolved !== true ? 'MODIFY'
    : !costsKnown ? 'MODIFY'
    : contribution <= 0 ? 'MODIFY'
    : !evidence.length ? 'NARROW'
    : input.fulfillmentVerified !== true ? 'MODIFY'
    : 'PROCEED';
  return {
    decision,
    demandState: evidence.length ? 'EVIDENCED' : 'UNKNOWN',
    contribution,
    risks,
    releaseAuthorized: false,
    ownerApprovalRequired: input.ownerApprovalRequired === true,
    nextAction: risks.length ? 'RUN_SMALLEST_REVERSIBLE_TEST' : 'FOLLOW_EXISTING_RELEASE_GATES',
  };
}

export function routeExecutionTask(task = {}) {
  const actions = new Set(task.actions || []);
  const risks = new Set(task.risks || []);
  const ownerApprovalRequired = [...actions].some((action) => OWNER_GATED_ACTIONS.has(action));
  const frontierRequired = [...risks].some((risk) => FRONTIER_RISKS.has(risk));
  let tier = EXECUTION_TIERS.GENERAL_REASONING;
  const reasons = [];
  if (frontierRequired) {
    tier = EXECUTION_TIERS.FRONTIER_REVIEW;
    reasons.push('material risk requires strongest available verified reasoning/review');
  } else if (task.deterministic === true && task.knownProcedure === true && task.authorityResolved === true) {
    tier = EXECUTION_TIERS.DETERMINISTIC;
    reasons.push('known deterministic procedure with resolved authority');
  } else if (task.authorityResolved === true && task.scopeBounded === true && BOUNDED_KINDS.has(task.kind)) {
    tier = EXECUTION_TIERS.BOUNDED_WORKER;
    reasons.push('bounded mechanical work should use the cheapest verified capable worker');
  } else {
    reasons.push('task still requires non-trivial judgment');
  }
  if (ownerApprovalRequired) reasons.push('owner-gated action must stop at the existing approval boundary before mutation');
  const independentReviewRequired = task.materialChange === true || tier === EXECUTION_TIERS.FRONTIER_REVIEW || actions.has('PRODUCTION_MUTATION');
  const demandValidation = task.demandValidationRequired === true ? evaluateDemandValidation(task.demandValidation || {}) : null;
  if (demandValidation && demandValidation.decision !== 'PROCEED') reasons.push('demand validation requires evidence or a bounded test before new build');
  const ceilings = RESOURCE_CEILINGS[tier] || RESOURCE_CEILINGS[EXECUTION_TIERS.GENERAL_REASONING];
  const { limits, invalidOverrides } = normalizeResourceLimits(ceilings, task.resourceLimits);
  const resourceGovernance = {
    mode: 'SHADOW',
    limits,
    invalidOverrides,
    requested: {
      inputTokens: validUsageNumber(task.estimatedInputTokens) ? task.estimatedInputTokens : null,
      outputTokens: validUsageNumber(task.estimatedOutputTokens) ? task.estimatedOutputTokens : null,
      modelCalls: validUsageNumber(task.expectedModelCalls) ? task.expectedModelCalls : null,
      wallTimeMs: validUsageNumber(task.estimatedWallTimeMs) ? task.estimatedWallTimeMs : null,
      costUsd: validUsageNumber(task.estimatedCostUsd) ? task.estimatedCostUsd : null,
    },
    usageFields: RESOURCE_USAGE_FIELDS.filter((field) => validUsageNumber(limits[field])),
    enforcementBoundary: 'POST_INFERENCE_PRE_CLAIM',
    preInferenceCapEnforced: false,
    action: 'OBSERVE_AND_COMPARE',
    retryPolicy: 'NO_AUTOMATIC_REPEAT_AFTER_RESOURCE_OVERRUN',
  };
  return {
    tier, demandValidation, ownerApprovalRequired, independentReviewRequired,
    workerSelection: 'CHEAPEST_VERIFIED_CAPABLE', authoritySource: 'EXISTING_CANONICAL_SYSTEMS',
    resourceGovernance,
    contextPolicy: {
      recoverHistoryFirst: true,
      include: unique(['owner_intent', 'authority_receipts', 'relevant_prior_fixes', ...(task.contextRefs || [])]),
      excludeByDefault: ['unrelated_repo_tree', 'unrelated_logs', 'unscoped_chat_history'],
    },
    reasons,
  };
}

export function evaluateExecutionResult({ route, result = {} } = {}) {
  if (!route) throw new Error('route is required');
  if (result.ownerDecisionPending === true) return { outcomeState: 'HELD', nextAction: 'SURFACE_OWNER_DECISION' };
  if (result.verificationPassed === false) return { outcomeState: 'FAILED', nextAction: 'ESCALATE_REPAIR', minimumNextTier: EXECUTION_TIERS.FRONTIER_REVIEW };
  if (route.independentReviewRequired && result.independentReviewPassed !== true) return { outcomeState: 'EXECUTING', nextAction: 'INDEPENDENT_REVIEW' };
  if (result.liveVerified === true && result.businessOutcomeProven === true) return { outcomeState: 'GREEN', nextAction: 'RECORD_LEARNING' };
  if (result.liveVerified === true) return { outcomeState: 'OBSERVING', nextAction: 'OBSERVE_BUSINESS_OUTCOME' };
  if (result.preProductionVerified === true) return { outcomeState: 'VERIFIED', nextAction: 'FOLLOW_EXISTING_PROMOTION_GATE' };
  return { outcomeState: 'EXECUTING', nextAction: 'CONTINUE_SMALLEST_DELTA' };
}
