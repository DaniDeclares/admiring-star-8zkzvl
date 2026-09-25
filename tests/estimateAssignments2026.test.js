import { resolveAcceptedAssignmentAuthority } from '../src/lib/operations/estimateAssignments2026.js';

describe('estimate assignment compensation authority', () => {
  test('direct provider acceptance freezes the proposed compensation and basis', () => {
    const result = resolveAcceptedAssignmentAuthority({
      proposed_compensation: 60,
      proposed_basis: { authority: 'PROVIDER_PAYOUT_BAND', component: 'CLEANING' },
      travel_cost_snapshot: 12.5
    });

    expect(result.authorizedProviderCompensation).toBe(60);
    expect(result.compensationBasisSnapshot).toEqual({
      authority: 'PROVIDER_PAYOUT_BAND',
      component: 'CLEANING'
    });
    expect(result.travelAllowanceSnapshot).toBe(12.5);
  });

  test('owner-accepted counteroffer freezes the accepted counter, not the original proposal', () => {
    const result = resolveAcceptedAssignmentAuthority({
      proposed_compensation: 60,
      proposed_basis: { authority: 'PROVIDER_PAYOUT_BAND', targetPayout: 60 },
      counter_compensation: 75,
      travel_cost_snapshot: 10,
      counter_basis: { reason: 'larger_scope', bandStatus: 'WITHIN_MAX_REVIEW' }
    }, {
      acceptedCounter: true,
      acceptedAt: '2026-09-25T10:00:00.000Z'
    });

    expect(result.authorizedProviderCompensation).toBe(75);
    expect(result.travelAllowanceSnapshot).toBe(10);
    expect(result.compensationBasisSnapshot).toMatchObject({
      authority: 'OWNER_ACCEPTED_PROVIDER_COUNTER',
      targetPayout: 60,
      reason: 'larger_scope',
      bandStatus: 'WITHIN_MAX_REVIEW',
      originalProposedCompensation: 60,
      acceptedCounterCompensation: 75,
      acceptedCounterAt: '2026-09-25T10:00:00.000Z'
    });
  });
});
