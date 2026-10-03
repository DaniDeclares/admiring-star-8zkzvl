/**
 * Owner-attention ordering from the governor evaluation stored in
 * dd_owner_attention_queue.metadata.governor (migration 20261003060000).
 *
 * The database decides state and rank; this only applies it on the Owner HQ
 * surface. Items without a governor evaluation (an environment where the
 * migration is not applied yet) keep their original order and stay visible.
 */

const PRIORITY_ORDER = { P0: 0, URGENT: 0, CRITICAL: 0, P1: 1, HIGH: 1, P2: 2, MEDIUM: 2 };

export function governorOf(item) {
  const governor = item?.metadata?.governor;
  return governor && typeof governor === 'object' ? governor : null;
}

/** False only when the governor has evaluated the item as not needing the owner now. */
export function needsOwnerNow(item) {
  const governor = governorOf(item);
  return !governor || governor.needs_owner_now !== false;
}

function compareByRank(a, b) {
  const ga = governorOf(a);
  const gb = governorOf(b);
  if (!ga && !gb) return 0;
  if (!ga) return 1;
  if (!gb) return -1;
  const diff = Number(gb.rank_score || 0) - Number(ga.rank_score || 0);
  if (diff) return diff;
  return (PRIORITY_ORDER[String(a.priority || '').toUpperCase()] ?? 3)
    - (PRIORITY_ORDER[String(b.priority || '').toUpperCase()] ?? 3);
}

/** Items the owner should act on now, highest governor rank first. */
export function ownerAttentionNow(items = []) {
  return items.filter(needsOwnerNow).sort(compareByRank);
}

/** Items the governor is holding back (waiting, unproven, suppressed, system-executable). */
export function ownerAttentionDeferred(items = []) {
  return items.filter(item => !needsOwnerNow(item)).sort(compareByRank);
}
