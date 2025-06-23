// src/components/WeddingsPage.jsx
import React from "react";
import "./WeddingsPage.css";

const packages = [
  {
    title: "Simple Vows",
    price: "$199",
    description: "A short and sweet ceremony with just the essentials. Perfect for elopements or vow renewals.",
    link: "https://buy.stripe.com/7sIg2M4WldBMd1G9AA",
  },
  {
    title: "Courthouse-Style Wedding",
    price: "$499",
    description: "A professional, stylish alternative to the courthouse. Includes ceremony script, signing, and planning support.",
    link: "https://buy.stripe.com/fZeaG9feF5eAd1GcMO",
  },
  {
    title: "Intimate All-Inclusive Wedding",
    price: "$1,499",
    description: "Includes venue, décor, music, photos, and ceremony. Ideal for up to 25 guests.",
    link: "https://buy.stripe.com/bIY9CUeE9fYgd1GbIK",
  },
  {
    title: "Reception Only Package",
    price: "$2,500+",
    description: "Already married? Celebrate with style. Includes venue, catering coordination, décor, DJ, and guest flow support.",
    link: "https://buy.stripe.com/5kAeXfcYv9Yg0Ra3cd",
  },
  {
    title: "Full-Service Wedding Planning",
    price: "$4,999",
    description: "From concept to cleanup. Venue scouting, vendor management, timeline creation, and coordination included.",
    link: "https://buy.stripe.com/5kA6ph0A91jUcLu4gl",
  },
  {
    title: "Premium All-Inclusive Wedding",
    price: "$10,000+",
    description: "Complete wedding experience — venue, catering, décor, entertainment, and a personal planning team. Perfect for larger guest counts or destination-style events.",
    link: "https://buy.stripe.com/fZe9CU2A9eYg5cY3cd",
  },
];

const images = [
  // ... your existing image list remains unchanged
  "barn-ceiling-drapery.jpg",
  "barn-hanging-glass-orbs.jpg",
  // (truncated for brevity)
  "wooden-coffee-table.jpg",
];

export default function WeddingsPage() {
  return (
    <div className="weddings-page">
      <div className="weddings-hero">
        <h1>Weddings by Dani Declares</h1>
        <p>Explore our signature wedding packages designed to match every style, size, and story.</p>
        <a
          className="btn--primary"
          href="https://danideclares.com/contact"
        >
          Book a Consultation
        </a>
      </div>

      <div className="package-list">
        {packages.map((pkg, index) => (
          <div className="package-card" key={index}>
            <h2>{pkg.title}</h2>
            <p className="package-price">{pkg.price}</p>
            <p className="package-desc">{pkg.description}</p>
            <a
              className="btn--secondary"
              href={pkg.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Now
            </a>
          </div>
        ))}
      </div>

      <div className="gallery-section">
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
      </div>

      <div className="why-choose">
        <h2>Why Choose Dani Declares?</h2>
        <ul>
          <li>Ordained, experienced, and deeply connected to Georgia’s wedding scene</li>
          <li>Seamless vendor coordination and timeline management</li>
          <li>Flexible packages for any budget — from elopements to grand affairs</li>
          <li>Warm, professional, and fully personalized planning support</li>
        </ul>
      </div>

      <div className="cta-final">
        <p>Let’s bring your vision to life — stylishly, stress-free, and on your terms.</p>
        <a
          className="btn--primary"
          href="https://danideclares.com/contact"
        >
          Start Planning Today
        </a>
      </div>
    </div>
  );
}
