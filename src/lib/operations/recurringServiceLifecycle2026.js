// Extends the paid-first runtime. Never supplies a catalog price or provider authority.
export const COMMERCIAL_OBJECT_TYPES = ['SERV','PROD','DIGITAL','KIT','RET','EVENT','WORK-ORDER'];
export function isMonthlyOffer(offer) {
  return ['MONTH','MONTHLY'].includes(String(offer?.billingCycle || '').toUpperCase());
}
export function hasPeriodEndCancellation(config) {
  return Boolean(config?.active && config.features?.subscription_cancel?.enabled && config.features.subscription_cancel.mode==='at_period_end' && config.features?.subscription_update?.enabled===false);
}
export function validateRecurringTerms(terms) {
  if (!terms || !COMMERCIAL_OBJECT_TYPES.includes(terms.objectType)) throw new Error('COMMERCIAL_OBJECT_TYPE_REQUIRED');
  if (!/^CH0[1-6]$/.test(terms.channel)) throw new Error('CANONICAL_CHANNEL_REQUIRED');
  if (!terms.scope?.trim() || !terms.exclusions?.trim()) throw new Error('RECURRING_SCOPE_REQUIRED');
  if (terms.rollover !== 'NONE' || terms.overage !== 'QUOTE_REQUIRED' || terms.cancellation !== 'PERIOD_END') throw new Error('UNSUPPORTED_RECURRING_TERMS');
  if (!Array.isArray(terms.allowances) || !terms.allowances.length || terms.allowances.length > 50) throw new Error('ALLOWANCES_REQUIRED');
  const keys = new Set();
  for (const a of terms.allowances) {
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(a.key || '') || keys.has(a.key) || !a.unit?.trim() || !Number.isFinite(a.quantity) || a.quantity <= 0) throw new Error('INVALID_ALLOWANCE');
    keys.add(a.key);
  }
  return { objectType:terms.objectType, channel:terms.channel, scope:terms.scope.trim(), exclusions:terms.exclusions.trim(), rollover:'NONE', overage:'QUOTE_REQUIRED', cancellation:'PERIOD_END', allowances:terms.allowances.map(a=>({key:a.key,unit:a.unit.trim(),quantity:a.quantity})) };
}
export function invoicePeriod(invoice) {
  const recurringLines = (invoice.lines?.data || []).filter(l => l.type === 'subscription' || l.parent?.type === 'subscription_item_details');
  if (recurringLines.length !== 1 || invoice.lines?.has_more || recurringLines[0].proration || recurringLines[0].parent?.subscription_item_details?.proration) throw new Error('RECURRING_INVOICE_REVIEW_REQUIRED');
  const { start, end } = recurringLines[0].period || {};
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= end) throw new Error('INVOICE_PERIOD_REQUIRED');
  return { start:new Date(start*1000).toISOString(), end:new Date(end*1000).toISOString() };
}
export function validatePaidInvoice(invoice, expectedCents) {
  if (invoice.status !== 'paid' || invoice.paid !== true || invoice.currency !== 'usd' || !Number.isSafeInteger(expectedCents) || expectedCents <= 0 || invoice.amount_paid !== expectedCents || invoice.total !== expectedCents) throw new Error('SUBSCRIPTION_PAYMENT_MISMATCH');
  if (!['subscription_create','subscription_cycle'].includes(invoice.billing_reason)) throw new Error('RECURRING_INVOICE_REVIEW_REQUIRED');
  return invoicePeriod(invoice);
}
export function allowanceBalance(terms, usage = []) {
  return validateRecurringTerms(terms).allowances.map(a=>{
    const consumed=usage.filter(u=>u.allowance_key===a.key).reduce((sum,u)=>sum+Number(u.quantity),0);
    return {...a,consumed,remaining:Math.max(0,a.quantity-consumed),excess:Math.max(0,consumed-a.quantity),overage:consumed>a.quantity?'QUOTE_REQUIRED':null};
  });
}
export function ownsRecurringRequest(context, request) {
  if (context.isStaff) return true;
  if (['customer','resident'].includes(context.role)) return Boolean(context.identity?.entity_id && String(request.lead_id || '') === String(context.identity.entity_id));
  if (['property_manager','procurement'].includes(context.role)) return Boolean(context.identity?.organization_id && String(request.organization_id || '') === String(context.identity.organization_id));
  return false;
}

