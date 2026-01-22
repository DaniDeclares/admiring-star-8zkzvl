import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { bookingServices } from "../data/services.js";
import "./Homepage.css";

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares • Tax Season Notary & Federal Ready Services</title>
        <meta
          name="description"
          content="Same-day mobile notary support for tax, legal, and government documents across Georgia and South Carolina."
        />
      </Helmet>

      <main className="homepage home-main">
        <section className="hero">
          <div className="hero-overlay">
            <p className="hero-eyebrow">Mobile Notary &amp; Document Support</p>
            <div className="hero-accent" aria-hidden="true" />
            <h1>
              Reliable Notary &amp; Document Services for Tax, Legal, and Government
              Needs
            </h1>
            <p className="hero-subtitle">
              Same-day mobile service for individuals, tax professionals, law firms,
              and agencies across Georgia and South Carolina.
            </p>
            <div className="hero-cta">
              <Link to="/book?service=notary" className="btn btn--primary">
                Book a Notary Now
              </Link>
              <Link to="/tax-services" className="btn btn--secondary">
                Tax &amp; IRS Document Help
              </Link>
              <Link to="/federal" className="btn btn--outline">
                Federal &amp; Agency Services
              </Link>
            </div>
            <p className="hero-subline">Book first. Pay to confirm.</p>
          </div>
        </section>

        <section className="capabilities">
          <div className="section-heading">
            <h2>We support essential offices and mobile filings.</h2>
            <p>
              Capability-forward coverage for courts, agencies, and institutional
              documentation across the Southeast.
            </p>
          </div>
          <div className="capability-grid">
            <article
              className="capability-tile"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(41, 9, 14, 0.7), rgba(41, 9, 14, 0.7)), url("/images/stock/court building exterior.jpg")',
              }}
            >
              <div className="capability-tile__content">
                <h3>Courts &amp; Clerk Filings</h3>
                <p>Affidavits, sworn statements, and on-site support.</p>
              </div>
            </article>
            <article
              className="capability-tile"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(41, 9, 14, 0.7), rgba(41, 9, 14, 0.7)), url("/images/stock/Hospital administrative desks.jpg")',
              }}
            >
              <div className="capability-tile__content">
                <h3>Hospitals &amp; Care Centers</h3>
                <p>Patient forms, POA, and urgent administrative signings.</p>
              </div>
            </article>
            <article
              className="capability-tile"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(41, 9, 14, 0.7), rgba(41, 9, 14, 0.7)), url("/images/stock/School admin offices.jpg")',
              }}
            >
              <div className="capability-tile__content">
                <h3>Schools &amp; Universities</h3>
                <p>Enrollment, guardianship, and education records.</p>
              </div>
            </article>
            <article
              className="capability-tile"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(41, 9, 14, 0.7), rgba(41, 9, 14, 0.7)), url("/images/stock/government office paperwork.jpg")',
              }}
            >
              <div className="capability-tile__content">
                <h3>Government Offices</h3>
                <p>Agency-ready execution and filing coordination.</p>
              </div>
            </article>
            <article
              className="capability-tile"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(41, 9, 14, 0.7), rgba(41, 9, 14, 0.7)), url("/images/stock/Clipboards.jpg")',
              }}
            >
              <div className="capability-tile__content">
                <h3>Employer &amp; I-9 Support</h3>
                <p>Identity verification and administrative documentation.</p>
              </div>
            </article>
            <article
              className="capability-tile"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(41, 9, 14, 0.7), rgba(41, 9, 14, 0.7)), url("/images/stock/personal data confidential folder image.jpg")',
              }}
            >
              <div className="capability-tile__content">
                <h3>Confidential Handling</h3>
                <p>Secure chain-of-custody and privacy-first processes.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="packages other-services">
          <div className="section-heading">
            <h2>Services designed for busy schedules</h2>
            <p>
              Choose the service you need and book right away. We’ll guide you to
              payment after scheduling so you avoid double-booking.
            </p>
          </div>
          <div className="packages-grid">
            {bookingServices.map((service) => (
              <div key={service.id} className="package-card">
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
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
          <div className="services-footer">
            <Link to="/services" className="btn btn--secondary">
              See all services &amp; pricing
            </Link>
          </div>
        </section>

        <section className="contact-cta">
          <h2>Need help selecting a service?</h2>
          <p>Tell us what you need and we’ll follow up quickly.</p>
          <Link to="/contact" className="btn btn--primary">
            Contact Us
          </Link>
        </section>
      </main>
    </>
  );
}
