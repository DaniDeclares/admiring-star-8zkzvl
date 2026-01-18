import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getServiceSections, servicePages } from "../data/services.js";
import { bookingPolicyText } from "../data/serviceRoutes.js";
import "./ApostillePage.css";

export default function ApostillePage() {
  const sections = getServiceSections(servicePages.notary).filter(
    (section) => section.id === "apostille"
  );

  return (
    <main className="apostille-page">
      <Helmet>
        <title>Apostille Services • Dani Declares</title>
        <meta
          name="description"
          content="Apostille intake and facilitation services for domestic and international documents."
        />
      </Helmet>

      <section className="apostille-hero">
        <h1>Apostille Facilitation</h1>
        <p>
          We handle document intake, submission, and updates so you can focus on
          what matters most.
        </p>
        <div className="apostille-actions">
          <Link to="/book?service=apostille" className="btn btn--primary">
            Book Apostille Intake
          </Link>
          <Link to="/pay?service=apostille" className="btn btn--accent">
            Pay to Confirm
          </Link>
        </div>
        <p className="apostille-policy">{bookingPolicyText}</p>
      </section>

      {sections.map((section) => (
        <section key={section.id} className="apostille-pricing">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
          <div className="pricing-grid">
            {section.items.map((item) => (
              <div key={item.name} className="pricing-card">
                <h3>{item.name}</h3>
                <p className="price">{item.price}</p>
                {item.details && <p>{item.details}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="apostille-details">
        <div>
          <h2>What to expect</h2>
          <ul>
            <li>Secure document intake and checklist.</li>
            <li>Status updates throughout the process.</li>
            <li>Return delivery options across GA/SC.</li>
          </ul>
        </div>
        <div className="details-card">
          <h3>Need help fast?</h3>
          <p>
            Tell us your deadline and we will confirm the fastest available
            turnaround.
          </p>
          <Link to="/contact" className="btn btn--secondary">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
