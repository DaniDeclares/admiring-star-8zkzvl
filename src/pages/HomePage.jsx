import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import { serviceCatalog, notaryFeeDisclaimer } from "../data/services.js";
import { siteConfig } from "../data/siteConfig.js";
import "./Homepage.css";

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares • Mobile Notary & Officiant Services</title>
        <meta
          name="description"
          content="Book mobile notary, apostille, loan signing, and officiant services with clear booking and payment steps."
        />
      </Helmet>

      <main className="homepage home-main">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <p className="hero-eyebrow">Dani Declares</p>
            <h1>Premium mobile notary and ceremony services.</h1>
            <p className="hero-subtitle">
              Book your appointment in minutes. Confirm with a secure deposit. We
              bring the service to you across Georgia and South Carolina.
            </p>
            <div className="hero-cta">
              <Link to="/book?service=notary" className="btn btn--primary">
                Book Notary
              </Link>
              <Link to="/services" className="btn btn--secondary">
                View Services
              </Link>
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div>
            <h3>Mobile Convenience</h3>
            <p>On-site appointments at homes, offices, and venues.</p>
          </div>
          <div>
            <h3>Secure Confirmation</h3>
            <p>Appointments are confirmed after your deposit is received.</p>
          </div>
          <div>
            <h3>Professional Care</h3>
            <p>NNA certified, bonded, and insured.</p>
          </div>
        </section>

        <section className="service-showcase">
          <div className="section-heading">
            <h2>Services</h2>
            <p>Four focused offerings with clear booking and payment steps.</p>
          </div>
          <div className="service-showcase__grid">
            {serviceCatalog.map((service) => (
              <article key={service.id} className="service-showcase__card">
                <span className="service-showcase__tag">{service.category}</span>
                <h3>{service.title}</h3>
                <p>{service.shortDesc}</p>
                <div className="service-showcase__actions">
                  <Link className="btn btn--primary" to={`/book?service=${service.id}`}>
                    {service.actionLabels.book}
                  </Link>
                  <Link className="btn btn--accent" to={`/pay?service=${service.id}`}>
                    {service.actionLabels.pay}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="service-disclaimer">
            <p>{notaryFeeDisclaimer}</p>
          </div>
        </section>

        <section className="how-it-works">
          <div>
            <h2>How it works</h2>
            <ol>
              <li>Select your service and book a time.</li>
              <li>Complete your deposit payment to confirm.</li>
              <li>Receive a confirmation and we arrive at your location.</li>
            </ol>
          </div>
          <div className="how-it-works__contact">
            <h3>Need a quick response?</h3>
            <p>Call or text and we will confirm availability quickly.</p>
            <a
              className="btn btn--primary"
              href={`tel:${siteConfig.phoneNumbers.primary.tel}`}
            >
              Call {siteConfig.phoneNumbers.primary.display}
            </a>
          </div>
        </section>

        <section className="contact-cta">
          <h2>Ready to schedule?</h2>
          <p>We will meet you where you are with a premium, mobile-first experience.</p>
          <div className="contact-cta__actions">
            <Link to="/book?service=notary" className="btn btn--primary">
              Book Notary
            </Link>
            <Link to="/contact" className="btn btn--secondary">
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
