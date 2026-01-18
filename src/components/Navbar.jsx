import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import logoSeal from "../assets/logo/logo-gold-seal.png";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand" onClick={handleLinkClick}>
        <img src={logoSeal} alt="Dani Declares" className="navbar-logo" />
        <span className="navbar-title">Dani Declares</span>
      </NavLink>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((open) => !open)}
      >
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <NavLink
          to="/"
          className="nav-link"
          onClick={handleLinkClick}
        >
          Home
        </NavLink>
        <NavLink
          to="/services"
          className="nav-link"
          onClick={handleLinkClick}
        >
          Services
        </NavLink>
        <NavLink
          to="/apostille"
          className="nav-link"
          onClick={handleLinkClick}
        >
          Apostille
        </NavLink>
        <NavLink
          to="/officiant"
          className="nav-link"
          onClick={handleLinkClick}
        >
          Officiant
        </NavLink>
        <NavLink
          to="/book"
          className="nav-link"
          onClick={handleLinkClick}
        >
          Book
        </NavLink>
        <NavLink
          to="/contact"
          className="nav-link"
          onClick={handleLinkClick}
        >
          Contact
        </NavLink>
      </div>

      <div className="navbar-cta">
        <NavLink to="/book?service=notary" className="btn btn--primary">
          Book Notary
        </NavLink>
      </div>
    </nav>
  );
}
