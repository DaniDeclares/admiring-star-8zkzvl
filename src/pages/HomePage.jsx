import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./Homepage.css";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Dani Declares LLC — Mobile Operations & Service Intake</title>
        <meta
          name="description"
          content="Mobile operations support for documents, property, courier runs, events, and vendor readiness. Request service and get it handled."
        />
      </Helmet>

      {/* HERO SECTION */}
      <section className="hp-hero">
        <div className="hp-hero-content">
          <div className="hp-eyebrow">Dani Declares LLC</div>
          <h1 className="hp-headline">Mobile operations support for the work that has to get handled.</h1>
          <p className="hp-hero-sub">
            Documents, courier runs, property resets, events, vendor readiness, admin cleanup, and custom production through one organized intake.
          </p>
          <div className="hp-hero-ctas">
            <Link to="/request-service" className="hp-btn-primary">Request Service</Link>
            <a href="tel:8643265362" className="hp-btn-secondary">Call or Text (864) 326-5362</a>
            <Link to="/services" className="hp-btn-outline">View Services</Link>
          </div>
        </div>
      </section>

      {/* FAST INTAKE STRIP */}
      <section className="hp-intake-strip">
        <div className="hp-intake-content">
          <h2>Need something handled?</h2>
          <p>Tell us what you need. We'll confirm availability and route you to the right team.</p>
          <Link to="/request-service" className="hp-btn-intake">Start Your Request →</Link>
        </div>
      </section>

      {/* SERVICE LANES GRID */}
      <section className="hp-service-lanes">
        <div className="hp-container">
          <h2 className="hp-section-title">Our Service Lanes</h2>
          <div className="hp-lanes-grid">
            <div className="hp-lane-card">
              <h3>DocOps</h3>
              <p>Document handling, notary, compliance paperwork, and admin support. Secure, on-site service.</p>
              <Link to="/request-service?lane=docops" className="hp-lane-link">Request DocOps →</Link>
            </div>
            <div className="hp-lane-card">
              <h3>FieldOps</h3>
              <p>Property resets, move-out turnovers, Airbnb prep, and inspection-ready support.</p>
              <Link to="/request-service?lane=fieldops" className="hp-lane-link">Request FieldOps →</Link>
            </div>
            <div className="hp-lane-card">
              <h3>CourierOps</h3>
              <p>Local pickups, deliveries, court runs, and time-sensitive logistics coordination.</p>
              <Link to="/request-service?lane=courieops" className="hp-lane-link">Request CourierOps →</Link>
            </div>
            <div className="hp-lane-card">
              <h3>EventOps</h3>
              <p>Event planning, coordination, setup, breakdown, and day-of execution.</p>
              <Link to="/request-service?lane=eventops" className="hp-lane-link">Request EventOps →</Link>
            </div>
            <div className="hp-lane-card">
              <h3>GovOps</h3>
              <p>Vendor readiness, procurement support, and compliance coordination.</p>
              <Link to="/request-service?lane=govops" className="hp-lane-link">Request GovOps →</Link>
            </div>
            <div className="hp-lane-card">
              <h3>ProductOps</h3>
              <p>Custom merch, DTF production, signage, and branded items produced in-house.</p>
              <Link to="/request-service?lane=productops" className="hp-lane-link">Request ProductOps →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONVERSION / PROOF SECTION */}
      <section className="hp-proof">
        <div className="hp-container">
          <h2 className="hp-section-title">Why Teams Choose Dani Declares</h2>
          <div className="hp-proof-grid">
            <div className="hp-proof-card">
              <h3>Organized Execution</h3>
              <p>Structured systems. Clear timelines. Documented completion. No surprises.</p>
            </div>
            <div className="hp-proof-card">
              <h3>One Point of Contact</h3>
              <p>Request, confirm, and track through the same interface. Simple and reliable.</p>
            </div>
            <div className="hp-proof-card">
              <h3>Multi-Lane Coverage</h3>
              <p>Multiple service types under one team. Handle docs, field work, and events in one partnership.</p>
            </div>
            <div className="hp-proof-card">
              <h3>Fast Response</h3>
              <p>Quick availability confirmation. Same-day or next-day service in most cases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hp-how-it-works">
        <div className="hp-container">
          <h2 className="hp-section-title">How It Works</h2>
          <ol className="hp-steps">
            <li>
              <span className="hp-step-number">1</span>
              <div className="hp-step-content">
                <strong>Request Service</strong>
                <p>Tell us what you need, when, and where. Pick your service lane or describe a custom need.</p>
              </div>
            </li>
            <li>
              <span className="hp-step-number">2</span>
              <div className="hp-step-content">
                <strong>We Confirm & Quote</strong>
                <p>We review your request, confirm availability, and send you a clear quote.</p>
              </div>
            </li>
            <li>
              <span className="hp-step-number">3</span>
              <div className="hp-step-content">
                <strong>We Execute</strong>
                <p>On the scheduled date, we show up prepared and handle everything as planned.</p>
              </div>
            </li>
            <li>
              <span className="hp-step-number">4</span>
              <div className="hp-step-content">
                <strong>You Get Proof & Pay</strong>
                <p>Photos, documentation, or direct confirmation. Simple payment options.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* WHO THIS HELPS */}
      <section className="hp-who-helps">
        <div className="hp-container">
          <h2 className="hp-section-title">Who This Helps</h2>
          <div className="hp-who-grid">
            <div className="hp-who-item">
              <strong>Property Managers & Landlords</strong>
              <p>Turnovers, inspections, vendor coordination, and move-out resets.</p>
            </div>
            <div className="hp-who-item">
              <strong>Event Professionals</strong>
              <p>Planning, coordination, setup, and day-of execution support.</p>
            </div>
            <div className="hp-who-item">
              <strong>Business Owners</strong>
              <p>Document handling, compliance support, and admin cleanup.</p>
            </div>
            <div className="hp-who-item">
              <strong>Government & Vendors</strong>
              <p>Procurement readiness and compliance documentation.</p>
            </div>
            <div className="hp-who-item">
              <strong>Logistics Companies</strong>
              <p>Courier runs, local deliveries, and field execution.</p>
            </div>
            <div className="hp-who-item">
              <strong>Individuals & Families</strong>
              <p>Estate paperwork, moving support, and personal event coordination.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="hp-bottom-cta">
        <div className="hp-container">
          <h2>Ready to Get Started?</h2>
          <p>Request service now. We'll handle the rest.</p>
          <div className="hp-bottom-cta-buttons">
            <Link to="/request-service" className="hp-btn-primary">Request Service</Link>
            <a href="tel:8643265362" className="hp-btn-secondary">Call or Text (864) 326-5362</a>
          </div>
        </div>
      </section>
    </>
  );
}
