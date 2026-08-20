import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';

const STAFF_ROLES = new Set(['admin', 'owner', 'staff_admin', 'staff']);

export default function RequireStaffAuth({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, authorized: false });

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      const role = data.session?.user?.app_metadata?.role;
      setState({ loading: false, authorized: !error && !!data.session && STAFF_ROLES.has(role) });
    };

    check();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => check());

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  if (state.loading) return <main style={{ padding: 32 }}><p>Checking staff access…</p></main>;
  if (!state.authorized) return <Navigate to="/contact" replace state={{ from: location.pathname }} />;
  return children;
}
