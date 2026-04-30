import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./ServicesPage.css";

const divisions = [
  {
    id: "field",
    title: "Field Services & Property Reset",
    tagline: "We prepare properties for the next tenant, buyer, or use.",
    forWho: "Property managers, landlords, real estate agents, Airbnb hosts, contractors, investors",
    items: [
      "Move-In / Move-Out Cleaning — from $300",
      "Deep Cleaning — from $400",
      "Rental & Airbnb Turnovers",
      "Post-Construction Cleaning",
      "Full Property Reset (Signature Service) — $500–$1,500",
      "Trash Removal Coordination",
      "Inspections & Photo Documentation",
      "Add-Ons: carpet, steam, odor removal, appliances",
    ],
    link: "/field-services",
    linkLabel: "View Field Services",
  },
  {
    id: "events",
    title: "Event Planning & Execution",
    tagline: "We plan, coordinate, and execute your entire event.",
    forWho: "Couples, families, businesses, organizations, community groups",
    items: [
      "Full Wedding Planning",
      "Wedding Officiating",
      "Party & Event Planning",
      "Day-Of Coordination",
      "Balloon Arches & Custom Decor",
      "Setup & Breakdown",
      "Vendor Coordination",
      "Custom Labels, Stickers, Signage & Favors",
    ],
    link: "/events",
    linkLabel: "View Events Services",
  },
  {
    id: "document",
    title: "Document & Compliance",
    tagline: "We handle your paperwork from start to submission.",
    forWho: "Individuals, businesses, law firms, tax offices, HR departments, employers",
    items: [
      "Mobile Notary Services (SC active / GA pending)",
      "POAs, Trusts & Affidavits",
      "I-9 Employment Verification",
      "Apostille Processing",
      "Document Preparation (non-attorney)",
      "Printing / Scanning / Organization",
      "Document Packaging & Submission (Signature Service)",
    ],
    link: "/book",
    linkLabel: "Book Document Services",
  },
  {
    id: "logistics",
    title: "Logistics & Courier",
    tagline: "We go where you can't and handle it.",
    forWho: "Law firms, title companies, carriers, businesses, medical facilities",
    items: [
      "Court Filing & Retrieval",
      "Document Pickup & Delivery",
      "Hospital / Jail / Facility Runs",
      "Process Serving",
      "Business Courier & Administrative Support",
      "Carrier Back-Office Support (invoicing, broker packets, compliance)",
    ],
    link: "/contact",
    linkLabel: "Request Logistics Support",
  },
  {
    id: "business",
    title: "Business & Administrative Support",
    tagline: "We organize systems so you can focus on running your business.",
    forWho: "Small businesses, startups, solo operators, agencies",
    items: [
      "Document Organization & Compliance Tracking",
      "Client Intake Systems",
      "Back-Office Support",
      "Business Writing & Bios",
      "Branded Document Kits & Business Starter Packs",
    ],
    link: "/contact",
    linkLabel: "Request Business Support",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>Services — Dani Declares LLC</title>
        <meta name="description" content="Mobile execution support across five divisions. Field services, events, documents, logistics, and business support. We come to you and handle it." />
      </Helmet>
      <div className="sp-page">
        <header className="sp-header">
          <div className="sp-container">
            <h1>What We Handle</h1>
            <p>Five service divisions. One company. We come to you and handle the entire process.</p>
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
                <Link to={div.link} className="sp-btn-primary">{div.linkLabel}</Link>
                <a href="tel:4706829348" className="sp-btn-secondary">Call / Text (470) 682-9348</a>
              </div>
            </div>
          </section>
        ))}

        <section className="sp-sig-cta">
          <div className="sp-container">
            <h2>Need a Complete Solution?</h2>
            <p>Our Signature Services bundle multiple divisions into one complete package handled from start to finish.</p>
            <div className="sp-sig-btns">
              <Link to="/signature-services" className="sp-btn-gold">View Signature Services</Link>
              <Link to="/contact" className="sp-btn-outline">Request a Custom Quote</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}