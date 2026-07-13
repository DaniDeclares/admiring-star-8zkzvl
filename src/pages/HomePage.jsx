import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { APP_IMAGES, resolveImageFallback } from "../assets/images.js";
import "./Homepage.css";

const heroVisuals = [
  {
    src: resolveImageFallback(APP_IMAGES.homepage.visuals.documentSupport),
    alt: "Organized document and administrative support",
    label: "Document & Administrative Support",
    className: "dd-visual-card dd-visual-card--large",
    priority: true,
  },
  {
    src: resolveImageFallback(APP_IMAGES.homepage.visuals.eventServices),
    alt: "Event planning and execution support",
    label: "Event Services",
    className: "dd-visual-card",
  },
  {
    src: resolveImageFallback(APP_IMAGES.homepage.visuals.governmentSupport),
    alt: "Government and compliance support",
    label: "Government Support",
    className: "dd-visual-card",
  },
];

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
              Mobile support for documents, compliance, logistics, property, events, and business operations.
              <br />
              We come to you, organize the details, and help get it done.
            </p>
            <div className="dd-hero-ctas">
              <Link to="/request-service" className="dd-btn-primary">Request Service</Link>
              <a href="tel:4704857173" className="dd-btn-secondary">Call / Text Now</a>
              <Link to="/services" className="dd-btn-outline">View Services</Link>
            </div>
          </div>

          <div className="dd-visual-collage" aria-label="Dani Declares service visuals">
            {heroVisuals.map((visual) => (
              <div key={visual.label} className={visual.className}>
                <img
                  src={visual.src}
                  alt={visual.alt}
                  loading="eager"
                  fetchPriority={visual.priority ? "high" : undefined}
                />
                <span>{visual.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dd-intake-strip">
        <div className="dd-container dd-intake-inner">
          <p className="dd-intake-text">Need something handled today? Submit a service request and we'll follow up fast.</p>
          <Link to="/request-service" className="dd-btn-intake">Request Service Now →</Link>
        </div>
      </section>

      <section className="dd-section dd-lanes">
        <div className="dd-container">
          <h2>Choose Your Service Lane</h2>
          <p className="dd-section-sub">Select the service type that matches your need. We route and execute from there.</p>
          <div className="dd-lanes-grid">
            <div className="dd-lane-card">
              <span className="dd-lane-tag">Documents</span>
              <h3>Document &amp; Compliance</h3>
              <p>Notary, apostille, document prep, I-9 verification, printing, and full packaging.</p>
              <Link to="/request-service" className="dd-btn-link">Request Document Support →</Link>
            </div>
            <div className="dd-lane-card">
              <span className="dd-lane-tag">Field Services</span>
              <h3>Field Services &amp; Property</h3>
              <p>Move-in/out cleaning, deep cleaning, rental turnovers, and full property resets.</p>
              <Link to="/request-service" className="dd-btn-link">Request Field Services →</Link>
            </div>
            <div className="dd-lane-card">
              <span className="dd-lane-tag">Courier Support</span>
              <h3>Logistics &amp; Courier</h3>
              <p>Court runs, document delivery, facility visits, and carrier back-office support.</p>
              <Link to="/request-service" className="dd-btn-link">Request Courier Support →</Link>
            </div>
            <div className="dd-lane-card">
              <span className="dd-lane-tag">Event Services</span>
              <h3>Event Planning &amp; Execution</h3>
              <p>Full planning, vendor coordination, setup, breakdown, and custom decor production.</p>
              <Link to="/request-service" className="dd-btn-link">Request Event Services →</Link>
            </div>
            <div className="dd-lane-card">
              <span className="dd-lane-tag">Government Support</span>
              <h3>Government &amp; Compliance</h3>
              <p>Court filings, government office runs, compliance documentation, and agency support.</p>
              <Link to="/request-service" className="dd-btn-link">Request Government Support →</Link>
            </div>
            <div className="dd-lane-card">
              <span className="dd-lane-tag">Product Services</span>
              <h3>Product, Print &amp; Merch Support</h3>
              <p>Stickers, labels, heat press apparel, business merch, event products, and branded add-ons.</p>
              <Link to="/request-service" className="dd-btn-link">Request Product Services →</Link>
              <Link to="/merch" className="dd-btn-link">View Merch &amp; Print Services →</Link>
            </div>
          </div>
          <div className="dd-divisions-footer">
            <Link to="/services" className="dd-btn-secondary">View All Services</Link>
          </div>
        </div>
      </section>

      <section className="dd-section dd-why dd-alt-bg">
        <div className="dd-container">
          <h2>Why Choose Dani Declares</h2>
          <div className="dd-why-grid">
            <div className="dd-why-card">
              <strong>Mobile</strong>
              <p>We come to you — no need to arrange drop-offs or pickups.</p>
            </div>
            <div className="dd-why-card">
              <strong>Multi-service</strong>
              <p>Multiple tasks handled in one visit, saving you time and coordination effort.</p>
            </div>
            <div className="dd-why-card">
              <strong>Structured execution</strong>
              <p>Organized, reliable, and fully documented from intake to completion.</p>
            </div>
            <div className="dd-why-card">
              <strong>Fast response</strong>
              <p>Quick turnaround on bookings and quotes — we don't sit on requests.</p>
            </div>
            <div className="dd-why-card">
              <strong>Built to execute</strong>
              <p>Designed for people who need things DONE, not just discussed.</p>
            </div>
            <div className="dd-why-card">
              <strong>Transparent intake</strong>
              <p>Clear service routing so you always know what's being handled and by whom.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dd-section dd-how">
        <div className="dd-container">
          <h2>How It Works</h2>
          <ol className="dd-steps">
            <li>
              <span className="dd-step-num">1</span>
              <div>
                <strong>Submit a Request</strong>
                <p>Fill out the service intake form. Select your lane and describe your need.</p>
              </div>
            </li>
            <li>
              <span className="dd-step-num">2</span>
              <div>
                <strong>We Review &amp; Confirm</strong>
                <p>We follow up to confirm details, timeline, location, and scope.</p>
              </div>
            </li>
            <li>
              <span className="dd-step-num">3</span>
              <div>
                <strong>We Execute</strong>
                <p>We coordinate and carry out the service — mobile, on-site, or remotely.</p>
              </div>
            </li>
            <li>
              <span className="dd-step-num">4</span>
              <div>
                <strong>Completion &amp; Documentation</strong>
                <p>You receive confirmation, documentation, and any relevant follow-up.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="dd-section dd-who dd-alt-bg">
        <div className="dd-container">
          <h2>Who This Helps</h2>
          <div className="dd-who-grid">
            <div className="dd-who-card">
              <strong>Individuals &amp; Families</strong>
              <p>Personal document needs, property transitions, and event coordination.</p>
            </div>
            <div className="dd-who-card">
              <strong>Business Owners &amp; Professionals</strong>
              <p>Back-office support, compliance documentation, and admin execution.</p>
            </div>
            <div className="dd-who-card">
              <strong>Property Managers &amp; Landlords</strong>
              <p>Rental turnovers, move-in/out cleans, and property reset coordination.</p>
            </div>
            <div className="dd-who-card">
              <strong>Law Firms &amp; Title Companies</strong>
              <p>Court runs, document delivery, notary coordination, and filing support.</p>
            </div>
            <div className="dd-who-card">
              <strong>Carriers &amp; Logistics Companies</strong>
              <p>Back-office support, facility visits, and compliance documentation.</p>
            </div>
            <div className="dd-who-card">
              <strong>Event Clients &amp; Organizations</strong>
              <p>Full event execution from planning through breakdown and wrap-up.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dd-section dd-bottom-cta">
        <div className="dd-container">
          <h2>Ready to Get It Handled?</h2>
          <p className="dd-bottom-cta-sub">Submit a request and we'll route you to the right service lane.</p>
          <div className="dd-hero-ctas">
            <Link to="/request-service" className="dd-btn-primary">Request Service</Link>
            <a href="tel:4704857173" className="dd-btn-secondary">Call / Text (470) 485-7173</a>
            <Link to="/services" className="dd-btn-outline">View All Services</Link>
          </div>
          <p className="dd-areas-note">Metro Atlanta &amp; surrounding areas &nbsp;•&nbsp; South Carolina &nbsp;•&nbsp; Travel available based on service</p>
        </div>
      </section>
    </>
  );
}
