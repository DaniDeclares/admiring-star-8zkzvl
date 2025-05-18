// src/pages/ShopPage.jsx
import React from "react";

// site-wide chrome
import FestivalBanner from "../components/FestivalBanner";
import "../components/FestivalBanner.css";
import Navbar from "../components/Navbar";
import "../components/Navbar.css";
import SocialLinks from "../components/SocialLinks";
import "../components/SocialLinks.css";
import CookieConsent from "../components/CookieConsent";
import "../components/CookieConsent.css";
import Footer from "../components/Footer";
import "../components/Footer.css";

// page styles
import "./ShopPage.css";

// if you still want to offer PayPal fallback:
import PayPalButton from "../components/PayPalButton";
import "../components/PayPalButton.css";

const PRODUCTS = [
  { id: 1,  name: "Undated Weekly Planner",        price: 35, img: "/merch/planner-weekly.jpg", desc: "Stay on track with your weekly goals in this elegant planner." },
  /* …etc… up to id:22… */
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
              <img src={p.img} alt={p.name} />
              <h2>{p.name}</h2>
              <p className="price">${p.price}</p>
              <p className="desc">{p.desc}</p>

              {/* SNIPCART button: */}
              <button
                className="snipcart-add-item btn btn--primary"
                data-item-id={`merch-${p.id}`}
                data-item-name={p.name}
                data-item-price={p.price}
                data-item-url="/shop"
                data-item-description={p.desc}
              >
                Add to Cart
              </button>

              {/* fallback PayPal: */}
              <PayPalButton price={p.price} />
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
