import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./Homepage.css";

export default function Homepage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares LLC — Mobile Operations & Execution Support</title>
        <meta
          name="description"
          content="Mobile operations and execution support for documents, compliance, logistics, property, and events. We come to you and handle it from start to finish."
        />
      </Helmet>

      <section className="dd-hero">
        <div className="dd-hero-content">
          <h1>We Handle It From Start to Finish</h1>
          <p className="dd-hero-sub">
            Mobile support for documents, compliance, logistics, property, and events.
            <br />
            We come to you and get it done.
          </p>
          <div className="dd-hero-ctas">
            <Link to="/book" className="dd-btn-primary">Book Now</Link>
            <a href="tel:8643265362" className="dd-btn-secondary">Call / Text Now</a>
            <Link to="/contact" className="dd-btn-outline">Request a Quote</Link>
          </div>
        </div>
      </section>

      <section className="dd-section dd-what">
        <div className="dd-container">
          <h2>What We Handle</h2>
          <ul className="dd-handle-list">
            <li>Paperwork and document processing</li>
            <li>Court, medical, and business logistics</li>
            <li>Property cleaning, resets, and turnovers</li>
            <li>Event planning, setup, and execution</li>
            <li>Administrative and compliance support</li>
          </ul>
        </div>
      </section>

      <section className="dd-section dd-divisions">
        <div className="dd-container">
          <h2>Core Service Divisions</h2>
          <div className="dd-divisions-grid">
            <div className="dd-division-card">
              <h3>Document &amp; Compliance</h3>
              <p>Notary, apostille, document prep, I-9 verification, printing, and full packaging.</p>
              <Link to="/services" className="dd-btn-link">Learn More →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Logistics &amp; Courier</h3>
              <p>Court runs, document delivery, facility visits, and carrier back-office support.</p>
              <Link to="/services" className="dd-btn-link">Learn More →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Field Services (Property Reset)</h3>
              <p>Move-in/out cleaning, deep cleaning, rental turnovers, and full property resets.</p>
              <Link to="/services" className="dd-btn-link">Learn More →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Event Planning &amp; Execution</h3>
              <p>Full planning, vendor coordination, setup, breakdown, and custom decor production.</p>
              <Link to="/services" className="dd-btn-link">Learn More →</Link>
            </div>
            <div className="dd-division-card">
              <h3>Business &amp; Admin Support</h3>
              <p>Document organization, compliance tracking, client intake, and back-office systems.</p>
              <Link to="/services" className="dd-btn-link">Learn More →</Link>
            </div>
          </div>
          <div className="dd-divisions-footer">
            <Link to="/signature-services" className="dd-btn-primary">View Signature Services</Link>
            <Link to="/services" className="dd-btn-secondary">All Services</Link>
          </div>
        </div>
      </section>

      <section className="dd-section dd-how">
        <div className="dd-container">
          <h2>How It Works</h2>
          <ol className="dd-steps">
            <li><span className="dd-step-num">1</span>Contact or Book</li>
            <li><span className="dd-step-num">2</span>We Review &amp; Confirm Details</li>
            <li><span className="dd-step-num">3</span>We Execute the Service</li>
            <li><span className="dd-step-num">4</span>You Get Completion &amp; Documentation</li>
          </ol>
        </div>
      </section>

      <section className="dd-section dd-who dd-alt-bg">
        <div className="dd-container">
          <h2>Who We Help</h2>
          <ul className="dd-two-col-list">
            <li>Individuals &amp; families</li>
            <li>Business owners &amp; professionals</li>
            <li>Property managers &amp; landlords</li>
            <li>Law firms, title companies, tax offices</li>
            <li>Carriers &amp; logistics companies</li>
            <li>Event clients</li>
            <li>Agencies &amp; contractors</li>
          </ul>
        </div>
      </section>

      <section className="dd-section dd-why">
        <div className="dd-container">
          <h2>Why Choose Dani Declares</h2>
          <ul className="dd-why-list">
            <li><strong>Mobile</strong> — we come to you</li>
            <li><strong>Multi-service</strong> — multiple tasks handled in one visit</li>
            <li><strong>Structured execution</strong> — organized, reliable, documented</li>
            <li><strong>Fast response</strong> — quick turnaround on bookings and quotes</li>
            <li><strong>Built to execute</strong> — for people who need things DONE</li>
          </ul>
        </div>
      </section>

      <section className="dd-section dd-areas dd-alt-bg">
        <div className="dd-container">
          <h2>Service Areas</h2>
          <p>Metro Atlanta &amp; surrounding areas &nbsp;•&nbsp; South Carolina (notary active) &nbsp;•&nbsp; Travel available based on service</p>
        </div>
      </section>

      <section className="dd-section dd-bottom-cta">
        <div className="dd-container">
          <h2>Ready to Get It Handled?</h2>
          <div className="dd-hero-ctas">
            <Link to="/book" className="dd-btn-primary">Book Now</Link>
            <a href="tel:8643265362" className="dd-btn-secondary">Call / Text (864) 326-5362</a>
            <Link to="/contact" className="dd-btn-outline">Request a Quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}