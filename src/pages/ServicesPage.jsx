import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { serviceCatalog } from "../data/services.js";
import { buildServiceActionPath } from "../data/serviceRoutes.js";
import { siteConfig } from "../data/siteConfig.js";
import NotaryFeesNotice from "../components/NotaryFeesNotice.jsx";
import "./ServicesPage.css";

export default function ServicesPage() {
  const heroStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(45, 12, 16, 0.82), rgba(45, 12, 16, 0.6)), url(${process.env.PUBLIC_URL}/images/stock/legal paperwork desk2.jpg)`,
  };
  const serviceGroups = [
    {
      id: "tax-legal",
      title: "Tax & legal paperwork support",
      description:
        "Support for time-sensitive filings, signatures, and legal documentation.",
    },
    {
      id: "general-notary",
      title: "General notary & document execution",
      description:
        "Mobile, on-site notarization for individuals, families, and businesses.",
    },
    {
      id: "school-family",
      title: "School & family documentation",
      description:
        "Documentation support for families, schools, and personal milestones.",
    },
    {
      id: "employer-admin",
      title: "Employer/I-9 & administrative services",
      description:
        "Administrative support for HR teams and employer verification needs.",
    },
    {
      id: "apostille-auth",
      title: "Apostille & authentication",
      description:
        "Guided document authentication support for domestic and international use.",
    },
  ].map((group) => ({
    ...group,
    services: serviceCatalog.filter((service) => service.group === group.id),
  }));

  return (
    <>
      <Helmet>
        <title>Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary, apostille facilitation, and loan signing support with clear booking and payment steps."
        />
      </Helmet>

      <main className="services-page">
        <header className="services-hero" style={heroStyle}>
          <p className="services-eyebrow">Premium Mobile Services</p>
          <h1>Trusted notary and document support, delivered with care.</h1>
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
        <section className="services-index">
          {serviceGroups.map((group) => (
            <div key={group.id} className="services-group">
              <div className="services-group__header">
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <div className="services-group__grid">
                {group.services.map((service) => (
                  <article key={service.id} className="service-card">
                    <div className="service-card__header">
                      <span className="service-card__tag">{service.category}</span>
                      <h3>{service.name}</h3>
                      <p>{service.shortDesc}</p>
                      {service.priceLabel && (
                        <p className="service-card__price">{service.priceLabel}</p>
                      )}
                    </div>
                    <div className="service-card__actions">
                      <Link
                        className="btn btn--primary"
                        to={buildServiceActionPath(service.bookingServiceId)}
                      >
                        Book Appointment
                      </Link>
                      <Link
                        className="btn btn--secondary"
                        to={`/pay?service=${service.paymentServiceId}`}
                      >
                        Pay
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="services-contact-bar">
          <div>
            <h3>Facility Visits</h3>
            <p>
              Mobile notary support for hospitals, nursing homes, rehab centers,
              correctional facilities, and courthouses with limited availability.
              We coordinate on-site details and confirm travel before your appointment
              is finalized.
            </p>
          </div>
          <div className="services-contact-bar__actions">
            <Link to="/facility-visits" className="btn btn--secondary">
              Learn About Facility Visits
            </Link>
          </div>
        </section>

        <section className="services-disclaimer">
          <h3>Notary pricing disclosure</h3>
          <NotaryFeesNotice />
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
