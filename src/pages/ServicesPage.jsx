import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { serviceCatalog } from "../data/services.js";
import { buildServiceActionPath } from "../data/serviceRoutes.js";
import { siteConfig } from "../data/siteConfig.js";
import NotaryFeesNotice from "../components/NotaryFeesNotice.jsx";
import "./ServicesPage.css";

const serviceThumbs = {
  notary: "/images/stock/mobile notary public.jpg",
  apostille: "/images/stock/legal paperwork desk.jpg",
  loansigning: "/images/stock/istockphoto-people signing.avif",
};

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary, apostille facilitation, loan signing, and officiant services with clear booking and payment steps."
        />
      </Helmet>

      <main className="services-page">
        <header
          className="services-hero"
          style={{
            backgroundImage:
              'linear-gradient(rgba(41, 9, 14, 0.78), rgba(41, 9, 14, 0.78)), url("/images/stock/legal paperwork desk2.jpg")',
          }}
        >
          <p className="services-eyebrow" style={{ color: "#f3e7d1" }}>
            Priority Services
          </p>
          <h1 style={{ color: "#f8f5f1" }}>
            Capability-forward support for tax, legal, and administrative documents.
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.85)" }}>
            We prioritize time-sensitive documentation with a mobile-first workflow
            across Georgia and South Carolina.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "1.5rem 0 0",
              display: "grid",
              gap: "0.6rem",
              color: "#f8f5f1",
              fontWeight: 600,
            }}
          >
            <li>1) Tax &amp; legal paperwork support</li>
            <li>2) General notary &amp; document execution</li>
            <li>3) School &amp; family documentation</li>
            <li>4) Employer / I-9 &amp; administrative services</li>
            <li>5) Apostille &amp; authentication</li>
          </ul>
          <p className="services-hero__notice" style={{ color: "#f3e7d1" }}>
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
            <h3>Verified &amp; Insured</h3>
            <p>NNA-certified, bonded, and insured for every appointment.</p>
          </div>
          <div>
            <h3>Mobile Convenience</h3>
            <p>We travel to homes, offices, hospitals, and agencies.</p>
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
                {serviceThumbs[service.id] && (
                  <div
                    aria-hidden="true"
                    style={{
                      width: "100%",
                      height: "160px",
                      borderRadius: "16px",
                      backgroundImage: `url(${serviceThumbs[service.id]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      marginBottom: "1rem",
                    }}
                  />
                )}
                <span className="service-card__tag">{service.category}</span>
                <h2>{service.name}</h2>
                <p>{service.shortDesc}</p>
                {service.priceLabel && (
                  <p className="service-card__price">{service.priceLabel}</p>
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
                  to={buildServiceActionPath(service.id)}
                >
                  Book Now
                </Link>
              </div>
            </article>
          ))}
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
