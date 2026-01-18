import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero/hero-couple-beach-wide.jpg";
import "./Homepage.css";

const CORE_SERVICES = [
  {
    title: "Mobile Notary",
    description: "On-demand notarizations for legal, business, and personal documents.",
    link: "/services",
  },
  {
    title: "Apostille",
    description: "Authentication support for documents used across state and country lines.",
    link: "/services",
  },
  {
    title: "Field Inspections",
    description: "Fast property checks with photo documentation and same-day reporting.",
    link: "/services",
  },
  {
    title: "Courier",
    description: "Secure, time-sensitive document delivery and court filings.",
    link: "/services",
  },
];

const STEPS = [
  {
    title: "Book in Minutes",
    description: "Schedule online or call with the document type, timing, and location.",
  },
  {
    title: "We Come to You",
    description: "A licensed professional arrives on-site and guides you through each step.",
  },
  {
    title: "Documents Complete",
    description: "We finalize signatures, notarize, and deliver filings or copies as needed.",
  },
];

const PRICING = [
  {
    title: "Mobile Notary",
    price: "From $50",
    detail: "Up to 3 signatures + travel",
  },
  {
    title: "Apostille",
    price: "From $175",
    detail: "Per document handling",
  },
  {
    title: "Field Inspections",
    price: "From $75",
    detail: "Drive-by or occupancy checks",
  },
];

const REVIEWS = [
  {
    quote: "Fast, professional, and made the paperwork easy. Highly recommend!",
    author: "J. Thompson",
  },
  {
    quote: "They met me after work and handled everything with care and clarity.",
    author: "S. Rivera",
  },
];

const FAQ = [
  {
    question: "How quickly can I book?",
    answer: "Same-day and evening appointments are available based on schedule and distance.",
  },
  {
    question: "What should I have ready?",
    answer: "Bring valid ID, unsigned documents, and any required witnesses if applicable.",
  },
];

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares • Mobile Notary, Apostille & Field Services</title>
        <meta
          name="description"
          content="Mobile notary, apostille, field inspections, and courier services with fast booking, clear pricing, and professional support."
        />
      </Helmet>

      <main className="homepage home-main">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay">
            <p className="hero-eyebrow">Mobile Document Services</p>
            <h1>Reliable Notary & Document Support, Wherever You Are</h1>
            <p className="hero-subtitle">
              Book mobile notary, apostille, field inspection, or courier services with clear pricing and quick response.
            </p>
            <div className="hero-cta">
              <a
                href="https://tidycal.com/danideclaresns"
                className="btn btn--primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Now
              </a>
              <a
                href="https://buy.stripe.com/aFa5kC9q18CW2LBb9f6kg01"
                className="btn btn--secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay Now
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>Core Mobile Services</h2>
            <p>Focused, reliable services that keep your documents moving.</p>
          </div>
          <div className="card-grid">
            {CORE_SERVICES.map((service) => (
              <article key={service.title} className="info-card">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.link} className="btn btn--accent">
                  View Details
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--muted">
          <div className="section-heading">
            <h2>How It Works</h2>
            <p>Three simple steps to completed documents.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((step, index) => (
              <div key={step.title} className="step-card">
                <span className="step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>Pricing Preview</h2>
            <p>Transparent starting prices with travel details explained upfront.</p>
          </div>
          <div className="card-grid">
            {PRICING.map((item) => (
              <article key={item.title} className="info-card info-card--price">
                <h3>{item.title}</h3>
                <p className="price-tag">{item.price}</p>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="section-actions">
            <Link to="/pricing" className="btn btn--primary">
              View Full Pricing
            </Link>
          </div>
        </section>

        <section className="section section--muted">
          <div className="section-heading">
            <h2>Service Area & Travel</h2>
            <p>
              We serve the greater metro area with flexible travel options. Travel fees are quoted based on distance and
              urgency.
            </p>
          </div>
          <div className="travel-card">
            <h3>Need us at your location?</h3>
            <p>
              Share your address and preferred time. We will confirm availability, travel fees, and any document
              requirements before arrival.
            </p>
            <Link to="/contact" className="btn btn--accent">
              Request Availability
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="reviews-faq">
            <div className="reviews-block">
              <h2>Client Reviews</h2>
              {REVIEWS.map((review) => (
                <blockquote key={review.author}>
                  <p>“{review.quote}”</p>
                  <span>— {review.author}</span>
                </blockquote>
              ))}
            </div>
            <div className="faq-block">
              <h2>FAQ Preview</h2>
              {FAQ.map((item) => (
                <div key={item.question} className="faq-item">
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </div>
              ))}
              <Link to="/contact" className="btn btn--secondary">
                Ask a Question
              </Link>
            </div>
          </div>
        </section>

        <section className="section final-cta">
          <div>
            <h2>Ready to book your mobile service?</h2>
            <p>Fast confirmations, professional service, and clear pricing every step of the way.</p>
          </div>
          <div className="final-cta-actions">
            <a
              href="https://tidycal.com/danideclaresns"
              className="btn btn--primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Now
            </a>
            <a
              href="tel:+14705234892"
              className="btn btn--accent"
            >
              Call (470) 523-4892
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
