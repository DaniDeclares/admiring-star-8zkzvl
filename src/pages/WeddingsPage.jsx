// src/pages/WeddingsPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { getServiceSections, servicePages } from "../data/services.js";
import TravelFeesBlock from "../components/TravelFeesBlock.jsx";
import ServiceCta from "../components/ServiceCta.jsx";
import "./WeddingsPage.css";

// These filenames must live under public/images/weddings/
const GALLERY_IMAGES = [
  "barn-ceiling-drapery.jpg",
  "barn-hanging-glass-orbs.jpg",
  "WeddingDress_Hanging_Archway.jpg",
  "rustic-barn-wedding-reception-with-greenery-on-wooden-table.jpg",
  "FloralWedding_Couple_GoldChairs.jpg",
  "LakefrontWedding_CeremonySetup.jpg",
  "Bride_Mom_Veil_Prep.jpg",
  "VintageCar_BrideGroom_BouquetKiss.jpg",
  "wooden-coffee-table.jpg",
];

export default function WeddingsPage() {
  const sections = getServiceSections(servicePages.weddings);

  return (
    <main className="weddings-page">
      <Helmet>
        <title>Officiant Services • Dani Declares</title>
        <meta
          name="description"
          content="Wedding officiant services including elopements, courthouse-style ceremonies, and custom ceremonies with clear pricing."
        />
      </Helmet>

      <header className="weddings-hero">
        <h1>Officiant Services</h1>
        <p>Thoughtful, personalized ceremonies across Georgia.</p>
      </header>

      {sections.map((section) => (
        <section key={section.id} className="package-list">
          <h2>{section.title}</h2>
          <p className="section-desc">{section.description}</p>
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

      <TravelFeesBlock />

      <section className="gallery-section">
        <h2>Real Weddings & Inspiration</h2>
        <div className="gallery-grid">
          {GALLERY_IMAGES.map((filename) => (
            <div className="gallery-img-wrapper" key={filename}>
              <img
                src={`${process.env.PUBLIC_URL}/images/weddings/${filename}`}
                alt={`Wedding inspiration ${filename}`}
                className="gallery-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="why-choose">
        <h2>Why Choose Dani Declares?</h2>
        <ul>
          <li>Licensed & ordained officiant serving all of Georgia</li>
          <li>Pop-up and destination ceremonies for any budget</li>
          <li>Rehearsal coordination, decor setup, and vendor liaison</li>
          <li>Flexible payment options with instant online booking</li>
          <li>Specialized in intimate, creative, and multicultural ceremonies</li>
        </ul>
      </section>

      <ServiceCta
        serviceId="officiant_deposit"
        bookingLabel="Book Officiant Consultation"
      />
    </main>
  );
}
