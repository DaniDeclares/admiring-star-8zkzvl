import { strict as assert } from 'node:assert';
import { assertTransition, canTransition, nextStateAfterPayment, workflowFamily } from './workflowStateMachines2026.js';

describe('workflowStateMachines2026', () => {
  test('maps channel families correctly', () => {
    assert.equal(workflowFamily('B2C'), 'B2C');
    assert.equal(workflowFamily('B2B_APT'), 'B2B');
    assert.equal(workflowFamily('B2B_RE'), 'B2B');
    assert.equal(workflowFamily('B2G'), 'B2G');
  });

  test('allows only valid channel transitions', () => {
    assert.equal(canTransition('B2C', 'PAID', 'JOB_CREATED'), true);
    assert.equal(canTransition('B2C', 'PAID', 'INVOICED'), false);
    assert.equal(canTransition('B2B_APT', 'PROPOSAL_SENT', 'APPROVED'), true);
    assert.equal(canTransition('B2B_RE', 'APPROVED', 'JOB_CREATED'), true);
    assert.equal(canTransition('B2G', 'BID_SUBMITTED', 'AWARDED'), true);
    assert.equal(canTransition('B2G', 'PAID', 'JOB_CREATED'), false);
  });

  test('protects payment gates', () => {
    assert.equal(nextStateAfterPayment('B2C'), 'JOB_CREATED');
    assert.throws(() => assertTransition('B2C', 'PAID', 'INVOICED'), /Invalid workflow transition/);
    assert.throws(() => nextStateAfterPayment('B2B_APT'), /commercial approval workflow/);
  });
});
