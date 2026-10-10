/**
 * Read-only organization membership proof for future licensed customer workspaces.
 * Pass ONLY a trusted server-side Supabase client and an auth.getUser()-verified user id.
 * Staff/provider roles never imply customer-organization membership.
 * The caller is responsible for validating the bearer session before invoking this helper.
 */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CUSTOMER_ROLES=new Set(['client','customer','client_admin','customer_admin']);
export async function resolveCustomerWorkflowMembership({supabase,authenticatedUserId,requestedOrganizationId}) {
  const deny={authenticatedTenantId:null, identityAuthorized:false,tenantMembershipVerified:false};
  if (!supabase || !UUID.test(authenticatedUserId||'') || !UUID.test(requestedOrganizationId||'')) return deny;
  try {
    const {data:identities,error:identityError}=await supabase.from('dd_portal_identities')
      .select('organization_id,portal_role,is_active')
      .eq('auth_user_id',authenticatedUserId).eq('organization_id',requestedOrganizationId)
      .eq('is_active',true).limit(2);
    if (identityError || !Array.isArray(identities) || identities.length!==1 ||
      !CUSTOMER_ROLES.has(identities[0].portal_role)) return deny;
    const {data:org,error:orgError}=await supabase.from('dd_client_organizations')
      .select('id,status').eq('id',requestedOrganizationId).maybeSingle();
    if (orgError || !org || org.id!==requestedOrganizationId ||
      !['ACTIVE','active'].includes(org.status)) return deny;
    return {authenticatedTenantId:org.id,identityAuthorized:true,tenantMembershipVerified:true};
  } catch (_) { return deny; }
}
