import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./ContactPage.css";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact & Quotes • Dani Declares</title>
        <meta
          name="description"
          content="Questions, bookings, or custom service quotes? Reach out to Dani Declares for notary, legal, wedding, coaching, financial, event, and merch inquiries."
        />
      </Helmet>

      <main className="contact-page">
        <h1>Let’s Connect & Get You Started</h1>
        <p>
          Have questions about our services—Notary & Legal Support, Real Estate,
          Weddings & Events, Coaching & Consulting, Financial Empowerment,
          Festival & Vendor Opportunities, or Merch? Fill out the form below, and
          we’ll follow up with personalized next steps or a custom quote.
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
            </a>{" "}
            |{" "}
            <a href="mailto:events@danideclares.com">
              events@danideclares.com
            </a>
            <br />
            📞{" "}
            <a href="tel:+14705234892">(470) 523-4892</a> |{" "}
            <a href="tel:+18643265362">(864) 326-5362</a>
          </p>
        </section>

        <section className="quick-links">
          <h3>Explore Our Services</h3>
          <ul>
            <li><Link to="/notary">Notary & Legal Support</Link></li>
            <li><Link to="/realestate">Real Estate Services</Link></li>
            <li><Link to="/weddings">Wedding & Event Services</Link></li>
            <li><Link to="/coaching">Coaching & Consulting</Link></li>
            <li><Link to="/financial">Financial Empowerment</Link></li>
            <li><Link to="/festival">Festival & Vendor Info</Link></li>
            <li><Link to="/shop">Merch & Digital Products</Link></li>
            <li><Link to="/packages">All Services & Bundles</Link></li>
          </ul>
        </section>
      </main>
    </>
  );
}
