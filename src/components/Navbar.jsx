import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";

import logoSeal from "../assets/logo/logo-gold-seal.png";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const { cart } = useCart();
  const location = useLocation();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const navRef = useRef();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
    setServicesOpen(false);
    setEventsOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setServicesOpen(false);
        setEventsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
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
        {/* Services Dropdown */}
        <div className="nav-item dropdown">
          <button
            className="drop-btn"
            onClick={() => setServicesOpen((open) => !open)}
          >
            Services ▾
          </button>
          <ul className={`dropdown-menu ${servicesOpen ? "open" : ""}`}>
            <li><Link to="/notary" onClick={handleLinkClick}>Notary & Legal</Link></li>
            <li><Link to="/real-estate" onClick={handleLinkClick}>Real Estate</Link></li>
            <li><Link to="/legal-services" onClick={handleLinkClick}>Court & Legal</Link></li>
            <li><Link to="/weddings" onClick={handleLinkClick}>Weddings</Link></li>
            <li><Link to="/coaching" onClick={handleLinkClick}>Coaching</Link></li>
            <li><Link to="/financial" onClick={handleLinkClick}>Financial</Link></li>
            <li><Link to="/packages" onClick={handleLinkClick}>All Services</Link></li>
          </ul>
        </div>

        {/* Events Dropdown */}
        <div className="nav-item dropdown">
          <button
            className="drop-btn"
            onClick={() => setEventsOpen((open) => !open)}
          >
            Events ▾
          </button>
          <ul className={`dropdown-menu ${eventsOpen ? "open" : ""}`}>
            <li><Link to="/events" onClick={handleLinkClick}>Pop-Up Events</Link></li>
            <li><Link to="/festival" onClick={handleLinkClick}>Festival</Link></li>
            <li><Link to="/membership" onClick={handleLinkClick}>Vendor & Speaker</Link></li>
          </ul>
        </div>

        {/* Primary Links */}
        <Link
          to="/shop"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/shop" ? "active" : ""}`}>
          Shop
        </Link>
        <Link
          to="/blog"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname.startsWith("/blog") ? "active" : ""}`}>
          Blog
        </Link>

        {/* Cart */}
        <Link to="/cart" className="cart-link" onClick={handleLinkClick}>
          <FiShoppingCart size={20} />
          {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
        </Link>
      </div>

      <a
        href="https://buy.stripe.com/aFa5kC9q18CW2LBb9f6kg01"
        className="btn btn--primary book-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        Book Now
      </a>
    </nav>
  );
}