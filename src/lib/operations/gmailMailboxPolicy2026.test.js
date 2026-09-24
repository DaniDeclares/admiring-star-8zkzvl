import { describe, expect, it } from 'vitest';
import { classifyGmailMessage, mailboxRole, CREDIT_LABEL } from './gmailMailboxPolicy2026.js';

describe('Gmail mailbox governance', () => {
  it('keeps the Google test account internal-only', () => {
    const result = classifyGmailMessage({accountEmail:'testingdd63@gmail.com',subject:'Test customer quote'});
    expect(mailboxRole('testingdd63@gmail.com')).toBe('INTERNAL_OPS_TESTING');
    expect(result.internalOnly).toBe(true);
    expect(result.leadScoutEligible).toBe(false);
    expect(result.productionMetricsEligible).toBe(false);
  });

  it('routes credit mail to the standalone credit label', () => {
    const result = classifyGmailMessage({accountEmail:'danijfong20@gmail.com',subject:'Your Experian credit report is ready'});
    expect(result.labels.some(x => x.label === CREDIT_LABEL)).toBe(true);
  });

  it('suppresses user-initiated integration activity from Lead Scout', () => {
    const result = classifyGmailMessage({accountEmail:'vendors@danideclares.com',subject:'Your Adspirer plugin connection is ready',snippet:'Authorize your ad account integration'});
    expect(result.leadScoutEligible).toBe(false);
    expect(result.suppressionReason).toBe('USER_INITIATED_INTEGRATION_ACTIVITY');
  });

  it('does not suppress genuine commercial activity just because integration is mentioned', () => {
    const result = classifyGmailMessage({accountEmail:'vendors@danideclares.com',subject:'Partnership proposal for your integration'});
    expect(result.leadScoutEligible).toBe(true);
  });
  it('keeps useful newsletters as intelligence without making them leads', () => {
    const result = classifyGmailMessage({
      accountEmail:'vendors@danideclares.com',
      from:'newsletter@example.com',
      subject:'Field service pricing and customer retention trends',
      snippet:'Automated newsletter about operations, pricing, and customer acquisition.'
    });
    expect(result.intelligenceEligible).toBe(true);
    expect(result.intelligenceSignals.length).toBeGreaterThan(0);
    expect(result.intelligenceReviewRequired).toBe(true);
  });
});
