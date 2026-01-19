import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import logoSeal from "../assets/logo/logo-gold-seal.png";
import "./Navbar.css";

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
          to="/tax-services"
          onClick={handleLinkClick}
          className={`nav-link ${
            location.pathname === "/tax-services" ? "active" : ""
          }`}
        >
          Tax Season
        </Link>
        <Link
          to="/federal-services"
          onClick={handleLinkClick}
          className={`nav-link ${
            location.pathname === "/federal-services" ? "active" : ""
          }`}
        >
          Federal
        </Link>
        <Link
          to="/apostille"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/apostille" ? "active" : ""}`}
        >
          Apostille
        </Link>
        <Link
          to="/book"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/book" ? "active" : ""}`}
        >
          Book
        </Link>
        <Link
          to="/contact"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
        >
          Contact
        </Link>
      </div>

      <Link
        to="/book?service=notary"
        className="btn btn--primary book-btn"
        onClick={handleLinkClick}
      >
        Book Notary
      </Link>
    </nav>
  );
}
