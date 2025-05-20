import React from "react";
import { Link } from "react-router-dom";
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
import "./FestivalPage.css";

export default function FestivalPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="festival-page">
        <h1>Declare Your Worth Festival</h1>
        <p>July 28–29, 2025 • Luxury experiences, empowerment workshops & more.</p>
        <a
          href="https://tidycal.com/danideclaresns/early-bird-festival"
          className="btn btn--primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Reserve Your Early-Bird Spot
        </a>
        <p className="festival-support">
          Or <Link to="/shop">shop our merch</Link> and support the cause now!
        </p>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
