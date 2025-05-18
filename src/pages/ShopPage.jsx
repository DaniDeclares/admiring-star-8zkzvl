import React from "react";

// Chrome
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

// Buy buttons
import PayPalButton from "../components/PayPalButton";
import "../components/PayPalButton.css";

// Styles
import "./ShopPage.css";

const PRODUCTS = [
  { id: 1, name: "Undated Weekly Planner", price: 35, img: "/merch/planner-weekly.jpg", desc: "Stay on track with your weekly goals in this elegant planner." },
  /* …other products… */
  { id: 22, name: "Plush Branded Blanket", price: 45, img: "/merch/blanket.jpg", desc: "Soft throw in your living room." },
];

export default function ShopPage() {
  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="shop-page">
        <h1>Declare Your Worth Shop</h1>
        <p>Wear your worth. Carry your story.</p>

        <div className="product-grid">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="product-card">
              <img src={p.img} alt={p.name} />
              <h2>{p.name}</h2>
              <p className="price">${p.price}</p>
              <p className="desc">{p.desc}</p>
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
