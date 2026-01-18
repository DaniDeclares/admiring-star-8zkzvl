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
          content="Questions about notary, apostille, officiant, or mobile support services? Contact Dani Declares for fast scheduling and quotes."
        />
      </Helmet>

      <main className="contact-page">
        <h1>Let’s Connect</h1>
        <p>
          Tell us what you need—mobile notary, apostille, officiant, or document
          support—and we will follow up with next steps and scheduling details.
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
            </a>
            <br />
            📞{" "}
            <a href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}>
              {siteConfig.phoneNumbers.secondary.display}
            </a>
          </p>
        </section>

        <section className="quick-links">
          <h3>Explore Our Services</h3>
          <ul>
            <li><Link to="/services">All Services</Link></li>
            <li><Link to="/apostille">Apostille</Link></li>
            <li><Link to="/officiant">Officiant</Link></li>
            <li><Link to="/book">Book Now</Link></li>
          </ul>
        </section>
      </main>
    </>
  );
}
