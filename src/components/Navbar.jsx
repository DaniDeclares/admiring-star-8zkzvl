import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSeal from "../assets/logo/logo-gold-seal.png";
import "./Navbar.css";

const BOOKING_URL = "https://tidycal.com/danideclaresns";
const PAYMENT_URL = "https://buy.stripe.com/aFa5kC9q18CW2LBb9f6kg01";
const PHONE_NUMBER = "(470) 523-4892";
const PHONE_LINK = "tel:+14705234892";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={handleLinkClick}>
          <img src={logoSeal} alt="Dani Declares Logo" className="navbar-logo" />
        </Link>
      </div>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link
          to="/"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/services"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}
        >
          Services
        </Link>
        <Link
          to="/pricing"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/pricing" ? "active" : ""}`}
        >
          Pricing
        </Link>
        <a
          href={BOOKING_URL}
          className="btn btn--primary nav-cta"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
        >
          Book Now
        </a>
        <a
          href={PAYMENT_URL}
          className="btn btn--secondary nav-cta"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
        >
          Pay
        </a>
        <Link
          to="/contact"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
        >
          Contact
        </Link>
      </div>

      <a className="navbar-phone" href={PHONE_LINK} aria-label={`Call ${PHONE_NUMBER}`}>
        {PHONE_NUMBER}
      </a>
    </nav>
  );
}
