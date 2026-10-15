import {
  EXECUTION_TIERS,
  evaluateDemandValidation,
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

  test.each(['PRICING_CHANGE', 'DEBT_COMMITMENT', 'INVESTMENT_COMMITMENT', 'INVENTORY_PURCHASE'])(
    'preserves owner approval for governed action %s without inventing a new gate',
    (action) => {
      const route = routeExecutionTask({
        kind: 'KNOWN_RECONCILIATION',
        deterministic: true,
        knownProcedure: true,
        authorityResolved: true,
        actions: [action],
      });
      expect(route.tier).toBe(EXECUTION_TIERS.DETERMINISTIC);
      expect(route.ownerApprovalRequired).toBe(true);
    },
  );

  test('keeps missing demand evidence UNKNOWN and never grants release', () => {
    expect(evaluateDemandValidation({
      expectedPrice: 100,
      variableCost: 40,
      fulfillmentVerified: true,
      authorityResolved: true,
    })).toEqual(expect.objectContaining({
      decision: 'NARROW',
      demandState: 'UNKNOWN',
      contribution: 60,
      releaseAuthorized: false,
      nextAction: 'RUN_SMALLEST_REVERSIBLE_TEST',
    }));
  });

  test('holds paid demand when unit economics are unknown', () => {
    const assessment = evaluateDemandValidation({
      paidDemandEvidence: ['paid-order-1'],
      fulfillmentVerified: true,
      authorityResolved: true,
    });
    expect(assessment.decision).toBe('MODIFY');
    expect(assessment.contribution).toBeNull();
    expect(assessment.risks).toContain('unit economics unverified');
    expect(assessment.releaseAuthorized).toBe(false);
  });

  test('rejects nonpositive contribution even when paid demand exists', () => {
    const assessment = evaluateDemandValidation({
      paidDemandEvidence: ['paid-order-1'],
      expectedPrice: 100,
      variableCost: 100,
      fulfillmentVerified: true,
      authorityResolved: true,
    });
    expect(assessment.decision).toBe('MODIFY');
    expect(assessment.risks).toContain('nonpositive contribution');
    expect(assessment.releaseAuthorized).toBe(false);
  });

  test.each([
    [{ fulfillmentVerified: false, authorityResolved: true }, 'fulfillment unverified'],
    [{ fulfillmentVerified: true, authorityResolved: false }, 'commercial authority unresolved'],
  ])('holds evidenced demand when a required authority fact is unresolved', (facts, risk) => {
    const assessment = evaluateDemandValidation({
      paidDemandEvidence: ['paid-order-1'],
      expectedPrice: 100,
      variableCost: 40,
      ...facts,
    });
    expect(assessment.decision).toBe('MODIFY');
    expect(assessment.risks).toContain(risk);
    expect(assessment.releaseAuthorized).toBe(false);
  });

  test('a favorable advisory result still follows the existing release gates', () => {
    const assessment = evaluateDemandValidation({
      paidDemandEvidence: ['paid-order-1'],
      expectedPrice: 100,
      variableCost: 40,
      fulfillmentVerified: true,
      authorityResolved: true,
    });
    expect(assessment).toEqual(expect.objectContaining({
      decision: 'PROCEED',
      demandState: 'EVIDENCED',
      contribution: 60,
      risks: [],
      releaseAuthorized: false,
      nextAction: 'FOLLOW_EXISTING_RELEASE_GATES',
    }));
  });

  test('demand validation is opt-in and advisory to the existing router', () => {
    const withoutValidation = routeExecutionTask({
      kind: 'HASH_COMPARE',
      deterministic: true,
      knownProcedure: true,
      authorityResolved: true,
    });
    expect(withoutValidation.demandValidation).toBeNull();

    const withValidation = routeExecutionTask({
      kind: 'HASH_COMPARE',
      deterministic: true,
      knownProcedure: true,
      authorityResolved: true,
      demandValidationRequired: true,
      demandValidation: {
        expectedPrice: 100,
        variableCost: 40,
        fulfillmentVerified: true,
        authorityResolved: true,
      },
    });
    expect(withValidation.tier).toBe(EXECUTION_TIERS.DETERMINISTIC);
    expect(withValidation.ownerApprovalRequired).toBe(false);
    expect(withValidation.demandValidation.decision).toBe('NARROW');
    expect(withValidation.demandValidation.releaseAuthorized).toBe(false);
    expect(withValidation.reasons).toContain(
      'demand validation requires evidence or a bounded test before new build',
    );
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
