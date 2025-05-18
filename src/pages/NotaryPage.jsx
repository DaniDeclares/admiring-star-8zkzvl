import React from "react";

// Chrome
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

// Styles
import "./NotaryPage.css";

const SERVICES = [
  {
    title: "Mobile Notary Visit",
    duration: "per notarial act",
    price: "$75",
    desc: "On-site notarizations at your home, office, or event — we come to you.",
  },
  {
    title: "Apostille Assistance",
    duration: "30 mins",
    price: "$250",
    desc: "Handle apostille filings for documents destined abroad.",
  },
  {
    title: "Fingerprinting",
    duration: "per session",
    price: "$50",
    desc: "FD-258 ink fingerprinting cards for background checks.",
  },
  {
    title: "Loan Signing Appointment",
    duration: "1 hr",
    price: "$100",
    desc: "Certified signing agent for refinance, HELOC, purchase closings.",
  },
  {
    title: "Notary + Financial Wellness",
    duration: "1 hr",
    price: "$135",
    desc: "Bundle notary with expert financial coaching.",
  },
];

export default function NotaryPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <div className="notary-page">
        <h1 className="page-title">Notary & Apostille Services</h1>
        <p className="page-subtitle">
          Convenient, certified, and trusted by Georgia professionals.
        </p>

        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card">
              <h2>{s.title}</h2>
              <p className="meta">{s.duration} | {s.price}</p>
              <p className="desc">{s.desc}</p>
              <a
                href="https://tidycal.com/danideclaresns"
                className="cta-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Now
              </a>
            </div>
          ))}
        </div>

        <section className="contact-info">
          <h3>Questions?</h3>
          <p>
            Email <a href="mailto:danideclaresns@gmail.com">danideclaresns@gmail.com</a> or
            call <a href="tel:+14705324892">(470) 523-4892</a>.
          </p>
        </section>
      </div>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
