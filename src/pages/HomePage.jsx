import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
 codex/redesign-danideclares.com-for-service-booking
import Countdown from "react-countdown";
import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import { SHOW_FESTIVAL } from "../data/siteConfig.js";
import { bookingServices } from "../data/services.js";
const eventBackground =
  process.env.PUBLIC_URL + "/images/festival/pexels-fang-liu-1996637-3617724.jpg";
=======

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
codex/redesign-danideclares.com-for-service-booking
            <p className="hero-eyebrow">Mobile Notary & Officiant Services</p>
            <h1>Book Notary Appointments in Minutes.</h1>
            <p className="hero-subtitle">
              Premium, mobile-first service across Metro Atlanta. Book first, pay
              to confirm, and we bring the experience to you.
            </p>
            <div className="hero-cta">
              <Link to="/book?service=notary" className="btn btn--primary">
                Book Notary
              </Link>
              <Link to="/services" className="btn btn--secondary">
                View Services
=======
            <h1>
              Reliable Notary &amp; Document Services for Tax, Legal, and Government
              Needs
            </h1>
            <p className="hero-subtitle">
              Same-day mobile service for individuals, tax professionals, law firms, and
              agencies across Georgia and South Carolina.
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
            <p className="hero-footnote">
              Your appointment is pending until payment is completed.
            </p>
          </div>
        </section>

codex/redesign-danideclares.com-for-service-booking
        {/* ABOUT US */}
        <section className="about-us-section">
          <h2>Premium mobile services, built for ease.</h2>
          <p>
            Dani Declares delivers trusted notary, apostille, and officiant support
            with transparent pricing and quick scheduling. Book your appointment,
            then confirm payment to lock in your time.
          </p>
=======
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
 codex/redesign-danideclares.com-for-service-booking
              <CountdownTimer />
              <Link to="/festival" className="btn btn--primary">
                Get Early Bird Tickets
              </Link>
              <p className="early-bird-note">Early Bird pricing ends soon!</p>
            </div>
          </section>
        )}

        {/* TESTIMONIAL CAROUSEL */}
        <section className="testimonial-carousel">
          <h2>Client Feedback</h2>
          <div className="carousel">
            <div className="testimonial-slide">
              <p>“{testimonials[idx].quote}”</p>
              <span>— {testimonials[idx].author}</span>
            </div>
          </div>
        </section>

        {/* SERVICE HIGHLIGHTS */}
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
              See all services & pricing
            </Link>
=======
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
              <Link to="/federal">Federal Services</Link>
            </div>

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
