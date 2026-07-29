// filename: src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="dd-navbar-header">
      <div className="dd-navbar-container">
        {/* Brand Logo & Title */}
        <Link to="/" className="dd-navbar-brand" onClick={closeMenu}>
          <span className="dd-brand-badge">GA SOS #25079444</span>
          <span className="dd-brand-name">DANI DECLARES LLC</span>
          <span className="dd-brand-tagline">We Handle the Execution</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="dd-navbar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "dd-nav-link active" : "dd-nav-link"}>Home</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? "dd-nav-link active" : "dd-nav-link"}>Services</NavLink>
          <NavLink to="/shop" className={({ isActive }) => isActive ? "dd-nav-link active" : "dd-nav-link"}>Marketplace</NavLink>
          <NavLink to="/industries/government" className={({ isActive }) => isActive ? "dd-nav-link active" : "dd-nav-link"}>GovCon</NavLink>
          <NavLink to="/network" className={({ isActive }) => isActive ? "dd-nav-link active" : "dd-nav-link"}>Network</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "dd-nav-link active" : "dd-nav-link"}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? "dd-nav-link active" : "dd-nav-link"}>Contact</NavLink>
        </nav>

        {/* Primary CTA & Mobile Toggle */}
        <div className="dd-navbar-actions">
          <Link to="/book" className="dd-btn-nav-primary">
            Book Appointment &rarr;
          </Link>
          <button className="dd-mobile-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="dd-mobile-drawer">
          <NavLink to="/" className="dd-mobile-link" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/services" className="dd-mobile-link" onClick={closeMenu}>Services Directory</NavLink>
          <NavLink to="/services/business-solutions" className="dd-mobile-link" onClick={closeMenu}>Business Solutions</NavLink>
          <NavLink to="/services/print-studio" className="dd-mobile-link" onClick={closeMenu}>Print &amp; Apparel Studio</NavLink>
          <NavLink to="/events/weddings" className="dd-mobile-link" onClick={closeMenu}>Weddings &amp; Celebrations</NavLink>
          <NavLink to="/services/property" className="dd-mobile-link" onClick={closeMenu}>Property &amp; Field Logistics</NavLink>
          <NavLink to="/services/concierge" className="dd-mobile-link" onClick={closeMenu}>Legal Compliance &amp; Mobile Notary</NavLink>
          <NavLink to="/shop" className="dd-mobile-link" onClick={closeMenu}>Marketplace &amp; Express Goods</NavLink>
          <NavLink to="/industries/government" className="dd-mobile-link" onClick={closeMenu}>Government Contracting (GovCon)</NavLink>
          <NavLink to="/network" className="dd-mobile-link" onClick={closeMenu}>Partner &amp; Vendor Network</NavLink>
          <NavLink to="/about" className="dd-mobile-link" onClick={closeMenu}>About Us</NavLink>
          <NavLink to="/contact" className="dd-mobile-link" onClick={closeMenu}>Contact &amp; Dispatch</NavLink>
          <div className="dd-mobile-cta-wrap">
            <Link to="/book" className="dd-btn-nav-primary" onClick={closeMenu}>
              Launch Project Quote &rarr;
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
