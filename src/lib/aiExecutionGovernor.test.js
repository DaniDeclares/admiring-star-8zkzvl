import {
  EXECUTION_TIERS,
  evaluateDemandValidation,
  evaluateExecutionResult,
  evaluateResourceUsage,
  routeExecutionTask,
} from './aiExecutionGovernor';

const runtimePolicy = (overrides = {}) => ({
  policy_key: 'test-runtime-policy',
  resource_governance_mode: 'SHADOW',
  max_agent_turns: 4,
  max_model_calls: 2,
  max_tool_calls: 8,
  max_retries: 1,
  max_elapsed_seconds: 60,
  token_budget: 8000,
  cost_budget_usd: 0.05,
  ...overrides,
});

describe('aiExecutionGovernor', () => {
  test('routes known deterministic work away from reasoning models', () => {
    const route = routeExecutionTask({ kind: 'HASH_COMPARE', deterministic: true, knownProcedure: true, authorityResolved: true });
    expect(route.tier).toBe(EXECUTION_TIERS.DETERMINISTIC);
    expect(route.ownerApprovalRequired).toBe(false);
  });
  test('routes bounded mechanical work to cheapest verified capable worker', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true });
    expect(route.tier).toBe(EXECUTION_TIERS.BOUNDED_WORKER);
    expect(route.workerSelection).toBe('CHEAPEST_VERIFIED_CAPABLE');
  });
  test('escalates security and failed-boundary work', () => {
    const route = routeExecutionTask({ kind: 'MECHANICAL_EDIT', authorityResolved: true, scopeBounded: true, risks: ['SECURITY_BOUNDARY'] });
    expect(route.tier).toBe(EXECUTION_TIERS.FRONTIER_REVIEW);
    expect(route.independentReviewRequired).toBe(true);
  });
  test.each(['PRICING_CHANGE', 'DEBT_COMMITMENT', 'INVESTMENT_COMMITMENT', 'INVENTORY_PURCHASE'])(
    'preserves owner approval for governed action %s without inventing a new gate', (action) => {
      const route = routeExecutionTask({ kind: 'KNOWN_RECONCILIATION', deterministic: true, knownProcedure: true, authorityResolved: true, actions: [action] });
      expect(route.tier).toBe(EXECUTION_TIERS.DETERMINISTIC);
      expect(route.ownerApprovalRequired).toBe(true);
    });
  test('keeps missing demand evidence UNKNOWN and never grants release', () => {
    expect(evaluateDemandValidation({ expectedPrice: 100, variableCost: 40, fulfillmentVerified: true, authorityResolved: true })).toEqual(expect.objectContaining({
      decision: 'NARROW', demandState: 'UNKNOWN', contribution: 60, releaseAuthorized: false, nextAction: 'RUN_SMALLEST_REVERSIBLE_TEST',
    }));
  });
  test('holds paid demand when unit economics are unknown', () => {
    const assessment = evaluateDemandValidation({ paidDemandEvidence: ['paid-order-1'], fulfillmentVerified: true, authorityResolved: true });
    expect(assessment.decision).toBe('MODIFY');
    expect(assessment.contribution).toBeNull();
    expect(assessment.risks).toContain('unit economics unverified');
    expect(assessment.releaseAuthorized).toBe(false);
  });
  test('rejects nonpositive contribution even when paid demand exists', () => {
    const assessment = evaluateDemandValidation({ paidDemandEvidence: ['paid-order-1'], expectedPrice: 100, variableCost: 100, fulfillmentVerified: true, authorityResolved: true });
    expect(assessment.decision).toBe('MODIFY');
    expect(assessment.risks).toContain('nonpositive contribution');
    expect(assessment.releaseAuthorized).toBe(false);
  });
  test.each([
    [{ fulfillmentVerified: false, authorityResolved: true }, 'fulfillment unverified'],
    [{ fulfillmentVerified: true, authorityResolved: false }, 'commercial authority unresolved'],
  ])('holds evidenced demand when a required authority fact is unresolved', (facts, risk) => {
    const assessment = evaluateDemandValidation({ paidDemandEvidence: ['paid-order-1'], expectedPrice: 100, variableCost: 40, ...facts });
    expect(assessment.decision).toBe('MODIFY');
    expect(assessment.risks).toContain(risk);
    expect(assessment.releaseAuthorized).toBe(false);
  });
  test('a favorable advisory result still follows the existing release gates', () => {
    const assessment = evaluateDemandValidation({ paidDemandEvidence: ['paid-order-1'], expectedPrice: 100, variableCost: 40, fulfillmentVerified: true, authorityResolved: true });
    expect(assessment).toEqual(expect.objectContaining({ decision: 'PROCEED', demandState: 'EVIDENCED', contribution: 60, risks: [], releaseAuthorized: false, nextAction: 'FOLLOW_EXISTING_RELEASE_GATES' }));
  });
  test('demand validation is opt-in and advisory to the existing router', () => {
    const withoutValidation = routeExecutionTask({ kind: 'HASH_COMPARE', deterministic: true, knownProcedure: true, authorityResolved: true });
    expect(withoutValidation.demandValidation).toBeNull();
    const withValidation = routeExecutionTask({ kind: 'HASH_COMPARE', deterministic: true, knownProcedure: true, authorityResolved: true, demandValidationRequired: true, demandValidation: { expectedPrice: 100, variableCost: 40, fulfillmentVerified: true, authorityResolved: true } });
    expect(withValidation.tier).toBe(EXECUTION_TIERS.DETERMINISTIC);
    expect(withValidation.ownerApprovalRequired).toBe(false);
    expect(withValidation.demandValidation.decision).toBe('NARROW');
    expect(withValidation.demandValidation.releaseAuthorized).toBe(false);
    expect(withValidation.reasons).toContain('demand validation requires evidence or a bounded test before new build');
  });
  test('failed verification escalates rather than looping at the same tier', () => {
    const route = routeExecutionTask({ authorityResolved: true });
    expect(evaluateExecutionResult({ route, result: { verificationPassed: false } })).toEqual({ outcomeState: 'FAILED', nextAction: 'ESCALATE_REPAIR', minimumNextTier: EXECUTION_TIERS.FRONTIER_REVIEW });
  });
  test('a live deployment is not green until the requested business outcome is proven', () => {
    const route = routeExecutionTask({ authorityResolved: true });
    expect(evaluateExecutionResult({ route, result: { liveVerified: true } })).toEqual({ outcomeState: 'OBSERVING', nextAction: 'OBSERVE_BUSINESS_OUTCOME' });
  });
  test('material changes require independent review', () => {
    const route = routeExecutionTask({ materialChange: true, authorityResolved: true });
    expect(evaluateExecutionResult({ route, result: { preProductionVerified: true, independentReviewPassed: false } })).toEqual({ outcomeState: 'EXECUTING', nextAction: 'INDEPENDENT_REVIEW' });
  });

  test('uses existing per-agent policy budgets instead of inventing tier ceilings', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true, runtimePolicy: runtimePolicy() });
    expect(route.resourceGovernance).toEqual(expect.objectContaining({
      policyResolved: true, policyKey: 'test-runtime-policy', mode: 'SHADOW',
      action: 'OBSERVE_AND_COMPARE', retryPolicy: 'NO_AUTOMATIC_REPEAT_AFTER_RESOURCE_OVERRUN',
    }));
    expect(route.resourceGovernance.limits).toEqual({
      totalTokens: 8000, modelCalls: 2, toolCalls: 8, retries: 1, wallTimeMs: 60000, costUsd: 0.05,
    });
    expect(route.resourceGovernance.preInferenceCapEnforced).toBe(false);
  });
  test('captures supplied estimates without inventing missing usage or cost', () => {
    const route = routeExecutionTask({
      authorityResolved: true, runtimePolicy: runtimePolicy(),
      estimatedInputTokens: 9000, estimatedCostUsd: 0.01,
    });
    expect(route.resourceGovernance.requested).toEqual(expect.objectContaining({
      inputTokens: 9000, costUsd: 0.01, outputTokens: null, totalTokens: null,
    }));
  });
  test('detects a shadow overrun without turning shadow observation into enforcement', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true, runtimePolicy: runtimePolicy() });
    expect(evaluateResourceUsage({ route, usage: {
      inputTokens: 7500, outputTokens: 800, modelCalls: 1, toolCalls: 2, retries: 0, wallTimeMs: 12000, costUsd: 0.01,
    } })).toEqual(expect.objectContaining({
      mode: 'SHADOW', status: 'EXCEEDED', exceeded: ['totalTokens'],
      retryAllowed: false, nextAction: 'RECORD_SHADOW_OVERRUN',
    }));
  });
  test('enforce mode holds on a measured overrun before claim or action', () => {
    const route = routeExecutionTask({
      kind: 'EXTRACT', authorityResolved: true, scopeBounded: true,
      runtimePolicy: runtimePolicy({ resource_governance_mode: 'ENFORCE' }),
    });
    expect(evaluateResourceUsage({ route, usage: {
      inputTokens: 7500, outputTokens: 800, modelCalls: 1, toolCalls: 2, retries: 0, wallTimeMs: 12000, costUsd: 0.01,
    } })).toEqual(expect.objectContaining({
      mode: 'ENFORCE', status: 'EXCEEDED', exceeded: ['totalTokens'],
      retryAllowed: false, nextAction: 'HOLD_BEFORE_CLAIM_OR_ACTION',
    }));
  });
  test('keeps missing usage unknown and respects only the authoritative runtime policy', () => {
    const route = routeExecutionTask({ authorityResolved: true, runtimePolicy: runtimePolicy() });
    expect(evaluateResourceUsage({ route, usage: {} })).toEqual(expect.objectContaining({
      status: 'UNKNOWN',
      missing: ['inputTokens', 'outputTokens', 'modelCalls', 'toolCalls', 'retries', 'wallTimeMs', 'costUsd'],
      measurementComplete: false, retryAllowed: false, nextAction: 'CONTINUE_WITH_USAGE_GAP',
    }));
    expect(route.resourceGovernance.limits.totalTokens).toBe(8000);
    const noPolicy = routeExecutionTask({ authorityResolved: true });
    expect(evaluateResourceUsage({ route: noPolicy, usage: {} }).status).toBe('UNKNOWN');
  });
  test('marks partial and invalid provider measurements without treating them as zero', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true, runtimePolicy: runtimePolicy() });
    expect(evaluateResourceUsage({ route, usage: {
      inputTokens: 100, modelCalls: 1, toolCalls: 0, retries: 0, wallTimeMs: 1000, costUsd: 0.001,
    } })).toEqual(expect.objectContaining({
      status: 'PARTIAL', observed: expect.objectContaining({ inputTokens: 100 }), missing: ['outputTokens'],
      measurementComplete: false,
    }));
    expect(evaluateResourceUsage({ route, usage: {
      inputTokens: -1, outputTokens: 1, modelCalls: 1, toolCalls: 0, retries: 0, wallTimeMs: 1000, costUsd: 0.001,
    } })).toEqual(expect.objectContaining({
      status: 'INVALID', invalid: ['inputTokens'], measurementComplete: false,
    }));
  });
  test('reports within limits only when every configured measurement is present', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true, runtimePolicy: runtimePolicy() });
    expect(evaluateResourceUsage({ route, usage: {
      inputTokens: 1200, outputTokens: 300, modelCalls: 1, toolCalls: 2, retries: 0, wallTimeMs: 12000, costUsd: 0.004,
    } })).toEqual(expect.objectContaining({
      status: 'WITHIN_LIMITS', measurementComplete: true, missing: [], invalid: [], exceeded: [],
      observed: expect.objectContaining({ totalTokens: 1500, costUsd: 0.004 }),
    }));
  });
  test('does not allow task-local overrides to replace the existing runtime policy', () => {
    const route = routeExecutionTask({
      authorityResolved: true, runtimePolicy: runtimePolicy(),
      resourceLimits: { token_budget: 100, cost_budget_usd: 0.001 },
    });
    expect(route.resourceGovernance.limits.totalTokens).toBe(8000);
    expect(route.resourceGovernance.limits.costUsd).toBe(0.05);
    expect(route.resourceGovernance.invalidOverrides).toEqual(['token_budget', 'cost_budget_usd']);
  });
});
