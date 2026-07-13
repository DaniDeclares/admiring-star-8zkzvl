import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./TaxServicesPage.css";

export default function TaxServicesPage() {
  return (
    <>
      <Helmet>
        <title>Tax &amp; IRS Document Notary Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile and same-day notary services for IRS correspondence, POA forms, affidavits, and identity verification."
        />
      </Helmet>

      <main className="tax-services-page">
        <section className="tax-services-hero">
          <h1>Tax &amp; IRS Document Notary Services</h1>
          <p>
            Dani Declares provides mobile and same-day notary services for tax-related
            documentation, identity verification, and sworn statements.
          </p>
        </section>

        <section className="tax-services-card">
          <ul>
            <li>IRS correspondence and notices</li>
            <li>Power of Attorney (Form 2848)</li>
            <li>Affidavits and declarations</li>
            <li>I-9 employment verification</li>
            <li>Apostille facilitation</li>
          </ul>
          <p className="tax-services-callout">
            <strong>Same-day and after-hours service available.</strong>
          </p>
          <Link to="/book" className="btn btn--primary">
            Book Tax-Related Service
          </Link>
        </section>
      </main>
    </>
  );
}
