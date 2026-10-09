import { linkJobForPaidProposalInvoice, PROPOSAL_INVOICE_JOB_CHANNELS } from './paidProposalInvoice2026.js';

function txFor({ channel = 'B2B', total = 450, existingJob = null, estimate = true, request = true } = {}) {
  const calls = { jobCreates: [], invoiceUpdates: [], requestUpdates: [] };
  const tx = {
    dd_estimates: { findUnique: jest.fn(async () => (estimate ? { id: 'est_1', service_request_id: 'req_1', estimated_total: total, division_slug: null, intake_answers: { pricingSnapshot: { lineItems: [{ serviceName: 'Office & Operations Rescue' }] } } } : null)) },
    serviceRequest: {
      findUnique: jest.fn(async () => (request ? { id: 'req_1', leadId: 'lead_1', organization_id: 'org_1', property_details: { operationsRouting: { channelType: channel } } } : null)),
      update: jest.fn(async args => { calls.requestUpdates.push(args); return args; }),
    },
    dd_jobs: {
      findFirst: jest.fn(async () => existingJob),
      create: jest.fn(async args => { calls.jobCreates.push(args); return { id: 'job_new' }; }),
    },
    dd_invoices: { update: jest.fn(async args => { calls.invoiceUpdates.push(args); return args; }) },
  };
  return { tx, calls };
}
const row = { id: 'inv_1', estimate_id: 'est_1' };

test.each(Object.keys(PROPOSAL_INVOICE_JOB_CHANNELS))('full payment of a %s proposal invoice creates the job and links it', async channel => {
  const { tx, calls } = txFor({ channel });
  const result = await linkJobForPaidProposalInvoice(tx, { row, invoice: { amount_paid: 45000 } });
  expect(result.heldReason).toBeNull();
  expect(result.jobCreated).toBe(true);
  expect(calls.jobCreates[0].data).toMatchObject({ estimate_id: 'est_1', service_request_id: 'req_1', division_slug: PROPOSAL_INVOICE_JOB_CHANNELS[channel], job_status: 'new', job_title: 'Office & Operations Rescue' });
  expect(calls.invoiceUpdates[0]).toMatchObject({ where: { id: 'inv_1' }, data: { job_id: 'job_new', invoice_status: 'paid', balance_due: 0 } });
  expect(calls.requestUpdates[0]).toMatchObject({ where: { id: 'req_1' }, data: { status: 'job_created' } });
});

test('business-service invoice reuses an existing job instead of creating a duplicate', async () => {
  const { tx, calls } = txFor({ existingJob: { id: 'job_existing' } });
  const result = await linkJobForPaidProposalInvoice(tx, { row, invoice: { amount_paid: 45000 } });
  expect(result.paymentJob.id).toBe('job_existing');
  expect(result.jobCreated).toBe(false);
  expect(calls.jobCreates).toHaveLength(0);
  expect(calls.invoiceUpdates[0].data.job_id).toBe('job_existing');
});

test('payment that does not match the frozen estimate is refused before any job write', async () => {
  const { tx, calls } = txFor();
  await expect(linkJobForPaidProposalInvoice(tx, { row, invoice: { amount_paid: 10000 } })).rejects.toThrow('does not match the frozen approved estimate');
  expect(calls.jobCreates).toHaveLength(0);
  expect(calls.invoiceUpdates).toHaveLength(0);
});

test('estimate with no valid total is refused', async () => {
  const { tx } = txFor({ total: 0 });
  await expect(linkJobForPaidProposalInvoice(tx, { row, invoice: { amount_paid: 0 } })).rejects.toThrow('no valid approved estimate total');
});

test('non-proposal channels are recorded as held with a reason, never auto-dispatched', async () => {
  for (const channel of ['B2C', 'B2G', 'B2B2C', null]) {
    const { tx, calls } = txFor({ channel });
    const result = await linkJobForPaidProposalInvoice(tx, { row, invoice: { amount_paid: 45000 } });
    expect(result.paymentJob).toBeNull();
    expect(result.heldReason).toBe(`CHANNEL_NOT_INVOICE_JOB_ELIGIBLE:${channel || 'UNKNOWN'}`);
    expect(calls.jobCreates).toHaveLength(0);
  }
});

test('channel falls back to the service_requests.channel_type column', async () => {
  const { tx, calls } = txFor();
  tx.serviceRequest.findUnique = jest.fn(async () => ({ id: 'req_1', organizationId: 'org_9', channelType: 'B2B', property_details: {} }));
  const result = await linkJobForPaidProposalInvoice(tx, { row, invoice: { amount_paid: 45000 } });
  expect(result.heldReason).toBeNull();
  expect(calls.jobCreates[0].data.organization_id).toBe('org_9');
});

test('invoice without estimate or request linkage is held, not thrown', async () => {
  expect((await linkJobForPaidProposalInvoice(txFor().tx, { row: { id: 'inv_1', estimate_id: null }, invoice: {} })).heldReason).toBe('NO_LINKED_ESTIMATE');
  expect((await linkJobForPaidProposalInvoice(txFor({ request: false }).tx, { row, invoice: {} })).heldReason).toBe('NO_LINKED_SERVICE_REQUEST');
});
