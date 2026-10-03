import crypto from 'node:crypto';

export function stableExternalActionKey({ destination, actionType, authoritativeTable, authoritativeRecordId, intentVersion = 'v1' }) {
  const raw = [destination, actionType, authoritativeTable, authoritativeRecordId, intentVersion].map(v => String(v || '').trim()).join(':');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function enqueueExternalAction(supabase, {
  correlationId, actionKey, actionType, destinationSystem, authoritativeTable,
  authoritativeRecordId, payload = {}, idempotencyKey, maxAttempts = 3
}) {
  if (!supabase) throw new Error('SUPABASE_REQUIRED');
  if (!correlationId || !actionKey || !actionType || !destinationSystem || !authoritativeTable || !authoritativeRecordId || !idempotencyKey) {
    throw new Error('OUTBOX_REQUIRED_FIELDS_MISSING');
  }
  const { data, error } = await supabase.rpc('dd_enqueue_external_action', {
    p_correlation_id: correlationId,
    p_action_key: actionKey,
    p_action_type: actionType,
    p_destination_system: destinationSystem,
    p_authoritative_table: authoritativeTable,
    p_authoritative_record_id: String(authoritativeRecordId),
    p_payload: payload,
    p_idempotency_key: idempotencyKey,
    p_max_attempts: maxAttempts,
  });
  if (error) throw error;
  return data;
}

// High-consequence integrations must reconcile an ambiguous remote timeout before retry.
// This helper intentionally does not call Gmail/HubSpot/Stripe/QuickBooks directly.
export function assertRetryIsSafe({ remoteOutcomeKnown, actionClass }) {
  const guarded = new Set(['PAYMENT_MUTATION', 'ACCOUNTING_WRITE', 'PROVIDER_PAYOUT']);
  if (guarded.has(String(actionClass || '').toUpperCase()) && !remoteOutcomeKnown) {
    const error = new Error('REMOTE_OUTCOME_UNKNOWN_RECONCILE_BEFORE_RETRY');
    error.code = 'REMOTE_OUTCOME_UNKNOWN';
    throw error;
  }
  return true;
}
