// src/pages/ShopPage.jsx
import React from "react";

// site chrome
import FestivalBanner from "../components/FestivalBanner.jsx";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar.jsx";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks.jsx";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent.jsx";
import "../components/CookieConsent.css";
import Footer from "../components/Footer.jsx";
import "../components/Footer.css";

// styles
import "./ShopPage.css";

// Product data with Snipcart integration
const PRODUCTS = [
  {
    id: "planner-001",
    name: "Undated Weekly Planner",
    price: 35,
    desc: "Stay on track with your weekly goals in this elegant planner.",
    image: "/static/media/logo-script.png"
  },
  {
    id: "notebook-002",
    name: "Declare Your Worth Budget Notebook",
    price: 20,
    desc: "Track income & expenses in style.",
    image: "/static/media/logo-gold-seal.png"
  },
  {
    id: "planner-003",
    name: "Leather-Bound Deluxe Planner",
    price: 50,
    desc: "Premium planner wrapped in burgundy leather.",
    image: "/static/media/love-marquee-barn.jpg"
  },
];

export default function ShopPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="page shop-page">
        <h1 className="hero-title">Declare Your Worth Shop</h1>
        <p className="hero-subtitle">Wear your worth. Carry your story.</p>

        <div className="product-grid">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="product-card">
              <img src={p.image} alt={p.name} className="product-image" />
              <h2 className="product-name">{p.name}</h2>
              <p className="price">${p.price}</p>
              <p className="desc">{p.desc}</p>
              <button
                className="snipcart-add-item buy-button"
                data-item-id={p.id}
                data-item-name={p.name}
                data-item-price={p.price}
                data-item-url="/shop"
                data-item-description={p.desc}
                data-item-image={p.image}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
