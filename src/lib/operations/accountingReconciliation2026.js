import prisma from '../../../lib/prisma.js';

function money(value) {
  return Number(value || 0);
}

/**
 * Reconciles a provider payment event against frozen commercial records.
 * This module never resolves catalog prices and never changes an estimate.
 * It only consolidates the frozen base estimate plus APPROVED change-order deltas.
 */
export async function reconcileStripePayment(event) {
  const session = event?.data?.object || {};
  const providerEventId = event?.id;
  const metadata = session.metadata || {};
  const requestId = metadata.request_id || null;
  const changeOrderId = metadata.change_order_id || null;

  if (!providerEventId) throw new Error('Accounting reconciliation requires a provider event id.');
  if (event.type !== 'checkout.session.completed') {
    return { status: 'IGNORED_EVENT_TYPE', providerEventId, eventType: event.type };
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.$queryRaw`
      select id, invoice_id, payment_status, amount_received
      from public.dd_payment_events
      where provider_event_id = ${providerEventId}
      limit 1
    `;

    if (existing.length) {
      return {
        status: 'IDEMPOTENT_REPLAY',
        paymentEventId: existing[0].id,
        invoiceId: existing[0].invoice_id,
      };
    }

    let job = null;
    let request = null;
    let changeOrder = null;

    if (changeOrderId) {
      changeOrder = await tx.dd_change_orders.findUnique({ where: { id: changeOrderId } });
      if (!changeOrder) throw new Error(`Change order ${changeOrderId} not found.`);
      job = await tx.dd_jobs.findUnique({ where: { id: changeOrder.job_id } });
    } else if (requestId) {
      request = await tx.serviceRequest.findUnique({ where: { id: requestId } });
      if (!request) throw new Error(`ServiceRequest ${requestId} not found.`);
      job = await tx.dd_jobs.findFirst({
        where: { service_request_id: requestId },
        orderBy: { created_at: 'desc' },
      });
    }

    if (!job) {
      throw new Error('Accounting reconciliation could not identify a job from payment metadata.');
    }

    const estimate = job.estimate_id
      ? await tx.dd_estimates.findUnique({ where: { id: job.estimate_id } })
      : await tx.dd_estimates.findFirst({
          where: { service_request_id: job.service_request_id },
          orderBy: { created_at: 'desc' },
        });

    if (!estimate) throw new Error(`No frozen estimate found for job ${job.id}.`);

    const approvedDeltas = await tx.dd_change_orders.findMany({
      where: { job_id: job.id, status: 'APPROVED' },
      select: {
        id: true,
        delta_base_subtotal: true,
        delta_addon_subtotal: true,
        delta_travel: true,
        delta_rush: true,
        delta_supplies: true,
        delta_tax: true,
        delta_estimated_total: true,
      },
    });

    const baseSubtotal = money(estimate.base_subtotal) + money(estimate.addon_subtotal)
      + money(estimate.travel_fee) + money(estimate.rush_fee)
      + money(estimate.supplies_fee) + money(estimate.pass_through_fee);
    const baseTax = money(estimate.tax_amount);
    const deltaSubtotal = approvedDeltas.reduce((sum, d) => sum
      + money(d.delta_base_subtotal) + money(d.delta_addon_subtotal)
      + money(d.delta_travel) + money(d.delta_rush) + money(d.delta_supplies), 0);
    const deltaTax = approvedDeltas.reduce((sum, d) => sum + money(d.delta_tax), 0);
    const finalSubtotal = baseSubtotal + deltaSubtotal;
    const finalTax = baseTax + deltaTax;
    const finalTotal = money(estimate.estimated_total)
      + approvedDeltas.reduce((sum, d) => sum + money(d.delta_estimated_total), 0);
    const amountReceived = money((session.amount_total ?? session.amount_received ?? 0) / 100);

    let invoice = await tx.dd_invoices.findFirst({
      where: { job_id: job.id },
      orderBy: { created_at: 'desc' },
    });

    if (!invoice) {
      invoice = await tx.dd_invoices.create({
        data: {
          estimate_id: estimate.id,
          job_id: job.id,
          lead_id: job.lead_id || null,
          stripe_payment_link: session.url || null,
          invoice_status: 'open',
          subtotal: finalSubtotal,
          tax_amount: finalTax,
          total_amount: finalTotal,
          deposit_due: money(estimate.deposit_due),
          balance_due: Math.max(finalTotal - amountReceived, 0),
        },
      });
    }

    const paymentEvent = await tx.$queryRaw`
      insert into public.dd_payment_events
        (provider_event_id, provider_payment_id, request_id, job_id, invoice_id,
         change_order_id, event_type, payment_status, amount_received, currency, raw_metadata)
      values
        (${providerEventId}, ${session.payment_intent || session.id}, ${requestId}, ${job.id},
         ${invoice.id}, ${changeOrderId}, ${event.type}, 'SUCCEEDED', ${amountReceived},
         ${session.currency || 'usd'}, ${JSON.stringify(metadata)}::jsonb)
      returning id
    `;

    const priorPayments = await tx.$queryRaw`
      select coalesce(sum(amount_received), 0) as captured
      from public.dd_payment_events
      where invoice_id = ${invoice.id} and payment_status = 'SUCCEEDED'
    `;
    const captured = money(priorPayments[0]?.captured);
    const balanceDue = Math.max(finalTotal - captured, 0);
    const invoiceStatus = balanceDue <= 0 ? 'paid' : 'open';

    await tx.dd_invoices.update({
      where: { id: invoice.id },
      data: {
        subtotal: finalSubtotal,
        tax_amount: finalTax,
        total_amount: finalTotal,
        balance_due: balanceDue,
        invoice_status: invoiceStatus,
      },
    });

    return {
      status: 'RECONCILED',
      paymentEventId: paymentEvent[0].id,
      invoiceId: invoice.id,
      jobId: job.id,
      finalSubtotal,
      finalTax,
      finalTotal,
      captured,
      balanceDue,
      approvedChangeOrderCount: approvedDeltas.length,
    };
  });
}
