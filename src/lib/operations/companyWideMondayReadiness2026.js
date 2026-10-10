/**
 * Company-wide Monday readiness — pure projection of existing governed DANI truth.
 * This does not approve contacts, provider accounts, quotes, payment paths or
 * dispatch; nor does it create a new scheduler, queue, ledger, or authority.
 * All five DANI channels and institutional/procurement opportunities use the
 * same checks; each request additionally requires its own SKU/channel/route proof.
 */
const integer = v => Number.isInteger(v) && v >= 0;
const yes = v => v === true;
const add = (holds, condition, reason) => { if (!condition) holds.push(reason); };

export function evaluateMondayOperatingReadiness(snapshot = {}) {
  const holds = {};
  const sales = [];
  add(sales, yes(snapshot.voiceOutboundTested) && yes(snapshot.voiceCallbackTested),
    'GOOGLE_VOICE_TWO_WAY_TEST_UNVERIFIED');
  add(sales, yes(snapshot.callLoggingTested), 'CALL_LOGGING_UNVERIFIED');
  add(sales, yes(snapshot.callEligibilityScreeningVerified),
    'CALLING_ELIGIBILITY_UNVERIFIED');
  add(sales, integer(snapshot.eligibleCallCount) && snapshot.eligibleCallCount > 0,
    'NO_VERIFIED_CALL_ELIGIBLE_CONTACTS');
  holds.sales = sales;

  const providers = [];
  add(providers, yes(snapshot.providerApplicantPathTested),
    'PROVIDER_SIGNUP_PATH_UNVERIFIED');
  add(providers, integer(snapshot.fullyDispatchReadyProviders) &&
    snapshot.fullyDispatchReadyProviders > 0,
    'NO_FULLY_DISPATCH_READY_PROVIDERS');
  add(providers, yes(snapshot.providerAvailabilityVerified),
    'PROVIDER_AVAILABILITY_UNVERIFIED');
  add(providers, yes(snapshot.providerAcceptancePathTested),
    'PROVIDER_ACCEPTANCE_PATH_UNVERIFIED');
  holds.providers = providers;

  const quote = [];
  add(quote, yes(snapshot.requestScopeTested), 'REQUEST_SCOPE_GATE_UNVERIFIED');
  add(quote, yes(snapshot.lockedPriceAndChannelVerified),
    'PRICING_CHANNEL_GATE_UNVERIFIED');
  add(quote, yes(snapshot.serviceSpecificEconomicsVerified),
    'SERVICE_ECONOMICS_UNVERIFIED');
  holds.quote = quote;

  const payments = [];
  add(payments, yes(snapshot.actualAuthorizedPaymentRouteVerified),
    'PAYMENT_COLLECTION_ROUTE_UNVERIFIED');
  add(payments, yes(snapshot.paymentReconciliationPathVerified),
    'PAYMENT_RECONCILIATION_UNVERIFIED');
  holds.payments = payments;

  const dispatch = [];
  add(dispatch, yes(snapshot.providerMatchGateVerified),
    'SERVICE_LOCATION_CREDENTIAL_MATCH_UNVERIFIED');
  add(dispatch, yes(snapshot.scheduleConflictCheckVerified),
    'SCHEDULE_CAPACITY_UNVERIFIED');
  add(dispatch, yes(snapshot.acceptedAssignmentProofVerified),
    'ACCEPTED_ASSIGNMENT_UNVERIFIED');
  holds.dispatch = dispatch;

  const qa = [];
  add(qa, yes(snapshot.completionEvidenceTested), 'COMPLETION_EVIDENCE_UNVERIFIED');
  add(qa, yes(snapshot.qaCloseoutTested), 'QA_CLOSEOUT_UNVERIFIED');
  holds.qa = qa;

  const capacity = {
    weeklyOwnerDeliveryTargetHours:
      integer(snapshot.weeklyOwnerDeliveryTargetHours) ?
        snapshot.weeklyOwnerDeliveryTargetHours : null,
    committedHours: Number.isFinite(snapshot.committedOwnerHours) &&
      snapshot.committedOwnerHours >= 0 ? snapshot.committedOwnerHours : null,
    bookableOwnerHours: null,
    state: 'CAPACITY_UNVERIFIED',
  };
  // A planning target never establishes calendar availability. Only an
  // independently verified available-hours figure can produce bookability.
  if (yes(snapshot.ownerCalendarAvailabilityVerified) &&
      Number.isFinite(snapshot.confirmedOwnerAvailableHours) &&
      snapshot.confirmedOwnerAvailableHours >= 0 &&
      capacity.committedHours !== null) {
    const limit = capacity.weeklyOwnerDeliveryTargetHours === null ?
      snapshot.confirmedOwnerAvailableHours :
      Math.min(capacity.weeklyOwnerDeliveryTargetHours,
        snapshot.confirmedOwnerAvailableHours);
    capacity.bookableOwnerHours = Math.max(0, limit - capacity.committedHours);
    capacity.state = 'CAPACITY_VERIFIED';
  }
  const allHolds = Object.entries(holds).flatMap(([lane, reasons]) =>
    reasons.map(reason => ({lane, reason})));
  return {
    overall: allHolds.length ? 'QUALIFICATION_ONLY' : 'OPERATIONAL_GATES_VERIFIED',
    holds, allHolds, capacity,
    eligibleCallCount: integer(snapshot.eligibleCallCount) ?
      snapshot.eligibleCallCount : null,
    fullyDispatchReadyProviders: integer(snapshot.fullyDispatchReadyProviders) ?
      snapshot.fullyDispatchReadyProviders : null,
    publicLaunchAuthorized: false,
    canAutoDial: false, canAutoMessage: false, canAutoApproveProviders: false,
    canAutoDispatch: false, canAutoCharge: false,
    // Live offers/jobs still require their own canonical price/scope/compliance
    // proof. This projection cannot authorize any specific transaction.
    requestSpecificGateStillRequired: true,
  };
}
