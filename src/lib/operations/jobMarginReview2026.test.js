import { evaluateJobMarginReview } from './jobMarginReview2026';

const approved={
  scopeApproved:true, approvedHours:1, paymentPathVerified:true,
  laborRuleVerified:true,ownerHourlyRate:75,
  approvedRevenue:129,actualHours:0.5,remainingHours:0.25,
  actualOtherDirectCosts:0,remainingOtherDirectCosts:0,
  overheadAllowance:19.35,processingAllowance:3.74,
  minimumMarginPercent:20,costEvidenceVerified:true
};

describe('job margin review proposal: no money movement or customer contact',()=>{
  test('fails closed for unknown costs and payment route',()=>{
    const result=evaluateJobMarginReview({});
    expect(result.holds).toContain('ECONOMICS_UNVERIFIED');
    expect(result.holds).toContain('PAYMENT_PATH_UNVERIFIED');
    expect(result.canAutoCharge).toBe(false);
  });
  test('holds if a theoretical compensation rule is not verified',()=>{
    expect(evaluateJobMarginReview({...approved,laborRuleVerified:false}).holds)
      .toContain('LABOR_AUTHORITY_UNVERIFIED');
  });
  test('reports time threshold once without repeated alerts',()=>{
    const result=evaluateJobMarginReview({...approved,actualHours:0.8,remainingHours:0.1});
    expect(result.budgetAlert).toBe('HOURS_75');
    expect(evaluateJobMarginReview({...approved,actualHours:0.8,remainingHours:0.1,
      previousAlertLevel:'HOURS_75'}).budgetAlert).toBeNull();
  });
  test('scope changes are reviewed, never billed automatically',()=>{
    const result=evaluateJobMarginReview({...approved,requestOutsideApprovedScope:true});
    expect(result.scopeChangeReview).toBe(true);
    expect(result.canAutoCharge).toBe(false);
  });
  test('margin below floor overrides hours threshold',()=>{
    const result=evaluateJobMarginReview({...approved,actualHours:1.2,remainingHours:0.3});
    expect(result.state).toBe('FORECAST_MARGIN_ALERT');
    expect(result.ownerReviewRequired).toBe(true);
  });
  test('zero costs are allowed only when explicitly verified',()=>{
    const result=evaluateJobMarginReview({...approved,actualOtherDirectCosts:undefined});
    expect(result.holds).toContain('ECONOMICS_UNVERIFIED');
  });
});
