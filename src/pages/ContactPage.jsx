import React from "react";
import { Helmet } from "react-helmet-async";

// HubSpot embed
import HubSpotForm from "../components/HubSpotForm.jsx";

// Styles
import "./ContactPage.css";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact • Dani Declares</title>
        <meta
          name="description"
          content="Questions, bookings, or collaborations? Reach out to Dani Declares for personalized support and next steps."
        />
      </Helmet>

      <main className="contact-page">
        <h1>Let’s Connect</h1>
        <p>
          Have questions about coaching, events, bookings, or partnership
          opportunities? Fill out the form below and we’ll follow up shortly.
        </p>

        <HubSpotForm
          region="na2"
          portalId="242764935"
          formId="d4cd290e-7766-4bf5-91a2-c1274ddd882e"
        />

        <section className="direct-contact">
          <h3>Prefer Email or Phone?</h3>
          <p>
            📧{" "}
            <a href="mailto:admin@danideclares.com">
              admin@danideclares.com
            </a>
            <br />
            📞{" "}
            <a href="tel:+14705234892">(470) 523-4892</a> |{" "}
            <a href="tel:+18643265362">(864) 326-5362</a>
          </p>
        </section>
      </main>
    </>
  );
}
