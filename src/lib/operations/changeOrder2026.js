export const CHANGE_ORDER_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

export const CHANGE_ORDER_PRICING_STATUS = Object.freeze({
  UNRESOLVED: 'UNRESOLVED',
  RESOLVED: 'RESOLVED',
  CUSTOM_QUOTE_REQUIRED: 'CUSTOM_QUOTE_REQUIRED',
});

function required(value, name) {
  if (value === undefined || value === null || value === '') throw new Error(`${name}_REQUIRED`);
}

function money(value) {
  return Number(value || 0);
}

/**
 * Creates a field change request without changing the original estimate/job
 * commercial snapshot. Pricing is injected through an explicit resolver
 * adapter so this layer cannot invent catalog IDs or rates.
 */
export async function priceChangeOrder({ prisma, jobId, requestedBy, requestedById = null, reason, pricingContext, resolvePricing }) {
  required(prisma, 'PRISMA');
  required(jobId, 'JOB_ID');
  required(requestedBy, 'REQUESTED_BY');
  required(reason, 'REASON');
  required(pricingContext, 'PRICING_CONTEXT');
  required(resolvePricing, 'PRICING_RESOLVER');

  const resolution = await resolvePricing({
    ...pricingContext,
    jobId,
    changeOrder: true,
  });

  if (!resolution || resolution.status === 'UNRESOLVED_CONTEXT') {
    throw new Error('CHANGE_ORDER_PRICING_CONTEXT_UNRESOLVED');
  }

  const pricingStatus = resolution.status === 'CUSTOM_QUOTE'
    ? CHANGE_ORDER_PRICING_STATUS.CUSTOM_QUOTE_REQUIRED
    : CHANGE_ORDER_PRICING_STATUS.RESOLVED;

  if (pricingStatus === CHANGE_ORDER_PRICING_STATUS.CUSTOM_QUOTE_REQUIRED) {
    return prisma.dd_change_orders.create({
      data: {
        job_id: jobId,
        requested_by: requestedBy,
        requested_by_id: requestedById,
        reason,
        status: CHANGE_ORDER_STATUS.PENDING_APPROVAL,
        pricing_status: pricingStatus,
        resolved_channel: pricingContext.channelType || pricingContext.channel || null,
        pricing_context: pricingContext,
      },
    });
  }

  if (resolution.isValid === false) throw new Error('CHANGE_ORDER_PRICING_INVALID');

  return prisma.dd_change_orders.create({
    data: {
      job_id: jobId,
      requested_by: requestedBy,
      requested_by_id: requestedById,
      reason,
      status: CHANGE_ORDER_STATUS.PENDING_APPROVAL,
      pricing_status: pricingStatus,
      resolved_channel: pricingContext.channelType || pricingContext.channel || null,
      resolved_offer_id: resolution.offerId || null,
      catalog_version: resolution.version || resolution.catalogVersion || null,
      disclaimer_id: resolution.disclaimerId || null,
      pricing_context: pricingContext,
      delta_base_subtotal: money(resolution.baseAmount ?? resolution.baseSubtotal),
      delta_addon_subtotal: money(resolution.addonAmount ?? resolution.addonSubtotal),
      delta_travel: money(resolution.travel),
      delta_rush: money(resolution.rush ?? resolution.rushFee),
      delta_supplies: money(resolution.supplies ?? resolution.suppliesFee),
      delta_tax: money(resolution.tax ?? resolution.taxAmount),
      delta_estimated_total: money(resolution.total ?? resolution.estimatedTotal),
      frozen_delta_modifiers: resolution.modifierRules || resolution.frozenModifierRules || null,
    },
  });
}

export async function approveChangeOrder({ prisma, changeOrderId, actorId, approvalReference = null }) {
  required(prisma, 'PRISMA');
  required(changeOrderId, 'CHANGE_ORDER_ID');
  required(actorId, 'ACTOR_ID');

  return prisma.$transaction(async (tx) => {
    const order = await tx.dd_change_orders.findUnique({ where: { id: changeOrderId } });
    if (!order) throw new Error('CHANGE_ORDER_NOT_FOUND');
    if (order.status !== CHANGE_ORDER_STATUS.PENDING_APPROVAL) throw new Error(`CHANGE_ORDER_NOT_APPROVABLE:${order.status}`);
    if (order.pricing_status !== CHANGE_ORDER_PRICING_STATUS.RESOLVED) throw new Error('CHANGE_ORDER_PRICING_NOT_RESOLVED');

    const updated = await tx.dd_change_orders.update({
      where: { id: changeOrderId },
      data: { status: CHANGE_ORDER_STATUS.APPROVED, approval_reference: approvalReference, approved_at: new Date(), updated_at: new Date() },
    });

    await tx.$executeRaw`
      insert into public.dd_task_events (job_id, actor_id, event_type, description, metadata)
      values (
        ${order.job_id}::uuid,
        ${actorId}::uuid,
        'CHANGE_ORDER_APPROVED',
        'Approved change order; downstream scope hydration may proceed.',
        ${JSON.stringify({ changeOrderId, deltaTotal: money(order.delta_estimated_total), approvalReference })}::jsonb
      )
    `;

    return updated;
  });
}

export async function rejectChangeOrder({ prisma, changeOrderId, actorId, rejectionReason }) {
  required(prisma, 'PRISMA');
  required(changeOrderId, 'CHANGE_ORDER_ID');
  required(actorId, 'ACTOR_ID');
  required(rejectionReason, 'REJECTION_REASON');

  return prisma.$transaction(async (tx) => {
    const order = await tx.dd_change_orders.findUnique({ where: { id: changeOrderId } });
    if (!order) throw new Error('CHANGE_ORDER_NOT_FOUND');
    if (order.status !== CHANGE_ORDER_STATUS.PENDING_APPROVAL) throw new Error(`CHANGE_ORDER_NOT_REJECTABLE:${order.status}`);

    const updated = await tx.dd_change_orders.update({
      where: { id: changeOrderId },
      data: { status: CHANGE_ORDER_STATUS.REJECTED, rejection_reason: rejectionReason, updated_at: new Date() },
    });

    await tx.$executeRaw`
      insert into public.dd_task_events (job_id, actor_id, event_type, description, metadata)
      values (
        ${order.job_id}::uuid,
        ${actorId}::uuid,
        'CHANGE_ORDER_REJECTED',
        'Change order rejected; original job scope remains unchanged.',
        ${JSON.stringify({ changeOrderId, rejectionReason })}::jsonb
      )
    `;

    return updated;
  });
}
