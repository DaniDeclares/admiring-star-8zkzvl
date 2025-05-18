import React from "react";

// site chrome
import FestivalBanner from "../components/FestivalBanner";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent";
import "../components/CookieConsent.css";
import Footer from "../components/Footer";
import "../components/Footer.css";

// gallery component
import WeddingsGallery from "../components/WeddingsGallery";
import "../components/WeddingsGallery.css";

// page styles
import "./WeddingsPage.css";

const PACKAGES = [
  {
    id: "crowned-in-love",
    name: "Crowned in Love",
    price: "$75,000",
    desc: "Full-service planning + concierge for 150–200 guests.",
  },
  {
    id: "the-opulent-weekend",
    name: "The Opulent Weekend",
    price: "$95,000",
    desc: "3-day destination experience for 50–100 guests.",
  },
  {
    id: "eternally-yours",
    name: "Eternally Yours",
    price: "Starting at $125,000",
    desc: "Fully bespoke luxury wedding experience.",
  },
];

export default function WeddingsPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="page weddings-page">
        <header className="weddings-hero">
          <h1>Weddings by Dani Declares</h1>
          <p>
            From intimate elopements to grand celebrations—luxury planning
            tailored to your vision.
          </p>
          <a
            href="https://tidycal.com/danideclaresns/30-minute-meeting?service=wedding"
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a Planning Consult
          </a>
        </header>

        <section className="package-list">
          {PACKAGES.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <h2>{pkg.name}</h2>
              <div className="package-price">{pkg.price}</div>
              <p className="package-desc">{pkg.desc}</p>
              <a
                href={`/packages#${pkg.id}`}
                className="btn btn--secondary"
              >
                View Details
              </a>
            </div>
          ))}
        </section>

        <section className="gallery-section">
          <h2>Our Work</h2>
          <WeddingsGallery />
        </section>

        <section className="why-choose">
          <h2>Why Choose Dani Declares?</h2>
          <ul>
            <li>Personalized design & full creative production</li>
            <li>White-glove concierge & on-site coordination</li>
            <li>Luxury vendor management & contract negotiation</li>
            <li>Financial planning consult & custom wedding website</li>
          </ul>
        </section>

        <section className="cta-final">
          <p>Ready to craft your dream wedding?</p>
          <a
            href="https://tidycal.com/danideclaresns/30-minute-meeting?service=wedding"
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Schedule Your Consultation
          </a>
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
