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

      <section className="dd-hero dd-hero--visual">
        <div className="dd-hero-inner">
          <div className="dd-hero-content">
            <p className="dd-hero-eyebrow">Mobile Operations &amp; Execution Support</p>
            <h1>We Handle It From Start to Finish</h1>
            <p className="dd-hero-sub">
              Dani Declares LLC helps clients handle documents, logistics, properties, events, and business support from start to finish.
              <br />
              We come to you, organize the details, and help get it done.
            </p>
            <div className="dd-hero-ctas">
              <Link to="/request-service" className="dd-btn-primary">Request Service</Link>
              <a href="tel:8643265362" className="dd-btn-secondary">Call / Text Now</a>
              <Link to="/services" className="dd-btn-outline">View Services</Link>
            </div>
          </div>

          <div className="dd-visual-collage" aria-label="Dani Declares service visuals">
            <div className="dd-visual-card dd-visual-card--large">
              <img src="/images/stock/document execution office.jpg" alt="Organized document and administrative support" loading="eager" />
              <span>Document &amp; Admin Support</span>
            </div>
            <div className="dd-visual-card">
              <img src="/weddings/FloralWedding_Couple_GoldChairs.jpg" alt="Event planning and execution support" loading="eager" />
              <span>Event Planning</span>
            </div>
            <div className="dd-visual-card">
              <img src="/images/stock/Courthouse steps.jpg" alt="Government and compliance support" loading="eager" />
              <span>Government Support</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dd-trust-strip" aria-label="Dani Declares trust signals">
        <div className="dd-container dd-trust-grid">
          <span>Mobile Support</span>
          <span>Metro Atlanta</span>
          <span>South Carolina Available</span>
          <span>Documentation Included</span>
          <span>Fast Response</span>
          <span>Vendor Readiness In Progress</span>
        </div>
      </section>

      <section className="dd-section dd-property-business">
        <div className="dd-container dd-property-panel">
          <div>
            <p className="dd-section-eyebrow">Property Managers &amp; Businesses</p>
            <h2>One Mobile Support Vendor for the Work That Has to Get Done</h2>
            <p>
              Need reliable support for turnovers, move-ready prep, document handling, inspections, courier runs, event execution, or administrative tasks?
            </p>
            <p>
              Dani Declares LLC helps property managers and businesses handle the small-but-critical work without chasing multiple vendors.
            </p>
          </div>
          <div className="dd-property-actions">
            <Link to="/request-service" className="dd-btn-primary">Request Service</Link>
            <Link to="/services" className="dd-btn-secondary">View Services</Link>
          </div>
        </div>
      </section>

      <section className="dd-section dd-ops-spotlight">
        <div className="dd-container">
          <p className="dd-section-eyebrow">High-Demand Support</p>
          <h2>Support for Property, Courier, and Business Tasks</h2>
          <div className="dd-spotlight-grid">
            <article className="dd-spotlight-card">
              <div className="dd-spotlight-icon">P</div>
              <div>
                <h3>Property Reset &amp; Field Support</h3>
                <p>Move-out cleaning, move-in prep, deep cleaning, turnovers, inspection/photo documentation, and property reset coordination.</p>
                <Link to="/request-service" className="dd-btn-link">Request Property Support →</Link>
              </div>
            </article>
            <article className="dd-spotlight-card">
              <div className="dd-spotlight-icon">C</div>
              <div>
                <h3>Courier &amp; Delivery Support</h3>
                <p>Court runs, document delivery, facility visits, business errands, and carrier back-office support.</p>
                <Link to="/request-service" className="dd-btn-link">Request Courier Support →</Link>
              </div>
            </article>
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
            <li><span className="dd-step-num">1</span>Request Service</li>
            <li><span className="dd-step-num">2</span>We Review &amp; Confirm Details</li>
            <li><span className="dd-step-num">3</span>We Execute or Coordinate the Service</li>
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
          <p>Metro Atlanta &amp; surrounding areas &nbsp;•&nbsp; South Carolina &nbsp;•&nbsp; Travel available based on service</p>
        </div>
      </section>

      <section className="dd-section dd-bottom-cta">
        <div className="dd-container">
          <h2>Ready to Get It Handled?</h2>
          <div className="dd-hero-ctas">
            <Link to="/request-service" className="dd-btn-primary">Request Service</Link>
            <a href="tel:8643265362" className="dd-btn-secondary">Call / Text (864) 326-5362</a>
            <Link to="/services" className="dd-btn-outline">View Services</Link>
          </div>
        </div>
      </section>
    </>
  );
}
