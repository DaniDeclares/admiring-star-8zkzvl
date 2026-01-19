// src/pages/LegalServicesPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { getServiceSections, servicePages } from "../data/services.js";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";
import "./LegalServicesPage.css";

export default function LegalServicesPage() {
  const sections = getServiceSections(servicePages.legal);

  return (
    <main className="legal-page">
      <Helmet>
        <title>Court & Legal Industry Services • Dani Declares</title>
        <meta
          name="description"
          content="Courier services and court support for legal professionals with transparent pricing."
        />
      </Helmet>

      <header className="hero">
        <h1>Court & Legal Industry Services</h1>
        <p>
          Fast, reliable support for law firms, courts, and legal departments.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.id} className="service-section">
          <h2>{section.title}</h2>
          <p className="section-desc">{section.description}</p>
          <div className="services-grid">
            {section.items.map((service) => (
              <div key={service.name} className="service-card">
                <h3>{service.name}</h3>
                {service.details && <p className="desc">{service.details}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <TravelFeesBlock />

      <section className="contact-cta">
        <p>
          For complex or high-volume requests, {" "}
          <a href="mailto:admin@danideclares.com">email us</a> for a custom quote.
        </p>
      </section>

      <ServiceCta
        serviceId="apostille"
        bookingLabel="Book Apostille Intake"
      />
    </main>
  );
}
