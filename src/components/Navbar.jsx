import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";

import logoSeal from "../assets/logo/logo-gold-seal.png";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
  const location = useLocation();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const navRef = useRef();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
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
        {/* Primary Links */}
        <Link
          to="/services"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/services" ? "active" : ""}`}
        >
          Services
        </Link>
        <Link
          to="/book"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/book" ? "active" : ""}`}
        >
          Book
        </Link>
        <Link
          to="/pay"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/pay" ? "active" : ""}`}
        >
          Pay
        </Link>
        <Link
          to="/contact"
          onClick={handleLinkClick}
          className={`nav-link ${location.pathname === "/contact" ? "active" : ""}`}
        >
          Contact
        </Link>
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
        href="/book?service=notary"
        className="btn btn--primary book-btn"
      >
        Book Notary
      </a>
    </nav>
  );
}
