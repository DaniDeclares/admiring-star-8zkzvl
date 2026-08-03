import React from "react";
import { Helmet } from "react-helmet-async";

export default function FestivalDashboard() {
  return (
    <main className="dashboard-page festival-dashboard">
      <Helmet>
        <title>Festival Vendor & Speaker Dashboard • Dani Declares</title>
      </Helmet>
      <h1>Festival Vendor & Speaker Dashboard</h1>
      <p>Welcome to your Festival Dashboard! Here you can:</p>

      <ul>
        <li>✅ Upload your logo and marketing materials (Coming Soon)</li>
        <li>✅ Submit your booth or speaker setup details (Coming Soon)</li>
        <li>✅ Check your Stripe Connect payment status (Coming Soon)</li>
        <li>✅ Download festival day logistics & maps (Coming Soon)</li>
      </ul>

      <p>
        If you haven't completed your onboarding yet,{" "}
        <a href="/onboarding">click here to start</a>.
      </p>

      <p>
        Questions? Email:{" "}
        <a href="mailto:admin@danideclares.com">admin@danideclares.com</a>
      </p>
    </main>
  );
}
