import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import "./GovConPage.css";

const capabilityStatementPath = "/assets/capability-statement.pdf";

export default function GovConPage() {
  return (
    <>
      <Helmet>
        <title>Operational Subcontracting & Vendor Readiness Support | Dani Declares</title>
        <meta
          name="description"
          content="Dani Declares LLC provides administrative support, document lifecycle support, project coordination, vendor readiness, and local operational support for prime contractors in Georgia and South Carolina."
        />
        <link rel="canonical" href="https://danideclares.com/govcon" />
        <meta property="og:title" content="Operational Subcontracting & Vendor Readiness Support | Dani Declares" />
        <meta
          property="og:description"
          content="Subcontracting and vendor-readiness support for prime contractors needing administrative, document lifecycle, project coordination, and local operational support."
        />
        <meta property="og:url" content="https://danideclares.com/govcon" />
      </Helmet>

      <main className="govcon-page">
        <section className="govcon-hero" aria-labelledby="govcon-title">
          <div className="govcon-hero__content">
            <p className="govcon-eyebrow">Government contracting and vendor readiness</p>
            <h1 id="govcon-title">Operational Execution & Subcontracting Support for Prime Contractors</h1>
            <p className="govcon-hero__lead">
              Dani Declares LLC supports prime contractors with administrative support,
              document lifecycle support, project coordination, vendor readiness, and
              local operational coordination across Georgia and South Carolina.
            </p>
            <div className="govcon-hero__actions">
              <Link className="govcon-btn govcon-btn--primary" to="/request-service?division=govcon&source=govcon">
                Submit Vendor Inquiry
              </Link>
              <a
                className="govcon-btn govcon-btn--secondary"
                href={capabilityStatementPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Capability Statement
              </a>
            </div>
          </div>
        </section>

        <section className="govcon-section govcon-intro" aria-labelledby="govcon-support-title">
          <div className="govcon-section__header">
            <p className="govcon-section-label">Prime contractor support</p>
            <h2 id="govcon-support-title">Reliable Support for Complex Contract Workflows</h2>
            <p>
              We focus on targeted back-office and local coordination tasks that help
              prime teams keep project details organized, documented, and moving.
            </p>
          </div>
        </section>

        <section className="govcon-section" aria-labelledby="govcon-capabilities-title">
          <div className="govcon-section__header">
            <p className="govcon-section-label">Core capabilities</p>
            <h2 id="govcon-capabilities-title">Teaming Scope</h2>
          </div>

          <div className="govcon-capability-grid">
            <article className="govcon-capability-card">
              <h3>Administrative Support</h3>
              <p>Document preparation, structured data entry, spreadsheet updates, task tracking, and file audit support.</p>
            </article>
            <article className="govcon-capability-card">
              <h3>Document Lifecycle Support</h3>
              <p>File organization, folder tracking, indexing support, metadata logging, and preparation for existing prime systems.</p>
            </article>
            <article className="govcon-capability-card">
              <h3>Project Coordination</h3>
              <p>Schedule monitoring, timeline logs, cross-team task updates, intake routing, and vendor-readiness follow-up.</p>
            </article>
            <article className="govcon-capability-card">
              <h3>Local Operational Coordination</h3>
              <p>Regional task coordination, local routing support, site documentation, and physical workspace coordination as scope allows.</p>
            </article>
          </div>
        </section>

        <section className="govcon-details" aria-labelledby="govcon-corporate-title">
          <div className="govcon-data-panel">
            <p className="govcon-section-label">Corporate snapshot</p>
            <h2 id="govcon-corporate-title">Corporate Identification</h2>
            <dl className="govcon-data-list">
              <div>
                <dt>Legal Entity Name</dt>
                <dd>Dani Declares LLC</dd>
              </div>
              <div>
                <dt>State of Incorporation</dt>
                <dd>Georgia</dd>
              </div>
              <div>
                <dt>Target Service Footprint</dt>
                <dd>Georgia and South Carolina</dd>
              </div>
              <div>
                <dt>UEI</dt>
                <dd>TD4TSG48LHN9</dd>
              </div>
              <div>
                <dt>SAM.gov Registration Status</dt>
                <dd>Pending verification</dd>
              </div>
              <div>
                <dt>CAGE Code</dt>
                <dd>Pending verification or assignment</dd>
              </div>
            </dl>
          </div>

          <div className="govcon-readiness-panel">
            <p className="govcon-section-label">Subcontractor readiness</p>
            <h2>Structured for Teaming Support</h2>
            <p>
              Dani Declares LLC is structured for small business teaming and
              subcontractor readiness. The company supports targeted operational
              tasks while prime contractors retain ownership of specialized systems,
              secure records infrastructure, and contract-specific compliance controls.
            </p>
            <ul>
              <li>Office administrative support</li>
              <li>Document preparation and lifecycle support</li>
              <li>Project coordination and vendor-readiness support</li>
              <li>Local operational coordination</li>
            </ul>
          </div>
        </section>

        <section id="vendor-inquiry" className="govcon-cta" aria-labelledby="govcon-cta-title">
          <div className="govcon-cta__content">
            <p className="govcon-section-label">Next step</p>
            <h2 id="govcon-cta-title">Discuss Teaming Opportunities</h2>
            <p>
              Preparing a proposal or managing an active award that needs reliable
              administrative support, document lifecycle support, or local coordination?
              Connect with Dani Declares to discuss a structured subcontracting fit.
            </p>
            <div className="govcon-cta__actions">
              <Link className="govcon-btn govcon-btn--light" to="/request-service?division=govcon&source=govcon">
                Submit Vendor Inquiry
              </Link>
              <a className="govcon-text-link" href={`mailto:${siteConfig.emails.vendor}`}>
                {siteConfig.emails.vendor}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
