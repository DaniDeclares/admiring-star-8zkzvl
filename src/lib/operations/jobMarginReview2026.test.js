import { evaluateJobMarginReview } from './jobMarginReview2026';

const verified = {
  scopeApproved: true, approvedHours: 1, paymentPathVerified: true,
  laborRuleVerified: true, ownerHourlyRate: 75,
  approvedRevenue: 129, actualHours: 0.1, remainingHours: 0.3,
  actualOtherDirectCosts: 0, remainingOtherDirectCosts: 0,
  overheadAllowance: 19.35, processingAllowance: 3.74,
  minimumMarginPercent: 20, costEvidenceVerified: true,
};

describe('DANI fail-closed job margin and scope review (read-only)', () => {
  test('missing evidence preserves every independent hold and never reports healthy', () => {
    const r = evaluateJobMarginReview({});
    expect(r.gates).toMatchObject({
      labor: 'LABOR_AUTHORITY_UNVERIFIED', scope: 'SCOPE_UNVERIFIED',
      payment: 'PAYMENT_PATH_UNVERIFIED', economics: 'ECONOMICS_UNVERIFIED',
      measuredProfitability: 'MEASURED_MARGIN_UNVERIFIED',
    });
    expect(r.forecastMarginPercent).toBeNull();
    expect(r.canAutoCharge).toBe(false);
    expect(r.canAutoContact).toBe(false);
    expect(r.canAutoReassign).toBe(false);
  });

  test('labor verification cannot hide payment or scope holds', () => {
    const r = evaluateJobMarginReview({laborRuleVerified:true,ownerHourlyRate:75});
    expect(r.gates.labor).toBe('LABOR_AUTHORITY_VERIFIED');
    expect(r.gates.scope).toBe('SCOPE_UNVERIFIED');
    expect(r.gates.payment).toBe('PAYMENT_PATH_UNVERIFIED');
    expect(r.gates.economics).toBe('ECONOMICS_UNVERIFIED');
  });

  test('verified forecast is still not a measured profitability claim', () => {
    const r = evaluateJobMarginReview(verified);
    expect(r.state).toBe('FORECAST_ONLY');
    expect(r.gates.measuredProfitability).toBe('MEASURED_MARGIN_UNVERIFIED');
    expect(r.measuredMarginPercent).toBeNull();
    expect(r.forecastMarginPercent).not.toBeNull();
  });

  test('scope change and low margin remain simultaneous independent findings', () => {
    const r = evaluateJobMarginReview({
      ...verified, actualHours:1.2,remainingHours:0.3,
      requestOutsideApprovedScope:true,
    });
    expect(r.alertReasons).toEqual(expect.arrayContaining([
      'SCOPE_CHANGE_REVIEW', 'FORECAST_HOURS_OVERRUN', 'FORECAST_MARGIN_ALERT',
    ]));
    expect(r.canAutoCharge).toBe(false);
    expect(r.ownerReviewRequired).toBe(true);
  });

  test('threshold fires at crossing and not for repeated current severity', () => {
    const data={...verified,actualHours:0.8,remainingHours:0.1};
    expect(evaluateJobMarginReview(data).budgetAlert).toBe('HOURS_75');
    expect(evaluateJobMarginReview({...data,previousAlertLevel:'HOURS_75'}).budgetAlert).toBeNull();
    expect(evaluateJobMarginReview({...data,previousAlertLevel:'HOURS_90'}).budgetAlert).toBeNull();
  });

  test('new scope and margin issues survive an unchanged hours threshold', () => {
    const first=evaluateJobMarginReview({
      ...verified,actualHours:0.8,remainingHours:0.1,
      previousAlertLevel:'HOURS_75',previousAlertReasons:[],
      requestOutsideApprovedScope:true,
    });
    expect(first.budgetAlert).toBeNull();
    expect(first.newlyAppearedReasons).toContain('SCOPE_CHANGE_REVIEW');

    const lowMargin=evaluateJobMarginReview({
      ...verified,actualHours:0.8,remainingHours:0.6,
      previousAlertLevel:'HOURS_75',
      previousAlertReasons:['SCOPE_CHANGE_REVIEW','FORECAST_HOURS_OVERRUN'],
      requestOutsideApprovedScope:true,
    });
    expect(lowMargin.newlyAppearedReasons).toContain('FORECAST_MARGIN_ALERT');
    expect(lowMargin.newlyAppearedReasons).not.toContain('SCOPE_CHANGE_REVIEW');

    const repeated=evaluateJobMarginReview({
      ...verified,actualHours:0.8,remainingHours:0.6,
      previousAlertLevel:'HOURS_75',
      previousAlertReasons:['SCOPE_CHANGE_REVIEW','FORECAST_HOURS_OVERRUN','FORECAST_MARGIN_ALERT'],
      requestOutsideApprovedScope:true,
    });
    expect(repeated.newlyAppearedReasons).toEqual([]);
    expect(repeated.alertReasons).toContain('FORECAST_MARGIN_ALERT');
  });

  test('missing costs never become zero', () => {
    const r=evaluateJobMarginReview({...verified,actualOtherDirectCosts:undefined});
    expect(r.gates.economics).toBe('ECONOMICS_UNVERIFIED');
    expect(r.forecastMarginPercent).toBeNull();
  });

  test('measured complete margin can be below minimum and remain ready', () => {
    const r=evaluateJobMarginReview({...verified,
      jobComplete:true,qaReconciled:true,actualFinancialsReconciled:true,
      actualRevenueCollected:129,actualTotalCosts:120,
    });
    expect(r.gates.measuredProfitability).toBe('MEASURED_MARGIN_READY');
    expect(r.measuredMarginPercent).toBeCloseTo(6.98);
    expect(r.measuredMarginPercent).toBeLessThan(verified.minimumMarginPercent);
  });

  test('unverified scope still shows scope change review without calculating a margin', () => {
    const r=evaluateJobMarginReview({...verified,scopeApproved:false,
      requestOutsideApprovedScope:true});
    expect(r.state).toBe('HELD');
    expect(r.scopeChangeReview).toBe(true);
    expect(r.forecastMarginPercent).toBeNull();
  });
});
