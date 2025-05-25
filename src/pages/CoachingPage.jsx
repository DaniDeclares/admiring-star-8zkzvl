import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import FestivalBanner from "../components/FestivalBanner.jsx";
import Navbar from "../components/Navbar.jsx";
import SocialLinks from "../components/SocialLinks.jsx";
import CookieConsent from "../components/CookieConsent.jsx";
import Footer from "../components/Footer.jsx";
import PayPalButton from "../components/PayPalButton.jsx";
import HubSpotForm from "../components/HubSpotForm.jsx";

import "./CoachingPage.css";

const PACKAGES = [
  { name: "Discovery Session", duration: "30 mins", price: 99, url: "https://tidycal.com/danideclaresns/discovery-session" },
  { name: "1:1 Coaching", duration: "4×1 hr sessions", price: 499, url: "https://tidycal.com/danideclaresns/1-1-package" },
  { name: "VIP Intensive", duration: "6 hrs", price: 1200, url: "https://tidycal.com/danideclaresns/vip-intensive" },
];

export default function CoachingPage() {
  return (
    <>
      <Helmet>
        <title>Coaching • Dani Declares</title>
        <meta name="description" content="Book a session with Dani to unlock confidence, cash flow, and clarity." />
      </Helmet>

      <FestivalBanner />
      <Navbar />

      <main className="coaching-page">
        <header className="coaching-hero">
          <h1>Ready to Declare Your Worth?</h1>
          <p>Let’s build the clarity, confidence, and cash flow you’ve been waiting for.</p>
          <Link to="https://tidycal.com/danideclaresns" target="_blank" className="btn btn--primary">
            Book Your Free Coaching Intro
          </Link>
        </header>

        <section className="testimonial-carousel">
          <h2>Client Breakthroughs</h2>
          <div className="carousel">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="testimonial-slide">
                <p>“Dani helped me unlock my power and profit — I’m finally building the life I want.”</p>
                <span>— Coaching Client {n}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="packages">
          <h2>Your Coaching Options</h2>
          <div className="packages-grid">
            {PACKAGES.map((p) => (
              <div key={p.name} className="package-card">
                <h3>{p.name}</h3>
                <p className="meta">{p.duration} • <strong>${p.price}</strong></p>
                <PayPalButton price={p.price} />
                <a href={p.url} className="btn btn--book" target="_blank" rel="noopener noreferrer">
                  Book Session
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="benefits">
          <h2>What You’ll Walk Away With</h2>
          <ul>
            <li>💡 Clarity on your next move</li>
            <li>📈 Strategy for growth</li>
            <li>🎯 Accountability to take action</li>
            <li>💬 Real-time mindset shifts</li>
          </ul>
        </section>

        <section className="coaching-contact">
          <h2>Still Have Questions?</h2>
          <p>Drop your email and we’ll follow up with a personalized response:</p>
          <HubSpotForm />
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
