import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./ContactPage.css";
import { siteConfig } from "../data/siteConfig.js";

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact & Quotes • Dani Declares</title>
        <meta
          name="description"

          content="Questions, bookings, or custom service quotes? Reach out to Dani Declares for notary, apostille, officiant, and event inquiries."
=======
          content="Questions, bookings, or custom quotes? Reach out to Dani Declares for mobile notary, apostille, loan signing, and officiant services."

        />
      </Helmet>

      <main className="contact-page">
codex/redesign-danideclares.com-for-service-booking
        <h1>Let’s Connect & Get You Started</h1>
        <p>
          Have questions about our services—Notary & Legal Support, Apostille,
          Officiant Services,
          {SHOW_FESTIVAL ? " Festival & Vendor Opportunities, or Merch? " : " or Merch? "}
          Fill out the form below, and we’ll follow up with personalized next
          steps or a custom quote.
        </p>
=======
        <header className="contact-hero">
          <p className="contact-eyebrow">Contact</p>
          <h1>Let’s plan your appointment.</h1>
          <p>
            Share your service needs and ideal time. We will confirm availability,
            travel coverage, and deposit details quickly.
          </p>
        </header>

        <section className="contact-form">
          <div className="embed-wrap">
            <HubSpotForm
              region="na2"
              portalId="242764935"
              formId="d4cd290e-7766-4bf5-91a2-c1274ddd882e"
            />
          </div>
        </section>

        <section className="direct-contact">
          <h3>Prefer email or phone?</h3>
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
          <h3>Quick Links</h3>
          <ul>
codex/redesign-danideclares.com-for-service-booking
            <li><Link to="/services">Service Catalog</Link></li>
            <li><Link to="/book">Book an Appointment</Link></li>
            <li><Link to="/pay">Complete Payment</Link></li>
            {SHOW_FESTIVAL && (
              <li><Link to="/festival">Festival & Vendor Info</Link></li>
            )}
            <li><Link to="/shop">Merch & Digital Products</Link></li>
=======
            <li><Link to="/services">All Services</Link></li>
            <li><Link to="/book?service=notary">Book Notary</Link></li>
            <li><Link to="/book?service=apostille">Book Apostille</Link></li>
            <li><Link to="/book?service=loansigning">Book Loan Signing</Link></li>
            <li><Link to="/book?service=officiant">Book Officiant</Link></li>
            <li><Link to="/pay">Pay to Confirm</Link></li>

          </ul>
        </section>
      </main>
    </>
  );
}
