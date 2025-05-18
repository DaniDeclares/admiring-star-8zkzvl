// src/pages/CoachingPage.jsx
import React, { useState } from "react";

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

// PayPal button component
import PayPalButton from "../components/PayPalButton";
import "../components/PayPalButton.css";

// page styles
import "./CoachingPage.css";

const PACKAGES = [
  {
    name: "Discovery Session",
    duration: "30 mins",
    price: 99,
    tidycalUrl: "https://tidycal.com/danideclaresns/discovery-session",
  },
  {
    name: "1:1 Coaching Package",
    duration: "4×1-hr sessions",
    price: 499,
    tidycalUrl: "https://tidycal.com/danideclaresns/1-1-package",
  },
  {
    name: "VIP Intensive",
    duration: "6 hrs",
    price: 1200,
    tidycalUrl: "https://tidycal.com/danideclaresns/vip-intensive",
  },
];

export default function CoachingPage() {
  // track which packages have been paid for
  const [paidPackages, setPaidPackages] = useState({});

  const handlePaid = (pkgName) => {
    setPaidPackages((prev) => ({ ...prev, [pkgName]: true }));
    // TODO: also notify you (e.g. webhook, email) about the purchase
  };

  return (
    <>
      {/* top banner + nav */}
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
                <p className="meta">
                  {p.duration} • <strong>${p.price}</strong>
                </p>

                {/* PayPal pay button */}
                <PayPalButton price={p.price} onSuccess={() => handlePaid(p.name)} />

                {/* Only enable booking once paid */}
                <a
                  href={paidPackages[p.name] ? p.tidycalUrl : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn--book ${!paidPackages[p.name] ? "btn--disabled" : ""}`}
                  onClick={(e) => {
                    if (!paidPackages[p.name]) e.preventDefault();
                  }}
                >
                  {paidPackages[p.name] ? "Book Your Session" : "Pay First to Book"}
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

      {/* footer chrome */}
      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
