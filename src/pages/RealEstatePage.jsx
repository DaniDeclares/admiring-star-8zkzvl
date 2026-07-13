// src/pages/RealEstatePage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { getServiceSections, servicePages } from "../data/services.js";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";
import "./RealEstatePage.css";

export default function RealEstatePage() {
  const sections = getServiceSections(servicePages.realEstate);

  return (
    <main className="realestate-page">
      <Helmet>
        <title>Real Estate & Broker Services • Dani Declares</title>
        <meta
          name="description"
          content="On-demand real estate support including open houses, field inspections, lockbox pickup, and transaction coordination with clear pricing."
        />
      </Helmet>

      <header className="hero">
        <h1>Real Estate & Broker Services</h1>
        <p>
          Streamline your transactions with on-demand support tailored for agents,
          brokers, and lenders.
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
                <p className="meta">{service.price}</p>
                {service.details && <p className="desc">{service.details}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <TravelFeesBlock />

      <section className="cta">
        <p>
          Need a custom combination of services? Reach out for tailored support.
        </p>
      </section>

      <ServiceCta
        serviceId="loansigning"
        bookingLabel="Book Loan Signing"
      />
    </main>
  );
}
