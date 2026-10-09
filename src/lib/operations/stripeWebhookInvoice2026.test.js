jest.mock('stripe', () => function Stripe() { return { webhooks: { constructEvent: raw => JSON.parse(raw.toString()) }, subscriptions: { retrieve: async () => ({}) } }; });
jest.mock('../../../lib/prisma.js', () => ({ __esModule: true, default: { $queryRaw: jest.fn(), $executeRaw: jest.fn(), $transaction: jest.fn() } }));
jest.mock('./eventBroker2026.js', () => ({ publishPaymentReconciled: jest.fn() }));
jest.mock('./recurringServiceLifecycle2026.js', () => ({ reconcileRecurringInvoice: jest.fn() }));
jest.mock('./accountingReconciliation2026.js', () => ({ reconcileStripePayment: jest.fn() }));
jest.mock('./governedCommercialGate2026.js', () => ({ getGovernedCommercialOffer: jest.fn(), resolveCH01CommercialSelection: jest.fn() }));
jest.mock('../posthogAnalyticsServer.js', () => ({ captureServer: jest.fn() }));
jest.mock('./bookingPaymentReconciliation2026.js', () => ({ reconcilePaidBookingWindow: jest.fn() }));

process.env.STRIPE_SECRET_KEY = 'sk_test_nonfunctional_fixture';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_nonfunctional_fixture';
delete process.env.GOOGLE_MAPS_ROUTES_API_KEY;
const { Readable } = require('node:stream');
const prisma = require('../../../lib/prisma.js').default;
const { publishPaymentReconciled } = require('./eventBroker2026.js');
const handler = require('../../../api-handlers/stripe-webhook.js').default;

function req(event) { const r = Readable.from([Buffer.from(JSON.stringify(event))]); r.method = 'POST'; r.headers = { 'stripe-signature': 't=1,v1=x' }; return r; }
function res() { return { status: jest.fn(function (n) { this.code = n; return this; }), json: jest.fn(function (x) { this.payload = x; return this; }), send: jest.fn(function (x) { this.payload = x; return this; }) }; }
const paidEvent = (id = 'evt_1', amount = 45000) => ({ id, type: 'invoice.paid', data: { object: { id: 'in_1', status: 'paid', amount_paid: amount, amount_remaining: 0, currency: 'usd', payment_intent: 'pi_1', metadata: { dani_estimate_id: 'est_1' }, status_transitions: { paid_at: 1760000000 } } } });

function fakeTx({ priorEvent = false } = {}) {
  const sql = [];
  const tx = {
    sql,
    $executeRaw: jest.fn(async (s) => { sql.push(s.join('?')); return 1; }),
    $queryRaw: jest.fn(async (s, ...v) => {
      const text = s.join('?'); sql.push(text);
      if (text.includes('from public.dd_payment_events where provider_event_id')) return priorEvent ? [{ id: 'pe_old' }] : [];
      if (text.includes('insert into public.dd_payment_events')) { tx.paymentInsert = v; return [{ id: 'pe_1' }]; }
      return [];
    }),
    dd_estimates: { findUnique: jest.fn(async () => ({ id: 'est_1', service_request_id: 'req_1', estimated_total: 450, division_slug: 'administrative-business-operations' })) },
    serviceRequest: { findUnique: jest.fn(async () => ({ id: 'req_1', property_details: { operationsRouting: { channelType: 'B2B' } } })), update: jest.fn() },
    dd_jobs: { findFirst: jest.fn(async () => null), create: jest.fn(async () => ({ id: 'job_1' })) },
    dd_invoices: { update: jest.fn() },
  };
  return tx;
}

beforeEach(() => { jest.clearAllMocks(); });

test('paid business-service invoice creates a job, links the payment, and publishes reconciliation', async () => {
  prisma.$queryRaw.mockResolvedValueOnce([{ id: 'inv_1', estimate_id: 'est_1', invoice_status: 'open' }]);
  const tx = fakeTx();
  prisma.$transaction.mockImplementation(fn => fn(tx));
  const r = res();
  await handler(req(paidEvent()), r);
  expect(r.code).toBe(200);
  expect(tx.dd_jobs.create).toHaveBeenCalledTimes(1);
  expect(tx.sql[0]).toContain('pg_advisory_xact_lock');
  expect(tx.paymentInsert).toEqual(expect.arrayContaining(['evt_1', 'req_1', 'job_1']));
  expect(JSON.parse(tx.paymentInsert.find(v => typeof v === 'string' && v.startsWith('{')))).toMatchObject({ dani_job_link: 'LINKED' });
  expect(publishPaymentReconciled).toHaveBeenCalledWith(expect.objectContaining({ jobId: 'job_1', invoiceId: 'inv_1', captured: 450, balanceDue: 0 }), tx);
});

test('replayed invoice.paid delivery is idempotent: no second job, no second payment record', async () => {
  prisma.$queryRaw.mockResolvedValueOnce([{ id: 'inv_1', estimate_id: 'est_1', invoice_status: 'paid' }]);
  const tx = fakeTx({ priorEvent: true });
  prisma.$transaction.mockImplementation(fn => fn(tx));
  const r = res();
  await handler(req(paidEvent()), r);
  expect(r.code).toBe(200);
  expect(tx.dd_jobs.create).not.toHaveBeenCalled();
  expect(tx.paymentInsert).toBeUndefined();
  expect(publishPaymentReconciled).not.toHaveBeenCalled();
});

test('late finalized/payment_failed notices never reopen a paid invoice', async () => {
  for (const type of ['invoice.finalized', 'invoice.sent', 'invoice.payment_failed']) {
    prisma.$queryRaw.mockResolvedValueOnce([{ id: 'inv_1', estimate_id: 'est_1', invoice_status: 'paid' }]);
    const r = res();
    await handler(req({ id: `evt_${type}`, type, data: { object: { id: 'in_1', status: 'open', amount_remaining: 45000 } } }), r);
    expect(r.code).toBe(200);
    expect(r.payload).toMatchObject({ staleEventIgnored: true, status: 'paid' });
  }
  expect(prisma.$transaction).not.toHaveBeenCalled();
});

test('underpaid business invoice fails reconciliation so Stripe retries and nothing is written', async () => {
  prisma.$queryRaw.mockResolvedValueOnce([{ id: 'inv_1', estimate_id: 'est_1', invoice_status: 'open' }]);
  const tx = fakeTx();
  prisma.$transaction.mockImplementation(fn => fn(tx));
  const r = res();
  await handler(req(paidEvent('evt_2', 10000)), r);
  expect(r.code).toBe(500);
  expect(tx.dd_jobs.create).not.toHaveBeenCalled();
  expect(tx.paymentInsert).toBeUndefined();
});
