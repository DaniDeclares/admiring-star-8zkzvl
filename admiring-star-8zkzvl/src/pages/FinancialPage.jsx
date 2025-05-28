import React from "react";

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

// Styles
import "./FinancialPage.css";

export default function FinancialPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="financial-page">
        <header className="financial-hero">
          <h1>Financial Empowerment</h1>
          <p>Helping you build wealth, protect your legacy, and declare your worth.</p>
        </header>

        <section className="insurance-cta">
          <h2>Get Your Free Life Insurance Quote</h2>
          <p>
            As a licensed financial professional with Primerica, I provide
            no-obligation quotes tailored to your family’s goals and budget.
          </p>
          <a
            href="https://tidycal.com/danideclaresns/15-minute-insurance"
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Your Insurance Consult
          </a>
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
