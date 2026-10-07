import {
  EXECUTION_TIERS,
  evaluateExecutionResult,
  routeExecutionTask,
} from './aiExecutionGovernor';

describe('aiExecutionGovernor', () => {
  test('routes known deterministic work away from reasoning models', () => {
    const route = routeExecutionTask({
      kind: 'HASH_COMPARE',
      deterministic: true,
      knownProcedure: true,
      authorityResolved: true,
    });
    expect(route.tier).toBe(EXECUTION_TIERS.DETERMINISTIC);
    expect(route.ownerApprovalRequired).toBe(false);
  });

  test('routes bounded mechanical work to cheapest verified capable worker', () => {
    const route = routeExecutionTask({
      kind: 'EXTRACT',
      authorityResolved: true,
      scopeBounded: true,
    });
    expect(route.tier).toBe(EXECUTION_TIERS.BOUNDED_WORKER);
    expect(route.workerSelection).toBe('CHEAPEST_VERIFIED_CAPABLE');
  });

  test('escalates security and failed-boundary work', () => {
    const route = routeExecutionTask({
      kind: 'MECHANICAL_EDIT',
      authorityResolved: true,
      scopeBounded: true,
      risks: ['SECURITY_BOUNDARY'],
    });
    expect(route.tier).toBe(EXECUTION_TIERS.FRONTIER_REVIEW);
    expect(route.independentReviewRequired).toBe(true);
  });

  test('preserves owner approval for governed actions without inventing a new gate', () => {
    const route = routeExecutionTask({
      kind: 'KNOWN_RECONCILIATION',
      deterministic: true,
      knownProcedure: true,
      authorityResolved: true,
      actions: ['PRICING_CHANGE'],
    });
    expect(route.tier).toBe(EXECUTION_TIERS.DETERMINISTIC);
    expect(route.ownerApprovalRequired).toBe(true);
  });

  test('failed verification escalates rather than looping at the same tier', () => {
    const route = routeExecutionTask({ authorityResolved: true });
    expect(evaluateExecutionResult({ route, result: { verificationPassed: false } })).toEqual({
      outcomeState: 'FAILED',
      nextAction: 'ESCALATE_REPAIR',
      minimumNextTier: EXECUTION_TIERS.FRONTIER_REVIEW,
    });
  });

  test('a live deployment is not green until the requested business outcome is proven', () => {
    const route = routeExecutionTask({ authorityResolved: true });
    expect(evaluateExecutionResult({ route, result: { liveVerified: true } })).toEqual({
      outcomeState: 'OBSERVING',
      nextAction: 'OBSERVE_BUSINESS_OUTCOME',
    });
  });

  test('material changes require independent review', () => {
    const route = routeExecutionTask({ materialChange: true, authorityResolved: true });
    expect(evaluateExecutionResult({
      route,
      result: { preProductionVerified: true, independentReviewPassed: false },
    })).toEqual({ outcomeState: 'EXECUTING', nextAction: 'INDEPENDENT_REVIEW' });
  });
});
