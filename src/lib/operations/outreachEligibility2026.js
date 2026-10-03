/**
 * Multi-mailbox no-recontact eligibility helper.
 *
 * Extends the existing #525 (relationship identity) and #527 (context contract /
 * pain gate) behavior. Does not create a parallel third gate.
 *
 * Shared campaign memory: a recent touch from Vendors@ or danideclaresns@gmail.com
 * (or a logged contact event) blocks new parallel outreach eligibility.
 *
 * Prefer the durable SQL path (private.dd_recent_mailbox_touch + the extended
 * dd_normalize_sales_queue_context trigger). This helper is for workers that
 * need an explicit pre-send check.
 */

const KNOWN_DANI_MAILBOXES = [
  'vendors@danideclares.com',
  'danideclaresns@gmail.com',
];

/**
 * Explicit pre-send check via the durable SQL function.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} email
 * @param {number} [lookbackDays=45]
 */
export async function hasRecentMailboxTouch(supabase, email, lookbackDays = 45) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) {
    return { found: false, reason: 'INVALID_EMAIL' };
  }

  const { data, error } = await supabase.rpc('dd_recent_mailbox_touch', {
    p_email: normalized,
    p_lookback_days: lookbackDays,
  }).maybeSingle?.() ?? await supabase.rpc('dd_recent_mailbox_touch', {
    p_email: normalized,
    p_lookback_days: lookbackDays,
  });

  // Note: the function is private; expose a thin public wrapper if workers need it
  // via service_role. Until then this may only work with elevated credentials.
  if (error) {
    return { found: true, reason: `GATE_ERROR:${error.message || error.code || 'UNKNOWN'}`, failClosed: true };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { found: false };
  return typeof row === 'object' ? row : { found: Boolean(row) };
}

export const OUTREACH_KNOWN_MAILBOXES = KNOWN_DANI_MAILBOXES;
