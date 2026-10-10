import { resolveCustomerWorkflowMembership } from '../../../api-handlers/_customerWorkflowMembership';
const user='11111111-1111-4111-8111-111111111111';
const org='22222222-2222-4222-8222-222222222222';
function db(role='customer', status='ACTIVE', fail=false) {
  return {from:(table)=>({
    select:()=>({
      eq:()=>({
        eq:()=>({
          eq:()=>({
            limit:async()=>({data:fail?null:[{organization_id:org,portal_role:role,is_active:true}],error:fail?new Error('db'):null})
          }),
          maybeSingle:async()=>({data:{id:org,status},error:null})
        }),
        maybeSingle:async()=>({data:{id:org,status},error:null})
      })
    })
  })};
}
test('invalid and missing identity fails closed', async()=>{
  expect((await resolveCustomerWorkflowMembership({supabase:null,authenticatedUserId:user,requestedOrganizationId:org})).tenantMembershipVerified).toBe(false);
});
test('provider identity never authorizes customer workflows',async()=>{
  const result=await resolveCustomerWorkflowMembership({supabase:db('provider'),authenticatedUserId:user,requestedOrganizationId:org});
  expect(result.tenantMembershipVerified).toBe(false);
});
test('staff identity never authorizes a customer workspace',async()=>{
  const result=await resolveCustomerWorkflowMembership({supabase:db('staff_admin'),authenticatedUserId:user,requestedOrganizationId:org});
  expect(result.tenantMembershipVerified).toBe(false);
});
test('database failure denies access',async()=>{
  const result=await resolveCustomerWorkflowMembership({supabase:db('customer','ACTIVE',true),authenticatedUserId:user,requestedOrganizationId:org});
  expect(result.identityAuthorized).toBe(false);
});
