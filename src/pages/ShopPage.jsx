// src/pages/ShopPage.jsx
import React, { useEffect } from "react";

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
    id: "mug-001",
    name: "License to Dad Mug",
    price: 14.99,
    desc: "Durable ceramic mug with 'License to Dad' design. Dishwasher & microwave safe. 11oz.",
    image: "/images/products/mugs/license-to-dad.png",
  },
  {
    id: "shirt-001",
    name: "Witnessed By Dad Tee (White)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on white cotton.",
    image: "/images/products/shirts/witnessed-white.png",
  },
  {
    id: "shirt-002",
    name: "Witnessed By Dad Tee (Maroon)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on maroon.",
    image: "/images/products/shirts/witnessed-maroon.png",
  },
  {
    id: "shirt-003",
    name: "Witnessed By Dad Tee (Red)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on red.",
    image: "/images/products/shirts/witnessed-red.png",
  },
  {
    id: "shirt-004",
    name: "Witnessed By Dad Tee (Dark Gray)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on dark gray.",
    image: "/images/products/shirts/witnessed-darkgray.png",
  },
  {
    id: "shirt-005",
    name: "Witnessed By Dad Tee (Gray)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on gray.",
    image: "/images/products/shirts/witnessed-gray.png",
  },
  {
    id: "shirt-006",
    name: "Witnessed By Dad Tee (Light Gray)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on light gray.",
    image: "/images/products/shirts/witnessed-lightgray.png",
  },
  {
    id: "shirt-007",
    name: "Witnessed By Dad Tee (Sand)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on sand.",
    image: "/images/products/shirts/witnessed-sand.png",
  },
  {
    id: "laptop-001",
    name: "Official Dad Documents Only Laptop Sleeve",
    price: 24.99,
    desc: "Protect your laptop in style. Soft interior, durable exterior.",
    image: "/images/products/laptop-sleeve/dad-documents.png",
  },
  {
    id: "tote-001",
    name: "Official Dad Documents Only Tote Bag",
    price: 17.99,
    desc: "Sturdy cotton tote bag for all your dad documents.",
    image: "/images/products/totes/dad-documents.png",
  },
  {
    id: "planner-001",
    name: "Undated Weekly Planner",
    price: 35,
    desc: "Stay on track with your weekly goals in this elegant planner.",
    image: "/images/products/planners/weekly-planner.png",
  },
  {
    id: "notebook-002",
    name: "Declare Your Worth Budget Notebook",
    price: 20,
    desc: "Track income & expenses in style.",
    image: "/images/products/notebooks/budget-notebook.png",
  },
  {
    id: "planner-003",
    name: "Leather-Bound Deluxe Planner",
    price: 50,
    desc: "Premium planner wrapped in burgundy leather.",
    image: "/images/products/planners/deluxe-planner.png",
  },
];

