import React from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import NotaryFeesNotice from "../components/NotaryFeesNotice.jsx";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";
import "./NotaryPage.css";

export default function NotaryPage() {
  return (
    <main className="notary-page">
      <Helmet>
        <title>Mobile Notary & Signing Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary, loan & real estate signings, apostilles, and fingerprinting across Metro Atlanta with transparent pricing."
        />
      </Helmet>

      <header className="notary-hero hero">
        <h1>Trusted Mobile Notary & Signing Services</h1>
        <p>
          {siteConfig.serviceAreaText}
          <br />
          <strong>Same-day, evening & weekend appointments available.</strong>
        </p>
        <p>
          <span className="feature">NNA Certified</span> |{" "}
          <span className="feature">Insured</span> |{" "}
          <span className="feature">We Come to You</span>
        </p>
      </header>

      <TravelFeesBlock />

      <section className="extra-info">
        <p>
          <strong>Discounts:</strong> Ask about volume plans and corporate rates.
        </p>
        <NotaryFeesNotice className="italic" />
      </section>

      <ServiceCta
        serviceId="notary"
        bookingLabel="Book Notary Appointment"
      />

      <section className="dashboard-cta">
        <h3>Notary Partners</h3>
        <p>Join our network to earn through the Dani Declares platform.</p>
        <a
          href="/partner-onboarding"
          className="btn btn--primary"
          style={{ marginRight: "1rem" }}
        >
          Become a Partner
        </a>
        <a href="/dashboard" className="btn btn--secondary">
          Notary Dashboard
        </a>
      </section>
    </main>
  );
}
