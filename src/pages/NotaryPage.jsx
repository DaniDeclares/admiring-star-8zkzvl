import React from "react";
import { Helmet } from "react-helmet-async";
import { siteConfig } from "../data/siteConfig.js";
import {
  getServiceSections,
  servicePages,
} from "../data/services.js";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";
import { tidyCalEvents } from "../data/tidycal.js";
import "./NotaryPage.css";

export default function NotaryPage() {
  const sections = getServiceSections(servicePages.notary);

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

      {sections.map((section) => (
        <section key={section.id} className="service-section">
          <div className="section-heading">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
          <div className="services-grid">
            {section.items.map((item) => (
              <div key={item.name} className="service-card">
                <h3>{item.name}</h3>
                <p className="meta">{item.price}</p>
                {item.details && <p className="desc">{item.details}</p>}
              </div>
            ))}
          </div>
          {section.addOns && (
            <div className="add-ons">
              <h3>Add-ons</h3>
              <ul>
                {section.addOns.map((addon) => (
                  <li key={addon.name}>
                    {addon.name}: <strong>{addon.price}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}

      <TravelFeesBlock />

      <section className="extra-info">
        <p>
          <strong>Discounts:</strong> Ask about volume plans and corporate rates.
          <br />
          <em className="italic">
            Additional notarizations may include per-signature act fees where applicable.
          </em>
        </p>
      </section>

      <ServiceCta
        bookingSlug={tidyCalEvents.generalNotary.slug}
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
