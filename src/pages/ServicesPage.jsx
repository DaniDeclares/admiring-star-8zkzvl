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
import {
  serviceRoutes,
  bookingPolicyText,
  buildServiceActionPath,
} from "../data/serviceRoutes.js";
import { siteConfig } from "../data/siteConfig.js";
import "./ServicesPage.css";

const iconMap = {
  notary: FiFileText,
  apostille: FiShield,
  officiant: FiHeart,
  loansigning: FiHome,
  fingerprinting: FiCheckCircle,
  courier: FiTruck,
  "real-estate-support": FiHome,
};

export default function ServicesPage() {
  return (
    <main className="services-page">
      <Helmet>
        <title>Services • Dani Declares</title>
        <meta
          name="description"
          content="Explore premium mobile notary, apostille, and officiant services across Georgia and South Carolina."
        />
      </Helmet>

      <section className="services-hero">
        <div>
          <p className="eyebrow">Premium Mobile Services</p>
          <h1>Dependable support for life’s important paperwork.</h1>
          <p className="hero-subtitle">
            We make it simple to book, sign, and celebrate with confidence. Choose
            a service below to schedule or submit payment.
          </p>
          <div className="hero-actions">
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

      <section className="services-grid" aria-label="Service list">
        {serviceRoutes.map((service) => {
          const Icon = iconMap[service.id] || FiCheckCircle;
          return (
            <article key={service.id} className="service-card">
              <div className="service-card__icon">
                <Icon size={28} />
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
      </section>

      <section className="trust-section">
        <div>
          <h2>Trusted across Georgia & South Carolina</h2>
          <ul>
            <li>Serving GA/SC with mobile, on-site appointments.</li>
            <li>Same-day and after-hours scheduling available.</li>
            <li>Clear travel fees and confirmation by text.</li>
          </ul>
        </div>
        <div className="trust-card">
          <h3>Need help choosing?</h3>
          <p>
            Tell us what you are signing and we will guide you to the right
            service.
          </p>
          <Link to="/contact" className="btn btn--primary">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
