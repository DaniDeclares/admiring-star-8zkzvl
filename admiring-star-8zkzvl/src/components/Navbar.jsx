import React, { useState } from "react";
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

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const links = [
    ["/",         "Home"],
    ["/shop",     "Shop"],
    ["/coaching", "Coaching"],
    ["/events",   "Events"],
    ["/weddings", "Weddings"],
    ["/notary",   "Notary"],
    ["/financial","Financial"],
    ["/blog",     "Blog"],
    ["/festival", "Festival"],
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={handleLinkClick}>
          <img src={logoSeal} alt="Dani Declares Logo" className="navbar-logo" />
        </Link>
      </div>

      <button className="hamburger" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {links.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            onClick={handleLinkClick}
            className={`nav-link ${location.pathname === to ? "active" : ""}`}
          >
            {label}
          </Link>
        ))}

        <Link to="/cart" className="cart-link" onClick={handleLinkClick}>
          <FiShoppingCart size={20} />
          {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
        </Link>
      </div>

      <a
        href="https://buy.stripe.com/aFa5kC9q18CW2LBb9f6kg01"
        className="btn btn--primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        Book Now
      </a>
    </nav>
  );
}
