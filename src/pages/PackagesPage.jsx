import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { listCanonicalOffers } from "../config/commercialRegistry";
import "./PackagesPage.css";

export default function PackagesPage() {
  const offers = listCanonicalOffers();
  return (
    <main className="packages-page">
      <Helmet>
        <title>DANI'S Current Services • DANI DECLARES</title>
        <meta
          name="description"
          content="Current owner-executed DANI DECLARES services in Georgia. Request a service or contact us for a custom review."
        />
      </Helmet>

      <header className="packages-hero">
        <p className="eyebrow">DANI'S CURRENT SERVICES</p>
        <h1>Services you can book with DANI DECLARES.</h1>
        <p>
          This page shows the small, current owner-executed sales layer. Additional company capabilities
          remain behind PASS 1 underwriting and activation controls.
        </p>
      </header>

      <section className="service-section">
        <h2>Current owner-executed services</h2>
        <div className="service-grid">
          {offers.map((service) => (
            <div key={service.serviceId} className="service-card">
              <div>
                <h3>{service.name}</h3>
                <p>Georgia • Direct owner execution</p>
                <span className="price">{service.pricingLabel}</span>
                {service.recurringOffer && <p>{service.recurringOffer.label}</p>}
              </div>
              <Link
                to={`/request-service?service=${encodeURIComponent(service.serviceId)}`}
                className="btn btn--primary"
              >
                Request / Book
              </Link>
              <p className="service-card__note">Additional scope may require a custom quote.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2>Need something else?</h2>
        <p>
          The full DANI DECLARES capability universe is larger than the current direct-sales layer.
          Submit the details and we can review whether the work is currently available.
        </p>
        <Link to="/request-service" className="btn btn--primary">Request a Custom Review</Link>
      </section>
    </main>
  );
}
