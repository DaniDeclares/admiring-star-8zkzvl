// src/pages/CancelPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function CancelPage() {
  return (
    <main className="cancel-page">
      <Helmet>
        <title>Payment Canceled • Dani Declares</title>
        <meta name="description" content="Your payment or booking was canceled. Need help? Contact Dani Declares." />
      </Helmet>

      <h1>Payment Canceled</h1>
      <p>Your transaction was not completed. No charges were made.</p>
      <p>If this was a mistake, you can try again or contact us for help.</p>

      <Link to="/contact" className="btn btn--secondary">Contact Support</Link>
      <br />
      <Link to="/" className="btn btn--primary">Back to Homepage</Link>
    </main>
  );
}
