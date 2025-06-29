// src/pages/DashboardPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <Helmet>
        <title>Your Vendor & Notary Dashboard • Dani Declares</title>
        <meta name="description" content="Manage your bookings, payouts, and onboarding status as a Dani Declares vendor or notary partner." />
      </Helmet>

      <h1>Welcome to Your Dashboard</h1>
      <p>Here you can track:</p>
      <ul>
        <li>✅ Booking status</li>
        <li>✅ Stripe Connect onboarding progress</li>
        <li>✅ Recent payouts</li>
        <li>✅ Download resources and marketing materials</li>
      </ul>
      <p>Need help? <a href="/contact">Contact our support team.</a></p>
    </main>
  );
}
