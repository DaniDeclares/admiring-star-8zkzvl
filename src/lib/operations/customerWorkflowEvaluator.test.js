import { evaluateCustomerWorkflow, evaluateCustomerWorkflows, validateCustomerWorkflow } from './customerWorkflowEvaluator';

const rule = { id:'inquiry-followup', tenantId:'orgA', trigger:'INQUIRY_RECEIVED', action:'PREPARE_FOLLOWUP', enabled:true, conditions:[{field:'buyerVerified',operator:'EQ',value:true}] };
const event = { id:'event1',tenantId:'orgA',signal:'INQUIRY_RECEIVED',source:'VERIFIED_INBOUND',attributes:{buyerVerified:true},evidence:{} };
const auth = { authenticatedTenantId:'orgA',identityAuthorized:true,tenantMembershipVerified:true };

test('valid inquiry proposes internal work deterministically', () => {
 const a=evaluateCustomerWorkflow(rule,event,auth),b=evaluateCustomerWorkflow(rule,event,auth);
 expect(a.eligible).toBe(true);
 expect(a.candidate.status).toBe('PROPOSED_ONLY');
 expect(a.candidate.idempotencyKey).toBe(b.candidate.idempotencyKey);
});

test('tenant mismatch or missing membership always fails closed', () => {
 expect(evaluateCustomerWorkflow(rule,{...event,tenantId:'orgB'},auth).eligible).toBe(false);
 expect(evaluateCustomerWorkflow(rule,event,{...auth,tenantMembershipVerified:false}).eligible).toBe(false);
});

test('disabled and unmatched workflow cannot propose', () => {
 expect(evaluateCustomerWorkflow({...rule,enabled:false},event,auth).eligible).toBe(false);
 expect(evaluateCustomerWorkflow(rule,{...event,attributes:{buyerVerified:false}},auth).eligible).toBe(false);
});

test('outbound requires proof of contact permission and explicit approval', () => {
 expect(evaluateCustomerWorkflow({...rule,action:'SEND_OUTREACH'},event,auth).eligible).toBe(false);
});

test('unauthorized payment, quote, and dispatch are blocked', () => {
 for (const action of ['CHARGE_PAYMENT','ISSUE_QUOTE','ASSIGN_JOB']) {
   expect(evaluateCustomerWorkflow({...rule,action},event,auth).eligible).toBe(false);
 }
});

test('unsupported actions, fields and trigger are rejected', () => {
 expect(validateCustomerWorkflow({...rule,action:'TRANSFER_FUNDS'})).toContain('UNKNOWN_ACTION');
 expect(validateCustomerWorkflow({...rule,trigger:'ANY_MESSAGE'})).toContain('INVALID_TRIGGER');
 expect(validateCustomerWorkflow({...rule,conditions:[{field:'private_token',operator:'EQ',value:1}]})).toContain('UNSUPPORTED_CONDITION');
});

test('payment receipt necessary to claim cash', () => {
 expect(evaluateCustomerWorkflow(rule,{...event,claimsCollectedRevenue:true},auth).eligible).toBe(false);
});

test('workflow evaluation is bounded', () => {
 expect(evaluateCustomerWorkflows([rule],event,auth)).toHaveLength(1);
 expect(() => evaluateCustomerWorkflows(new Array(101).fill(rule),event,auth)).toThrow();
});
