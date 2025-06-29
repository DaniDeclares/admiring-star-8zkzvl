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
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";

export default function SuccessPage() {
  const [search] = useSearchParams();
  const sessionId = search.get("session_id");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/stripe/fetch-session?sessionId=${sessionId}`)
        .then((res) => res.json())
        .then((data) => setSession(data))
        .catch(console.error);
    }
  }, [sessionId]);

  return (
    <main className="success-page">
      <Helmet>
        <title>Payment Successful • Dani Declares</title>
        <meta
          name="description"
          content="Thank you for your purchase or booking! Next steps and contact info from Dani Declares."
        />
      </Helmet>

      <h1>Thank You!</h1>

      {session ? (
        <>
          <p>Your order <strong>#{session.id}</strong> for{" "}
            <strong>${(session.amount_total/100).toFixed(2)}</strong> was successful.</p>
          <p>👉 Check your email (<em>{session.customer_details.email}</em>) for confirmation and next steps.</p>
        </>
      ) : (
        <p>Loading your order details…</p>
      )}

      <Link to="/" className="btn btn--primary">
        Return to Homepage
      </Link>
    </main>
  );
}
