// src/pages/ShopPage.jsx
import React from "react";
import "./ShopPage.css";

const PRODUCTS = [
  {
    id: "cheaper-to-keep-dad-mug",
    name: "Cheaper to Keep Dad Mug",
    price: 14.99,
    desc: "Classic white ceramic mug. Bold 'It's Cheaper to Keep Dad — Estimated: 1983' graphic in deep green. Dishwasher & microwave safe. 11oz.",
    image: "/images/products/cheaper-to-keep-dad-mug/13417731404300332877_2048.jpg",
  },
  {
    id: "signed-sealed-dadlivered-glass-mug",
    name: "Signed. Sealed. Dad-livered. Glass Mug",
    price: 17.99,
    desc: "Crystal clear glass mug with 'Signed. Sealed. Dad-livered.' wraparound print. Sturdy and gift-ready for Dad.",
    image: "/images/products/signed-sealed-dadlivered-glass-mug/13417731404300332877_2048_800.jpg",
  },
  // ...remaining products
];

export default function ShopPage() {
  return (
    <main className="shop-page">
      <h1>Shop Dani Declares</h1>
      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} loading="lazy" />
            <h2>{product.name}</h2>
            <p>{product.desc}</p>
            <div className="price">${product.price.toFixed(2)}</div>
            <button
              className="snipcart-add-item btn btn--primary"
              data-item-id={product.id}
              data-item-price={product.price}
              data-item-url="/shop"
              data-item-description={product.desc}
              data-item-image={product.image}
              data-item-name={product.name}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
