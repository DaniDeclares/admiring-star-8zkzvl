import { isProspectingDue, researchProgramNeedsOwner } from './ownerHqTruth2026.js';

const now = new Date('2026-10-04T23:59:59-04:00');

describe('Owner HQ truth contract', () => {
  it('keeps a genuinely untouched overdue prospect due', () => {
    expect(isProspectingDue({
      disposition: 'NOT_CONTACTED',
      campaign_status: 'UNASSESSED',
      next_action_date: '2026-10-03',
    }, now)).toBe(true);
  });

  it('does not count a stale dated action already satisfied by a later Gmail touch', () => {
    expect(isProspectingDue({
      disposition: 'NOT_CONTACTED',
      campaign_status: 'UNASSESSED',
      next_action_date: '2026-10-03',
      source: 'GMAIL_SENT',
      source_occurred_at: '2026-10-04T14:00:00Z',
    }, now)).toBe(false);
  });

  it('allows a legitimate follow-up dated after the last outbound touch', () => {
    expect(isProspectingDue({
      disposition: 'DECISION_MAKER_REACHED',
      campaign_status: 'SENT',
      campaign_last_contacted_at: '2026-10-01T14:00:00Z',
      next_action_date: '2026-10-04',
    }, now)).toBe(true);
  });

  it('removes terminal and suppressed records from owner-now prospecting', () => {
    expect(isProspectingDue({ disposition: 'PAYMENT_SUCCEEDED', next_action_date: '2026-10-01' }, now)).toBe(false);
    expect(isProspectingDue({ disposition: 'NOT_INTERESTED', next_action_date: '2026-10-01' }, now)).toBe(false);
    expect(isProspectingDue({ disposition: 'NOT_CONTACTED', campaign_status: 'SUPPRESSED', next_action_date: '2026-10-01' }, now)).toBe(false);
  });

  it('keeps detailed research off owner-now unless owner authority is explicit', () => {
    expect(researchProgramNeedsOwner({ release_blocked: true, status: 'ACTIVE' })).toBe(false);
    expect(researchProgramNeedsOwner({ status: 'OWNER_REVIEW' })).toBe(true);
    expect(researchProgramNeedsOwner({ metadata: { needs_owner_now: true } })).toBe(true);
  });
});
