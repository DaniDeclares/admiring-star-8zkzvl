import React from "react";
import { Helmet } from "react-helmet-async";

export default function AdminTools() {
  return (
    <main className="admin-tools-page">
      <Helmet>
        <title>Admin Tools • Dani Declares</title>
      </Helmet>
      <h1>Admin Control Panel</h1>
      <p>For internal use only.</p>
      <ul>
        <li>🛠️ View Stripe Webhook Logs: Coming Soon</li>
        <li>🛠️ Trigger Test Payouts: Coming Soon</li>
        <li>🛠️ Export Sales Data: Coming Soon</li>
        <li>🛠️ Manage Vendor Approvals: Coming Soon</li>
      </ul>
    </main>
  );
}
