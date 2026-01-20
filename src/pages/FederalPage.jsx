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
          content="Federal-ready mobile notary, loan signing, and apostille facilitation services across Georgia and South Carolina."
        />
      </Helmet>

      <main className="federal-page">
        <section className="federal-hero">
          <h1>Federal Contracting</h1>
          <p>
            Dani Declares provides mobile notary, loan signing, and apostille
            facilitation support for government teams and prime contractors.
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
          <h2>Core Capabilities</h2>
          <ul>
            <li>Mobile and on-site notary services</li>
            <li>Loan signing support for real estate transactions</li>
            <li>Apostille facilitation and document intake coordination</li>
            <li>Document courier and field support coordination</li>
          </ul>
        </section>

        <section className="federal-section">
          <h2>Coverage</h2>
          <p>Georgia and South Carolina with travel available upon request.</p>
          <p>
            Mobile, on-site, and after-hours coverage is coordinated in advance to
            meet agency timelines.
          </p>
        </section>

        <section className="federal-section">
          <h2>Identifiers</h2>
          <ul>
            <li>UEI: [Add UEI]</li>
            <li>CAGE: [Add CAGE]</li>
            <li>SAM Status: [Add SAM Status]</li>
            <li>NAICS: 541120 (Primary), 541199, 561410, 541611</li>
          </ul>
        </section>

        <section className="federal-section">
          <h2>Differentiators</h2>
          <ul>
            <li>Fast response for urgent mission-critical requests</li>
            <li>Compliance-minded workflows and documentation</li>
            <li>Insured and bonded where applicable</li>
            <li>Mobile-first scheduling and field-ready support</li>
          </ul>
        </section>

        <section className="federal-section federal-contact">
          <h2>Ready to Engage?</h2>
          <p>
            Request a quote or download the capability statement for internal
            distribution and procurement onboarding.
          </p>
          <div className="federal-contact__actions">
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
      </main>
    </>
  );
}
