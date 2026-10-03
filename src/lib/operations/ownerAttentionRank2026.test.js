import { ownerAttentionNow, ownerAttentionDeferred, needsOwnerNow } from './ownerAttentionRank2026.js';

const item = (id, priority, governor) => ({ id, priority, metadata: governor ? { governor } : {} });

describe('ownerAttentionRank2026', () => {
  test('orders evaluated items by governor rank, not by priority label', () => {
    const rows = [
      item('low-value-p0', 'P0', { state: 'ACTIONABLE_NOW', rank_score: 1007, needs_owner_now: true }),
      item('turn-350', 'P1', { state: 'ACTIONABLE_NOW', rank_score: 1290, needs_owner_now: true }),
      item('netlify', 'P0', { state: 'OWNER_ONLY', rank_score: 1000, needs_owner_now: true }),
    ];
    expect(ownerAttentionNow(rows).map(r => r.id)).toEqual(['turn-350', 'low-value-p0', 'netlify']);
  });

  test('waiting, unproven and suppressed items leave the owner list but are not lost', () => {
    const rows = [
      item('rpm', 'P1', { state: 'WAITING', rank_score: 30, needs_owner_now: false }),
      item('dnc', 'P0', { state: 'BLOCKED', rank_score: 0, needs_owner_now: false }),
      item('turn', 'P1', { state: 'ACTIONABLE_NOW', rank_score: 1290, needs_owner_now: true }),
    ];
    expect(ownerAttentionNow(rows).map(r => r.id)).toEqual(['turn']);
    expect(ownerAttentionDeferred(rows).map(r => r.id)).toEqual(['rpm', 'dnc']);
  });

  test('items without a governor evaluation stay visible in their original order', () => {
    const rows = [item('a', 'P2'), item('b', 'P0'), item('c', 'P1')];
    expect(rows.every(needsOwnerNow)).toBe(true);
    expect(ownerAttentionNow(rows).map(r => r.id)).toEqual(['a', 'b', 'c']);
  });
});
