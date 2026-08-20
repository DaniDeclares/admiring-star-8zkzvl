import { createClient } from '@supabase/supabase-js';

const STAFF_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);

function getServerClient() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is missing.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function authenticatePortalRequest(req) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return { error: 'Authentication required', status: 401 };

  const supabase = getServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { error: 'Invalid or expired session', status: 401 };

  const role = user.app_metadata?.role;
  if (STAFF_ROLES.has(role)) return { supabase, user, role, isStaff: true };

  const { data: identity, error: identityError } = await supabase
    .from('dd_portal_identities')
    .select('*')
    .eq('auth_user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (identityError) throw identityError;
  if (!identity) return { error: 'No active Dani Declares portal identity is assigned to this account.', status: 403 };
  return { supabase, user, role: identity.portal_role, identity, isStaff: false };
}

export function requireRole(context, roles) {
  if (context.isStaff || roles.includes(context.role)) return null;
  return { error: 'This portal action is not authorized for the current account.', status: 403 };
}
