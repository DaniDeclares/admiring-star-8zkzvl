/**
 * Multi-mailbox no-recontact eligibility (Tester + future Production).
 *
 * Rule: Using a fallback address (e.g. danideclaresns@gmail.com) does NOT
 * authorize replaying prior campaigns from Vendors@ or any other primary
 * business mailbox. Campaign memory is shared.
 *
 * Before any outbound:
 * - Exclude anyone already contacted from Vendors@
 * - Exclude anyone already contacted from the fallback account
 * - Exclude closed / suppressed / opted-out
 * - Exclude anyone with an unresolved recent touch in HubSpot/Supabase
 *
 * Only net-new or clearly dormant-but-still-valid prospects may be contacted
 * from the fallback account.
 */

const PRIMARY_ACCOUNTS = [
  'vendors@danideclares.com',
  'danideclaresns@gmail.com',
];

/**
 * Call the durable SQL gate. Prefer this over ad-hoc checks.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} email
 * @param {string} [sendingFrom]
 * @param {number} [lookbackDays=45]
 * @returns {Promise<{ canContact: boolean, reason: string, lastTouchAt?: string, lastDirection?: string, lastAccount?: string }>}
 */
export async function canContactForOutreach(supabase, email, sendingFrom = null, lookbackDays = 45) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) {
    return { canContact: false, reason: 'INVALID_EMAIL' };
  }

  const { data, error } = await supabase.rpc('dd_can_contact_for_outreach', {
    p_email: normalized,
    p_sending_from: sendingFrom ? String(sendingFrom).trim().toLowerCase() : null,
    p_lookback_days: lookbackDays,
  });

  if (error) {
    // Fail closed on infrastructure errors
    return {
      canContact: false,
      reason: `GATE_ERROR:${error.message || error.code || 'UNKNOWN'}`,
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return { canContact: false, reason: 'GATE_EMPTY_RESULT' };
  }

  return {
    canContact: Boolean(row.can_contact),
    reason: row.reason || 'UNKNOWN',
    lastTouchAt: row.last_touch_at || undefined,
    lastDirection: row.last_direction || undefined,
    lastAccount: row.last_account || undefined,
  };
}

/**
 * Lightweight local pre-check when SQL is not yet available (e.g. unit tests).
 * Does not replace the durable gate.
 */
export function localPrecheckEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) return { ok: false, reason: 'INVALID_EMAIL' };
  return { ok: true, reason: 'FORMAT_OK' };
}

export const OUTREACH_PRIMARY_ACCOUNTS = PRIMARY_ACCOUNTS;
