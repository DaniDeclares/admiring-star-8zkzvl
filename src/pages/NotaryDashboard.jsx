import React from "react";
import { Helmet } from "react-helmet-async";

export default function NotaryDashboard() {
  return (
    <main className="dashboard-page notary-dashboard">
      <Helmet>
        <title>Notary Dashboard • Dani Declares</title>
      </Helmet>
      <h1>Your Notary Dashboard</h1>
      <p>Track your earnings, upcoming appointments, and Connect status below:</p>
      <ul>
        <li>✅ Total Earnings: Coming Soon</li>
        <li>✅ Upcoming Bookings: Coming Soon</li>
        <li>✅ Stripe Connect Status: Coming Soon</li>
      </ul>
      <p>Questions? Email <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>.</p>
    </main>
  );
}