export default function ShopPage() {
  useEffect(() => {
    // Only add the script if it hasn't been added yet
    if (!document.getElementById("shopify-buy-button-script")) {
      const script = document.createElement("script");
      script.id = "shopify-buy-button-script";
      script.async = true;
      script.src = "https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js";
      script.onload = () => {
        if (window.ShopifyBuy) {
          if (window.ShopifyBuy.UI) {
            ShopifyBuyInit();
          }
        }
      };
      document.body.appendChild(script);
    } else {
      if (window.ShopifyBuy && window.ShopifyBuy.UI) {
        ShopifyBuyInit();
      }
    }

    function ShopifyBuyInit() {
      const client = window.ShopifyBuy.buildClient({
        domain: "g3umzm-cq.myshopify.com",
        storefrontAccessToken: "0ad93d193be412dcb3119a52eb13f0b3",
      });
      window.ShopifyBuy.UI.onReady(client).then(function (ui) {
        ui.createComponent("product", {
          id: "8760719343790",
          node: document.getElementById("product-component-1748389902692"),
          moneyFormat: "%24%7B%7Bamount%7D%7D",
          options: {
            product: {
              styles: {
                product: {
                  "@media (min-width: 601px)": {
                    "max-width": "calc(25% - 20px)",
                    "margin-left": "20px",
                    "margin-bottom": "50px",
                  },
                },
                title: { "font-family": "Raleway, sans-serif" },
                price: { "font-family": "Raleway, sans-serif" },
                compareAt: { "font-family": "Raleway, sans-serif" },
                unitPrice: { "font-family": "Raleway, sans-serif" },
                button: {
                  "background-color": "#8b1e2e",
                  ":hover": { "background-color": "#7d1b29" },
                  ":focus": { "background-color": "#7d1b29" },
                  "font-family": "Raleway, sans-serif",
                  "border-radius": "12px",
                },
              },
              contents: { options: false },
              width: "380px",
              buttonDestination: "modal",
              text: { button: "View product" },
              googleFonts: ["Raleway"],
            },
            productSet: {
              styles: {
                products: {
                  "@media (min-width: 601px)": { "margin-left": "-20px" },
                },
              },
            },
            modalProduct: {
              contents: { img: false, imgWithCarousel: true },
              styles: {
                product: {
                  "@media (min-width: 601px)": {
                    "max-width": "100%",
                    "margin-left": "0px",
                    "margin-bottom": "0px",
                  },
                },
                button: {
                  "background-color": "#8b1e2e",
                  ":hover": { "background-color": "#7d1b29" },
                  ":focus": { "background-color": "#7d1b29" },
                  "font-family": "Raleway, sans-serif",
                  "border-radius": "12px",
                },
                title: {
                  "font-family": "Raleway, sans-serif",
                  "font-weight": "normal",
                },
                price: {
                  "font-family": "Raleway, sans-serif",
                  "font-weight": "normal",
                },
                compareAt: {
                  "font-family": "Raleway, sans-serif",
                  "font-weight": "normal",
                },
                unitPrice: {
                  "font-family": "Raleway, sans-serif",
                  "font-weight": "normal",
                },
              },
              googleFonts: ["Raleway"],
            },
            option: {},
            cart: {
              styles: {
                button: {
                  "background-color": "#8b1e2e",
                  ":hover": { "background-color": "#7d1b29" },
                  ":focus": { "background-color": "#7d1b29" },
                  "font-family": "Raleway, sans-serif",
                  "border-radius": "12px",
                },
              },
              googleFonts: ["Raleway"],
              popup: false,
            },
            toggle: {
              styles: {
                toggle: {
                  "background-color": "#8b1e2e",
                  ":hover": { "background-color": "#7d1b29" },
                  ":focus": { "background-color": "#7d1b29" },
                  "font-family": "Raleway, sans-serif",
                },
              },
              googleFonts: ["Raleway"],
            },
          },
        });
      });
    }
  }, []);

  return (
    <>
      <FestivalBanner />
      <Navbar />

      <main className="page shop-page">
        <h1 className="hero-title">Declare Your Worth Shop</h1>
        <p className="hero-subtitle">Wear your worth. Carry your story.</p>

        {/* Stripe Tickets & Sponsorships Section */}
        <section className="stripe-tickets" style={{ margin: "2rem 0" }}>
          <h2 style={{ textAlign: "center" }}>Festival Tickets & Sponsorships</h2>
          <div className="stripe-buttons" style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center", margin: "2rem 0" }}>
            {/* General Admission Ticket */}
            <stripe-buy-button
              buy-button-id="buy_btn_1RTBlbChHm1uJK9xNZmn7BXz"
              publishable-key="pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS"
            ></stripe-buy-button>
            {/* Power Coaching Session */}
            <stripe-buy-button
              buy-button-id="buy_btn_1RTBmwChHm1uJK9xnuDcXpB7"
              publishable-key="pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS"
            ></stripe-buy-button>
            {/* VIP Admission */}
            <stripe-buy-button
              buy-button-id="buy_btn_1RTBpgChHm1uJK9xAGVGAKIx"
              publishable-key="pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS"
            ></stripe-buy-button>
            {/* Speaker Slot */}
            <stripe-buy-button
              buy-button-id="buy_btn_1RTBt8ChHm1uJK9xmTdQtQyi"
              publishable-key="pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS"
            ></stripe-buy-button>
            {/* Double-Sized Vendor Booth */}
            <stripe-buy-button
              buy-button-id="buy_btn_1RTBuIChHm1uJK9x8bOTsC7E"
              publishable-key="pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS"
            ></stripe-buy-button>
            {/* Premium Vendor Booth */}
            <stripe-buy-button
              buy-button-id="buy_btn_1RTBveChHm1uJK9xTvKiaedv"
              publishable-key="pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS"
            ></stripe-buy-button>
            {/* Standard Vendor Table */}
            <stripe-buy-button
              buy-button-id="buy_btn_1RTBwjChHm1uJK9xSlUCTbaq"
              publishable-key="pk_live_51RSlaPChHm1uJK9x3849mIe5jWAx3ta194CU6Gexn4Dfo5WBtsVSrkgt7G9PvTofvqgQousBFcZKDkUl4P4VDjoO00nVt1xlAS"
            ></stripe-buy-button>
          </div>
        </section>

        <div style={{ textAlign: "center", margin: "3rem 0" }}>
          <a
            href="https://g3umzm-cq.myshopify.com/"
            className="btn btn--primary"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "1.3rem", padding: "1rem 2.5rem" }}
          >
            Shop All Merch on Shopify
          </a>
        </div>

        <section className="shop-products">
          <div className="product-list">
            {PRODUCTS.map((product) => (
              <div className="product-card" key={product.id}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  style={{ maxWidth: 180, margin: "0 auto" }}
                />
                <h2 className="product-title">{product.name}</h2>
                <p className="product-desc">{product.desc}</p>
                <div className="product-price">${product.price.toFixed(2)}</div>
                <button
                  className="snipcart-add-item btn btn--secondary"
                  data-item-id={product.id}
                  data-item-price={product.price}
                  data-item-url="/shop"
                  data-item-description={product.desc}
                  data-item-image={product.image}
                  data-item-name={product.name}
                  style={{ marginTop: "1rem" }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="shopify-printify-products" style={{ margin: "2rem 0" }}>
          <h2 style={{ textAlign: "center" }}>Featured Printify Product</h2>
          <div id="product-component-1748389902692"></div>
        </section>
      </main>

      <SocialLinks />
      <CookieConsent />
      <Footer />
    </>
  );
}
