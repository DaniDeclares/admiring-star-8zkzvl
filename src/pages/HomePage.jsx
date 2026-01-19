import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
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
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <h1>
              Reliable Notary &amp; Document Services for Tax, Legal, and Government
              Needs
            </h1>
            <p className="hero-subtitle">
              Same-day mobile service for individuals, tax professionals, law firms, and
              agencies across Georgia and South Carolina.
            </p>
            <div className="hero-cta">
              <Link to="/book" className="btn btn--primary">
                Book a Notary Now
              </Link>
              <Link to="/tax-services" className="btn btn--secondary">
                Tax &amp; IRS Document Help
              </Link>
              <Link to="/federal-services" className="btn btn--outline">
                Federal &amp; Agency Services
              </Link>
            </div>
          </div>
        </section>

        <section className="tax-season">
          <h2>Tax Season Services</h2>
          <ul>
            <li>IRS letters, notices, and sworn statements</li>
            <li>Power of Attorney (POA) for tax representatives</li>
            <li>I-9 and identity verification</li>
            <li>Affidavits and declarations</li>
            <li>Apostille facilitation for foreign income or dependents</li>
            <li>Same-day mobile and after-hours availability</li>
          </ul>
          <Link to="/book" className="btn btn--primary">
            Schedule Tax-Related Notary Service
          </Link>
        </section>

        <section className="trust">
          <ul className="trust-list">
            <li>Commissioned Notary Public (GA &amp; SC)</li>
            <li>Experienced with legal, real estate, and government documents</li>
            <li>Mobile, on-site, and on-call availability</li>
            <li>Insured and compliant business entity</li>
          </ul>
        </section>

        <section className="who-we-serve">
          <h2>Who We Serve</h2>
          <div className="grid-3">
            <div>
              <h3>Individuals &amp; Families</h3>
              <p>
                Fast, professional notary support for personal, tax, and legal
                documents.
              </p>
              <Link to="/book">Book Service</Link>
            </div>
            <div>
              <h3>Tax &amp; Legal Professionals</h3>
              <p>
                Reliable execution for clients, filings, and time-sensitive documents.
              </p>
              <Link to="/services">Professional Services</Link>
            </div>
            <div>
              <h3>Government &amp; Agencies</h3>
              <p>Contract-ready document, notary, and administrative support.</p>
              <Link to="/federal-services">Federal Services</Link>
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <h2>Need help planning?</h2>
          <p>Let us know what you need and we’ll follow up quickly.</p>
          <Link to="/contact" className="btn btn--primary">
            Contact Us
          </Link>
        </section>
      </main>
    </>
  );
}
