import {
  DISPATCH_ACTIONS,
  DISPATCH_STATES,
  nextDispatchState,
} from './dispatchEngine2026.js';

describe('G4 dispatch state machine', () => {
  test('created jobs can enter dispatch review', () => {
    expect(
      nextDispatchState(DISPATCH_STATES.CREATED, DISPATCH_ACTIONS.MOVE_TO_REVIEW),
    ).toBe(DISPATCH_STATES.DISPATCH_REVIEW);
  });

  test('review can offer an assignment', () => {
    expect(
      nextDispatchState(DISPATCH_STATES.DISPATCH_REVIEW, DISPATCH_ACTIONS.OFFER_ASSIGNMENT),
    ).toBe(DISPATCH_STATES.ASSIGNMENT_OFFERED);
  });

  test('offered assignment can be accepted or rejected', () => {
    expect(
      nextDispatchState(DISPATCH_STATES.ASSIGNMENT_OFFERED, DISPATCH_ACTIONS.PROVIDER_ACCEPT),
    ).toBe(DISPATCH_STATES.ACCEPTED);
    expect(
      nextDispatchState(DISPATCH_STATES.ASSIGNMENT_OFFERED, DISPATCH_ACTIONS.PROVIDER_REJECT),
    ).toBe(DISPATCH_STATES.REJECTED);
  });

  test('invalid provider acceptance before an offer is rejected', () => {
    expect(() =>
      nextDispatchState(DISPATCH_STATES.DISPATCH_REVIEW, DISPATCH_ACTIONS.PROVIDER_ACCEPT),
    ).toThrow('DISPATCH_STATE_VIOLATION');
  });

  test('accepted work can start and complete', () => {
    expect(
      nextDispatchState(DISPATCH_STATES.ACCEPTED, DISPATCH_ACTIONS.START_JOB),
    ).toBe(DISPATCH_STATES.IN_PROGRESS);
    expect(
      nextDispatchState(DISPATCH_STATES.IN_PROGRESS, DISPATCH_ACTIONS.COMPLETE_JOB),
    ).toBe(DISPATCH_STATES.COMPLETED);
  });
});
