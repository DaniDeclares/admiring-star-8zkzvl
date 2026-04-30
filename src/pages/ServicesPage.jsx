import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./ServicesPage.css";

const divisions = [
  {
    id: "document",
    title: "Document & Compliance",
    tagline: "We handle paperwork from start to submission",
    forWho: "Individuals, businesses, law firms, tax offices, HR departments",
    items: [
      "Notary Services (SC active / GA pending)",
      "Apostille Processing",
      "Document Preparation (non-attorney)",
      "I-9 Employment Verification",
      "Printing / Scanning / Organization",
      "Document Packaging & Submission (Signature Service)",
      "Power of Attorney (POA) Notarization",
      "Sworn Statements & Affidavits",
    ],
    bookSlug: "notary",
  },
  {
    id: "logistics",
    title: "Logistics & Courier",
    tagline: "We move documents and handle execution tasks",
    forWho: "Law firms, title companies, carriers, businesses, medical facilities",
    items: [
      "Court Filing & Retrieval",
      "Document Pickup & Delivery",
      "Hospital / Jail / Facility Runs",
      "Process Serving (standard & rush)",
      "Business Courier & Admin Support",
      "Carrier Back-Office (invoicing, paperwork, compliance)",
    ],
    bookSlug: null,
  },
  {
    id: "field",
    title: "Field Services (Property Reset)",
    tagline: "We reset and prepare properties for use",
    forWho: "Property managers, landlords, real estate agents, investors",
    items: [
      "Move-In / Move-Out Cleaning — from $300",
      "Deep Cleaning — from $400",
      "Rental Turnovers",
      "Full Property Reset (Signature Service) — $500–$1,500",
      "Inspections & Photo Documentation",
    ],
    bookSlug: null,
  },
  {
    id: "events",
    title: "Event Planning & Execution",
    tagline: "We plan, coordinate, and execute events",
    forWho: "Individuals, organizations, businesses, couples",
    items: [
      "Planning & Coordination",
      "Setup & Breakdown",
      "Vendor Coordination",
      "Decor & Custom Production",
      "Balloon Installs & Backdrops",
      "Sticker / Label Packages",
    ],
    bookSlug: null,
  },
  {
    id: "business",
    title: "Business & Admin Support",
    tagline: "We organize and manage administrative systems",
    forWho: "Small businesses, startups, professionals, agencies",
    items: [
      "Document Organization",
      "Compliance Tracking",
      "Client Intake Systems",
      "Back-Office Support",
    ],
    bookSlug: null,
  },
];

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Services — Dani Declares LLC</title>
        <meta
          name="description"
          content="Document compliance, logistics, property resets, event execution, and business support. Mobile services across Metro Atlanta and South Carolina."
        />
      </Helmet>
      <div className="sp-page">
        <header className="sp-header">
          <div className="sp-container">
            <h1>Our Services</h1>
            <p>Mobile execution support across five divisions. We come to you and handle the entire process.</p>
          </div>
        </header>
        {divisions.map((div) => (
          <section key={div.id} className="sp-division">
            <div className="sp-container">
              <h2>{div.title}</h2>
              <p className="sp-tagline">{div.tagline}</p>
              <p className="sp-for-who"><strong>Who it's for:</strong> {div.forWho}</p>
              <ul className="sp-items">
                {div.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="sp-division-ctas">
                {div.bookSlug
                  ? <a href={`https://tidycal.com/danideclaresns/${div.bookSlug}`} target="_blank" rel="noopener noreferrer" className="sp-btn-primary">Book Now</a>
                  : <Link to="/contact" className="sp-btn-primary">Request a Quote</Link>
                }
                <Link to="/pay" className="sp-btn-secondary">Pay for Service</Link>
              </div>
            </div>
          </section>
        ))}
        <section className="sp-sig-cta">
          <div className="sp-container">
            <h2>Need a Complete Solution?</h2>
            <p>Our Signature Services handle entire processes from start to finish — not just individual tasks.</p>
            <Link to="/signature-services" className="sp-btn-primary">View Signature Services</Link>
          </div>
        </section>
      </div>
    </>
  );
}