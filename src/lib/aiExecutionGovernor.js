/**
 * Deterministic routing policy for DANI's existing Intent-to-Outcome Engine.
 *
 * This is not an agent, scheduler, queue, model registry, or source of authority.
 * It converts already-resolved task facts into a minimum execution tier and
 * verification/escalation requirements. Worker selection still comes from
 * verified capability evidence (Tester dd_integration_operating_registry).
 */

export const EXECUTION_TIERS = Object.freeze({
  DETERMINISTIC: 'DETERMINISTIC',
  BOUNDED_WORKER: 'BOUNDED_WORKER',
  GENERAL_REASONING: 'GENERAL_REASONING',
  FRONTIER_REVIEW: 'FRONTIER_REVIEW',
});

const OWNER_GATED_ACTIONS = new Set([
  'OUTBOUND_MESSAGE',
  'PRICING_CHANGE',
  'MONEY_MOVEMENT',
  'LEGAL_CLAIM',
  'COMPLIANCE_CLAIM',
  'PRODUCTION_MUTATION',
]);

const FRONTIER_RISKS = new Set([
  'SECURITY_BOUNDARY',
  'ARCHITECTURE',
  'DATA_AUTHORITY_CONFLICT',
  'FAILED_VERIFICATION',
  'PRODUCTION_INCIDENT',
]);

const BOUNDED_KINDS = new Set([
  'CLASSIFY',
  'EXTRACT',
  'FORMAT',
  'HASH_COMPARE',
  'KNOWN_TEST_RUN',
  'KNOWN_RECONCILIATION',
  'MECHANICAL_EDIT',
]);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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
  } else if (
    task.deterministic === true &&
    task.knownProcedure === true &&
    task.authorityResolved === true
  ) {
    tier = EXECUTION_TIERS.DETERMINISTIC;
    reasons.push('known deterministic procedure with resolved authority');
  } else if (
    task.authorityResolved === true &&
    task.scopeBounded === true &&
    BOUNDED_KINDS.has(task.kind)
  ) {
    tier = EXECUTION_TIERS.BOUNDED_WORKER;
    reasons.push('bounded mechanical work should use the cheapest verified capable worker');
  } else {
    reasons.push('task still requires non-trivial judgment');
  }

  if (ownerApprovalRequired) {
    reasons.push('owner-gated action must stop at the existing approval boundary before mutation');
  }

  const independentReviewRequired =
    task.materialChange === true ||
    tier === EXECUTION_TIERS.FRONTIER_REVIEW ||
    actions.has('PRODUCTION_MUTATION');

  return {
    tier,
    ownerApprovalRequired,
    independentReviewRequired,
    workerSelection: 'CHEAPEST_VERIFIED_CAPABLE',
    authoritySource: 'EXISTING_CANONICAL_SYSTEMS',
    contextPolicy: {
      recoverHistoryFirst: true,
      include: unique([
        'owner_intent',
        'authority_receipts',
        'relevant_prior_fixes',
        ...(task.contextRefs || []),
      ]),
      excludeByDefault: ['unrelated_repo_tree', 'unrelated_logs', 'unscoped_chat_history'],
    },
    reasons,
  };
}

export function evaluateExecutionResult({ route, result = {} } = {}) {
  if (!route) throw new Error('route is required');

  if (result.ownerDecisionPending === true) {
    return { outcomeState: 'HELD', nextAction: 'SURFACE_OWNER_DECISION' };
  }

  if (result.verificationPassed === false) {
    return {
      outcomeState: 'FAILED',
      nextAction: 'ESCALATE_REPAIR',
      minimumNextTier: EXECUTION_TIERS.FRONTIER_REVIEW,
    };
  }

  if (route.independentReviewRequired && result.independentReviewPassed !== true) {
    return { outcomeState: 'EXECUTING', nextAction: 'INDEPENDENT_REVIEW' };
  }

  if (result.liveVerified === true && result.businessOutcomeProven === true) {
    return { outcomeState: 'GREEN', nextAction: 'RECORD_LEARNING' };
  }

  if (result.liveVerified === true) {
    return { outcomeState: 'OBSERVING', nextAction: 'OBSERVE_BUSINESS_OUTCOME' };
  }

  if (result.preProductionVerified === true) {
    return { outcomeState: 'VERIFIED', nextAction: 'FOLLOW_EXISTING_PROMOTION_GATE' };
  }

  return { outcomeState: 'EXECUTING', nextAction: 'CONTINUE_SMALLEST_DELTA' };
}
