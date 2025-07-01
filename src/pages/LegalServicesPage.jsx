// src/pages/LegalServicesPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import "./LegalServicesPage.css";

const SERVICES = [
  {
    title: "Digital Court Reporting",
    price: "$150/hr",
    desc: "Certified reporters, virtual deposition & hearing transcripts within 3–5 days.",
  },
  {
    title: "Court Filing Courier",
    price: "$85+",
    desc: "Same-day runs to local courthouses for filings, returns, and pick-ups.",
  },
  {
    title: "Process Serving",
    price: "$95–$125",
    desc: "Document service with rush options and proof of service affidavit.",
  },
  {
    title: "Legal Document Preparation",
    price: "$100+",
    desc: "Preparation of affidavits, POAs, simple contracts, and other non-attorney documents.",
  },
  {
    title: "Witness Services",
    price: "$50/hr",
    desc: "Professional witness and attestation for depositions, affidavits, and signings.",
  },
  {
    title: "Skip Trace & Asset Locate",
    price: "$125",
    desc: "Basic skip tracing to locate individuals or assets for legal matters.",
  },
];

export default function LegalServicesPage() {
  return (
    <main className="legal-page">
      <Helmet>
        <title>Court & Legal Industry Services • Dani Declares</title>
        <meta
          name="description"
          content="Court reporting, filings, process serving, document prep, witness services, and skip tracing for legal professionals."
        />
      </Helmet>

      <header className="hero">
        <h1>Court & Legal Industry Services</h1>
        <p>
          Fast, reliable support for law firms, courts, and legal departments.
        </p>
      </header>

      <section className="services-grid">
        {SERVICES.map((s) => (
          <div key={s.title} className="service-card">
            <h2>{s.title}</h2>
            <p className="meta">{s.price}</p>
            <p className="desc">{s.desc}</p>
          </div>
        ))}
      </section>

      <section className="contact-cta">
        <p>
          For complex or high-volume requests,{" "}
          <a href="mailto:admin@danideclares.com">email us</a> for a custom quote.
        </p>
      </section>
    </main>
  );
}
