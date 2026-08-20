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

function nullableUuid(value) {
  return value ? `${value}` : null;
}

/**
 * Creates a field change request without changing the original estimate/job
 * commercial snapshot. Pricing is injected through an explicit resolver
 * adapter so this layer cannot invent catalog IDs or rates.
 *
 * Raw SQL is intentional here: G7's migration is deployable before a Prisma
 * client regeneration, and the change-order ledger remains an additive DB
 * boundary rather than a prerequisite for existing Prisma models.
 */
export async function priceChangeOrder({ prisma, jobId, requestedBy, requestedById = null, reason, pricingContext, resolvePricing }) {
  required(prisma, 'PRISMA');
  required(jobId, 'JOB_ID');
  required(requestedBy, 'REQUESTED_BY');
  required(reason, 'REASON');
  required(pricingContext, 'PRICING_CONTEXT');
  required(resolvePricing, 'PRICING_RESOLVER');

  const resolution = await resolvePricing({ ...pricingContext, jobId, changeOrder: true });
  if (!resolution || resolution.status === 'UNRESOLVED_CONTEXT') {
    throw new Error('CHANGE_ORDER_PRICING_CONTEXT_UNRESOLVED');
  }

  const pricingStatus = resolution.status === 'CUSTOM_QUOTE'
    ? CHANGE_ORDER_PRICING_STATUS.CUSTOM_QUOTE_REQUIRED
    : CHANGE_ORDER_PRICING_STATUS.RESOLVED;
  if (resolution.isValid === false) throw new Error('CHANGE_ORDER_PRICING_INVALID');

  return prisma.$queryRaw`
    insert into public.dd_change_orders
      (job_id, requested_by, requested_by_id, reason, status, pricing_status,
       resolved_channel, resolved_offer_id, catalog_version, disclaimer_id,
       pricing_context, delta_base_subtotal, delta_addon_subtotal, delta_travel,
       delta_rush, delta_supplies, delta_tax, delta_estimated_total,
       frozen_delta_modifiers)
    values
      (${jobId}::uuid, ${requestedBy}, ${nullableUuid(requestedById)}::uuid, ${reason},
       'PENDING_APPROVAL', ${pricingStatus},
       ${pricingContext.channelType || pricingContext.channel || null},
       ${resolution.offerId || null}, ${resolution.version || resolution.catalogVersion || null},
       ${resolution.disclaimerId || null}, ${JSON.stringify(pricingContext)}::jsonb,
       ${money(resolution.baseAmount ?? resolution.baseSubtotal)},
       ${money(resolution.addonAmount ?? resolution.addonSubtotal)},
       ${money(resolution.travel)}, ${money(resolution.rush ?? resolution.rushFee)},
       ${money(resolution.supplies ?? resolution.suppliesFee)},
       ${money(resolution.tax ?? resolution.taxAmount)},
       ${money(resolution.total ?? resolution.estimatedTotal)},
       ${resolution.modifierRules || resolution.frozenModifierRules ? JSON.stringify(resolution.modifierRules || resolution.frozenModifierRules) : null}::jsonb)
    returning *
  `;
}

export async function approveChangeOrder({ prisma, changeOrderId, actorId, approvalReference = null }) {
  required(prisma, 'PRISMA');
  required(changeOrderId, 'CHANGE_ORDER_ID');
  required(actorId, 'ACTOR_ID');

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      select * from public.dd_change_orders
      where id = ${changeOrderId}::uuid
      for update
    `;
    const order = rows[0];
    if (!order) throw new Error('CHANGE_ORDER_NOT_FOUND');
    if (order.status !== CHANGE_ORDER_STATUS.PENDING_APPROVAL) throw new Error(`CHANGE_ORDER_NOT_APPROVABLE:${order.status}`);
    if (order.pricing_status !== CHANGE_ORDER_PRICING_STATUS.RESOLVED) throw new Error('CHANGE_ORDER_PRICING_NOT_RESOLVED');

    const updated = await tx.$queryRaw`
      update public.dd_change_orders
      set status = 'APPROVED', approval_reference = ${approvalReference}, approved_at = now(), updated_at = now()
      where id = ${changeOrderId}::uuid
      returning *
    `;

    await tx.$executeRaw`
      insert into public.dd_task_events (job_id, actor_id, event_type, description, metadata)
      values (${order.job_id}::uuid, ${actorId}::uuid, 'CHANGE_ORDER_APPROVED',
        'Approved change order; downstream scope hydration may proceed.',
        ${JSON.stringify({ changeOrderId, deltaTotal: money(order.delta_estimated_total), approvalReference })}::jsonb)
    `;
    return updated[0];
  });
}

export async function rejectChangeOrder({ prisma, changeOrderId, actorId, rejectionReason }) {
  required(prisma, 'PRISMA');
  required(changeOrderId, 'CHANGE_ORDER_ID');
  required(actorId, 'ACTOR_ID');
  required(rejectionReason, 'REJECTION_REASON');

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw`
      select * from public.dd_change_orders
      where id = ${changeOrderId}::uuid
      for update
    `;
    const order = rows[0];
    if (!order) throw new Error('CHANGE_ORDER_NOT_FOUND');
    if (order.status !== CHANGE_ORDER_STATUS.PENDING_APPROVAL) throw new Error(`CHANGE_ORDER_NOT_REJECTABLE:${order.status}`);

    const updated = await tx.$queryRaw`
      update public.dd_change_orders
      set status = 'REJECTED', rejection_reason = ${rejectionReason}, updated_at = now()
      where id = ${changeOrderId}::uuid
      returning *
    `;

    await tx.$executeRaw`
      insert into public.dd_task_events (job_id, actor_id, event_type, description, metadata)
      values (${order.job_id}::uuid, ${actorId}::uuid, 'CHANGE_ORDER_REJECTED',
        'Change order rejected; original job scope remains unchanged.',
        ${JSON.stringify({ changeOrderId, rejectionReason })}::jsonb)
    `;
    return updated[0];
  });
}
