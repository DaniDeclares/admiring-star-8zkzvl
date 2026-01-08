import React from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";

export default function PartnerOnboarding() {
  const stripeConnectClientId =
    process.env.REACT_APP_STRIPE_CONNECT_CLIENT_ID || "";
  const stripeConnectRedirect =
    process.env.REACT_APP_STRIPE_CONNECT_REDIRECT_URL || "";
  const stripeConnectUrl = `https://connect.stripe.com/express/oauth/authorize?client_id=${stripeConnectClientId}&scope=read_write${stripeConnectRedirect ? `&redirect_uri=${stripeConnectRedirect}` : ""}`;

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
        href={stripeConnectUrl}
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
      <p>
        Email:{" "}
        <a href={`mailto:${siteConfig.emails.admin}`}>
          {siteConfig.emails.admin}
        </a>
      </p>

      <h2>Step 3: Next Steps</h2>
      <ul>
        <li>✅ Watch for confirmation email from Stripe</li>
        <li>✅ Check your event date/time in your welcome packet</li>
        <li>✅ Reach out if you need help</li>
      </ul>
    </main>
  );
}
