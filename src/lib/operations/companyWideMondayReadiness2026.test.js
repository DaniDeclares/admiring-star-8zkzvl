import { evaluateMondayOperatingReadiness } from './companyWideMondayReadiness2026';
const clean={
  voiceOutboundTested:true,voiceCallbackTested:true,callLoggingTested:true,
  callEligibilityScreeningVerified:true,eligibleCallCount:1,
  providerApplicantPathTested:true,fullyDispatchReadyProviders:1,
  providerAvailabilityVerified:true,providerAcceptancePathTested:true,
  requestScopeTested:true,lockedPriceAndChannelVerified:true,
  serviceSpecificEconomicsVerified:true,actualAuthorizedPaymentRouteVerified:true,
  paymentReconciliationPathVerified:true,providerMatchGateVerified:true,
  scheduleConflictCheckVerified:true,acceptedAssignmentProofVerified:true,
  completionEvidenceTested:true,qaCloseoutTested:true,
  weeklyOwnerDeliveryTargetHours:10,committedOwnerHours:3,
  ownerCalendarAvailabilityVerified:true,confirmedOwnerAvailableHours:8,
};
describe('company-wide sales-to-dispatch gate for all DANI channels',()=>{
  test('no records or proof fails closed without creating authorization',()=>{
    const r=evaluateMondayOperatingReadiness();
    expect(r.overall).toBe('QUALIFICATION_ONLY');
    expect(r.holds.sales).toContain('CALLING_ELIGIBILITY_UNVERIFIED');
    expect(r.holds.providers).toContain('NO_FULLY_DISPATCH_READY_PROVIDERS');
    expect(r.holds.payments).toContain('PAYMENT_COLLECTION_ROUTE_UNVERIFIED');
    expect(r.capacity.bookableOwnerHours).toBeNull();
    expect(r.canAutoDial).toBe(false);
    expect(r.canAutoApproveProviders).toBe(false);
    expect(r.canAutoDispatch).toBe(false);
    expect(r.canAutoCharge).toBe(false);
  });
  test('large prospect list never becomes eligible calling list',()=>{
    const r=evaluateMondayOperatingReadiness({...clean,eligibleCallCount:0});
    expect(r.holds.sales).toContain('NO_VERIFIED_CALL_ELIGIBLE_CONTACTS');
    expect(r.overall).toBe('QUALIFICATION_ONLY');
  });
  test('zero approved providers prevents claiming dispatch readiness',()=>{
    const r=evaluateMondayOperatingReadiness({...clean,fullyDispatchReadyProviders:0});
    expect(r.holds.providers).toContain('NO_FULLY_DISPATCH_READY_PROVIDERS');
  });
  test('payment route missing holds only that lane while all lanes stay visible',()=>{
    const r=evaluateMondayOperatingReadiness({...clean,actualAuthorizedPaymentRouteVerified:false});
    expect(r.holds.payments).toContain('PAYMENT_COLLECTION_ROUTE_UNVERIFIED');
    expect(r.holds.sales).toEqual([]);
    expect(r.holds.providers).toEqual([]);
  });
  test('10-hour planning limit never implies 10 hours bookable',()=>{
    const r=evaluateMondayOperatingReadiness({...clean,ownerCalendarAvailabilityVerified:false});
    expect(r.capacity.state).toBe('CAPACITY_UNVERIFIED');
    expect(r.capacity.bookableOwnerHours).toBeNull();
  });
  test('verified calendar and existing work produce bounded residual hours',()=>{
    const r=evaluateMondayOperatingReadiness(clean);
    expect(r.capacity.bookableOwnerHours).toBe(5);
    expect(r.overall).toBe('OPERATIONAL_GATES_VERIFIED');
    expect(r.publicLaunchAuthorized).toBe(false);
    expect(r.requestSpecificGateStillRequired).toBe(true);
  });
  test('unknown economic inputs never greenlight a live quote',()=>{
    const r=evaluateMondayOperatingReadiness({...clean,serviceSpecificEconomicsVerified:false});
    expect(r.holds.quote).toContain('SERVICE_ECONOMICS_UNVERIFIED');
  });
});
