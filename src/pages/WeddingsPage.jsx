import React from "react";
import { Helmet } from "react-helmet-async";
import "./WeddingsPage.css";

// Core wedding packages
const PACKAGES = [
  {
    title: "Simple Vows",
    price: "$199",
    description: "Short and sweet legal ceremony. Perfect for elopements or vow renewals. Officiant & filing included.",
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
    title: "Reception-Only Package",
    price: "$2,500+",
    description: "Already married? Let’s party! Includes venue, decor, food coordination, DJ, and guest flow support.",
    link: "https://buy.stripe.com/5kAeXfcYv9Yg0Ra3cd",
  },
  {
    title: "Full-Service Planning",
    price: "$4,999",
    description: "From venue scouting to day-of coordination. Full-service planning with vendor management and timeline creation.",
    link: "https://buy.stripe.com/5kA6ph0A91jUcLu4gl",
  },
  {
    title: "Premium All-Inclusive Wedding",
    price: "$10,000+",
    description: "The total package: venue, catering, decor, entertainment, guest logistics, and full planning team for large or destination weddings.",
    link: "https://buy.stripe.com/fZe9CU2A9eYg5cY3cd",
  },
];

// Popular add-ons
const ADDONS = [
  { title: "Rehearsal Coordination Add-On", price: "$150", description: "Pre-ceremony walkthrough and coordination for smooth execution.", bookUrl: "https://tidycal.com/danideclaresns/rehearsal-coordination" },
  { title: "Bouquet & Boutonniere", price: "$125", description: "Fresh florals for bride and groom—bouquet & boutonniere.", bookUrl: "https://tidycal.com/danideclaresns/flowers" },
  { title: "Photography Add-On (1 hr)", price: "$250", description: "Professional photographer for one hour of your ceremony.", bookUrl: "https://tidycal.com/danideclaresns/photography" },
  { title: "Live Streaming Add-On", price: "$399", description: "Stream your ceremony live for virtual guests.", bookUrl: "https://tidycal.com/danideclaresns/live-stream" },
  { title: "Ceremony Script Customization", price: "$50", description: "Fully personalized ceremony script tailored to your story.", bookUrl: "https://tidycal.com/danideclaresns/script" },
];

// Bundled deals
const BUNDLES = [
  { title: "Wedding Essentials Bundle", price: "$1,650", description: "Intimate All-Inclusive + Photography Add-On + Bouquet & Boutonniere.", link: "https://buy.stripe.com/essentials-bundle" },
  { title: "I Do & Done Micro-Wedding Bundle", price: "$799", description: "Simple Vows + Decor Setup + Photography + Filing.", link: "https://buy.stripe.com/micro-wedding-bundle" },
];

export default function WeddingsPage() {
  return (
    <div className="weddings-page">
      <Helmet>
        <title>Wedding Officiant, Planning & Packages • Dani Declares</title>
        <meta
          name="description"
          content="Affordable, stylish wedding packages in Georgia. Officiant, planning, add-ons, and bundles. Book online now."
        />
      </Helmet>

      <header className="weddings-hero">
        <h1>Weddings by Dani Declares</h1>
        <p>
          Stylish, affordable, and stress-free ceremonies & receptions across Georgia.
        </p>
        <a className="btn btn--primary" href="https://danideclares.com/contact">
          Book Your Free Wedding Call
        </a>
      </header>

      <section className="package-list">
        <h2>Core Wedding Packages</h2>
        {PACKAGES.map((pkg, idx) => (
          <div className="package-card" key={idx}>
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

      <section className="addons-section">
        <h2>Popular Add-Ons</h2>
        <div className="addons-grid">
          {ADDONS.map((add, i) => (
            <div className="addon-card" key={i}>
              <h3>{add.title}</h3>
              <p className="addon-price">{add.price}</p>
              <p className="addon-desc">{add.description}</p>
              <a
                className="btn btn--primary"
                href={add.bookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add On
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="bundles-section">
        <h2>Special Bundles</h2>
        <div className="bundles-grid">
          {BUNDLES.map((b, i) => (
            <div className="bundle-card" key={i}>
              <h3>{b.title}</h3>
              <p className="bundle-price">{b.price}</p>
              <p className="bundle-desc">{b.description}</p>
              <a
                className="btn btn--secondary"
                href={b.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reserve Bundle
              </a>
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
        <a className="btn btn--primary" href="https://danideclares.com/contact">
          Start Planning Today
        </a>
      </section>
    </div>
  );
}
