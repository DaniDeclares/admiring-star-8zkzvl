import { CUSTOMER_SUCCESS_LINKS, completedCustomerActions } from './customerSuccess2026.js';

describe('CH01 customer success actions', () => {
  it('shows review and continued-service actions only after completion', () => {
    expect(completedCustomerActions({ job_status: 'scheduled' })).toEqual([]);
    const actions = completedCustomerActions({ job_status: 'completed' });
    expect(actions.map(x => x.key)).toEqual(['book_again','thumbtack_review','google_review']);
    expect(CUSTOMER_SUCCESS_LINKS.createAccount).toContain('role=customer');
    expect(CUSTOMER_SUCCESS_LINKS.requestService).toBe('/request-service');
  });
});
