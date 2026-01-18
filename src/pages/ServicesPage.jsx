import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./ServicesPage.css";

const CORE_SERVICES = [
  {
    title: "Mobile Notary",
    description: "On-site notarization for personal, legal, and business documents with flexible scheduling.",
    cta: "Book Notary",
    link: "https://tidycal.com/danideclaresns",
  },
  {
    title: "Apostille",
    description: "Document authentication and coordination for domestic and international use.",
    cta: "Start Apostille",
    link: "/contact",
  },
  {
    title: "Field Inspections",
    description: "Fast property inspections, occupancy checks, and photo documentation for lenders.",
    cta: "Request Inspection",
    link: "/contact",
  },
  {
    title: "Courier",
    description: "Same-day document delivery, court filings, and secure drop-offs when timing matters.",
    cta: "Schedule Courier",
    link: "/contact",
  },
];

const ADDITIONAL_SERVICES = [
  {
    title: "Wedding Officiant",
    description: "Intimate ceremonies and professional officiant services for your big day.",
    cta: "Explore Weddings",
    link: "/weddings",
  },
  {
    title: "Merch",
    description: "Signature apparel and tools to keep your goals front and center.",
    cta: "Shop Merch",
    link: "/shop",
  },
];

export default function ServicesPage() {
  return (
    <main className="services-page">
      <Helmet>
        <title>Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile notary, apostille, field inspections, and courier services with additional wedding officiant and merch offerings."
        />
      </Helmet>

      <header className="services-hero">
        <h1>Services Built for Busy Schedules</h1>
        <p>
          We bring essential document services to you—fast, professional, and transparent from booking to completion.
        </p>
        <div className="services-hero-actions">
          <a
            href="https://tidycal.com/danideclaresns"
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Now
          </a>
          <Link to="/pricing" className="btn btn--accent">
            View Pricing
          </Link>
        </div>
      </header>

      <section className="services-section">
        <div className="section-heading">
          <h2>Core Mobile Services</h2>
          <p>The essentials you count on most—delivered at your location.</p>
        </div>
        <div className="services-grid">
          {CORE_SERVICES.map((service) => (
            <article key={service.title} className="service-card">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              {service.link.startsWith("http") ? (
                <a
                  href={service.link}
                  className="btn btn--primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {service.cta}
                </a>
              ) : (
                <Link to={service.link} className="btn btn--primary">
                  {service.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="services-section services-section--secondary">
        <div className="section-heading">
          <h2>More Services</h2>
          <p>Additional ways to celebrate and shop with Dani Declares.</p>
        </div>
        <div className="services-grid services-grid--compact">
          {ADDITIONAL_SERVICES.map((service) => (
            <article key={service.title} className="service-card service-card--compact">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <Link to={service.link} className="btn btn--secondary">
                {service.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="services-section services-cta">
        <h2>Need help choosing the right service?</h2>
        <p>Call or message us and we will guide you to the best option.</p>
        <Link to="/contact" className="btn btn--primary">
          Contact Us
        </Link>
      </section>
    </main>
  );
}
