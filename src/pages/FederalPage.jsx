import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./FederalPage.css";

export default function FederalPage() {
  const heroStyle = {
    backgroundImage: `linear-gradient(180deg, rgba(27, 10, 14, 0.82), rgba(27, 10, 14, 0.6)), url(${process.env.PUBLIC_URL}/images/stock/Courthouse steps.jpg)`,
  };

  return (
    <>
      <Helmet>
        <title>Government Contracting • Dani Declares LLC</title>
        <meta
          name="description"
          content="Government contracting capabilities for mobile administrative, document, compliance, field support, courier coordination, and property support services."
        />
      </Helmet>

      <main className="federal-page">
        <section className="federal-hero" style={heroStyle}>
          <h1>Government Contracting</h1>
          <p>
            Dani Declares LLC provides mobile operations and execution support
            for agencies, prime contractors, subcontractors, and organizations
            needing administrative, document, compliance, courier, and field
            support services.
          </p>
          <div className="federal-hero__actions">
            <Link className="btn btn--primary" to="/contact">
              Contracting Inquiries
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
          <h2>Core Capabilities</h2>
          <ul>
            <li>Administrative support and document processing</li>
            <li>Records organization and compliance support</li>
            <li>Document packaging and submission support</li>
            <li>Courier, logistics coordination, and field support</li>
            <li>Field inspection and photo documentation support</li>
            <li>Property support and mobile operations assistance</li>
          </ul>
        </section>

        <section className="federal-section">
          <h2>Coverage</h2>
          <p>
            Georgia and South Carolina service coordination with travel
            availability based on scope, location, and scheduling requirements.
          </p>
          <p>
            Mobile, on-site, and deadline-sensitive coverage is coordinated in
            advance to support project and agency timelines.
          </p>
        </section>

        <section className="federal-section">
          <h2>Identifiers</h2>
          <ul>
            <li>UEI: TD4TSG48LHN9</li>
            <li>Primary NAICS: 561410 — Document Preparation Services</li>
            <li>Additional NAICS: 541120, 541199, 561611, 531390</li>
            <li>PSC Codes: R699, R499, R707, R418</li>
          </ul>
        </section>

        <section className="federal-section">
          <h2>Differentiators</h2>
          <ul>
            <li>Mobile-first support for document, field, and courier needs</li>
            <li>Compliance-minded workflows and organized documentation</li>
            <li>Flexible support for prime contractors and subcontracting teams</li>
            <li>Administrative and operational support across multiple service areas</li>
          </ul>
        </section>
      </main>
    </>
  );
}
