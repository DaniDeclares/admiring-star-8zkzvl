import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./SignatureServicesPage.css";

const signatureServices = [
  { title: "Document Packaging & Submission", desc: "Complete document intake, preparation, organization, and submission with full chain of custody. We handle every step from signature to delivery.", ideal: "Law firms, title companies, individuals with complex filing needs" },
  { title: "Full Property Reset & Turnover Package", desc: "Comprehensive move-out cleaning, deep sanitization, inspection, photo documentation, and turnover coordination. Property ready to list or re-lease.", ideal: "Property managers, landlords, real estate agents", price: "$500–$1,500" },
  { title: "Carrier Compliance & Back-Office Support", desc: "Full carrier packet management, broker compliance tracking, invoicing, and ongoing administrative support for trucking and logistics companies.", ideal: "Carriers, freight brokers, logistics operators" },
  { title: "Full-Service Event Execution", desc: "End-to-end event management: theme development, vendor coordination, decor production, on-site setup, execution, and breakdown.", ideal: "Individuals, organizations, corporate clients" },
  { title: "Business Setup & Organization Packages", desc: "Document system setup, compliance framework, client intake process, and back-office organization. You focus on running your business — we build the systems behind it.", ideal: "New businesses, solo operators, growing teams" },
];

export default function SignatureServicesPage() {
  return (
    <>
      <Helmet>
        <title>Signature Services — Dani Declares LLC</title>
        <meta name="description" content="Complete, end-to-end solutions from Dani Declares LLC. We don't just assist — we handle the entire process." />
      </Helmet>
      <div className="sig-page">
        <header className="sig-header">
          <div className="sig-container">
            <h1>Signature Services</h1>
            <p className="sig-sub">We Handle Complete Solutions</p>
            <p className="sig-desc">Our Signature Services go beyond individual tasks. We take ownership of the entire process — from start to finish — so you can focus on what matters.</p>
          </div>
        </header>
        <section className="sig-services">
          <div className="sig-container">
            {signatureServices.map((s) => (
              <div key={s.title} className="sig-card">
                <h2>{s.title}</h2>
                <p className="sig-card-desc">{s.desc}</p>
                <p className="sig-card-ideal"><strong>Ideal for:</strong> {s.ideal}</p>
                {s.price && <p className="sig-card-price">Starting at {s.price}</p>}
              </div>
            ))}
          </div>
        </section>
        <section className="sig-cta">
          <div className="sig-container">
            <h2>Ready for a Complete Solution?</h2>
            <p>Every signature service starts with a custom quote. Tell us what you need and we will put together the right scope.</p>
            <div className="sig-cta-btns">
              <Link to="/contact" className="sig-btn-primary">Request Custom Quote</Link>
              <a href="tel:8643265362" className="sig-btn-secondary">Call / Text (864) 326-5362</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}