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
    ["/shop",     "Shop"],
    ["/",         "Home"],
    ["/weddings", "Weddings"],
    ["/notary",   "Notary"],
    ["/coaching", "Coaching"],
    ["/calendar", "Calendar"],
    ["/events",   "Events"],
    ["/packages", "Packages"],
    ["/pricing",  "Pricing"],
    ["/sponsor",  "Sponsor"],
    ["/speaker",  "Speak & Vendor"],
    ["/financial","Financial"],
    ["/blog",     "Blog"],
    ["/merch",    "Merch Shop"],
    ["/magazine", "Magazine"],
    ["/faq",      "FAQ"],
    ["/media",    "Media"],
    ["/speakers", "Speakers"],
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
    </nav>
  );
}
