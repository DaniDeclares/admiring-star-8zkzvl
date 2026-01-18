import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiShield,
  FiHeart,
  FiHome,
  FiTruck,
  FiCheckCircle,
} from "react-icons/fi";
import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import {
  serviceRoutes,
  bookingPolicyText,
  buildServiceActionPath,
} from "../data/serviceRoutes.js";
import { siteConfig } from "../data/siteConfig.js";
import "./Homepage.css";

const iconMap = {
  notary: FiFileText,
  apostille: FiShield,
  officiant: FiHeart,
  loansigning: FiHome,
  fingerprinting: FiCheckCircle,
  courier: FiTruck,
  "real-estate-support": FiHome,
};

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares • Mobile Notary & Officiant Services</title>
        <meta
          name="description"
          content="Premium mobile notary, apostille, and officiant services across Georgia and South Carolina. Book appointments and pay to confirm in minutes."
        />
      </Helmet>

      <main className="homepage">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <p className="eyebrow">Dani Declares</p>
            <h1>Premium mobile notary & officiant services.</h1>
            <p className="hero-subtitle">
              Fast scheduling, clear pricing, and on-site support for life’s most
              important paperwork.
            </p>
            <div className="hero-cta">
              <Link to="/book?service=notary" className="btn btn--primary">
                Book Notary
              </Link>
              <a
                href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}
                className="btn btn--accent"
              >
                Call/Text {siteConfig.phoneNumbers.secondary.display}
              </a>
            </div>
          </div>
        </section>

        <section className="services-preview">
          <div className="section-header">
            <h2>Services</h2>
            <p>
              Choose a service below to book or submit payment. {bookingPolicyText}
            </p>
          </div>
          <div className="services-grid">
            {serviceRoutes.map((service) => {
              const Icon = iconMap[service.id] || FiCheckCircle;
              return (
                <article key={service.id} className="service-card">
                  <div className="service-card__icon">
                    <Icon size={26} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.shortDesc}</p>
                  <p className="service-card__policy">{bookingPolicyText}</p>
                  <Link
                    to={buildServiceActionPath(service)}
                    className="btn btn--secondary"
                  >
                    {service.primaryActionType === "pay" ? "Pay to Confirm" : "Book Now"}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="trust-section">
          <div>
            <h2>Trusted across GA & SC</h2>
            <ul>
              <li>Serving Georgia & South Carolina with mobile appointments.</li>
              <li>Same-day and after-hours scheduling when available.</li>
              <li>Real-time booking confirmations and text updates.</li>
            </ul>
          </div>
          <div className="trust-card">
            <h3>How it works</h3>
            <ol>
              <li>Book the service you need.</li>
              <li>Complete payment to confirm.</li>
              <li>We travel to you at the scheduled time.</li>
            </ol>
            <Link to="/services" className="btn btn--primary">
              Explore Services
            </Link>
          </div>
        </section>

        <section className="contact-cta">
          <h2>Need help fast?</h2>
          <p>Reach out for same-day availability or special requests.</p>
          <div className="contact-actions">
            <Link to="/contact" className="btn btn--primary">
              Contact Us
            </Link>
            <a
              href={`tel:${siteConfig.phoneNumbers.secondary.tel}`}
              className="btn btn--accent"
            >
              Call/Text Now
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
