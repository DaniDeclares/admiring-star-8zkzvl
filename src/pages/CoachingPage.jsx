import React, { useState } from "react";

// Chrome
import FestivalBanner from "../components/FestivalBanner.jsx";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar.jsx";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks.jsx";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent.jsx";
import "../components/CookieConsent.css";
import Footer from "../components/Footer.jsx";
import "../components/Footer.css";

// HubSpot embed
import HubSpotForm from "../components/HubSpotForm.jsx";

// PayPal
import PayPalButton from "../components/PayPalButton.jsx";
import "../components/PayPalButton.css";

// Styles
import "./CoachingPage.css";

const PACKAGES = [
  { name: "Discovery Session", duration: "30 mins", price: 99, url: "https://tidycal.com/danideclaresns/discovery-session" },
  { name: "1:1 Coaching", duration: "4×1 hr sessions", price: 499, url: "https://tidycal.com/danideclaresns/1-1-package" },
  { name: "VIP Intensive", duration: "6 hrs", price: 1200, url: "https://tidycal.com/danideclaresns/vip-intensive" },
];

export default function CoachingPage() {
  const [paid, setPaid] = useState({});

  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="coaching-page">
        <header className="coaching-hero">
          <h1>Coaching & Business Support</h1>
          <p>Empowering you with clarity, confidence, and actionable strategy.</p>
        </header>

        <section className="packages">
          <h2>Your Coaching Options</h2>
          <div className="packages-grid">
            {PACKAGES.map((p) => (
              <div key={p.name} className="package-card">
                <h3>{p.name}</h3>
                <p className="meta">{p.duration} • <strong>${p.price}</strong></p>
                <PayPalButton
                  price={p.price}
                  onSuccess={() => setPaid((prev) => ({ ...prev, [p.name]: true }))}
                />
                <a
                  href={p.url}
                  className={`btn btn--book ${paid[p.name] ? "" : "disabled"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {paid[p.name] ? "Book Your Session" : "Pay First to Book"}
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="benefits">
          <h2>What You’ll Learn</h2>
          <ul>
            <li>Daily rituals for unstoppable confidence</li>
            <li>Step-by-step goal-setting framework</li>
            <li>Strategies to launch or scale your side hustle</li>
            <li>Money-mindset shifts for financial growth</li>
          </ul>
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
