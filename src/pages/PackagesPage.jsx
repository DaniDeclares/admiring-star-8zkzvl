import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { bookingServices } from "../data/services.js";
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
          Book first, then complete payment to confirm your appointment. Select the
          service that matches your needs and follow the guided flow.
        </p>
      </header>

      <section className="service-section">
        <img src={process.env.PUBLIC_URL + "/images/festival/festival-promo-graphic-01.png"} alt="visual" className="w-full h-44 object-cover rounded-t-lg mb-3" onError={(e) => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + "/images/festival/festival-crowd-01.jpg"; }} />
<h2>Book a service</h2>
        <div className="service-grid">
          {bookingServices.map((service) => (
            <div key={service.id} className="service-card">
              <div>
                <img src={process.env.PUBLIC_URL + "/images/festival/festival-promo-graphic-01.png"} alt="visual" className="w-full h-44 object-cover rounded-t-lg mb-3" onError={(e) => { e.target.onerror = null; e.target.src = process.env.PUBLIC_URL + "/images/festival/festival-crowd-01.jpg"; }} />
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
                Book an Appointment
              </Link>
              <p className="service-card__note">
                Appointments are not confirmed until payment is completed.
              </p>
            </div>
          ))}
        </div>
      </section>

      <ServiceCta serviceId="notary" bookingLabel="Book an Appointment" />
    </main>
  );
}
