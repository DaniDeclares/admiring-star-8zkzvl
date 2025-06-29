import React from "react";
import { Helmet } from "react-helmet-async";

export default function VendorPortal() {
  return (
    <main className="dashboard-page vendor-portal">
      <Helmet>
        <title>Vendor & Speaker Portal • Dani Declares</title>
        <meta
          name="description"
          content="Manage your festival booth, speaker info, and payments here. Vendor dashboard for Dani Declares event partners."
        />
      </Helmet>

      <h1>Vendor & Speaker Portal</h1>
      <p>Welcome! Use this portal to manage your participation in the <strong>Declare Your Worth Festival</strong> and other Dani Declares events.</p>

      <section className="portal-section">
        <h2>Vendor Actions</h2>
        <ul>
          <li>✅ Upload your logo and booth info <em>(Coming Soon)</em></li>
          <li>✅ Submit promotional materials for shoutouts <em>(Coming Soon)</em></li>
          <li>✅ View your Stripe Connect payment status <em>(Coming Soon)</em></li>
          <li>✅ Download your setup & arrival instructions <em>(Coming Soon)</em></li>
        </ul>
      </section>

      <section className="portal-section">
        <h2>Speaker Actions</h2>
        <ul>
          <li>✅ Upload headshot and bio <em>(Coming Soon)</em></li>
          <li>✅ Confirm your speaking time slot <em>(Coming Soon)</em></li>
          <li>✅ Submit your presentation slides or promo materials <em>(Coming Soon)</em></li>
        </ul>
      </section>

      <section className="portal-section contact-support">
        <h2>Need Help?</h2>
        <p>📧 Email: <a href="mailto:admin@danideclares.com">admin@danideclares.com</a></p>
        <p>📞 Call/Text: <a href="tel:+14705234892">(470) 523-4892</a></p>
      </section>
    </main>
  );
}
