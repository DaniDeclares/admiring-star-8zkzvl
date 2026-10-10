/**
 * DANI Business OS - authenticated two-organization read isolation gate.
 * Invoke only against an isolated Tester project with two real test users
 * and owner-approved fixture records. No writes or network side effects beyond
 * read-only Supabase requests. Do NOT commit fixture tokens, IDs or output data.
 *
 * Env: TESTER_SUPABASE_URL, TESTER_SUPABASE_ANON_KEY,
 *      TENANT_A_JWT, TENANT_B_JWT, TENANT_A_ORG_ID, TENANT_B_ORG_ID,
 *      TENANT_A_JOB_ID, TENANT_B_JOB_ID, TENANT_A_CRM_ID, TENANT_B_CRM_ID
 */
import { createClient } from '@supabase/supabase-js';

const required = ['TESTER_SUPABASE_URL','TESTER_SUPABASE_ANON_KEY',
  'TENANT_A_JWT','TENANT_B_JWT','TENANT_A_ORG_ID','TENANT_B_ORG_ID',
  'TENANT_A_JOB_ID','TENANT_B_JOB_ID','TENANT_A_CRM_ID','TENANT_B_CRM_ID'];
const missing=required.filter(key=>!process.env[key]);
if (missing.length) {
  console.error('HOLD: missing isolated test fixture configuration: '+missing.join(', '));
  process.exitCode=2;
} else {
  const cfg=process.env;
  const client=token=>createClient(cfg.TESTER_SUPABASE_URL,cfg.TESTER_SUPABASE_ANON_KEY,{
    auth:{persistSession:false,autoRefreshToken:false},
    global:{headers:{Authorization:'Bearer '+token}},
  });
  const a=client(cfg.TENANT_A_JWT), b=client(cfg.TENANT_B_JWT);
  const tests=[
    {table:'dd_client_organizations',column:'id',ownA:cfg.TENANT_A_ORG_ID,ownB:cfg.TENANT_B_ORG_ID},
    {table:'dd_jobs',column:'id',ownA:cfg.TENANT_A_JOB_ID,ownB:cfg.TENANT_B_JOB_ID},
    {table:'dd_sales_queue',column:'id',ownA:cfg.TENANT_A_CRM_ID,ownB:cfg.TENANT_B_CRM_ID},
  ];
  let failed=false;
  const identity=await Promise.all([a.auth.getUser(cfg.TENANT_A_JWT),b.auth.getUser(cfg.TENANT_B_JWT)]);
  if (identity.some(x=>x.error||!x.data?.user) ||
      identity[0].data.user.id===identity[1].data.user.id ||
      cfg.TENANT_A_ORG_ID===cfg.TENANT_B_ORG_ID) {
    console.error('HOLD: two distinct authenticated test users and organizations are required');
    process.exitCode=1;
  } else {
    for (const t of tests) {
      for (const [label,instance,own,other] of [
        ['A',a,t.ownA,t.ownB],['B',b,t.ownB,t.ownA]]) {
        const ownResult=await instance.from(t.table).select('id').eq(t.column,own);
        const otherResult=await instance.from(t.table).select('id').eq(t.column,other);
        // A denial is not a PASS if tenant cannot access its own fixture.
        const ownAllowed=!ownResult.error && ownResult.data?.length===1;
        const crossDenied=!otherResult.error && otherResult.data?.length===0;
        const pass=ownAllowed&&crossDenied;
        if (!pass) failed=true;
        console.log((pass?'PASS ':'FAIL ')+t.table+' tenant '+label+
          ' own='+ownAllowed+' crossDenied='+crossDenied);
      }
    }
    if (failed) {
      console.error('HOLD: tenant isolation is not proven. Do not enable customer software.');
      process.exitCode=1;
    } else console.log('READ ISOLATION PROVEN FOR CRM, JOB AND ORGANIZATION FIXTURES ONLY; ACTION AND STORAGE PROOF STILL REQUIRED.');
  }
}
