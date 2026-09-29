jest.mock('../../../lib/prisma.js', () => ({
  __esModule: true,
  default: {},
}));

import { reconcileStripePayment } from './accountingReconciliation2026.js';
import { publishPaymentReconciled } from './eventBroker2026.js';

function queryResponder(responses) {
  return jest.fn(() => {
    if (!responses.length) throw new Error('Unexpected query call');
    return Promise.resolve(responses.shift());
  });
}

describe('CH03 payment -> accounting regression', () => {
  test('reconcileStripePayment creates invoice/payment event and computes balance without moving money', async () => {
    const requestId = '11111111-1111-4111-8111-111111111111';
    const jobId = '22222222-2222-4222-8222-222222222222';
    const estimateId = '33333333-3333-4333-8333-333333333333';
    const invoiceId = '44444444-4444-4444-8444-444444444444';
    const paymentEventId = '55555555-5555-4555-8555-555555555555';

    const tx = {
      $queryRaw: queryResponder([
        [], // idempotency lookup
        [], // approved change orders
        [{ id: paymentEventId }], // insert payment event
        [{ captured: 176.55 }], // cumulative successful receipts
      ]),
      serviceRequest: {
        findUnique: jest.fn().mockResolvedValue({ id: requestId }),
      },
      dd_jobs: {
        findFirst: jest.fn().mockResolvedValue({
          id: jobId,
          estimate_id: estimateId,
          service_request_id: requestId,
          lead_id: null,
        }),
      },
      dd_estimates: {
        findUnique: jest.fn().mockResolvedValue({
          id: estimateId,
          base_subtotal: 330,
          addon_subtotal: 0,
          travel_fee: 0,
          rush_fee: 0,
          supplies_fee: 0,
          pass_through_fee: 0,
          tax_amount: 0,
          estimated_total: 330,
          deposit_due: 176.55,
        }),
      },
      dd_invoices: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: invoiceId,
          job_id: jobId,
        }),
        update: jest.fn().mockResolvedValue({
          id: invoiceId,
        }),
      },
    };

    const event = {
      id: 'evt_ch03_accounting_proof',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_ch03_accounting_proof',
          payment_intent: 'pi_ch03_accounting_proof',
          amount_total: 17655,
          currency: 'usd',
          metadata: {
            request_id: requestId,
            payment_type: 'INITIAL_PAYMENT',
          },
        },
      },
    };

    const result = await reconcileStripePayment(event, tx);

    expect(result).toMatchObject({
      status: 'RECONCILED',
      paymentEventId,
      invoiceId,
      jobId,
      finalTotal: 330,
      captured: 176.55,
      balanceDue: 153.45,
    });

    expect(tx.dd_invoices.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        estimate_id: estimateId,
        job_id: jobId,
        total_amount: 330,
        deposit_due: 176.55,
        balance_due: 153.45,
      }),
    });

    expect(tx.dd_invoices.update).toHaveBeenCalledWith({
      where: { id: invoiceId },
      data: expect.objectContaining({
        total_amount: 330,
        balance_due: 153.45,
        invoice_status: 'open',
      }),
    });
  });

  test('publishPaymentReconciled queues an internal idempotent outbox event', async () => {
    const db = {
      $queryRaw: jest.fn().mockResolvedValue([
        {
          id: '66666666-6666-4666-8666-666666666666',
          event_key: 'payment-reconciled:55555555-5555-4555-8555-555555555555',
          status: 'PENDING',
        },
      ]),
    };

    const result = await publishPaymentReconciled(
      {
        paymentEventId: '55555555-5555-4555-8555-555555555555',
        invoiceId: '44444444-4444-4444-8444-444444444444',
        jobId: '22222222-2222-4222-8222-222222222222',
        finalTotal: 330,
        captured: 176.55,
        balanceDue: 153.45,
      },
      db,
    );

    expect(result).toMatchObject({
      status: 'PENDING',
      event_key: 'payment-reconciled:55555555-5555-4555-8555-555555555555',
    });
    expect(db.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
