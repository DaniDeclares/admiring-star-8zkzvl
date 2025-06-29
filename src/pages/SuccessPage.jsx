// src/pages/SuccessPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function SuccessPage() {
  return (
    <main className="success-page">
      <Helmet>
        <title>Payment Successful • Dani Declares</title>
        <meta name="description" content="Thank you for your purchase or booking! Next steps and contact info from Dani Declares." />
      </Helmet>

      <h1>Thank You!</h1>
      <p>Your payment or booking was successful. We're excited to work with you!</p>
      <p>👉 Check your email for a confirmation and next steps.</p>

      <Link to="/" className="btn btn--primary">Return to Homepage</Link>
    </main>
  );
}
