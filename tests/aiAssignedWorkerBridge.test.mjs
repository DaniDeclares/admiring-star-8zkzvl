import test from 'node:test';
import assert from 'node:assert/strict';
import {executeAssignedStep} from '../src/lib/aiAssignedWorkerBridge.js';

const input={assignmentId:'task-1',authorityRef:'ASANA:task-1'};
const setup=(override={})=>{
  const calls=[];
  const adapters={
    recover:async()=>({...input,status:'READY',approved:true,revision:'r1',
      objective:'Verify an existing product',expectedOutcome:'usable file',modelInferenceApproved:true,modelContextSanitized:true,modelApprovalRef:'approved-fixture',
      scope:{businessDomain:true,allowedSteps:['Inspect existing file']},
      routingFacts:{authorityResolved:true,scopeBounded:true,kind:'FORMAT'}}),
    recoverContext:async()=>({assignmentId:input.assignmentId,authorityRef:input.authorityRef,
      sourceRevision:'r1',currentVerified:true,contextSanitized:true,contradictionUnresolved:false,
      evidenceRefs:['ASANA:task-1:revision-r1'],sanitizedContext:'Already-approved synthetic scope'}),
    routeModel:async()=>({workerId:'file-qa',step:'Inspect existing file'}),
    listVerifiedWorkers:async()=>[{id:'file-qa',verified:true,authorized:true}],
    claim:async()=>{calls.push('claim');return {claimed:true,claimRef:'claim-1'}},
    execute:async()=>{calls.push('execute');return {path:'candidate.pdf'}},
    verify:async()=>{calls.push('verify');return {passed:true,evidenceRef:'evidence-1',outcome:'usable file'}},
    complete:async()=>{calls.push('complete');return {receiptRef:'receipt-1'}},
    deliver:async()=>{calls.push('deliver');return {deliveryRef:'owner-result-1',ownerRetrievable:true}},
    fail:async()=>{calls.push('fail')},...override};
  return {adapters,calls};
};
test('one bounded claim executes and produces durable evidence',async()=>{
  const {adapters,calls}=setup();
  const r=await executeAssignedStep(input,adapters);
  assert.equal(r.state,'VERIFIED');
  assert.equal(r.claimRef,'claim-1');
  assert.equal(r.evidenceRef,'evidence-1');
  assert.equal(r.receiptRef,'receipt-1');
  assert.equal(r.deliveryRef,'owner-result-1');
  assert.equal(r.resourceReceipt.status,'UNKNOWN');
  assert.deepEqual(calls,['claim','execute','verify','complete','deliver']);
});
test('owner approval is necessary; LLM cannot choose unauthorized workers',async()=>{
  let h=setup({recover:async()=>({...input,status:'READY',approved:false})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'NOT_AUTHORIZED');
  assert.deepEqual(h.calls,[]);
  h=setup({routeModel:async()=>({workerId:'unverified',step:'Inspect existing file'})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'UNAUTHORIZED_WORKER');
  assert.deepEqual(h.calls,[]);
});
test('model proposals cannot change authorization; gated actions are held',async()=>{
  let h=setup({routeModel:async()=>({workerId:'file-qa',step:'Inspect existing file',actions:['OUTBOUND_MESSAGE']})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'MODEL_PROPOSED_AUTHORITY_CHANGE');
  assert.deepEqual(h.calls,[]);
  h=setup({recover:async()=>({...input,status:'READY',approved:true,routingFacts:{actions:['PRODUCTION_MUTATION']}})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'GOVERNED_REVIEW_REQUIRED');
  assert.deepEqual(h.calls,[]);
});
test('fresh context pickup fails closed before any model call',async()=>{
  let modelCalls=0;
  const h=setup({recoverContext:async()=>({
    assignmentId:input.assignmentId,authorityRef:input.authorityRef,
    sourceRevision:'stale',currentVerified:true,evidenceRefs:['stale-record']
  }),routeModel:async()=>{modelCalls++;return {workerId:'file-qa',step:'Inspect existing file'}}});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'CONTEXT_PICKUP_UNVERIFIED');
  assert.equal(modelCalls,0);
  assert.deepEqual(h.calls,[]);
});
test('missing authoritative context does not become a guessed model prompt',async()=>{
  let modelCalls=0;
  const h=setup({recoverContext:async()=>{throw new Error('authority unavailable')},
    routeModel:async()=>{modelCalls++;return {workerId:'file-qa',step:'Inspect existing file'}}});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'CONTEXT_PICKUP_UNAVAILABLE');
  assert.equal(modelCalls,0);
  assert.deepEqual(h.calls,[]);
});
test('external inference requires explicit approval and sanitized context',async()=>{
  const h=setup({recover:async()=>({...input,status:'READY',approved:true,
    scope:{businessDomain:true,allowedSteps:['Inspect existing file']},
    routingFacts:{authorityResolved:true,scopeBounded:true,kind:'FORMAT'},
    modelInferenceApproved:false,modelContextSanitized:false})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'MODEL_INFERENCE_NOT_AUTHORIZED');
  assert.deepEqual(h.calls,[]);
});
test('model cannot invent unapproved work steps',async()=>{
  const h=setup({routeModel:async()=>({workerId:'file-qa',step:'Publish product'})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'STEP_NOT_IN_APPROVED_SCOPE');
  assert.deepEqual(h.calls,[]);
});
test('verification failure never becomes completion',async()=>{
  const {adapters,calls}=setup({verify:async()=>({passed:false})});
  assert.equal((await executeAssignedStep(input,adapters)).state,'FAILED');
  assert.deepEqual(calls,['claim','execute','fail']);
});
test('completed work without owner retrieval remains held, not verified',async()=>{
  const h=setup({deliver:async()=>({ownerRetrievable:false})});
  const result=await executeAssignedStep(input,h.adapters);
  assert.equal(result.state,'HELD');
  assert.equal(result.reason,'OWNER_RESULT_NOT_RETRIEVABLE');
  assert.equal(result.receiptRef,'receipt-1');
});
test('uncertain completion does not call failure or repeat the worker',async()=>{
  const h=setup({complete:async()=>{throw new Error('response lost')}});
  const result=await executeAssignedStep(input,h.adapters);
  assert.equal(result.state,'HELD');
  assert.equal(result.reason,'COMPLETION_UNCONFIRMED');
  assert.deepEqual(h.calls,['claim','execute','verify']);
});
test('delivery interruption holds completed receipt without marking it failed',async()=>{
  const h=setup({deliver:async()=>{throw new Error('owner surface unavailable')}});
  const result=await executeAssignedStep(input,h.adapters);
  assert.equal(result.reason,'OWNER_RESULT_NOT_RETRIEVABLE');
  assert.equal(result.receiptRef,'receipt-1');
  assert.deepEqual(h.calls,['claim','execute','verify','complete']);
});
test('already completed tasks are not re-executed',async()=>{
  const h=setup({recover:async()=>({...input,status:'GREEN',receiptRef:'existing'})});
  assert.deepEqual(await executeAssignedStep(input,h.adapters),{state:'GREEN',receiptRef:'existing'});
  assert.deepEqual(h.calls,[]);
});

test('a measured resource overrun holds before claim or worker action',async()=>{
  let modelCalls=0;
  const h=setup({routeModel:async(args)=>{
    modelCalls++;
    assert.equal(args.resourceGovernance.mode,'SHADOW');
    assert.equal(args.resourceGovernance.preInferenceCapEnforced,false);
    return {workerId:'file-qa',step:'Inspect existing file',
      usage:{inputTokens:8001,outputTokens:500,modelCalls:1,wallTimeMs:12000}};
  }});
  const result=await executeAssignedStep(input,h.adapters);
  assert.equal(modelCalls,1);
  assert.equal(result.state,'HELD');
  assert.equal(result.reason,'RESOURCE_LIMIT_EXCEEDED');
  assert.deepEqual(result.resourceReceipt.exceeded,['inputTokens']);
  assert.deepEqual(h.calls,[]);
});

test('unknown usage remains visible and is carried through existing receipt adapters',async()=>{
  let completedResource=null;
  let deliveredResource=null;
  let modelEnvelope=null;
  const h=setup({
    routeModel:async(args)=>{
      modelEnvelope=args.resourceGovernance;
      return {workerId:'file-qa',step:'Inspect existing file'};
    },
    complete:async({resourceReceipt})=>{
      h.calls.push('complete');
      completedResource=resourceReceipt;
      return {receiptRef:'receipt-unknown-usage'};
    },
    deliver:async({resourceReceipt})=>{
      h.calls.push('deliver');
      deliveredResource=resourceReceipt;
      return {deliveryRef:'owner-result-unknown-usage',ownerRetrievable:true};
    },
  });
  const result=await executeAssignedStep(input,h.adapters);
  assert.equal(modelEnvelope.mode,'SHADOW');
  assert.equal(modelEnvelope.enforcementBoundary,'POST_INFERENCE_PRE_CLAIM');
  assert.equal(modelEnvelope.preInferenceCapEnforced,false);
  assert.equal(result.state,'VERIFIED');
  assert.equal(result.resourceReceipt.status,'UNKNOWN');
  assert.equal(result.resourceReceipt.measurementComplete,false);
  assert.deepEqual(completedResource,result.resourceReceipt);
  assert.deepEqual(deliveredResource,result.resourceReceipt);
  assert.deepEqual(h.calls,['claim','execute','verify','complete','deliver']);
});

test('synthetic file worker produces a retrievable artifact without duplicate execution',async()=>{
  const {mkdtemp,writeFile,readFile,rm}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os');
  const {join}=await import('node:path');
  const {createHash}=await import('node:crypto');
  const dir=await mkdtemp(join(tmpdir(),'dani-bridge-'));
  const output=join(dir,'approved-synthetic-output.txt');
  let executionCount=0;
  let completed=null;
  const h=setup({
    recover:async()=>completed?({...input,status:'GREEN',receiptRef:completed}):
      ({...input,status:'READY',approved:true,revision:'r1',
        objective:'Produce a synthetic QA artifact',expectedOutcome:'verified output',
        scope:{allowedSteps:['Write synthetic proof']},modelInferenceApproved:true,
        modelContextSanitized:true,modelApprovalRef:'synthetic-approved',
        routingFacts:{authorityResolved:true,scopeBounded:true,kind:'FORMAT'}}),
    routeModel:async()=>({workerId:'file-qa',step:'Write synthetic proof'}),
    execute:async()=>{executionCount++;await writeFile(output,'DANI governed synthetic test output');
      return {output};},
    verify:async({result})=>{const bytes=await readFile(result.output);
      const hash=createHash('sha256').update(bytes).digest('hex');
      return {passed:bytes.toString()==='DANI governed synthetic test output',
        evidenceRef:'SHA256:'+hash,outcome:'verified output'};},
    complete:async()=>{completed='receipt-synthetic';return {receiptRef:completed};},
    deliver:async()=>({ownerRetrievable:(await readFile(output,'utf8')).startsWith('DANI governed'),
      deliveryRef:output})
  });
  try {
    const first=await executeAssignedStep(input,h.adapters);
    assert.equal(first.state,'VERIFIED');
    assert.ok(first.evidenceRef.startsWith('SHA256:'));
    assert.equal(await readFile(first.deliveryRef,'utf8'),'DANI governed synthetic test output');
    assert.equal((await executeAssignedStep(input,h.adapters)).state,'GREEN');
    assert.equal(executionCount,1);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
