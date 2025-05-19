import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";
import logoSeal from "../assets/logo/logo-gold-seal.png";
import logoScript from "../assets/logo/logo-script.png";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  const closeMenu = () => setMenuOpen(false);

  const links = [
    ["/", "Home"],
    ["/weddings", "Weddings"],
    ["/notary", "Notary"],
    ["/coaching", "Coaching"],
    ["/calendar", "Calendar"],
    ["/events", "Events"],
    ["/packages", "Packages"],
    ["/pricing", "Pricing"],
    ["/sponsor", "Sponsor"],
    ["/speaker", "Speak & Vendor"],
    ["/financial", "Financial"],
    ["/blog", "Blog"],
    ["/merch", "Merch Shop"],
    ["/magazine", "Magazine"],
    ["/faq", "FAQ"],
    ["/media", "Media"],
    ["/speakers", "Speakers"],
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMenu}>
          <img src={logo} alt="Dani Declares Logo" className="navbar-logo" />
        </Link>
      </div>

      <button
        className="hamburger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {links.map(([to, label]) => (
          <Link key={to} to={to} onClick={closeMenu}>
            {label}
          </Link>
        ))}

        <Link to="/cart" className="cart-link" onClick={closeMenu}>
          <FiShoppingCart size={20} />
          {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
        </Link>
      </div>
    </nav>
  );
}