export async function reconcileRecurringInvoice(db, event, subscription, finalizeRoutes) {
  const invoice=event.data.object;
  if (event.type !== 'invoice.paid') return {held:true};
  const result=await db.$transaction(async tx=>{
    // Same lock for checkout binding, invoice deliveries and renewal creation.
    await tx.$executeRaw`select pg_advisory_xact_lock(hashtextextended(${subscription.stripe_subscription_id},0))`;
    const replay=await tx.$queryRaw`select id from public.dd_service_subscription_cycles where stripe_invoice_id=${invoice.id}`;
    if (replay.length) return {replay:true};
    const request=await tx.serviceRequest.findUnique({where:{id:subscription.service_request_id}});
    const estimate=await tx.dd_estimates.findUnique({where:{id:subscription.estimate_id}});
    if (!request || !estimate || String(estimate.estimate_status).toLowerCase()!=='approved') throw new Error('APPROVED_RECURRING_ESTIMATE_REQUIRED');
    const period=validatePaidInvoice(invoice,Math.round(Number(estimate.estimated_total)*100));
    const termRows=await tx.$queryRaw`select * from public.dd_service_subscription_terms where estimate_id=${estimate.id}::uuid and accepted_at is not null`;
    const overlap=await tx.$queryRaw`select id from public.dd_service_subscription_cycles where subscription_id=${subscription.id}::uuid and period_start<${period.end}::timestamptz and period_end>${period.start}::timestamptz limit 1`;
    if(overlap.length)throw new Error('OVERLAPPING_SUBSCRIPTION_PERIOD_REVIEW_REQUIRED');
    const terms=termRows[0];
    if (!terms || terms.canonical_sku!==subscription.canonical_sku) throw new Error('ACCEPTED_RECURRING_TERMS_REQUIRED');
    if(terms.monthly_amount_cents!==invoice.amount_paid)throw new Error('AGREED_SUBSCRIPTION_AMOUNT_MISMATCH');
    const snapshot=validateRecurringTerms(terms.terms);
    if(estimate.intake_answers?.serviceSku!==subscription.canonical_sku||estimate.intake_answers?.channelCode!==snapshot.channel)throw new Error('RECURRING_ESTIMATE_IDENTITY_MISMATCH');
    const previous=await tx.$queryRaw`select id from public.dd_service_subscription_cycles where subscription_id=${subscription.id}::uuid limit 1`;
    // Each renewal needs fresh economics/assignment review. Never reactivate an old paid estimate.
    const first=invoice.billing_reason==='subscription_create' && !previous.length && subscription.commercialReady!==false && new Date(period.end)>new Date() && !['CANCELED','UNPAID','PAUSED','INCOMPLETE_EXPIRED'].includes(subscription.currentStripeStatus||subscription.subscription_status);
    let job=null;
    if (first && estimate.economics_status==='PASS' && estimate.active_economics_snapshot_id) {
      job=await tx.dd_jobs.findFirst({where:{service_request_id:request.id,estimate_id:estimate.id},orderBy:{created_at:'desc'}});
      if (!job) job=await tx.dd_jobs.create({data:{estimate_id:estimate.id,lead_id:request.leadId||null,service_request_id:request.id,organization_id:request.organizationId||null,division_slug:estimate.division_slug,job_title:request.service_needed||'Recurring service',job_status:'new',location_address:request.location_address||null,scope_summary:snapshot.scope}});
      await tx.serviceRequest.update({where:{id:request.id},data:{status:'job_created'}});
    }
    const cycles=await tx.$queryRaw`
      insert into public.dd_service_subscription_cycles(subscription_id,stripe_invoice_id,period_start,period_end,amount_paid_cents,terms_snapshot,job_id,estimate_id,fulfillment_status)
      values(${subscription.id}::uuid,${invoice.id},${period.start}::timestamptz,${period.end}::timestamptz,${invoice.amount_paid},${JSON.stringify(snapshot)}::jsonb,${job?.id||null}::uuid,${first?estimate.id:null}::uuid,${job?'READY':'REVIEW_REQUIRED'}) returning id
    `;
    await tx.$executeRaw`
      insert into public.dd_payment_events(provider_event_id,provider_payment_id,request_id,job_id,event_type,payment_status,amount_received,currency,raw_metadata)
      values(${event.id},${typeof invoice.payment_intent==='string'?invoice.payment_intent:invoice.id},${request.id}::uuid,${job?.id||null}::uuid,${event.type},'SUCCEEDED',${invoice.amount_paid/100},'usd',${JSON.stringify({subscription_id:subscription.id,cycle_id:cycles[0].id})}::jsonb)
      on conflict(provider_event_id) do nothing
    `;
    if(job)await tx.$queryRaw`select public.dd_activate_paid_estimate_assignments(${estimate.id}::uuid) as routing`;
    await tx.$executeRaw`
      update public.dd_service_subscriptions set latest_stripe_invoice_id=${invoice.id},subscription_status=${subscription.currentStripeStatus||'ACTIVE_PAID'},cancel_at_period_end=${Boolean(subscription.cancel_at_period_end)},first_payment_verified_at=coalesce(first_payment_verified_at,now()),current_period_end=greatest(current_period_end,${period.end}::timestamptz),updated_at=now() where id=${subscription.id}::uuid
    `;
    return {cycleId:cycles[0].id,jobId:job?.id||null,estimateId:job?estimate.id:null,fulfillmentStatus:job?'READY':'REVIEW_REQUIRED'};
  });
  if (result.estimateId) await finalizeRoutes(db,result.estimateId);
  return result;
}
