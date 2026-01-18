import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./ContactPage.css";
import { SHOW_FESTIVAL, siteConfig } from "../data/siteConfig.js";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact & Quotes • Dani Declares</title>
        <meta
          name="description"
          content="Questions, bookings, or custom service quotes? Reach out to Dani Declares for notary, legal, wedding, financial, event, and merch inquiries."
        />
      </Helmet>

      <main className="contact-page">
        <h1>Let’s Connect & Get You Started</h1>
        <p>
          Have questions about our services—Notary & Legal Support, Real Estate,
          Weddings & Events, Financial Empowerment,
          {SHOW_FESTIVAL ? " Festival & Vendor Opportunities, or Merch? " : " or Merch? "}
          Fill out the form below, and we’ll follow up with personalized next
          steps or a custom quote.
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
            <a href={`mailto:${siteConfig.emails.admin}`}>
              {siteConfig.emails.admin}
            </a>{" "}
            |{" "}
            <a href={`mailto:${siteConfig.emails.events}`}>
              {siteConfig.emails.events}
            </a>
            <br />
            📞{" "}
            <a href={`tel:${siteConfig.phoneNumbers.primary.tel}`}>
              {siteConfig.phoneNumbers.primary.display}
            </a>{" "}
            |{" "}
            <a href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}>
              {siteConfig.phoneNumbers.secondary.display}
            </a>
          </p>
        </section>

        <section className="quick-links">
          <h3>Explore Our Services</h3>
          <ul>
            <li><Link to="/notary">Notary & Legal Support</Link></li>
            <li><Link to="/real-estate">Real Estate Services</Link></li>
            <li><Link to="/weddings">Wedding & Event Services</Link></li>
            <li><Link to="/financial">Financial Empowerment</Link></li>
            {SHOW_FESTIVAL && (
              <li><Link to="/festival">Festival & Vendor Info</Link></li>
            )}
            <li><Link to="/shop">Merch & Digital Products</Link></li>
            <li><Link to="/packages">All Services & Bundles</Link></li>
          </ul>
        </section>
      </main>
    </>
  );
}
