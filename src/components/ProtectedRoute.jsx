import React from "react";
import { Navigate, Outlet, useSearchParams } from "react-router-dom";

export default function ProtectedRoute({ allowed }) {
  const [search] = useSearchParams();
  const account = search.get("account") || localStorage.getItem("stripeAccount");
  if (!account || (allowed && !allowed.includes(account))) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
