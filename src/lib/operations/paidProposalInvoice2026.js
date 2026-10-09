// Paid proposal invoices (Stripe `invoice.paid` for an estimate-linked dd_invoices row).
// Every B2B proposal channel (property management, real estate, business services) is
// invoiced the same way by portal-operations `create_stripe_invoice`: one invoice for the
// full approved estimate total. A verified full payment therefore creates (or links) the
// dd_jobs row that is DANI's dispatch authority, instead of leaving the paid order stranded.

export const PROPOSAL_INVOICE_JOB_CHANNELS = Object.freeze({
  B2B_APT: 'propertyops',
  B2B_RE: 'real-estate-support',
  B2B: 'administrative-business-operations',
});

function money(value) { return Number(Number(value || 0).toFixed(2)); }

export function readRequestChannel(propertyDetails) {
  return propertyDetails?.operationsRouting?.channelType || propertyDetails?.operationsRouting?.channel || null;
}

// Intake also stores the channel on service_requests.channel_type; older rows carry only one of the two.
function requestChannel(request) {
  return readRequestChannel(request?.property_details) || request?.channelType || request?.channel_type || null;
}

/**
 * Runs inside the webhook's invoice transaction. Returns the linked job (or null) and,
 * when no job is created, the reason, so the payment event records why it was held.
 * Throws (Stripe retries) only when a job-eligible payment disagrees with the frozen estimate.
 */
export async function linkJobForPaidProposalInvoice(tx, { row, invoice }) {
  let paymentEstimate = null;
  let paymentRequest = null;
  if (row.estimate_id) {
    paymentEstimate = await tx.dd_estimates.findUnique({ where: { id: row.estimate_id } });
    if (paymentEstimate?.service_request_id) {
      paymentRequest = await tx.serviceRequest.findUnique({ where: { id: paymentEstimate.service_request_id } });
    }
  }
  if (!paymentEstimate) return { paymentJob: null, paymentEstimate, paymentRequest, heldReason: 'NO_LINKED_ESTIMATE' };
  if (!paymentRequest) return { paymentJob: null, paymentEstimate, paymentRequest, heldReason: 'NO_LINKED_SERVICE_REQUEST' };
  const channel = requestChannel(paymentRequest);
  if (!Object.prototype.hasOwnProperty.call(PROPOSAL_INVOICE_JOB_CHANNELS, channel)) {
    return { paymentJob: null, paymentEstimate, paymentRequest, channel, heldReason: `CHANNEL_NOT_INVOICE_JOB_ELIGIBLE:${channel || 'UNKNOWN'}` };
  }

  const approvedTotal = Number(paymentEstimate.estimated_total || 0);
  const paidAmount = Number(invoice.amount_paid || invoice.total || 0) / 100;
  if (!Number.isFinite(approvedTotal) || approvedTotal <= 0) throw new Error(`Paid ${channel} invoice has no valid approved estimate total.`);
  if (money(approvedTotal) !== money(paidAmount)) throw new Error(`${channel} invoice payment does not match the frozen approved estimate.`);

  let paymentJob = await tx.dd_jobs.findFirst({ where: { service_request_id: paymentRequest.id }, orderBy: { created_at: 'desc' } });
  const jobCreated = !paymentJob;
  if (!paymentJob) {
    const lineItems = paymentEstimate.intake_answers?.pricingSnapshot?.lineItems || paymentEstimate.intake_answers?.lineItems || [];
    const primaryName = lineItems[0]?.serviceName || paymentRequest.service_needed || paymentRequest.service_category || 'Dani Declares Service';
    paymentJob = await tx.dd_jobs.create({
      data: {
        estimate_id: paymentEstimate.id,
        lead_id: paymentRequest.leadId || null,
        service_request_id: paymentRequest.id,
        division_slug: paymentEstimate.division_slug || PROPOSAL_INVOICE_JOB_CHANNELS[channel],
        job_title: primaryName,
        job_status: 'new',
        location_address: paymentRequest.location_address || paymentEstimate.location_address || null,
        scope_summary: paymentEstimate.client_notes || paymentRequest.request_details || null,
        organization_id: paymentRequest.organizationId || paymentRequest.organization_id || null,
      },
    });
  }
  await tx.dd_invoices.update({ where: { id: row.id }, data: { job_id: paymentJob.id, invoice_status: 'paid', balance_due: 0, updated_at: new Date() } });
  await tx.serviceRequest.update({ where: { id: paymentRequest.id }, data: { status: 'job_created' } });
  return { paymentJob, paymentEstimate, paymentRequest, channel, jobCreated, heldReason: null };
}
