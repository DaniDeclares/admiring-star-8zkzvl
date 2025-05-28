import React from "react";
import { Link } from "react-router-dom";
import FestivalBanner from "../components/FestivalBanner.jsx";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar.jsx";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks.jsx";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent.jsx";
import "../components/CookieConsent.css";
import Footer from "../components/Footer.jsx";
import "../components/Footer.css";
import "./FestivalPage.css";
import CountdownTimer from "../components/CountdownTimer.jsx";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function FestivalPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

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

        {/* PayPal Button Example */}
        <div style={{ marginTop: "2rem" }}>
          <h2>Or pay directly with PayPal:</h2>
          <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: "99.00" // Early-bird ticket price
                    },
                    description: "Declare Your Worth Festival Early-Bird Ticket"
                  }]
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then(function(details) {
                  alert("Thank you, " + details.payer.name.given_name + "! Your payment was successful.");

                  // --- Send lead info to Zapier ---
                  fetch("https://hooks.zapier.com/hooks/catch/16103675/2jidouq/", { // <-- Your Zapier URL
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: details.payer.email_address,
                      name: details.payer.name.given_name + " " + details.payer.name.surname,
                      ticketType: "Early Bird Festival",
                      amount: "99.00",
                      paypalOrderId: data.orderID
                    })
                  });

                  // Optionally, redirect to TidyCal booking or show next steps
                  window.open("https://tidycal.com/danideclaresns/early-bird-festival", "_blank");
                });
              }}
            />
          </PayPalScriptProvider>
        </div>
      </main>

      <section className="event-overview">
        <h2>Declare Your Worth Festival 2025</h2>
        <p>
          Two-day experience of coaching, shopping, storytelling, and community to empower your legacy.
        </p>
      </section>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
