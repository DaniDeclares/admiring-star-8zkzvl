import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, Navigate } from "react-router-dom";

export default function VendorPortal() {
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
    <main className="dashboard-page vendor-portal">
      <Helmet>
        <title>Vendor & Speaker Portal • Dani Declares</title>
        <meta
          name="description"
          content="Manage your festival booth, speaker info, and payouts as a Dani Declares event partner."
        />
      </Helmet>

      <h1>Vendor & Speaker Portal</h1>

      {balance ? (
        <ul>
          <li>
            ✅ <strong>Available Funds</strong>: $
            {(balance.available[0].amount / 100).toFixed(2)}
          </li>
          <li>
            ✅ <strong>Pending Funds</strong>: $
            {(balance.pending[0].amount / 100).toFixed(2)}
          </li>
        </ul>
      ) : (
        <p>Loading your vendor balance…</p>
      )}

      <section className="portal-section">
        <h2>Actions</h2>
        <ul>
          <li>✅ Upload logo & booth info (Coming Soon)</li>
          <li>✅ Submit promo materials (Coming Soon)</li>
          <li>✅ Download setup instructions (Coming Soon)</li>
        </ul>
      </section>

      <section className="portal-section contact-support">
        <h2>Need Help?</h2>
        <p>
          📧 <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>
        </p>
        <p>
          📞 <a href="tel:+14705234892">(470) 523-4892</a>
        </p>
      </section>
    </main>
  );
}
