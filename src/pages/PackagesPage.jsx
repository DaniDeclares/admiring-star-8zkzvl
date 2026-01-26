import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { bookingServices, paymentServices } from "../data/services.js";
import ServiceCta from "../components/ServiceCta.jsx";
import "./PackagesPage.css";

export default function PackagesPage() {
  return (
    <main className="packages-page">
      <Helmet>
        <title>Services & Pricing • Dani Declares</title>
        <meta
          name="description"
          content="Explore Dani Declares notary, apostille, loan signing, and officiant services with clear booking and payment steps."
        />
      </Helmet>

      <header className="packages-hero">
        <p className="eyebrow">Service Catalog</p>
        <h1>Services & Pricing</h1>
        <p>
          Book first, then pay to confirm your appointment. Select the service that
          matches your needs and follow the guided flow.
        </p>
      </header>

      <section className="service-section">
        <h2>Book a service</h2>
        <div className="service-grid">
          {bookingServices.map((service) => (
            <div key={service.id} className="service-card">
              <div>
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
                {service.priceLabel && (
                  <span className="price">{service.priceLabel}</span>
                )}
              </div>
              <Link
                to={`/book?service=${service.id}`}
                className="btn btn--primary"
              >
                Book
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="service-section">
        <h2>Complete payment</h2>
        <p className="section-note">
          Payment links are only used after you have booked your appointment. This
          keeps your time slot safe and avoids double-booking.
        </p>
        <div className="service-grid">
          {paymentServices.map((service) => (
            <div key={service.id} className="service-card">
              <div>
                <h3>{service.title}</h3>
                <p>{service.shortDescription}</p>
              </div>
              <Link
                to={`/pay?service=${service.id}`}
                className="btn btn--secondary"
              >
                Pay
              </Link>
            </div>
          ))}
        </div>
      </section>

      <ServiceCta serviceId="notary" bookingLabel="Book an Appointment" />
    </main>
  );
}
