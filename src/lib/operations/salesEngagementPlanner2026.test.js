import {planSalesCall,buildSalesCallPriority,planDealStageChange} from './salesEngagementPlanner2026';
const now=new Date('2026-10-10T17:00:00Z');
const lead={id:'lead-1',phone:'555-0100',consent_phone:true,lead_origin_class:'VERIFIED_INBOUND',
  next_action_date:'2026-10-09',campaign_eligible:true,do_not_contact:false,disposition:'OPEN',intent_score:70};
test('eligible call generates only internal task proposal',()=>{
 const p=planSalesCall(lead,{now});expect(p.eligible).toBe(true);
 expect(p.effect).toBe('INTERNAL_PROPOSAL_ONLY');
});
test('suppressed, DNC and cooling-down contacts cannot enter call queue',()=>{
 for (const blocked of [{do_not_contact:true},{campaign_status:'SUPPRESSED'},
 {next_permitted_contact_at:'2026-10-12T12:00:00Z'},{contact_pressure_state:'BLOCKED'}]) {
  expect(planSalesCall({...lead,...blocked},{now}).eligible).toBe(false);
 }
});
test('lack of affirmative phone consent fails closed',()=>{
 expect(planSalesCall({...lead,consent_phone:null},{now}).reasons).toContain('PHONE_AUTHORITY_UNVERIFIED');
});
test('research-only records are not call-ready',()=>{
 expect(planSalesCall({...lead,lead_origin_class:'RESEARCH'},{now}).eligible).toBe(false);
});
test('future-dated or recently contacted records are not due',()=>{
 expect(planSalesCall({...lead,next_action_date:'2026-10-11'},{now}).eligible).toBe(false);
 expect(planSalesCall({...lead,last_contacted_at:'2026-10-10T12:00:00Z'},{now}).eligible).toBe(false);
});
test('call priorities are deterministic and do not mutate source records',()=>{
 const rows=[{...lead,id:'low',intent_score:20},{...lead,id:'high',intent_score:90}];
 expect(buildSalesCallPriority(rows,{now}).map(x=>x.sourceRecordId)).toEqual(['high','low']);
 expect(rows[0].intent_score).toBe(20);
});
test('bad records and unbounded input are rejected',()=>{
 expect(planSalesCall({}, {now}).eligible).toBe(false);
 expect(()=>buildSalesCallPriority(new Array(1001).fill(lead),{now})).toThrow();
});
test('deal change produces internal task only for authorized business',()=>{
 const p=planDealStageChange({dealId:'deal-1',oldStage:'INTAKE',newStage:'QUALIFIED',
   recordTenantId:'business-a',authenticatedTenantId:'business-a',identityAuthorized:true});
 expect(p.proposedTask).toBe('PREPARE_QUOTE');expect(p.effect).toBe('INTERNAL_PROPOSAL_ONLY');
});
test('deal task cannot cross tenants or infer authority from a stage change',()=>{
 expect(planDealStageChange({dealId:'deal-1',oldStage:'INTAKE',newStage:'QUALIFIED',
   recordTenantId:'business-a',authenticatedTenantId:'business-b',identityAuthorized:true}).eligible).toBe(false);
 expect(planDealStageChange({dealId:'deal-1',oldStage:'INTAKE',newStage:'PAID',
   recordTenantId:'business-a',authenticatedTenantId:'business-a'}).eligible).toBe(false);
});
test('unknown stages and no-op moves fail closed',()=>{
 const base={dealId:'deal-1',recordTenantId:'a',authenticatedTenantId:'a',identityAuthorized:true};
 expect(planDealStageChange({...base,oldStage:'NEW',newStage:'FANTASY'}).eligible).toBe(false);
 expect(planDealStageChange({...base,oldStage:'NEW',newStage:'NEW'}).eligible).toBe(false);
});
