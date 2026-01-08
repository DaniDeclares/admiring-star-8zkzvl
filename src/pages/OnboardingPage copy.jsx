// src/pages/OnboardingPage.jsx
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

export default function OnboardingPage() {
  const stripeConnectClientId =
    process.env.REACT_APP_STRIPE_CONNECT_CLIENT_ID || "";
  const stripeConnectRedirect =
    process.env.REACT_APP_STRIPE_CONNECT_REDIRECT_URL || "";
  const stripeConnectUrl = `https://connect.stripe.com/express/oauth/authorize?client_id=${stripeConnectClientId}&scope=read_write${stripeConnectRedirect ? `&redirect_uri=${stripeConnectRedirect}` : ""}`;

  useEffect(() => {
    // Example: Simulate redirect to Stripe Connect onboarding link
    window.location.href = stripeConnectUrl;
  }, []);

  return (
    <main className="onboarding-page">
      <Helmet>
        <title>Onboarding • Vendor & Notary Payments • Dani Declares</title>
        <meta name="description" content="Get set up for direct payouts and commissions as a Dani Declares vendor, speaker, or notary partner." />
      </Helmet>

      <h1>Redirecting to Stripe Onboarding...</h1>
      <p>
        If you aren’t redirected in a few seconds,{" "}
        <a href={stripeConnectUrl}>click here</a>.
      </p>
    </main>
  );
}
