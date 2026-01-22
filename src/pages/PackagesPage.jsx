import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./PackagesPage.css";
odex/redesign-danideclares.com-for-service-booking
import { bookingServices, paymentServices } from "../data/services.js";
=======
import { SHOW_FESTIVAL } from "../data/siteConfig.js";
import {
  getServiceSections,
  serviceBundles,
  servicePages,
 from "../data/services.js";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";

export default function PackagesPage() {
  return (
    <main className="packages-page">
      <Helme
        <title>Services & Pricing • Dani Declares</title>
        <meta
          name="description"
          content="Explore Dani Declares notary, apostille, loan signing, and officiant services with clear booking and payment steps."
        />
      </Helmet>

      <header className="packages-hero">
codex/make-service-pricing-compliance-safe
        <h1>All Services & Pricing</h1>
        <p>Browse every service and package offered by Dani Declares LLC.</p>
        <p className="packages-fee-note">
          Statutory notarial act fees are set by state law (GA $2/act, SC up to
          $5/act). Mobile/service fees are separate.
=======
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
codex/redesign-danideclares.com-for-service-booking
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
=======
            ))}
          </div>
        </section>
      )}

      <ServiceCta
        serviceId="notary"
        bookingLabel="Book an Appointment"
      />
    </main>
  );
}