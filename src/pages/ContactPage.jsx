import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import HubSpotForm from "../components/HubSpotForm.jsx";
import "./ContactPage.css";
import { siteConfig } from "../data/siteConfig.js";

export default function ContactPage() {
  const heroStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(45, 12, 16, 0.75), rgba(45, 12, 16, 0.5)), url(${process.env.PUBLIC_URL}/images/stock/document execution office.jpg)`,
  };

  return (
    <>
      <Helmet>
        <title>Contact & Quotes • Dani Declares</title>
        <meta
          name="description"
          content="Questions, bookings, or custom quotes? Reach out to Dani Declares for mobile notary, apostille, loan signing, and officiant services."
        />
      </Helmet>

      <main className="contact-page">
        <header className="contact-hero" style={heroStyle}>
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
            <a href={`mailto:${siteConfig.emails.vendor}`}>
              {siteConfig.emails.vendor}
            </a>
            <br />
            📞{" "}
            <a href={`tel:${siteConfig.phoneNumbers.public.tel}`}>
              {siteConfig.phoneNumbers.public.display}
            </a>{" "}
            |{" "}
            SC:{" "}
            <a href={`tel:${siteConfig.phoneNumbers.sc.tel}`}>
              {siteConfig.phoneNumbers.sc.display}
            </a>
          </p>
        </section>

        <section className="quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/services">All Services</Link>
            </li>
            <li>
              <Link to="/book?service=notary">Book Notary</Link>
            </li>
            <li>
              <Link to="/book?service=apostille">Book Apostille</Link>
            </li>
            <li>
              <Link to="/book?service=loansigning">Book Loan Signing</Link>
            </li>
            <li>
              <Link to="/book?service=officiant">Book Officiant</Link>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
