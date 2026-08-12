import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient.js";

const ADMIN_ROLES = new Set(["admin", "owner", "staff_admin"]);

/**
 * Client-side route guard for internal admin pages.
 *
 * Authorization is based only on Supabase app_metadata, which is controlled
 * by the trusted backend rather than user-editable profile metadata.
 * Database RLS must remain the final authorization boundary for protected data.
 */
export default function RequireAdminAuth({ children }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, authorized: false });

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error || !data.session) {
        setState({ loading: false, authorized: false });
        return;
      }

      const role = data.session.user?.app_metadata?.role;
      setState({ loading: false, authorized: ADMIN_ROLES.has(role) });
    };

    checkSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  if (state.loading) {
    return (
      <main style={{ padding: 32 }}>
        <p>Checking administrative access…</p>
      </main>
    );
  }

  if (!state.authorized) {
    return <Navigate to="/contact" replace state={{ from: location.pathname }} />;
  }

  return children;
}
