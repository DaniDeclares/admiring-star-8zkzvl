import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <main className="payment-cancel-page">
      <Helmet>
        <title>Payment Canceled • Dani Declares</title>
      </Helmet>
      <h1>❌ Payment Canceled</h1>
      <p>Your payment was not completed. No worries!</p>
      <p>If this was a mistake, you can retry your payment anytime.</p>
      <Link to="/events" className="btn btn--primary">View Events</Link>
      <Link to="/shop" className="btn btn--secondary" style={{ marginLeft: "1rem" }}>Shop Merch</Link>
    </main>
  );
}
