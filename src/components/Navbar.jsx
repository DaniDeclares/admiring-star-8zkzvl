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
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="dd-navbar" aria-label="Main navigation">
      <div className="dd-navbar-inner">
        <Link to="/" className="dd-navbar-logo" onClick={handleLinkClick}>
          <img src={logoSeal} alt="Dani Declares LLC" />
          <span>Dani Declares</span>
        </Link>
        <ul className="dd-nav-links" role="list">
          <li><Link to="/" className={isActive("/") ? "active" : ""} onClick={handleLinkClick}>Home</Link></li>
          <li><Link to="/field-services" className={isActive("/field-services") ? "active" : ""} onClick={handleLinkClick}>Field Services</Link></li>
          <li><Link to="/events" className={isActive("/events") ? "active" : ""} onClick={handleLinkClick}>Events</Link></li>
          <li><Link to="/services" className={isActive("/services") ? "active" : ""} onClick={handleLinkClick}>Services</Link></li>
          <li><Link to="/signature-services" className={isActive("/signature-services") ? "active" : ""} onClick={handleLinkClick}>Signature Services</Link></li>
          <li><Link to="/federal" className={isActive("/federal") ? "active" : ""} onClick={handleLinkClick}>Government</Link></li>
          <li><Link to="/about" className={isActive("/about") ? "active" : ""} onClick={handleLinkClick}>About</Link></li>
          <li><Link to="/contact" className={isActive("/contact") ? "active" : ""} onClick={handleLinkClick}>Contact</Link></li>
        </ul>
        <button
          className="dd-nav-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
      {menuOpen && (
        <ul className="dd-nav-mobile" role="list">
          <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
          <li><Link to="/field-services" onClick={handleLinkClick}>Field Services</Link></li>
          <li><Link to="/events" onClick={handleLinkClick}>Events</Link></li>
          <li><Link to="/services" onClick={handleLinkClick}>Services</Link></li>
          <li><Link to="/signature-services" onClick={handleLinkClick}>Signature Services</Link></li>
          <li><Link to="/federal" onClick={handleLinkClick}>Government</Link></li>
          <li><Link to="/about" onClick={handleLinkClick}>About</Link></li>
          <li><Link to="/contact" onClick={handleLinkClick}>Contact</Link></li>
        </ul>
      )}
    </nav>
  );
}