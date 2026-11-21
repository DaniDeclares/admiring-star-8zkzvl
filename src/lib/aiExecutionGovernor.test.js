import {
  EXECUTION_TIERS,
  evaluateDemandValidation,
  evaluateExecutionResult,
  evaluateResourceUsage,
  routeExecutionTask,
} from './aiExecutionGovernor';

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

  test('provides bounded shadow resource ceilings by routing tier', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true });
    expect(route.resourceGovernance).toEqual(expect.objectContaining({
      mode: 'SHADOW', action: 'OBSERVE_AND_COMPARE', retryPolicy: 'NO_AUTOMATIC_REPEAT_AFTER_RESOURCE_OVERRUN',
    }));
    expect(route.resourceGovernance.limits.inputTokens).toBe(8000);
    expect(route.resourceGovernance.requested.inputTokens).toBeNull();
  });
  test('captures supplied estimates without inventing missing usage or cost', () => {
    const route = routeExecutionTask({ authorityResolved: true, estimatedInputTokens: 9000, estimatedCostUsd: 0.01 });
    expect(route.resourceGovernance.requested).toEqual(expect.objectContaining({ inputTokens: 9000, costUsd: 0.01, outputTokens: null }));
  });
  test('detects measured resource overrun but never automatically retries', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true });
    expect(evaluateResourceUsage({ route, usage: { inputTokens: 9001, outputTokens: 800, modelCalls: 1, wallTimeMs: 12000 } })).toEqual(expect.objectContaining({
      mode: 'SHADOW', status: 'EXCEEDED', exceeded: ['inputTokens'], retryAllowed: false, nextAction: 'HOLD_AND_REVIEW_RESOURCE_OVERRUN',
    }));
  });
  test('keeps missing usage unknown and respects valid scoped policy overrides', () => {
    const route = routeExecutionTask({ authorityResolved: true, resourceLimits: { inputTokens: 1000, costUsd: 0.02 } });
    expect(evaluateResourceUsage({ route, usage: {} })).toEqual(expect.objectContaining({
      status: 'UNKNOWN', observed: {}, missing: ['inputTokens', 'outputTokens', 'modelCalls', 'wallTimeMs', 'costUsd'],
      measurementComplete: false, retryAllowed: false, nextAction: 'CONTINUE_WITH_USAGE_GAP',
    }));
    expect(route.resourceGovernance.limits.inputTokens).toBe(1000);
    expect(route.resourceGovernance.limits.costUsd).toBe(0.02);
  });
  test('marks partial and invalid provider measurements without treating them as zero', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true });
    expect(evaluateResourceUsage({ route, usage: { inputTokens: 100 } })).toEqual(expect.objectContaining({
      status: 'PARTIAL', observed: { inputTokens: 100 }, missing: ['outputTokens', 'modelCalls', 'wallTimeMs'],
      measurementComplete: false,
    }));
    expect(evaluateResourceUsage({ route, usage: { inputTokens: -1 } })).toEqual(expect.objectContaining({
      status: 'INVALID', invalid: ['inputTokens'], measurementComplete: false,
    }));
  });
  test('reports within limits only when every configured measurement is present', () => {
    const route = routeExecutionTask({ kind: 'EXTRACT', authorityResolved: true, scopeBounded: true });
    expect(evaluateResourceUsage({ route, usage: {
      inputTokens: 1200, outputTokens: 300, modelCalls: 1, wallTimeMs: 12000, costUsd: 0.004,
    } })).toEqual(expect.objectContaining({
      status: 'WITHIN_LIMITS', measurementComplete: true, missing: [], invalid: [], exceeded: [],
      observed: { inputTokens: 1200, outputTokens: 300, modelCalls: 1, wallTimeMs: 12000, costUsd: 0.004 },
    }));
    expect(route.resourceGovernance.limits.costUsd).toBeUndefined();
  });
  test('rejects invalid or unknown resource-limit overrides instead of silently accepting them', () => {
    const route = routeExecutionTask({ authorityResolved: true, resourceLimits: { inputTokens: -1, vendorRank: 1, costUsd: 0.01 } });
    expect(route.resourceGovernance.limits.inputTokens).toBe(24000);
    expect(route.resourceGovernance.limits.costUsd).toBe(0.01);
    expect(route.resourceGovernance.invalidOverrides).toEqual(['inputTokens', 'vendorRank']);
  });
});
