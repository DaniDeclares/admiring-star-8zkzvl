import React from "react";
import { Helmet } from "react-helmet-async";

export default function PartnerOnboarding() {
  return (
    <main className="partner-onboarding-page">
      <Helmet>
        <title>Partner Onboarding • Dani Declares</title>
      </Helmet>
      <h1>Partner Onboarding Portal</h1>
      <p>Welcome, new partner! Let’s get you set up for payouts and event access.</p>

      <h2>Step 1: Stripe Connect Setup</h2>
      <p>
        Click below to connect your bank account securely via Stripe:
      </p>
      <a
        href="https://connect.stripe.com/express/oauth/authorize?client_id=YOUR_STRIPE_CLIENT_ID&redirect_uri=https://danideclares.com/success"
        className="btn btn--primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        Complete Stripe Onboarding
      </a>

      <h2>Step 2: Submit Your Bio & Details</h2>
      <p>
        After setting up payouts, email us your headshot, bio, and any special
        requests for your event appearance.
      </p>
      <p>Email: <a href="mailto:admin@danideclares.com">admin@danideclares.com</a></p>

      <h2>Step 3: Next Steps</h2>
      <ul>
        <li>✅ Watch for confirmation email from Stripe</li>
        <li>✅ Check your event date/time in your welcome packet</li>
        <li>✅ Reach out if you need help</li>
      </ul>
    </main>
  );
}
