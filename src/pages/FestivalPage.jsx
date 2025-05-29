import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./FestivalPage.css";
import CountdownTimer from "../components/CountdownTimer.jsx";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function FestivalPage() {
  return (
    <>
      <Helmet>
        <title>Festival • Declare Your Worth 2025</title>
        <meta
          name="description"
          content="Join Dani Declares in Atlanta on July 28–29, 2025 for the Declare Your Worth Festival. Empowerment, speakers, vendors, shopping, and more."
        />
      </Helmet>

      <main className="festival-page">
        <h1>Declare Your Worth Festival</h1>
        <p>July 28–29, 2025 • Luxury experiences, empowerment workshops & more.</p>
        <a
          href="https://tidycal.com/danideclaresns/early-bird-festival"
          className="btn btn--primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reserve Your Early-Bird Spot
        </a>
        <p className="festival-support">
          Or <Link to="/shop">shop our merch</Link> and support the cause now!
        </p>
        <CountdownTimer />

        <div style={{ marginTop: "2rem" }}>
          <h2>Or pay directly with PayPal:</h2>
          <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: "99.00",
                      },
                      description: "Declare Your Worth Festival Early-Bird Ticket",
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then(function (details) {
                  alert(`Thank you, ${details.payer.name.given_name}! Your payment was successful.`);
                  fetch("https://hooks.zapier.com/hooks/catch/16103675/2jidouq/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: details.payer.email_address,
                      name: `${details.payer.name.given_name} ${details.payer.name.surname}`,
                      ticketType: "Early Bird Festival",
                      amount: "99.00",
                      paypalOrderId: data.orderID,
                    }),
                  });
                  window.open("https://tidycal.com/danideclaresns/early-bird-festival", "_blank");
                });
              }}
            />
          </PayPalScriptProvider>
        </div>

        <section className="application-links" style={{ marginTop: "3rem" }}>
          <h2>Want to get involved?</h2>
          <p>We're calling for dynamic speakers, unique vendors, and empowering sponsors to join us.</p>
          <div className="btn-group">
            <a
              href="https://buy.stripe.com/6oEcPYcck6VAfcU7ss"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              Apply as a Vendor
            </a>
            <a
              href="https://buy.stripe.com/5kA3fC0ko2CEfcUfYZ"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              Apply as a Speaker
            </a>
            <a
              href="https://buy.stripe.com/14k8xW4C2gEifcUeV2"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline"
            >
              Become a Sponsor
            </a>
          </div>
        </section>
      </main>

      <section className="event-overview">
        <h2>Declare Your Worth Festival 2025</h2>
        <p>
          Two-day experience of coaching, shopping, storytelling, and community to empower your legacy.
        </p>
      </section>
    </>
  );
}
