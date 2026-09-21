import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';

const STAFF_APP_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);
const STAFF_GOVERNED_ROLES = new Set(['OWNER_OPERATOR']);

export default function RequireStaffAuth({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, authorized: false });

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      const session = data.session;
      const user = session?.user;
      const appRole = user?.app_metadata?.portal_role || user?.app_metadata?.role;
      if (error || !user) {
        setState({ loading: false, authorized: false });
        return;
      }

      if (STAFF_APP_ROLES.has(appRole)) {
        setState({ loading: false, authorized: true });
        return;
      }

      const { data: roleRows, error: roleError } = await supabase.rpc('dd_get_my_portal_roles');
      if (!mounted) return;
      const roles = Array.isArray(roleRows) ? roleRows : [];
      const authorized = !roleError && roles.some((row) =>
        STAFF_GOVERNED_ROLES.has(row?.role || row?.portal_role || row)
      );
      setState({ loading: false, authorized });
    };

    check();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => check());

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  if (state.loading) return <main style={{ padding: 32 }}><p>Checking staff access…</p></main>;
  if (!state.authorized) return <Navigate to="/portal" replace state={{ from: location.pathname }} />;
  return children;
}
