import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <main className="payment-success-page">
      <Helmet>
        <title>Payment Successful • Dani Declares</title>
      </Helmet>
      <h1>🎉 Payment Successful!</h1>
      <p>Thank you for your purchase or booking. A confirmation email has been sent.</p>
      <p>For vendor or speaker purchases: You’ll receive onboarding instructions shortly.</p>
      <Link to="/" className="btn btn--primary">Back to Homepage</Link>
    </main>
  );
}
