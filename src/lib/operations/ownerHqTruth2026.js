const TERMINAL_DISPOSITIONS = new Set([
  'PAYMENT_SUCCEEDED',
  'NOT_INTERESTED',
  'DO_NOT_CONTACT',
]);

const NON_ACTIONABLE_CAMPAIGN_STATES = new Set([
  'SUPPRESSED',
  'UNSUBSCRIBED',
]);

function endOfLocalDay(value) {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sourceTouchAt(item) {
  const values = [item?.campaign_last_contacted_at, item?.source_occurred_at]
    .map(value => value ? new Date(value) : null)
    .filter(value => value && !Number.isNaN(value.getTime()));
  return values.length ? new Date(Math.max(...values.map(value => value.getTime()))) : null;
}

/**
 * Owner HQ should count an action as due only when the dated action is still
 * unresolved by newer canonical evidence. A Gmail-sent/source touch that
 * occurred on or after the dated action satisfies that stale action even when
 * an older reconciliation path failed to advance disposition/campaign_status.
 *
 * This is deliberately conservative: SENT/RESPONDED are not terminal states by
 * themselves because a later dated follow-up may still be legitimate.
 */
export function isProspectingDue(item, now = new Date()) {
  const disposition = String(item?.disposition || '').toUpperCase();
  const campaignStatus = String(item?.campaign_status || '').toUpperCase();
  if (TERMINAL_DISPOSITIONS.has(disposition)) return false;
  if (NON_ACTIONABLE_CAMPAIGN_STATES.has(campaignStatus)) return false;
  if (!item?.next_action_date) return false;

  const dueAt = endOfLocalDay(item.next_action_date);
  if (!dueAt || dueAt > now) return false;

  const latestTouch = sourceTouchAt(item);
  if (latestTouch && latestTouch >= dueAt) return false;

  return true;
}

/** Research program detail remains authoritative but does not belong in the
 * owner-now surface unless it represents a material owner decision/block.
 */
export function researchProgramNeedsOwner(program) {
  if (!program) return false;
  const metadata = program.metadata && typeof program.metadata === 'object' ? program.metadata : {};
  return metadata.needs_owner_now === true
    || metadata.owner_decision_required === true
    || String(program.status || '').toUpperCase() === 'OWNER_REVIEW';
}
