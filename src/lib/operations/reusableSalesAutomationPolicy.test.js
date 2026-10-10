import { evaluateSalesAutomationAction, evaluateSalesAutomationBatch, WORKFLOW_ACTION } from './reusableSalesAutomationPolicy';

const base = { tenantId:'org-a', recordTenantId:'org-a', source:'VERIFIED_INBOUND', evidence:{} };
const context = { authenticatedTenantId:'org-a', identityAuthorized:true };

describe('DANI reusable workflow policy', () => {
  test('internal review is safe for an authorized tenant', () => {
    expect(evaluateSalesAutomationAction({...base, action:WORKFLOW_ACTION.INTERNAL_REVIEW}, context).allowed).toBe(true);
  });
  test('rejects cross-tenant data regardless of permissions', () => {
    const r=evaluateSalesAutomationAction({...base, recordTenantId:'org-b', action:WORKFLOW_ACTION.INTERNAL_REVIEW},context);
    expect(r.allowed).toBe(false); expect(r.reasons).toContain('TENANT_SCOPE_NOT_VERIFIED');
  });
  test('rejects an identity mismatch', () => {
    expect(evaluateSalesAutomationAction({...base,action:WORKFLOW_ACTION.PREPARE_FOLLOWUP},{...context,identityAuthorized:false}).allowed).toBe(false);
  });
  test('research contact cannot be automatically messaged', () => {
    const r=evaluateSalesAutomationAction({...base,action:WORKFLOW_ACTION.SEND_OUTREACH,source:'RESEARCH_ONLY',evidence:{contactAuthority:true,ownerApproved:true}},context);
    expect(r.allowed).toBe(false); expect(r.reasons).toContain('NO_CONTACT_AUTHORITY');
  });
  test('suppressed contact cannot be messaged even with approval', () => {
    const r=evaluateSalesAutomationAction({...base,action:WORKFLOW_ACTION.SEND_OUTREACH,evidence:{doNotContact:true,contactAuthority:true,ownerApproved:true}},context);
    expect(r.reasons).toContain('CONTACT_SUPPRESSED');
  });
  test('outreach with proven authority and explicit approval is only an eligible decision', () => {
    const r=evaluateSalesAutomationAction({...base,action:WORKFLOW_ACTION.SEND_OUTREACH,evidence:{contactAuthority:true,ownerApproved:true}},context);
    expect(r.allowed).toBe(true); expect(r.effect).toBe('DECISION_ONLY_NO_MUTATION');
  });
  test('payment and dispatch require separate authorization evidence', () => {
    for (const action of [WORKFLOW_ACTION.CHARGE_PAYMENT, WORKFLOW_ACTION.ASSIGN_JOB]) {
      expect(evaluateSalesAutomationAction({...base,action,evidence:{ownerApproved:true}},context).allowed).toBe(false);
    }
  });
  test('CRM amounts are not collected cash without an actual receipt', () => {
    const r=evaluateSalesAutomationAction({...base,action:WORKFLOW_ACTION.INTERNAL_REVIEW,claimsCollectedRevenue:true},context);
    expect(r.reasons).toContain('PAYMENT_RECEIPT_REQUIRED');
  });
  test('rejects unknown actions and missing tenant scope', () => {
    const r=evaluateSalesAutomationAction({action:'AUTO_EMAIL_EVERYBODY'},context);
    expect(r.allowed).toBe(false); expect(r.reasons).toContain('UNKNOWN_ACTION');
  });
  test('batch does not mutate input or call services', () => {
    const items=[{...base,action:WORKFLOW_ACTION.INTERNAL_REVIEW}];
    expect(evaluateSalesAutomationBatch(items,context)).toHaveLength(1);
    expect(items[0].evidence).toEqual({});
  });
});
