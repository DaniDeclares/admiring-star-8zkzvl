import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getServiceSections, servicePages } from "../data/services.js";
import { bookingPolicyText } from "../data/serviceRoutes.js";
import "./OfficiantPage.css";

const GALLERY_IMAGES = [
  "barn-ceiling-drapery.jpg",
  "barn-hanging-glass-orbs.jpg",
  "WeddingDress_Hanging_Archway.jpg",
  "rustic-barn-wedding-reception-with-greenery-on-wooden-table.jpg",
  "FloralWedding_Couple_GoldChairs.jpg",
  "LakefrontWedding_CeremonySetup.jpg",
];

export default function OfficiantPage() {
  const sections = getServiceSections(servicePages.weddings);

  return (
    <main className="officiant-page">
      <Helmet>
        <title>Officiant Services • Dani Declares</title>
        <meta
          name="description"
          content="Wedding officiant services including elopements, courthouse-style ceremonies, and custom vows across Georgia and South Carolina."
        />
      </Helmet>

      <section className="officiant-hero">
        <div>
          <p className="eyebrow">Officiant Services</p>
          <h1>Celebrate your story with a personalized ceremony.</h1>
          <p>
            Thoughtful, heartfelt ceremonies for elopements, vow renewals, and
            intimate celebrations.
          </p>
          <div className="officiant-actions">
            <Link to="/book?service=officiant" className="btn btn--primary">
              Book Officiant
            </Link>
            <Link to="/pay?service=officiant" className="btn btn--accent">
              Pay to Confirm
            </Link>
          </div>
          <p className="officiant-policy">{bookingPolicyText}</p>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.id} className="officiant-packages">
          <h2>{section.title}</h2>
          <p>{section.description}</p>
          <div className="packages-grid">
            {section.items.map((pkg) => (
              <div className="package-card" key={pkg.name}>
                <h3>{pkg.name}</h3>
                <p className="package-price">{pkg.price}</p>
                {pkg.details && <p className="package-desc">{pkg.details}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="officiant-gallery">
        <h2>Recent Celebrations</h2>
        <div className="gallery-grid">
          {GALLERY_IMAGES.map((filename) => (
            <div className="gallery-img-wrapper" key={filename}>
              <img
                src={`${process.env.PUBLIC_URL}/images/weddings/${filename}`}
                alt="Officiant ceremony moment"
                className="gallery-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="officiant-trust">
        <div>
          <h2>Why couples choose Dani Declares</h2>
          <ul>
            <li>Licensed, ordained officiant serving GA & SC.</li>
            <li>Custom scripts and vow support.</li>
            <li>Flexible scheduling for intimate gatherings.</li>
          </ul>
        </div>
        <div className="trust-card">
          <h3>Let’s plan your ceremony</h3>
          <p>
            Share your vision and we will tailor the ceremony to fit your style.
          </p>
          <Link to="/contact" className="btn btn--secondary">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
