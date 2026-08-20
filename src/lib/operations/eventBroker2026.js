import prisma from '../../../lib/prisma.js';

const EVENT_CHANNELS = {
  B2C_JOB_COMPLETED: 'EMAIL',
  B2B_CHANGE_ORDER_PENDING: 'SMS',
  B2B_CHANGE_ORDER_APPROVED: 'EMAIL',
  B2G_COMPLETION_REVIEW_REQUIRED: 'EMAIL',
  PAYMENT_RECONCILED: 'INTERNAL',
};

/**
 * Transaction-safe outbox publisher.
 * External providers (Twilio/email/etc.) are deliberately not called here.
 * This creates an idempotent intent that a worker can deliver later.
 */
export async function publishOperationalEvent({
  eventType,
  aggregateType,
  aggregateId,
  payload = {},
  eventKey,
  channel = EVENT_CHANNELS[eventType] || 'INTERNAL',
}) {
  if (!eventType || !eventKey) throw new Error('Event broker requires eventType and eventKey.');

  const rows = await prisma.$queryRaw`
    insert into public.dd_event_outbox
      (event_key, event_type, channel, aggregate_type, aggregate_id, payload)
    values
      (${eventKey}, ${eventType}, ${channel}, ${aggregateType}, ${aggregateId || null}, ${JSON.stringify(payload)}::jsonb)
    on conflict (event_key) do nothing
    returning id, event_key, status
  `;

  if (!rows.length) {
    const existing = await prisma.$queryRaw`
      select id, event_key, status
      from public.dd_event_outbox
      where event_key = ${eventKey}
      limit 1
    `;
    return { status: 'IDEMPOTENT_REPLAY', ...existing[0] };
  }

  return { status: 'QUEUED', ...rows[0] };
}

export async function publishPaymentReconciled(result) {
  return publishOperationalEvent({
    eventType: 'PAYMENT_RECONCILED',
    aggregateType: 'INVOICE',
    aggregateId: result.invoiceId,
    eventKey: `payment-reconciled:${result.paymentEventId}`,
    payload: {
      jobId: result.jobId,
      finalTotal: result.finalTotal,
      captured: result.captured,
      balanceDue: result.balanceDue,
    },
  });
}
