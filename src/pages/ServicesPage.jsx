import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { serviceCatalog, notaryFeeDisclaimer } from "../data/services.js";
import { buildServiceActionPath } from "../data/serviceRoutes.js";
import { siteConfig } from "../data/siteConfig.js";
import "./ServicesPage.css";

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary, apostille facilitation, tax-season services, and loan signing support with clear booking and payment steps."
        />
      </Helmet>

      <main className="services-page">
        <header className="services-hero">
          <p className="services-eyebrow">Premium Mobile Services</p>
          <h1>Trusted notary and ceremony support, delivered with care.</h1>
          <p>
            Book your appointment in minutes, then confirm with a secure deposit.
            We serve Georgia and South Carolina with flexible, mobile-first scheduling.
          </p>
          <p className="services-hero__notice">
            Appointments are pending until payment is completed. Unpaid bookings may be
            released.
          </p>
          <div className="services-hero__actions">
            <Link to="/book?service=notary" className="btn btn--primary">
              Book Notary
            </Link>
            <Link to="/contact" className="btn btn--secondary">
              Request a Custom Quote
            </Link>
          </div>
        </header>

        <section className="services-trust">
          <div>
            <h3>Verified & Insured</h3>
            <p>NNA-certified, bonded, and insured for every appointment.</p>
          </div>
          <div>
            <h3>Mobile Convenience</h3>
            <p>We travel to homes, offices, hospitals, and venues.</p>
          </div>
          <div>
            <h3>Clear Confirmation</h3>
            <p>Book → Pay deposit → Receive appointment confirmation.</p>
          </div>
        </section>

        <section className="services-grid">
          {serviceCatalog.map((service) => (
            <article key={service.id} className="service-card">
              <div className="service-card__header">
                <span className="service-card__tag">{service.category}</span>
                <h2>{service.name}</h2>
                <p>{service.shortDesc}</p>
                {service.priceDisplay && (
                  <p className="service-card__price">{service.priceDisplay}</p>
                )}
              </div>
              <ul className="service-card__highlights">
                {service.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="service-card__actions">
                <Link
                  className="btn btn--primary"
                  to={buildServiceActionPath(service.id, service.actionType)}
                >
                  {service.actionType === "pay" ? "Pay Now" : "Book Now"}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="services-disclaimer">
          <h3>Notary pricing disclosure</h3>
          <p>{notaryFeeDisclaimer}</p>
          <p className="services-discount-note">
            Preferred client rates, volume pricing, multi-appointment bundles, and
            retainers are available for law firms, tax professionals, and recurring
            clients. After-hours and urgent requests may include an expedited service
            fee.
          </p>
        </section>

        <section className="services-contact-bar">
          <div>
            <h3>Need a fast answer?</h3>
            <p>Call or text and we will confirm your service window quickly.</p>
          </div>
          <div className="services-contact-bar__actions">
            <a
              className="btn btn--primary"
              href={`tel:${siteConfig.phoneNumbers.primary.tel}`}
            >
              Call {siteConfig.phoneNumbers.primary.display}
            </a>
            <a
              className="btn btn--secondary"
              href={`mailto:${siteConfig.emails.admin}`}
            >
              Email {siteConfig.emails.admin}
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
