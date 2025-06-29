import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Navigate } from "react-router-dom";

export default function DashboardPage() {
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

  if (!accountId) {
    // no account query → send them to onboarding
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <main className="dashboard-page">
      <Helmet>
        <title>Your Vendor & Notary Dashboard • Dani Declares</title>
        <meta
          name="description"
          content="Manage your bookings, payouts, and onboarding status as a Dani Declares vendor or notary partner."
        />
      </Helmet>

      <h1>Welcome to Your Dashboard</h1>

      {balance ? (
        <ul>
          <li>
            ✅ <strong>Available</strong>: $
            {(balance.available[0].amount / 100).toFixed(2)}
          </li>
          <li>
            ✅ <strong>Pending</strong>: $
            {(balance.pending[0].amount / 100).toFixed(2)}
          </li>
          <li>✅ Booking status: Coming soon</li>
          <li>✅ Stripe Connect onboarding progress: Active</li>
        </ul>
      ) : (
        <p>Loading your Stripe balance…</p>
      )}

      <p>
        Need help? <a href="/contact">Contact our support team.</a>
      </p>
    </main>
  );
}
