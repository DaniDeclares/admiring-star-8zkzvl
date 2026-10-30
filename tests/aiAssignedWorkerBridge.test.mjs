import test from 'node:test';
import assert from 'node:assert/strict';
import {executeAssignedStep} from '../src/lib/aiAssignedWorkerBridge.js';

const input={assignmentId:'task-1',authorityRef:'ASANA:task-1'};
const setup=(override={})=>{
  const calls=[];
  const adapters={
    recover:async()=>({...input,status:'READY',approved:true,revision:'r1',
      objective:'Verify an existing product',expectedOutcome:'usable file',
      scope:{businessDomain:true},
      routingFacts:{authorityResolved:true,scopeBounded:true,kind:'FORMAT'}}),
    routeModel:async()=>({workerId:'file-qa',step:'Inspect existing file'}),
    listVerifiedWorkers:async()=>[{id:'file-qa',verified:true,authorized:true}],
    claim:async()=>{calls.push('claim');return {claimed:true,claimRef:'claim-1'}},
    execute:async()=>{calls.push('execute');return {path:'candidate.pdf'}},
    verify:async()=>{calls.push('verify');return {passed:true,evidenceRef:'evidence-1',outcome:'usable file'}},
    complete:async()=>{calls.push('complete');return {receiptRef:'receipt-1'}},
    fail:async()=>{calls.push('fail')},...override};
  return {adapters,calls};
};
test('one bounded claim executes and produces durable evidence',async()=>{
  const {adapters,calls}=setup();
  const r=await executeAssignedStep(input,adapters);
  assert.deepEqual(r,{state:'VERIFIED',claimRef:'claim-1',evidenceRef:'evidence-1',receiptRef:'receipt-1'});
  assert.deepEqual(calls,['claim','execute','verify','complete']);
});
test('owner approval is necessary; LLM cannot choose unauthorized workers',async()=>{
  let h=setup({recover:async()=>({...input,status:'READY',approved:false})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'NOT_AUTHORIZED');
  assert.deepEqual(h.calls,[]);
  h=setup({routeModel:async()=>({workerId:'unverified',step:'Proceed'})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'UNAUTHORIZED_WORKER');
  assert.deepEqual(h.calls,[]);
});
test('model proposals cannot change authorization; gated actions are held',async()=>{
  let h=setup({routeModel:async()=>({workerId:'file-qa',step:'Send',actions:['OUTBOUND_MESSAGE']})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'MODEL_PROPOSED_AUTHORITY_CHANGE');
  assert.deepEqual(h.calls,[]);
  h=setup({recover:async()=>({...input,status:'READY',approved:true,routingFacts:{actions:['PRODUCTION_MUTATION']}})});
  assert.equal((await executeAssignedStep(input,h.adapters)).reason,'GOVERNED_REVIEW_REQUIRED');
  assert.deepEqual(h.calls,[]);
});
test('verification failure never becomes completion',async()=>{
  const {adapters,calls}=setup({verify:async()=>({passed:false})});
  assert.equal((await executeAssignedStep(input,adapters)).state,'FAILED');
  assert.deepEqual(calls,['claim','execute','fail']);
});
test('already completed tasks are not re-executed',async()=>{
  const h=setup({recover:async()=>({...input,status:'GREEN',receiptRef:'existing'})});
  assert.deepEqual(await executeAssignedStep(input,h.adapters),{state:'GREEN',receiptRef:'existing'});
  assert.deepEqual(h.calls,[]);
});
