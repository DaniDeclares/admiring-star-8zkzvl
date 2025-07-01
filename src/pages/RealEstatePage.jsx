// src/pages/RealEstatePage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./RealEstatePage.css";

const SERVICES = [
  {
    title: "Open House Hosting",
    price: "$150 / 3 hrs",
    desc: "Sign-in management, property walkthroughs, and client concierge for your open house.",
  },
  {
    title: "Field Property Inspections",
    price: "$75–$150",
    desc: "Drive-by, interior, or occupancy checks with detailed photo & video reporting.",
  },
  {
    title: "Listing Photography",
    price: "$100–$350",
    desc: "MLS-ready photos, basic editing, and virtual staging options.",
  },
  {
    title: "Social Media Content Package",
    price: "$150/mo",
    desc: "Custom posts, stories, and ads to showcase your listings & generate leads.",
  },
  {
    title: "Transaction Coordination",
    price: "$300–$500",
    desc: "End-to-end file management from contract to close—avoid missed deadlines.",
  },
  {
    title: "Signing Agent Services",
    price: "$150",
    desc: "Certified loan signings, HELOCs, refinances, and seller/buyer closings.",
  },
  {
    title: "Courier for Docs & Keys",
    price: "$65+",
    desc: "Same-day delivery of earnest money, title docs, keys—rush options available.",
  },
];

export default function RealEstatePage() {
  return (
    <main className="realestate-page">
      <Helmet>
        <title>Real Estate & Broker Services • Dani Declares</title>
        <meta
          name="description"
          content="Mobile closings, property inspections, listing photography, transaction coordination, and more for real estate professionals."
        />
      </Helmet>

      <header className="hero">
        <h1>Real Estate & Broker Services</h1>
        <p>
          Streamline your transactions with on-demand support tailored for agents,
          brokers, and lenders.
        </p>
      </header>

      <section className="services-grid">
        {SERVICES.map((s) => (
          <div key={s.title} className="service-card">
            <h2>{s.title}</h2>
            <p className="meta">{s.price}</p>
            <p className="desc">{s.desc}</p>
            <Link to="/contact" className="btn btn--primary">
              Request Quote
            </Link>
          </div>
        ))}
      </section>

      <section className="cta">
        <p>
          Need a custom combination of services? <br />
          <Link to="/contact" className="btn btn--secondary">
            Contact Us
          </Link>
        </p>
      </section>
    </main>
  );
}
