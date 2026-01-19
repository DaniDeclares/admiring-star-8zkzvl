import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./FederalPage.css";

export default function FederalPage() {
  return (
    <>
      <Helmet>
        <title>Federal Contracting &amp; Agency Support • Dani Declares</title>
        <meta
          name="description"
          content="Professional notary, document handling, and administrative support services for government entities and contractors."
        />
      </Helmet>

      <main className="federal-page">
        <section className="federal-hero">
          <h1>Federal Contracting &amp; Agency Support Services</h1>
          <p>
            Dani Declares provides professional notary, document handling, and
            administrative support services for government entities and contractors.
          </p>
        </section>

        <section className="federal-section">
          <h2>Core Capabilities</h2>
          <ul>
            <li>Mobile and on-site notary services</li>
            <li>Loan, trust, and legal document execution</li>
            <li>Identity and employment verification</li>
            <li>Apostille facilitation</li>
            <li>Secure document courier and delivery</li>
            <li>Document preparation, scanning, and compliance support</li>
          </ul>
        </section>

        <section className="federal-section">
          <h2>NAICS Codes</h2>
          <ul>
            <li>541120 – Offices of Notaries (Primary)</li>
            <li>541199 – Other Legal Services</li>
            <li>561611 – Investigation Services</li>
            <li>541611 – Administrative &amp; Compliance Services</li>
            <li>561410 – Document Preparation Services</li>
          </ul>
        </section>

        <section className="federal-section">
          <h2>Service Area</h2>
          <p>Georgia and South Carolina</p>
          <p>Mobile, on-site, and remote coordination available.</p>
        </section>

        <section className="federal-section">
          <h2>Compliance Snapshot</h2>
          <ul>
            <li>Commissioned Notary Public</li>
            <li>Registered business entity</li>
            <li>Insured</li>
            <li>Available for direct contracts and subcontracting</li>
          </ul>
        </section>

        <section className="federal-section federal-contact">
          <h2>Contact</h2>
          <p>
            Dani Declares LLC
            <br />
            Phone: (864) 326-5362
            <br />
            Email: admin@danideclares.com
          </p>
          <div className="federal-contact__actions">
            <Link className="btn btn--primary" to="/contact">
              Request Support
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
