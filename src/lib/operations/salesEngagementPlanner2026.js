/**
 * DANI Business OS — sales engagement planning.
 *
 * Uses canonical sales-queue evidence to suggest internal call and deal tasks.
 * No new queue, outbound send, contact enrollment, financial mutation or dispatch.
 * Authenticated organization access MUST be enforced by the caller; returned
 * plans are never authorization to perform customer-facing actions.
 */
const TERMINAL = new Set(['DO_NOT_CONTACT','NOT_INTERESTED','PAYMENT_SUCCEEDED']);
const SUPPRESSED = new Set(['SUPPRESSED','UNSUBSCRIBED']);
const STAGES = Object.freeze({
  NEW:'REVIEW_INQUIRY',
  INTAKE:'QUALIFY_BUYER',
  QUALIFIED:'PREPARE_QUOTE',
  QUOTE_DRAFT:'REVIEW_QUOTE',
  QUOTE_SENT:'CHECK_QUOTE_RESPONSE',
  APPROVED:'VERIFY_PAYMENT_AND_FULFILLMENT_READINESS',
  PAYMENT_PENDING:'CHECK_PAYMENT_STATUS',
  PAID:'CHECK_JOB_HANDOFF',
  JOB_CREATED:'MONITOR_JOB_EXECUTION',
  COMPLETED:'CHECK_QA_AND_REPEAT_OPPORTUNITY',
});
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const id = value => typeof value === 'string' && /^[\w-]{1,100}$/.test(value);
const validDate = value => typeof value==='string' && !Number.isNaN(Date.parse(value));
const timestamp = value => validDate(value) ? Date.parse(value) : null;

function blockedReasons(row, now) {
  const reasons=[];
  if (!row || typeof row!=='object' || Array.isArray(row) || !id(row.id)) reasons.push('INVALID_RECORD');
  if (row?.do_not_contact === true || TERMINAL.has(String(row?.disposition||'').toUpperCase())) reasons.push('CLOSED_OR_DNC');
  if (SUPPRESSED.has(String(row?.campaign_status||'').toUpperCase())) reasons.push('CAMPAIGN_SUPPRESSED');
  if (row?.campaign_eligible === false) reasons.push('CAMPAIGN_NOT_ELIGIBLE');
  const next=timestamp(row?.next_permitted_contact_at);
  if (next!==null && next>now.getTime()) reasons.push('CONTACT_COOLDOWN');
  if (row?.contact_pressure_state==='BLOCKED') reasons.push('CONTACT_PRESSURE_BLOCK');
  return reasons;
}

/**
 * Internal call prep, not permission to place a call. A phone number and
 * affirmative consent/verified contact authority are required to be eligible;
 * compliance and any jurisdictional restrictions remain executor obligations.
 */
export function planSalesCall(row,{now=new Date()}={}) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError('Invalid now');
  const reasons=blockedReasons(row,now);
  if (!row?.phone || !String(row.phone).trim()) reasons.push('NO_PHONE');
  if (row?.consent_phone!==true) reasons.push('PHONE_AUTHORITY_UNVERIFIED');
  if (!['VERIFIED_INBOUND','EXPLICIT_OPT_IN'].includes(String(row?.lead_origin_class||'').toUpperCase())) {
    reasons.push('BUYER_ORIGIN_UNVERIFIED');
  }
  const day=row?.next_action_date;
  if (!ISO_DAY.test(day||'') || Number.isNaN(Date.parse(day+'T00:00:00Z'))) reasons.push('NO_VALID_DUE_DATE');
  else if (Date.parse(day+'T23:59:59Z')>now.getTime()) reasons.push('NOT_DUE');
  const last=timestamp(row?.last_contacted_at), due=ISO_DAY.test(day||'')?Date.parse(day+'T23:59:59Z'):null;
  if (last!==null && due!==null && last>=due) reasons.push('ALREADY_CONTACTED');
  return Object.freeze({
    eligible:reasons.length===0,
    reasons:Object.freeze([...new Set(reasons)]),
    sourceRecordId:typeof row?.id==='string'?row.id:null,
    proposedAction:'PREPARE_CALL_TASK',
    effect:'INTERNAL_PROPOSAL_ONLY',
  });
}

export function buildSalesCallPriority(rows,options={}) {
  if (!Array.isArray(rows) || rows.length>1000) throw new TypeError('rows must be an array (max 1000)');
  const candidates=rows.map(row=>({row,plan:planSalesCall(row,options)})).filter(x=>x.plan.eligible);
  return candidates.sort((a,b)=>{
    const scoreA=Number.isFinite(a.row.intent_score)?a.row.intent_score:0;
    const scoreB=Number.isFinite(b.row.intent_score)?b.row.intent_score:0;
    return scoreB-scoreA || String(a.row.next_action_date).localeCompare(String(b.row.next_action_date)) ||
      String(a.row.id).localeCompare(String(b.row.id));
  }).map(x=>x.plan);
}

/** Stage changes generate internal task suggestions only. */
export function planDealStageChange({dealId,oldStage,newStage,recordTenantId,authenticatedTenantId,identityAuthorized=false}) {
  const reasons=[];
  if (!id(dealId)) reasons.push('INVALID_DEAL');
  if (!id(recordTenantId) || authenticatedTenantId!==recordTenantId || identityAuthorized!==true)
    reasons.push('TENANT_NOT_AUTHORIZED');
  const previous=String(oldStage||'').toUpperCase(),current=String(newStage||'').toUpperCase();
  if (!Object.prototype.hasOwnProperty.call(STAGES,current)) reasons.push('UNKNOWN_STAGE');
  if (previous===current) reasons.push('NO_STAGE_CHANGE');
  return Object.freeze({eligible:reasons.length===0, reasons:Object.freeze(reasons),
    proposedTask:reasons.length===0?STAGES[current]:null,dealId:dealId||null,
    effect:'INTERNAL_PROPOSAL_ONLY'});
}
