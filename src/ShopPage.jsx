// src/ShopPage.jsx
import React from "react";
import Footer from "./Footer";
import "./ShopPage.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Undated Weekly Planner",
    price: 35,
    img: "/merch/planner-weekly.jpg",
    desc: "Stay on track with your weekly goals in this elegant planner.",
  },
  {
    id: 2,
    name: "Declare Your Worth Budget Notebook",
    price: 20,
    img: "/merch/budget-notebook.jpg",
    desc: "Track income & expenses in style.",
  },
  {
    id: 3,
    name: "Leather-Bound Deluxe Planner",
    price: 50,
    img: "/merch/planner-deluxe.jpg",
    desc: "Premium planner wrapped in burgundy leather.",
  },
  {
    id: 4,
    name: "Wedding Day Timeline Planner",
    price: 25,
    img: "/merch/wedding-timeline.jpg",
    desc: "Step-by-step guide to keep your big day on schedule.",
  },
  {
    id: 5,
    name: "Financial Goal Tracker",
    price: 18,
    img: "/merch/goal-tracker.jpg",
    desc: "Set & achieve your money milestones.",
  },
  {
    id: 6,
    name: "90-Day Goal-Setting Workbook",
    price: 22,
    img: "/merch/90day-workbook.jpg",
    desc: "Quarterly planner for goal clarity.",
  },
  {
    id: 7,
    name: "Sticker Pack (20 pcs)",
    price: 8,
    img: "/merch/stickers.jpg",
    desc: "Fun, branded stickers for your planner or laptop.",
  },
  {
    id: 8,
    name: "Premium Gel Pen Set (6-pack)",
    price: 12,
    img: "/merch/gel-pens.jpg",
    desc: "Smooth writing pens in burgundy & gold.",
  },
  {
    id: 9,
    name: "Burgundy & Gold Ceramic Mug",
    price: 15,
    img: "/merch/ceramic-mug.jpg",
    desc: "Sip in style with the Dani Declares mug.",
  },
  {
    id: 10,
    name: "Insulated Stainless Tumbler",
    price: 20,
    img: "/merch/tumbler.jpg",
    desc: "Keeps drinks hot or cold for hours.",
  },
  {
    id: 11,
    name: "Canvas Tote Bag",
    price: 20,
    img: "/merch/tote.jpg",
    desc: "Eco-friendly tote with gold logo.",
  },
  {
    id: 12,
    name: "Branded Water Bottle",
    price: 18,
    img: "/merch/bottle.jpg",
    desc: "Stainless steel bottle with wrap.",
  },
  {
    id: 13,
    name: "Custom Scented Candle",
    price: 18,
    img: "/merch/candle.jpg",
    desc: "Subtle vanilla & bergamot scent.",
  },
  {
    id: 14,
    name: "Gold-Foil Logo Throw Pillow",
    price: 30,
    img: "/merch/pillow.jpg",
    desc: "Velvet accent pillow with foil logo.",
  },
  {
    id: 15,
    name: "Heirloom Photo Album",
    price: 40,
    img: "/merch/photo-album.jpg",
    desc: "Keep wedding memories forever.",
  },
  {
    id: 16,
    name: "Milestone Cards (set of 20)",
    price: 12,
    img: "/merch/milestone-cards.jpg",
    desc: "Celebrate life’s special moments.",
  },
  {
    id: 17,
    name: "2025 Desk Calendar",
    price: 20,
    img: "/merch/desk-calendar.jpg",
    desc: "Monthly spreads with motivational quotes.",
  },
  {
    id: 18,
    name: "Logo Mouse Pad",
    price: 12,
    img: "/merch/mouse-pad.jpg",
    desc: "Smooth surface with non-slip backing.",
  },
  {
    id: 19,
    name: "Phone Grip / PopSocket",
    price: 10,
    img: "/merch/popsocket.jpg",
    desc: "Grip & stand with burgundy gold logo.",
  },
  {
    id: 20,
    name: "Enamel Logo Pin",
    price: 6,
    img: "/merch/enamel-pin.jpg",
    desc: "Subtle way to show your support.",
  },
  {
    id: 21,
    name: "Keychain (Enamel)",
    price: 7,
    img: "/merch/keychain.jpg",
    desc: "Durable enamel keychain with logo.",
  },
  {
    id: 22,
    name: "Plush Branded Blanket",
    price: 45,
    img: "/merch/blanket.jpg",
    desc: "Soft throw in your living room.",
  },
];

export default function ShopPage() {
  return (
    <>
      <div className="page shop-page">
        <h1 className="hero-title">Declare Your Worth Shop</h1>
        <p className="hero-subtitle">Wear your worth. Carry your story.</p>

        <div className="product-grid">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="product-card">
              <img src={p.img} alt={p.name} />
              <h2>{p.name}</h2>
              <p className="price">${p.price}</p>
              <p className="desc">{p.desc}</p>
              <a
                href={`https://paypal.me/DaniDeclaresGA/${p.price}?currencyCode=USD`}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-button"
              >
                Buy Now
              </a>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
