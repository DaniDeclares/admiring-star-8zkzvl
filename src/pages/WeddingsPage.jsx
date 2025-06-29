import React from "react";
import { Helmet } from "react-helmet-async";
import "./WeddingsPage.css";

const packages = [
  {
    title: "Simple Vows",
    price: "$199",
    description: "Short and sweet legal ceremony. Perfect for elopements or vow renewals. Officiant and filing included.",
    link: "https://buy.stripe.com/7sIg2M4WldBMd1G9AA",
  },
  {
    title: "Courthouse-Style Wedding",
    price: "$499",
    description: "Skip the courthouse! A professional, styled ceremony with script, filing, and on-location service.",
    link: "https://buy.stripe.com/fZeaG9feF5eAd1GcMO",
  },
  {
    title: "Intimate All-Inclusive Wedding",
    price: "$1,499",
    description: "Venue, decor, music, photos, and officiant—all bundled for up to 25 guests. Stress-free & budget-friendly.",
    link: "https://buy.stripe.com/bIY9CUeE9fYgd1GbIK",
  },
  {
    title: "Reception Only Package",
    price: "$2,500+",
    description: "Already married? Let’s party! Includes venue, decor, food coordination, DJ, and guest flow support.",
    link: "https://buy.stripe.com/5kAeXfcYv9Yg0Ra3cd",
  },
  {
    title: "Full-Service Wedding Planning",
    price: "$4,999",
    description: "From venue scouting to day-of coordination. Full-service planning with vendor management and timeline creation.",
    link: "https://buy.stripe.com/5kA6ph0A91jUcLu4gl",
  },
  {
    title: "Premium All-Inclusive Wedding",
    price: "$10,000+",
    description: "The total package: venue, catering, decor, entertainment, guest logistics, and full planning team for large or destination-style weddings.",
    link: "https://buy.stripe.com/fZe9CU2A9eYg5cY3cd",
  },
];

const images = [
  "barn-ceiling-drapery.jpg",
  "barn-hanging-glass-orbs.jpg",
  "wedding-arch-decor.jpg",
  "rustic-reception-table.jpg",
  "floral-aisle-runner.jpg",
  "outdoor-vows.jpg",
  "bride-first-look.jpg",
  "ceremony-candlelight.jpg",
  "wooden-coffee-table.jpg",
];

export default function WeddingsPage() {
  return (
    <div className="weddings-page">
      <Helmet>
        <title>Wedding Officiant, Planning & Packages • Dani Declares</title>
        <meta
          name="description"
          content="Affordable, stylish wedding packages in Georgia. Officiant, full planning, pop-up elopements, receptions & destination weddings. Book online now."
        />
      </Helmet>

      <header className="weddings-hero">
        <h1>Weddings by Dani Declares</h1>
        <p>
          Stylish, affordable, and stress-free. Whether you want to elope or host a full reception—Dani’s got you.
        </p>
        <a className="btn btn--primary" href="https://danideclares.com/contact">
          Book Your Free Wedding Call
        </a>
      </header>

      <section className="package-list">
        {packages.map((pkg, index) => (
          <div className="package-card" key={index}>
            <h2>{pkg.title}</h2>
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
      </section>

      <section className="gallery-section">
        <h2>Real Weddings & Inspiration</h2>
        <div className="gallery-grid">
          {images.map((img, i) => (
            <div className="gallery-img-wrapper" key={i}>
              <img
                src={`/images/weddings/${img}`}
                alt={`Wedding gallery photo ${i + 1}`}
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
          <li>Licensed & Ordained Wedding Officiant (Serving all of Georgia)</li>
          <li>Pop-up and destination packages for any budget</li>
          <li>Vendor coordination, guest flow, and timeline planning included in full-service packages</li>
          <li>Flexible payment options with instant online booking</li>
          <li>Specialized in intimate, creative, and multicultural weddings</li>
        </ul>
      </section>

      <section className="cta-final">
        <p>Let’s create a wedding day that reflects your love and your story. Easy. Affordable. Unforgettable.</p>
        <a className="btn btn--primary" href="https://danideclares.com/contact">
          Start Planning Today
        </a>
      </section>
    </div>
  );
}
