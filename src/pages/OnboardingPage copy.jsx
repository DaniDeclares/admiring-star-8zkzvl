// src/pages/OnboardingPage.jsx
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

export default function OnboardingPage() {
  useEffect(() => {
    // Example: Simulate redirect to Stripe Connect onboarding link
    window.location.href = "https://connect.stripe.com/express/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=read_write";
  }, []);

  return (
    <main className="onboarding-page">
      <Helmet>
        <title>Onboarding • Vendor & Notary Payments • Dani Declares</title>
        <meta name="description" content="Get set up for direct payouts and commissions as a Dani Declares vendor, speaker, or notary partner." />
      </Helmet>

      <h1>Redirecting to Stripe Onboarding...</h1>
      <p>If you aren’t redirected in a few seconds, <a href="https://connect.stripe.com/express/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=read_write">click here</a>.</p>
    </main>
  );
}
