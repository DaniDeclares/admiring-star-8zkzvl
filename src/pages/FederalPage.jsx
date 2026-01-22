import React from "react";
import { Helmet } from "react-helmet-async";
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
          <div className="federal-hero__content">
            <h1>Federal Contracting</h1>
            <p>
              Mobile notary, loan signing, and document execution support for
              government teams and prime contractors across Georgia and South Carolina.
            </p>
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

        <section className="federal-section federal-note">
          <h2>Engagement</h2>
          <p>
            Capability statement and compliance documentation are available upon
            request for procurement and onboarding.
          </p>
        </section>
      </main>
    </>
  );
}
