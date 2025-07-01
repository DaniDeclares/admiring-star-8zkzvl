// src/pages/WeddingsPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import "./WeddingsPage.css";

// import your gallery images via Webpack
import barnCeiling from "../assets/weddings/barn-ceiling-drapery.jpg";
import barnOrbs from "../assets/weddings/barn-hanging-glass-orbs.jpg";
import dressArchway from "../assets/weddings/WeddingDress_Hanging_Archway.jpg";
import rusticReception from "../assets/weddings/rustic-barn-wedding-reception-with-greenery-on-wooden-table.jpg";
import floralCouple from "../assets/weddings/FloralWedding_Couple_GoldChairs.jpg";
import lakefrontSetup from "../assets/weddings/LakefrontWedding_CeremonySetup.jpg";
import bridePrep from "../assets/weddings/Bride_Mom_Veil_Prep.jpg";
import vintageCar from "../assets/weddings/VintageCar_BrideGroom_BouquetKiss.jpg";
import coffeeTable from "../assets/weddings/wooden-coffee-table.jpg";

// constants for reuse
const CONTACT_URL = "https://danideclares.com/contact";
const HEADER_CTA_TEXT = "Book Your Free Wedding Call";
const FINAL_CTA_TEXT = "Start Planning Today";

// Core wedding packages
const PACKAGES = [
  /* ...same as before... */
  {
    title: "Simple Vows",
    price: "$199",
    description:
      "Short and sweet legal ceremony. Perfect for elopements or vow renewals. Officiant & filing included.",
    link: "https://buy.stripe.com/7sIg2M4WldBMd1G9AA",
  },
  {
    title: "Courthouse-Style Wedding",
    price: "$499",
    description:
      "Skip the courthouse! A professional, styled ceremony with script, filing, and on-location service.",
    link: "https://buy.stripe.com/fZeaG9feF5eAd1GcMO",
  },
  {
    title: "Intimate All-Inclusive Wedding",
    price: "$1,499",
    description:
      "Venue, decor, music, photos, and officiant—all bundled for up to 25 guests. Stress-free & budget-friendly.",
    link: "https://buy.stripe.com/bIY9CUeE9fYgd1GbIK",
  },
  {
    title: "Reception-Only Package",
    price: "$2,500+",
    description:
      "Already married? Let’s party! Includes venue, decor, food coordination, DJ, and guest flow support.",
    link: "https://buy.stripe.com/5kAeXfcYv9Yg0Ra3cd",
  },
  {
    title: "Full-Service Planning",
    price: "$4,999",
    description:
      "From venue scouting to day-of coordination. Full-service planning with vendor management and timeline creation.",
    link: "https://buy.stripe.com/5kA6ph0A91jUcLu4gl",
  },
  {
    title: "Premium All-Inclusive Wedding",
    price: "$10,000+",
    description:
      "The total package: venue, catering, decor, entertainment, guest logistics, and full planning team for large or destination weddings.",
    link: "https://buy.stripe.com/fZe9CU2A9eYg5cY3cd",
  },
];

// Gallery images array of objects
const GALLERY = [
  { src: barnCeiling, alt: "Barn ceiling drapery" },
  { src: barnOrbs, alt: "Hanging glass orbs in barn" },
  { src: dressArchway, alt: "Wedding dress hanging in archway" },
  { src: rusticReception, alt: "Rustic barn reception with greenery" },
  { src: floralCouple, alt: "Couple seated on gold chairs with florals" },
  { src: lakefrontSetup, alt: "Lakefront wedding ceremony setup" },
  { src: bridePrep, alt: "Bride and mom preparing veil" },
  { src: vintageCar, alt: "Bride and groom kissing by vintage car" },
  { src: coffeeTable, alt: "Wooden coffee table decor" },
];

export default function WeddingsPage() {
  return (
    <main className="weddings-page">
      <Helmet>
        <title>Wedding Officiant, Planning & Packages • Dani Declares</title>
        <meta
          name="description"
          content="Affordable, stylish wedding packages in Georgia. Officiant, planning, add-ons, and bundles. Book online now."
        />
      </Helmet>

      <header className="weddings-hero">
        <h1>Weddings by Dani Declares</h1>
        <p>Stylish, affordable, and stress-free ceremonies & receptions across Georgia.</p>
        <a className="btn btn--primary" href={CONTACT_URL}>
          {HEADER_CTA_TEXT}
        </a>
      </header>

      <section className="package-list">
        <h2>Core Wedding Packages</h2>
        <div className="packages-grid">
          {PACKAGES.map((pkg) => (
            <div className="package-card" key={pkg.title}>
              <h3>{pkg.title}</h3>
              <p className="package-price">{pkg.price}</p>
              <p className="package-desc">{pkg.description}</p>
              <a
                className="btn btn--secondary"
                href={pkg.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reserve This Package
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="gallery-section">
        <h2>Real Weddings & Inspiration</h2>
        <div className="gallery-grid">
          {GALLERY.map(({ src, alt }) => (
            <div className="gallery-img-wrapper" key={alt}>
              <img src={src} alt={alt} className="gallery-img" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="why-choose">
        <h2>Why Choose Dani Declares?</h2>
        <ul>
          <li>Licensed & ordained officiant serving all of Georgia</li>
          <li>Pop-up and destination packages for any budget</li>
          <li>Rehearsal coordination, decor setup, and vendor liaison</li>
          <li>Flexible payment options with instant online booking</li>
          <li>Specialized in intimate, creative, and multicultural ceremonies</li>
        </ul>
      </section>

      <section className="cta-final">
        <p>
          Let’s create a wedding day that reflects your love and your story.
          Easy. Affordable. Unforgettable.
        </p>
        <a className="btn btn--primary" href={CONTACT_URL}>
          {FINAL_CTA_TEXT}
        </a>
      </section>
    </main>
  );
}
