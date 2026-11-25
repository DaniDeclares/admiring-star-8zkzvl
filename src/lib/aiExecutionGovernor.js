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

function resolveRuntimeResourcePolicy(policy) {
  if (!policy || typeof policy !== 'object' || typeof policy.policy_key !== 'string' || !policy.policy_key ||
      !['SHADOW', 'ENFORCE'].includes(policy.resource_governance_mode)) {
    return { policyResolved: false, policyKey: policy?.policy_key || null, mode: 'UNCONFIGURED', limits: {} };
  }
  const maxModelCalls = validUsageNumber(policy.max_model_calls)
    ? policy.max_model_calls
    : policy.max_agent_turns;
  const limits = {
    totalTokens: validUsageNumber(policy.token_budget) ? policy.token_budget : null,
    modelCalls: validUsageNumber(maxModelCalls) ? maxModelCalls : null,
    toolCalls: validUsageNumber(policy.max_tool_calls) ? policy.max_tool_calls : null,
    retries: validUsageNumber(policy.max_retries) ? policy.max_retries : null,
    wallTimeMs: validUsageNumber(policy.max_elapsed_seconds) ? policy.max_elapsed_seconds * 1000 : null,
    costUsd: validUsageNumber(policy.cost_budget_usd) ? policy.cost_budget_usd : null,
  };
  return {
    policyResolved: true,
    policyKey: policy.policy_key,
    mode: policy.resource_governance_mode === 'ENFORCE' ? 'ENFORCE' : 'SHADOW',
    limits,
  };
}

/** Compares provider usage with the existing per-agent runtime policy. No local tier budgets are invented. */
export function evaluateResourceUsage({ route, usage = {} } = {}) {
  if (!route) throw new Error('route is required');
  const limits = route.resourceGovernance?.limits || {};
  const observed = {};
  const missing = [];
  const invalid = [];
  const exceeded = [];
  const metricValues = {
    inputTokens: usage?.inputTokens,
    outputTokens: usage?.outputTokens,
    modelCalls: usage?.modelCalls,
    toolCalls: usage?.toolCalls,
    retries: usage?.retries,
    wallTimeMs: usage?.wallTimeMs,
    costUsd: usage?.costUsd,
  };
  for (const [field, value] of Object.entries(metricValues)) {
    if (value === undefined || value === null) continue;
    if (!validUsageNumber(value)) invalid.push(field);
    else observed[field] = value;
  }
  const requiredMetricCount = (validUsageNumber(limits.totalTokens) ? 2 : 0)
    + ['modelCalls', 'toolCalls', 'retries', 'wallTimeMs', 'costUsd'].filter((field) => validUsageNumber(limits[field])).length;
  if (validUsageNumber(limits.totalTokens)) {
    if (metricValues.inputTokens === undefined || metricValues.inputTokens === null) missing.push('inputTokens');
    if (metricValues.outputTokens === undefined || metricValues.outputTokens === null) missing.push('outputTokens');
    if (validUsageNumber(metricValues.inputTokens) && validUsageNumber(metricValues.outputTokens)) {
      observed.totalTokens = metricValues.inputTokens + metricValues.outputTokens;
      if (observed.totalTokens > limits.totalTokens) exceeded.push('totalTokens');
    }
  }
  for (const field of ['modelCalls', 'toolCalls', 'retries', 'wallTimeMs', 'costUsd']) {
    if (!validUsageNumber(limits[field])) continue;
    const value = metricValues[field];
    if (value === undefined || value === null) missing.push(field);
    else if (validUsageNumber(value) && value > limits[field]) exceeded.push(field);
  }
  const status = exceeded.length ? 'EXCEEDED'
    : invalid.length ? 'INVALID'
    : !route.resourceGovernance?.policyResolved || missing.length === requiredMetricCount ? 'UNKNOWN'
    : missing.length ? 'PARTIAL'
    : 'WITHIN_LIMITS';
  const mode = route.resourceGovernance?.mode || 'SHADOW';
  const nextAction = status === 'EXCEEDED'
    ? (mode === 'SHADOW' ? 'RECORD_SHADOW_OVERRUN' : 'HOLD_BEFORE_CLAIM_OR_ACTION')
    : ['INVALID', 'PARTIAL', 'UNKNOWN'].includes(status)
      ? (mode === 'SHADOW' ? 'CONTINUE_WITH_USAGE_GAP' : 'HOLD_FOR_USAGE_EVIDENCE')
      : 'CONTINUE_EXISTING_VERIFICATION';
  return {
    mode,
    policyKey: route.resourceGovernance?.policyKey || null,
    status,
    observed,
    missing: unique(missing),
    invalid: unique(invalid),
    limits,
    exceeded,
    measurementComplete: missing.length === 0 && invalid.length === 0 && route.resourceGovernance?.policyResolved === true,
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
  const runtimeResourcePolicy = resolveRuntimeResourcePolicy(task.runtimePolicy);
  const invalidOverrides = task.resourceLimits && typeof task.resourceLimits === 'object'
    ? Object.keys(task.resourceLimits)
    : task.resourceLimits == null ? [] : ['resourceLimits'];
  const requestedInputTokens = validUsageNumber(task.estimatedInputTokens) ? task.estimatedInputTokens : null;
  const requestedOutputTokens = validUsageNumber(task.estimatedOutputTokens) ? task.estimatedOutputTokens : null;
  const resourceGovernance = {
    ...runtimeResourcePolicy,
    invalidOverrides,
    requested: {
      inputTokens: requestedInputTokens,
      outputTokens: requestedOutputTokens,
      totalTokens: requestedInputTokens !== null && requestedOutputTokens !== null ? requestedInputTokens + requestedOutputTokens : null,
      modelCalls: validUsageNumber(task.expectedModelCalls) ? task.expectedModelCalls : null,
      toolCalls: validUsageNumber(task.expectedToolCalls) ? task.expectedToolCalls : null,
      retries: validUsageNumber(task.expectedRetries) ? task.expectedRetries : null,
      wallTimeMs: validUsageNumber(task.estimatedWallTimeMs) ? task.estimatedWallTimeMs : null,
      costUsd: validUsageNumber(task.estimatedCostUsd) ? task.estimatedCostUsd : null,
    },
    usageFields: Object.entries(runtimeResourcePolicy.limits).filter(([, limit]) => validUsageNumber(limit)).map(([field]) => field),
    enforcementBoundary: 'EXISTING_GOVERNED_AGENT_RUNTIME_RESERVATION_REQUIRED',
    preInferenceCapEnforced: false,
    action: runtimeResourcePolicy.mode === 'ENFORCE' ? 'REQUIRE_GOVERNED_RUNTIME_RESERVATION' : runtimeResourcePolicy.mode === 'UNCONFIGURED' ? 'HOLD_UNCONFIGURED_POLICY' : 'OBSERVE_AND_COMPARE',
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
