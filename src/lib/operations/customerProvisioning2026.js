import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getSiteUrl(req) {
  return (process.env.SITE_URL || `https://${req.headers.host || 'danideclares.com'}`).replace(/\/$/, '');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

async function findAuthUserByEmail(admin, email) {
  const normalized = normalizeEmail(email);
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const users = data?.users || [];
    const match = users.find(user => normalizeEmail(user.email) === normalized);
    if (match) return match;
    if (users.length < 1000) break;
  }
  return null;
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || null,
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : null,
  };
}

/**
 * Establishes the durable customer portal identity at the commercial handoff.
 *
 * Invariants:
 * - Never creates or emails a password.
 * - Never converts a provider/staff account into a customer account.
 * - Existing customer identities are reused idempotently.
 * - New customers receive a Supabase invitation that lands on the existing
 *   password-set page so the customer chooses their own password.
 * - The portal identity is scoped to the originating lead and optional client
 *   organization; invoice/payment state remains separate.
 */
export async function provisionCustomerPortalAccount({ req, supabase, estimate }) {
  const email = normalizeEmail(estimate?.client_email);
  const leadId = estimate?.lead_id || null;
  if (!email) return { status: 'EMAIL_REQUIRED', userId: null, portalIdentityId: null, invited: false };
  if (!leadId) return { status: 'LEAD_REQUIRED', userId: null, portalIdentityId: null, invited: false };

  const { data: existingLead, error: leadError } = await supabase
    .from('leads')
    .select('id,full_name,email,organization_name')
    .eq('id', leadId)
    .maybeSingle();
  if (leadError) throw leadError;
  if (!existingLead) throw new Error('The invoice customer lead could not be resolved.');

  let requestOrganizationId = null;
  if (estimate.service_request_id) {
    const { data: sourceRequest, error: requestError } = await supabase
      .from('service_requests')
      .select('organization_id')
      .eq('id', estimate.service_request_id)
      .maybeSingle();
    if (requestError) throw requestError;
    requestOrganizationId = sourceRequest?.organization_id || null;
  }

  const admin = getAdminClient();
  let user = await findAuthUserByEmail(admin, email);
  let createdUser = false;
  let invited = false;
  const name = splitName(estimate.client_name || existingLead.full_name);
  const siteUrl = getSiteUrl(req);
  const redirectTo = `${siteUrl}/portal/reset-password`;
  const userMetadata = {
    first_name: name.firstName,
    last_name: name.lastName,
    relationship_type: 'customer',
    channel_code: String(estimate.client_type || '').toUpperCase() === 'B2B_APT' ? 'CH02' : 'CH04',
    provisioned_from: 'COMMERCIAL_HANDOFF',
    provisioned_estimate_id: estimate.id,
    provisioned_lead_id: leadId,
  };

  if (!user) {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: userMetadata,
      redirectTo,
    });
    if (error) throw error;
    user = data?.user || null;
    if (!user) throw new Error('Supabase created the customer invitation without returning a user.');
    createdUser = true;
    invited = true;
  }

  const { data: existingIdentity, error: identityLookupError } = await supabase
    .from('dd_portal_identities')
    .select('id,auth_user_id,portal_role,entity_id,organization_id,is_active')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (identityLookupError) throw identityLookupError;

  if (existingIdentity) {
    if (existingIdentity.portal_role !== 'customer') {
      if (createdUser) await admin.auth.admin.deleteUser(user.id);
      throw new Error('CUSTOMER_PORTAL_CONFLICT: This email already belongs to a non-customer portal account.');
    }
    if (existingIdentity.entity_id && String(existingIdentity.entity_id) !== String(leadId)) {
      if (createdUser) await admin.auth.admin.deleteUser(user.id);
      throw new Error('CUSTOMER_PORTAL_CONFLICT: This email is already linked to another customer record.');
    }
    if (!existingIdentity.is_active) {
      const { error } = await supabase.from('dd_portal_identities').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', existingIdentity.id);
      if (error) throw error;
    }
    return { status: 'EXISTING', userId: user.id, portalIdentityId: existingIdentity.id, invited };
  }

  const { data: identity, error: identityError } = await supabase
    .from('dd_portal_identities')
    .insert({
      auth_user_id: user.id,
      portal_role: 'customer',
      entity_id: leadId,
      organization_id: estimate.organization_id || requestOrganizationId || null,
      is_active: true,
    })
    .select('id,auth_user_id,portal_role,entity_id,organization_id,is_active')
    .single();

  if (identityError) {
    if (createdUser) await admin.auth.admin.deleteUser(user.id);
    throw identityError;
  }

  return {
    status: 'PROVISIONED',
    userId: user.id,
    portalIdentityId: identity.id,
    invited,
    activationRedirect: redirectTo,
  };
}
