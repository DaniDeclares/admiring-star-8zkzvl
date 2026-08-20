import { hasStaffRole } from '../residentDispatchService.js';

describe('residentDispatchService authorization boundary', () => {
  test('accepts only trusted staff roles from app_metadata', () => {
    expect(hasStaffRole({ app_metadata: { role: 'admin' } })).toBe(true);
    expect(hasStaffRole({ app_metadata: { role: 'owner' } })).toBe(true);
    expect(hasStaffRole({ app_metadata: { role: 'staff_admin' } })).toBe(true);
    expect(hasStaffRole({ app_metadata: { role: 'staff' } })).toBe(true);
    expect(hasStaffRole({ user_metadata: { role: 'admin' } })).toBe(false);
    expect(hasStaffRole({ app_metadata: { role: 'resident' } })).toBe(false);
    expect(hasStaffRole(null)).toBe(false);
  });
});
