import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Navigate } from "react-router-dom";

export default function NotaryDashboard() {
  const [search] = useSearchParams();
  const accountId = search.get("account");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (accountId) {
      fetch(`/api/stripe/fetch-balance?account=${accountId}`)
        .then((res) => res.json())
        .then(setBalance)
        .catch(console.error);
    }
  }, [accountId]);

  if (!accountId) return <Navigate to="/onboarding" replace />;

  return (
    <main className="dashboard-page notary-dashboard">
      <Helmet>
        <title>Notary Dashboard • Dani Declares</title>
        <meta
          name="description"
          content="Track your notary earnings, appointments, and Stripe Connect status."
        />
      </Helmet>

      <h1>Your Notary Dashboard</h1>

      {balance ? (
        <ul>
          <li>
            ✅ <strong>Available Earnings</strong>: $
            {(balance.available[0].amount / 100).toFixed(2)}
          </li>
          <li>
            ✅ <strong>Pending Earnings</strong>: $
            {(balance.pending[0].amount / 100).toFixed(2)}
          </li>
          <li>✅ Upcoming Bookings: Coming soon</li>
          <li>✅ Stripe Connect Status: Active</li>
        </ul>
      ) : (
        <p>Loading your notary balance…</p>
      )}

      <p>
        Questions? Email{" "}
        <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>.
      </p>
    </main>
  );
}
