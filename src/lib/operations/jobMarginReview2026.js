/**
 * Pure, read-only job economics review. Not a price, payment, job or tenant authority.
 * All amounts are verified inputs supplied by DANI's existing governed records.
 * No database writes, notifications, billing, or dispatch side effects.
 */
const nonnegative = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const percentage = value => nonnegative(value) && value <= 100;
const round = value => Math.round(value * 100) / 100;
const LEVELS = [null, 'HOURS_50', 'HOURS_75', 'HOURS_90', 'HOURS_100'];

export function evaluateJobMarginReview(job = {}) {
  const scopeVerified = job.scopeApproved === true &&
    nonnegative(job.approvedHours) && job.approvedHours > 0;
  const paymentVerified = job.paymentPathVerified === true;
  const laborVerified = job.laborRuleVerified === true &&
    nonnegative(job.ownerHourlyRate) && job.ownerHourlyRate > 0;
  const economicsVerified = job.costEvidenceVerified === true &&
    nonnegative(job.approvedRevenue) && job.approvedRevenue > 0 &&
    nonnegative(job.actualHours) && nonnegative(job.remainingHours) &&
    nonnegative(job.actualOtherDirectCosts) && nonnegative(job.remainingOtherDirectCosts) &&
    nonnegative(job.overheadAllowance) && nonnegative(job.processingAllowance) &&
    percentage(job.minimumMarginPercent);

  // Independent gates: fixing one must never clear another.
  const gates = {
    labor: laborVerified ? 'LABOR_AUTHORITY_VERIFIED' : 'LABOR_AUTHORITY_UNVERIFIED',
    scope: scopeVerified ? 'SCOPE_VERIFIED' : 'SCOPE_UNVERIFIED',
    payment: paymentVerified ? 'PAYMENT_PATH_VERIFIED' : 'PAYMENT_PATH_UNVERIFIED',
    economics: economicsVerified ? 'ECONOMICS_INPUTS_VERIFIED' : 'ECONOMICS_UNVERIFIED',
    measuredProfitability: 'MEASURED_MARGIN_UNVERIFIED',
  };
  const holds = Object.values(gates).filter(v => v.endsWith('_UNVERIFIED'));
  const scopeChangeReview = job.requestOutsideApprovedScope === true;
  const base = {
    state: 'HELD', gates, holds, scopeChangeReview,
    forecastMarginPercent: null, forecastContribution: null,
    forecastHours: null, forecastHoursOverrun: null, marginBreach: null,
    budgetAlert: null, budgetLevel: null, alertReasons: scopeChangeReview ? ['SCOPE_CHANGE_REVIEW'] : [],
    ownerReviewRequired: scopeChangeReview,
    canAutoCharge: false, canAutoContact: false, canAutoReassign: false,
  };

  // A reconciled actual margin is distinct from a forecast and can be negative.
  // Reconciliation requires explicit completion, QA and cost evidence, not a mere positive number.
  if (job.jobComplete === true && job.qaReconciled === true &&
      job.actualFinancialsReconciled === true &&
      nonnegative(job.actualRevenueCollected) && job.actualRevenueCollected > 0 &&
      nonnegative(job.actualTotalCosts)) {
    gates.measuredProfitability = 'MEASURED_MARGIN_READY';
    base.measuredMarginPercent = round(100 *
      (job.actualRevenueCollected - job.actualTotalCosts) / job.actualRevenueCollected);
  } else {
    base.measuredMarginPercent = null;
  }
  const blocking = holds.filter(h => h !== 'MEASURED_MARGIN_UNVERIFIED');
  if (blocking.length) return base;

  const forecastHours = job.actualHours + job.remainingHours;
  const forecastCost = forecastHours * job.ownerHourlyRate +
    job.actualOtherDirectCosts + job.remainingOtherDirectCosts +
    job.overheadAllowance + job.processingAllowance;
  const forecastContribution = job.approvedRevenue - forecastCost;
  const forecastMarginPercent = round(100 * forecastContribution / job.approvedRevenue);
  const marginBreach = forecastMarginPercent < job.minimumMarginPercent;
  const forecastHoursOverrun = forecastHours > job.approvedHours;
  const usedPercent = 100 * job.actualHours / job.approvedHours;
  const budgetLevel = usedPercent >= 100 ? 'HOURS_100' : usedPercent >= 90 ? 'HOURS_90' :
    usedPercent >= 75 ? 'HOURS_75' : usedPercent >= 50 ? 'HOURS_50' : null;
  const previous = LEVELS.includes(job.previousAlertLevel) ? job.previousAlertLevel : null;
  const budgetAlert = LEVELS.indexOf(budgetLevel) > LEVELS.indexOf(previous) ? budgetLevel : null;
  const alertReasons = [
    ...(scopeChangeReview ? ['SCOPE_CHANGE_REVIEW'] : []),
    ...(forecastHoursOverrun ? ['FORECAST_HOURS_OVERRUN'] : []),
    ...(marginBreach ? ['FORECAST_MARGIN_ALERT'] : []),
    ...(budgetAlert ? [budgetAlert] : []),
  ];
  return {
    ...base,
    state: alertReasons.length ? 'OWNER_REVIEW_REQUIRED' : 'FORECAST_ONLY',
    holds,
    forecastHours, forecastHoursOverrun, forecastContribution: round(forecastContribution),
    forecastMarginPercent, marginBreach, budgetLevel, budgetAlert, alertReasons,
    ownerReviewRequired: alertReasons.length > 0,
  };
}
