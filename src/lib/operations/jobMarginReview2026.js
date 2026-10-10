/**
 * Read-only proposal classifier for DANI job economics.
 * Existing pricing, compensation, quote, payment, job, QA and tenant authority
 * remain in Supabase. Never use this helper to approve prices, charges or dispatch.
 * All monetary inputs are verified snapshots expressed in dollars.
 */
const number = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const rate = v => number(v) && v <= 100;

export function evaluateJobMarginReview(job = {}) {
  const holds = [];
  if (!job.scopeApproved || !number(job.approvedHours) || job.approvedHours <= 0)
    holds.push('SCOPE_UNVERIFIED');
  if (job.paymentPathVerified !== true) holds.push('PAYMENT_PATH_UNVERIFIED');
  if (job.laborRuleVerified !== true || !number(job.ownerHourlyRate))
    holds.push('LABOR_AUTHORITY_UNVERIFIED');
  if (!number(job.approvedRevenue) || job.approvedRevenue <= 0 ||
      !number(job.actualHours) || !number(job.remainingHours) ||
      !number(job.actualOtherDirectCosts) || !number(job.remainingOtherDirectCosts) ||
      !number(job.overheadAllowance) || !number(job.processingAllowance) ||
      !rate(job.minimumMarginPercent) || job.costEvidenceVerified !== true)
    holds.push('ECONOMICS_UNVERIFIED');

  const scopeChange = job.requestOutsideApprovedScope === true;
  const result = { state:'HELD', holds, scopeChangeReview:scopeChange,
    budgetAlert:null, forecastMarginPercent:null, forecastContribution:null,
    canAutoCharge:false, canAutoContact:false, canAutoReassign:false };
  if (holds.length) return result;

  const totalForecastHours=job.actualHours+job.remainingHours;
  const ratio=100*job.actualHours/job.approvedHours;
  const forecastCost=totalForecastHours*job.ownerHourlyRate+
    job.actualOtherDirectCosts+job.remainingOtherDirectCosts+
    job.overheadAllowance+job.processingAllowance;
  const contribution=job.approvedRevenue-forecastCost;
  const margin=100*contribution/job.approvedRevenue;
  const forecastOverrun=totalForecastHours>job.approvedHours;
  const marginBreach=margin<job.minimumMarginPercent;
  const level=ratio>=100?'HOURS_100':ratio>=90?'HOURS_90':
    ratio>=75?'HOURS_75':ratio>=50?'HOURS_50':null;
  const previous=job.previousAlertLevel ?? null;
  const order=[null,'HOURS_50','HOURS_75','HOURS_90','HOURS_100'];
  const newlyCrossed=order.indexOf(level)>order.indexOf(previous);
  return {...result, state: marginBreach?'FORECAST_MARGIN_ALERT':
    forecastOverrun?'FORECAST_HOURS_OVERRUN':scopeChange?'SCOPE_CHANGE_REVIEW':'FORECAST_ONLY',
    holds:[], approvedHours:job.approvedHours, actualHours:job.actualHours,
    forecastHours:totalForecastHours, forecastHoursOverrun:forecastOverrun,
    forecastMarginPercent:Math.round(margin*100)/100,
    forecastContribution:Math.round(contribution*100)/100,
    marginBreach, budgetAlert:newlyCrossed?level:null,
    ownerReviewRequired:marginBreach||forecastOverrun||scopeChange||level==='HOURS_100'};
}
