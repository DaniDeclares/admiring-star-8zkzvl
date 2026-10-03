import { OUTREACH_KNOWN_MAILBOXES } from './outreachEligibility2026.js';

describe('outreachEligibility2026 (extends #525/#527)', () => {
  test('exports the known Dani Declares mailboxes that share campaign memory', () => {
    expect(OUTREACH_KNOWN_MAILBOXES).toContain('vendors@danideclares.com');
    expect(OUTREACH_KNOWN_MAILBOXES).toContain('danideclaresns@gmail.com');
  });
});
