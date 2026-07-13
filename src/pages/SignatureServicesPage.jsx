import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteConfig.js";
import "./SignatureServicesPage.css";

const signatureServices = [
  {
    title: "Full Property Reset & Turnover Package",
    desc: "Comprehensive move-out cleaning, deep sanitization, inspection, photo documentation, and turnover coordination. Property ready to list, lease, or hand over.",
    ideal: "Property managers, landlords, real estate agents, investors",
    price: "$500 – $1,500",
  },
  {
    title: "Document Packaging & Submission",
    desc: "Complete document intake, preparation, organization, printing, packaging, and submission with full chain of custody. We handle every step from signature to delivery.",
    ideal: "Law firms, title companies, employers, individuals with complex filing needs",
  },
  {
    title: "Ghost-Writing & Book Writing",
    desc: "Full ghost-writing for books, memoirs, and stories. We handle the writing from start to finished manuscript. You own the work. Your name goes on the cover.",
    ideal: "Authors, entrepreneurs, professionals, individuals with a story to tell",
    note: "Custom quoted based on scope, word count, and timeline.",
  },
  {
    title: "Grant Writing",
    desc: "Professional grant writing for nonprofits, small businesses, and organizations. We research, write, and prepare submission-ready grant applications.",
    ideal: "Nonprofits, small businesses, community organizations",
    note: "Custom quoted based on grant type and scope.",
  },
  {
    title: "Academic & Professional Editing",
    desc: "Editing and proofreading for dissertations, research papers, medical documents, business proposals, bios, and professional writing of all kinds.",
    ideal: "Students, academics, medical professionals, business owners",
    note: "Custom quoted based on document type, length, and turnaround.",
  },
  {
    title: "Carrier Compliance & Back-Office Support",
    desc: "Full carrier packet management, broker compliance tracking, invoicing, POD organization, and ongoing administrative support for trucking and logistics companies.",
    ideal: "Owner-operators, small carriers, freight brokers, logistics companies",
  },
  {
    title: "Full-Service Event Execution",
    desc: "End-to-end event management including theme development, vendor coordination, decor production, balloon installs, on-site setup, day-of management, and breakdown.",
    ideal: "Couples, families, businesses, organizations",
    price: "Starting at $2,500",
  },
  {
    title: "Business Setup & Organization Package",
    desc: "Document system setup, compliance framework, client intake process, branded business kits, and back-office organization. We build the systems so you can focus on running your business.",
    ideal: "New businesses, solo operators, growing teams",
  },
];

export default function SignatureServicesPage() {
  return (
    <>
      <Helmet>
        <title>Signature Services — Dani Declares LLC</title>
        <meta name="description" content="Complete, end-to-end solutions from Dani Declares LLC. Property resets, ghost-writing, event execution, carrier support, and more." />
      </Helmet>
      <div className="sig-page">

        <header className="sig-header">
          <div className="sig-container">
            <h1>Signature Services</h1>
            <p className="sig-sub">Complete Solutions. Start to Finish.</p>
            <p className="sig-desc">Our Signature Services go beyond individual tasks. We take ownership of the entire process so you can focus on what matters. Every service is custom scoped and fully executed by us.</p>
          </div>
        </header>

        <section className="sig-services">
          <div className="sig-container">
            {signatureServices.map((s) => (
              <div key={s.title} className="sig-card">
                <h2>{s.title}</h2>
                <p className="sig-card-desc">{s.desc}</p>
                <p className="sig-card-ideal"><strong>Ideal for:</strong> {s.ideal}</p>
                {s.note && <p className="sig-card-note">{s.note}</p>}
                {s.price && <p className="sig-card-price">Starting at {s.price}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="sig-bundles">
          <div className="sig-container">
            <h2>Signature Bundles</h2>
            <p className="sig-bundle-sub">Combine services for a complete solution at one price.</p>
            <div className="sig-bundle-grid">
              <div className="sig-bundle-card">
                <h3>Wedding Bundle</h3>
                <p>Full wedding planning + officiating + balloon arches + custom decor + printed programs + setup & breakdown</p>
              </div>
              <div className="sig-bundle-card">
                <h3>Move-Out Bundle</h3>
                <p>Property reset + deep cleaning + photo documentation + notary for lease docs + courier for keys/deposit</p>
              </div>
              <div className="sig-bundle-card">
                <h3>Real Estate Bundle</h3>
                <p>Property reset + notary for closing docs + document packaging + courier delivery + photo documentation</p>
              </div>
              <div className="sig-bundle-card">
                <h3>Business Starter Bundle</h3>
                <p>Document organization + I-9 verification + printing & scanning + business bio writing + branded business kit</p>
              </div>
              <div className="sig-bundle-card">
                <h3>Estate & Legal Bundle</h3>
                <p>POA / Trust notarization + document packaging + apostille (if needed) + courier to attorney or court</p>
              </div>
              <div className="sig-bundle-card">
                <h3>Writing + Documentation Bundle</h3>
                <p>Ghost-writing or grant writing + document printing + packaging + courier or mailing preparation</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sig-cta">
          <div className="sig-container">
            <h2>Ready for a Complete Solution?</h2>
            <p>Every Signature Service starts with a consultation. Tell us what you need and we will scope the right solution.</p>
            <div className="sig-cta-btns">
              <Link to="/contact" className="sig-btn-primary">Request a Custom Quote</Link>
              <a href={`tel:${siteConfig.phoneNumbers.public.tel}`} className="sig-btn-secondary">Call / Text GA: {siteConfig.phoneNumbers.public.display}</a>
              <a href={`tel:${siteConfig.phoneNumbers.sc.tel}`} className="sig-btn-secondary">Call / Text SC: {siteConfig.phoneNumbers.sc.display}</a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}