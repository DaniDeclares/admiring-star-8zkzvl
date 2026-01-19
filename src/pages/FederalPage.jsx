import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./FederalPage.css";

export default function FederalPage() {
  return (
    <>
      <Helmet>
        <title>Federal Contracting • Dani Declares</title>
        <meta
          name="description"
          content="Government-ready mobile notary, loan signing, and apostille facilitation support across Georgia and South Carolina."
        />
      </Helmet>

      <main className="federal-page">
        <section className="federal-hero">
          <p className="federal-eyebrow">Government-Ready</p>
          <h1>Federal Contracting</h1>
          <p>
            Dani Declares provides compliance-minded mobile notary, loan signing, and
            document support for federal, state, and local agencies.
          </p>
          <div className="federal-hero__actions">
            <Link className="btn btn--primary" to="/contact">
              Request a Quote
            </Link>
            <a
              className="btn btn--secondary"
              href="/assets/capability-statement.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Capability Statement
            </a>
          </div>
        </section>

        <section className="federal-section">
          <h2>Capabilities</h2>
          <div className="federal-grid">
            <div>
              <h3>Mobile Notary</h3>
              <p>On-site notarizations for government documents and field teams.</p>
            </div>
            <div>
              <h3>Loan Signing Support</h3>
              <p>Certified signing agent support for real estate and lending workflows.</p>
            </div>
            <div>
              <h3>Apostille Facilitation</h3>
              <p>Guided intake and document authentication coordination.</p>
            </div>
            <div>
              <h3>Document Courier</h3>
              <p>Secure pickup, delivery, and field support for time-sensitive files.</p>
            </div>
          </div>
        </section>

        <section className="federal-section federal-coverage">
          <h2>Coverage</h2>
          <p>
            Serving agencies across Georgia and South Carolina with travel options for
            mission-critical appointments. Extended travel is available by request.
          </p>
        </section>

        <section className="federal-section federal-identifiers">
          <h2>Identifiers</h2>
          <ul>
            <li>UEI: TBD</li>
            <li>CAGE: TBD</li>
            <li>SAM.gov Status: TBD</li>
            <li>NAICS: 541199, 561499, 531390 (editable)</li>
          </ul>
        </section>

        <section className="federal-section federal-differentiators">
          <h2>Differentiators</h2>
          <ul>
            <li>Fast response and flexible scheduling for urgent requests.</li>
            <li>Compliance-minded approach with clear documentation.</li>
            <li>Insured, bonded, and mobile-first where applicable.</li>
            <li>Professional communication and status updates.</li>
          </ul>
        </section>

        <section className="federal-cta">
          <h2>Ready to support your agency?</h2>
          <p>
            Contact us to discuss requirements, timelines, and service details for your
            federal or state contract.
          </p>
          <div className="federal-cta__actions">
            <Link className="btn btn--primary" to="/contact">
              Request a Quote
            </Link>
            <a
              className="btn btn--accent"
              href="/assets/capability-statement.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Capability Statement
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
