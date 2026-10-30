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
  const required=['recover','routeModel','listVerifiedWorkers','claim','execute','verify','complete','fail'];
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

  const proposal=await adapters.routeModel({
    assignmentId:current.assignmentId,objective:current.objective,tier:route.tier,
    context:current.modelContext||null,modelApprovalRef:current.modelApprovalRef,workerIds:workers.map(w=>w.id)
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
    expectedRevision:current.revision,workerId:proposal.workerId,step:proposal.step
  });
  if (claim?.claimed!==true||!hasText(claim.claimRef)) return held('CLAIM_DENIED');
  try {
    const result=await adapters.execute({
      claimRef:claim.claimRef,workerId:proposal.workerId,
      step:proposal.step,scope:current.scope
    });
    const proof=await adapters.verify({
      claimRef:claim.claimRef,result,expectedOutcome:current.expectedOutcome
    });
    if (proof?.passed!==true||!hasText(proof.evidenceRef)) {
      await adapters.fail({claimRef:claim.claimRef,code:'VERIFICATION_FAILED'});
      return {state:'FAILED',claimRef:claim.claimRef,reason:'VERIFICATION_FAILED'};
    }
    const receipt=await adapters.complete({
      claimRef:claim.claimRef,evidenceRef:proof.evidenceRef,outcome:proof.outcome
    });
    if (!hasText(receipt?.receiptRef)) return {state:'HELD',claimRef:claim.claimRef,reason:'COMPLETION_NOT_CONFIRMED'};
    return {state:'VERIFIED',claimRef:claim.claimRef,evidenceRef:proof.evidenceRef,receiptRef:receipt.receiptRef};
  } catch {
    // Do not retry automatically: the worker may have committed a side effect.
    await adapters.fail({claimRef:claim.claimRef,code:'EXECUTION_INTERRUPTED'});
    return {state:'FAILED',claimRef:claim.claimRef,reason:'EXECUTION_INTERRUPTED'};
  }
}
