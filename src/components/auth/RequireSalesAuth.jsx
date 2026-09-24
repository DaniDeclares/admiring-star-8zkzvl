import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';

const STAFF_APP_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);
const SALES_GOVERNED_ROLES = new Set(['OWNER_OPERATOR', 'SALESPERSON']);

export default function RequireSalesAuth({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, authorized: false, isOwner: false });

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data.session;
      const user = session?.user;
      if (error || !user) {
        setState({ loading: false, authorized: false, isOwner: false });
        return;
      }

      const appRole = user?.app_metadata?.portal_role || user?.app_metadata?.role;
      if (STAFF_APP_ROLES.has(appRole)) {
        setState({ loading: false, authorized: true, isOwner: true });
        return;
      }

      const { data: roleRows, error: roleError } = await supabase.rpc('dd_get_my_portal_roles');
      if (!mounted) return;
      const roles = Array.isArray(roleRows) ? roleRows : [];
      const authorized = !roleError && roles.some((row) => SALES_GOVERNED_ROLES.has(row?.role || row?.portal_role || row));
      const isOwner = !roleError && roles.some((row) => (row?.role || row?.portal_role || row) === 'OWNER_OPERATOR');
      setState({ loading: false, authorized, isOwner });
    };

    check();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => check());

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  if (state.loading) return <main style={{ padding: 32 }}><p>Checking sales access…</p></main>;
  if (!state.authorized) return <Navigate to="/portal" replace state={{ from: location.pathname }} />;
  return typeof children === 'function' ? children(state) : children;
}
