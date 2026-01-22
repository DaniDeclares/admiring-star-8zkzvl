import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
codex/redesign-danideclares.com-for-service-booking
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";
=======


import logoSeal from "../assets/logo/logo-gold-seal.png";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
codex/redesign-danideclares.com-for-service-booking
  const { cart } = useCart();
=======

  const location = useLocation();

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

codex/redesign-danideclares.com-for-service-booking
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

=======

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
codex/redesign-danideclares.com-for-service-booking
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
=======
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
          to="/federal"
          onClick={handleLinkClick}
          className={`nav-link ${
            location.pathname === "/federal" ? "active" : ""
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

codex/redesign-danideclares.com-for-service-booking
      <a
        href="/book?service=notary"
=======
      <Link
        to="/book?service=notary"

        className="btn btn--primary book-btn"
        onClick={handleLinkClick}
      >
        Book Notary
 codex/redesign-danideclares.com-for-service-booking
      </a>
=======
      </Link>

    </nav>
  );
}
