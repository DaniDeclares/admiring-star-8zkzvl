import { localPrecheckEmail, OUTREACH_PRIMARY_ACCOUNTS } from './outreachEligibility2026.js';

describe('outreachEligibility2026', () => {
  test('exports primary accounts used for shared campaign memory', () => {
    expect(OUTREACH_PRIMARY_ACCOUNTS).toContain('vendors@danideclares.com');
    expect(OUTREACH_PRIMARY_ACCOUNTS).toContain('danideclaresns@gmail.com');
  });

  test('localPrecheck rejects empty or invalid emails', () => {
    expect(localPrecheckEmail('').ok).toBe(false);
    expect(localPrecheckEmail('not-an-email').ok).toBe(false);
    expect(localPrecheckEmail('good@example.com').ok).toBe(true);
  });
});
