/**
 * One governed DANI assignment step. Integration seam, not a new orchestrator.
 * The existing task authority owns claims, records, retries and state.
 * The LLM proposes; verified capabilities and current approvals decide.
 */
import { routeExecutionTask } from './aiExecutionGovernor.js';
const hasText = x => typeof x === 'string' && x.trim().length > 0;
const held = reason => ({state:'HELD',reason});
export async function executeAssignedStep(input, adapters) {
  if (!hasText(input?.assignmentId) || !hasText(input?.authorityRef)) return held('INVALID_ASSIGNMENT');
  const required=['recover','recoverContext','routeModel','listVerifiedWorkers','claim','execute','verify','complete','deliver','fail'];
  if (!required.every(k=>typeof adapters?.[k]==='function')) return held('ADAPTER_NOT_CONNECTED');

  const current=await adapters.recover({assignmentId:input.assignmentId,authorityRef:input.authorityRef});
  if (!current || current.assignmentId!==input.assignmentId || current.authorityRef!==input.authorityRef)
    return held('CURRENT_AUTHORITY_UNVERIFIED');
  if (current.status==='GREEN') return {state:'GREEN',receiptRef:current.receiptRef||null};
  if (current.status!=='READY' || current.approved!==true) return held('NOT_AUTHORIZED');
  if (current.scope?.personalData===true && current.scope?.businessDomain===true)
    return held('DATA_BOUNDARY_REQUIRES_REVIEW');

  const route=routeExecutionTask(current.routingFacts||{});
  if (route.ownerApprovalRequired || route.independentReviewRequired)
    return held('GOVERNED_REVIEW_REQUIRED');
  // Never send task context to an external inference provider by implication.
  if (current.modelInferenceApproved !== true ||
      current.modelContextSanitized !== true ||
      !hasText(current.modelApprovalRef))
    return held('MODEL_INFERENCE_NOT_AUTHORIZED');
  const available=await adapters.listVerifiedWorkers({tier:route.tier,authorityRef:current.authorityRef});
  if (!Array.isArray(available)) return held('NO_VERIFIED_WORKER');
  const workers=available.filter(w=>hasText(w?.id)&&w.verified===true&&w.authorized===true);
  if (!workers.length) return held('NO_AUTHORIZED_WORKER');

  // Retrieve fresh task-scoped context from the existing authoritative stores.
  // A model-written summary is never sufficient evidence of current state.
  let pickup;
  try {
    pickup=await adapters.recoverContext({
      assignmentId:current.assignmentId,authorityRef:current.authorityRef,
      expectedRevision:current.revision,contextRefs:route.contextPolicy.include
    });
  } catch {
    return held('CONTEXT_PICKUP_UNAVAILABLE');
  }
  if (pickup?.assignmentId!==current.assignmentId ||
      pickup?.authorityRef!==current.authorityRef ||
      pickup?.sourceRevision!==current.revision ||
      pickup?.currentVerified!==true ||
      pickup?.contextSanitized!==true ||
      pickup?.contradictionUnresolved===true ||
      !Array.isArray(pickup?.evidenceRefs) || pickup.evidenceRefs.length===0 ||
      !pickup.evidenceRefs.every(hasText))
    return held('CONTEXT_PICKUP_UNVERIFIED');

  const proposal=await adapters.routeModel({
    assignmentId:current.assignmentId,objective:current.objective,tier:route.tier,
    context:pickup.sanitizedContext||null,contextEvidenceRefs:pickup.evidenceRefs,
    modelApprovalRef:current.modelApprovalRef,workerIds:workers.map(w=>w.id)
  });
  if (!hasText(proposal?.workerId)||!hasText(proposal?.step)) return held('MODEL_PROPOSAL_INVALID');
  // The model must choose from explicitly approved steps, not invent actions.
  const allowedSteps=current.scope?.allowedSteps;
  if (!Array.isArray(allowedSteps)||!allowedSteps.includes(proposal.step))
    return held('STEP_NOT_IN_APPROVED_SCOPE');
  if (!workers.some(w=>w.id===proposal.workerId)) return held('UNAUTHORIZED_WORKER');
  if (proposal.actions?.length || proposal.changeAuthority || proposal.allowNetwork===true)
    return held('MODEL_PROPOSED_AUTHORITY_CHANGE');

  const claim=await adapters.claim({
    assignmentId:current.assignmentId,authorityRef:current.authorityRef,
    expectedRevision:current.revision,workerId:proposal.workerId,step:proposal.step,
    contextEvidenceRefs:pickup.evidenceRefs
  });
  if (claim?.claimed!==true||!hasText(claim.claimRef)) return held('CLAIM_DENIED');
  let proof;
  try {
    const result=await adapters.execute({
      claimRef:claim.claimRef,workerId:proposal.workerId,
      step:proposal.step,scope:current.scope
    });
    proof=await adapters.verify({
      claimRef:claim.claimRef,result,expectedOutcome:current.expectedOutcome
    });
  } catch {
    // The worker may already have performed the action. Never auto-retry.
    try { await adapters.fail({claimRef:claim.claimRef,code:'EXECUTION_INTERRUPTED'}); }
    catch { return {state:'HELD',claimRef:claim.claimRef,reason:'FAILURE_RECORD_UNCONFIRMED'}; }
    return {state:'FAILED',claimRef:claim.claimRef,reason:'EXECUTION_INTERRUPTED'};
  }
  if (proof?.passed!==true||!hasText(proof.evidenceRef)) {
    try { await adapters.fail({claimRef:claim.claimRef,code:'VERIFICATION_FAILED'}); }
    catch { return {state:'HELD',claimRef:claim.claimRef,reason:'FAILURE_RECORD_UNCONFIRMED'}; }
    return {state:'FAILED',claimRef:claim.claimRef,reason:'VERIFICATION_FAILED'};
  }
  let receipt;
  try {
    receipt=await adapters.complete({
      claimRef:claim.claimRef,evidenceRef:proof.evidenceRef,outcome:proof.outcome
    });
  } catch {
    // Completion may have committed before the response failed.
    return {state:'HELD',claimRef:claim.claimRef,reason:'COMPLETION_UNCONFIRMED'};
  }
  if (!hasText(receipt?.receiptRef))
    return {state:'HELD',claimRef:claim.claimRef,reason:'COMPLETION_UNCONFIRMED'};
  let delivered;
  try {
    delivered=await adapters.deliver({
      assignmentId:current.assignmentId,authorityRef:current.authorityRef,
      claimRef:claim.claimRef,receiptRef:receipt.receiptRef,evidenceRef:proof.evidenceRef
    });
  } catch {
    return {state:'HELD',claimRef:claim.claimRef,receiptRef:receipt.receiptRef,
      reason:'OWNER_RESULT_NOT_RETRIEVABLE'};
  }
  if (delivered?.ownerRetrievable!==true || !hasText(delivered?.deliveryRef))
    return {state:'HELD',claimRef:claim.claimRef,receiptRef:receipt.receiptRef,
      reason:'OWNER_RESULT_NOT_RETRIEVABLE'};
  return {state:'VERIFIED',claimRef:claim.claimRef,evidenceRef:proof.evidenceRef,
    receiptRef:receipt.receiptRef,deliveryRef:delivered.deliveryRef};
}
