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
  {
    id: "license-to-dad-mug",
    name: "License to Dad Mug",
    price: 14.99,
    desc: "Ceramic mug featuring gold 'License to Dad — Authorized to Dad Anywhere in the Continental US' design.",
    image: "/images/products/license-to-dad-mug/13673897199289775117_2048_800.jpg",
  },
  {
    id: "license-to-dad-beach-towel",
    name: "License to Dad Beach Towel",
    price: 34.99,
    desc: "Soft, oversized towel with gold shades and 'License to Dad — Authorized to Dad Anywhere in the Continental US.'",
    image: "/images/products/license-to-dad-beach-towel/10363092619905953242_2048.jpg",
  },
  {
    id: "cheaper-to-keep-dad-beach-towel",
    name: "Cheaper to Keep Dad Beach Towel",
    price: 34.99,
    desc: "Plush beach towel with 'It's Cheaper to Keep Dad — Estimated: 1983' print in deep green.",
    image: "/images/products/cheaper-to-keep-dad-beach-towel/9879137063207955309_2048_800x.jpg",
  },
  {
    id: "grill-sergeant-beach-towel",
    name: "Grill Sergeant Beach Towel",
    price: 34.99,
    desc: "BBQ-approved! Soft white towel with green 'Grill Sergeant' print. Ideal for summer, picnics, pool, and grilling dads.",
    image: "/images/products/grill-sergeant-beach-towel/9879137063207955309_2048_800x.jpg",
  },
  {
    id: "official-dad-documents-tote-bag",
    name: "Official Dad Documents Tote Bag",
    price: 19.99,
    desc: "Eco-friendly, sturdy tote bag. Printed with 'Official Dad Documents Only.' Perfect for work, groceries, or dad stuff.",
    image: "/images/products/official-dad-documents-tote-bag/11901353032387740085_2048_800x800.jpg",
  },
  {
    id: "dad-documents-laptop-sleeve",
    name: "Dad Documents Laptop Sleeve",
    price: 24.99,
    desc: "Protective sleeve for laptops with a fun 'Dad Documents' design. Soft interior, tough exterior.",
    image: "/images/products/dad-documents-laptop-sleeve/11010138353168134045_2048_800x800.jpg",
  },
  {
    id: "declare-your-worth-tee",
    name: "Inspirational T-shirt: Declare Your Worth",
    price: 24.99,
    desc: "'Declare Your Worth' empowerment tee. Motivational print on breathable cotton, for confident everyday style.",
    image: "/images/products/declare-your-worth-tee/11901353032387740085_2048_800x800.jpg",
  },
  {
    id: "heartfelt-dad-unisex-tee",
    name: "Heartfelt Dad Unisex T-Shirt",
    price: 24.99,
    desc: "Ultra-soft, classic fit tee with 'Heartfelt Dad' graphic. Great for Father's Day or everyday family love.",
    image: "/images/products/heartfelt-dad-unisex-tee/9375045573264734471_2048.jpg",
  },
  {
    id: "dad-documents-laptop-sleeve-alt",
    name: "Dad Documents Laptop Sleeve (Alt)",
    price: 24.99,
    desc: "Second style for Dad Documents laptop sleeve, same soft interior and tough exterior.",
    image: "/images/products/dad-documents-laptop-sleeve/404397518277071714_2048_800x800.jpg",
  },
  {
    id: "desk-mat-coach-counselor-officiant-dad",
    name: "Desk Mat for Coach Counselor Officiant Dad",
    price: 29.99,
    desc: "Large, smooth desk mat with 'Coach. Counselor. Officiant. Dad.' design. Inspiring office accessory.",
    image: "/images/products/desk-mat-coach-counselor-officiant-dad/404397518277071714_2048_800x800.jpg",
  },
  {
    id: "unisex-garment-dyed-tshirt",
    name: "Unisex Garment-Dyed T-shirt",
    price: 22.99,
    desc: "Premium garment-dyed tee, soft-washed and comfortable. Minimal Dani Declares logo on the chest.",
    image: "/images/products/unisex-garment-dyed-tshirt/CPxzKdjZLCfK73jMmEVThn.jpg",
  },
  {
    id: "dads-beach-towel-license-to-dad",
    name: "Dad's Beach Towel (License to Dad)",
    price: 34.99,
    desc: "Show off Dad's credentials poolside! White towel with 'License to Dad' and sunglasses print.",
    image: "/images/products/dads-beach-towel-license-to-dad/UYEy6AHSqBbqNquao85NoK.jpg",
  },
  {
    id: "declare-your-worth-ebook",
    name: "Declare Your Worth – eBook",
    price: 9.99,
    desc: "Digital download of our empowerment guide for entrepreneurs and creatives. PDF format, instant access.",
    image: "/images/products/declare-your-worth-ebook.png",
  },
  {
    id: "business-planner-digital",
    name: "Small Business Launch Planner (Digital)",
    price: 12.99,
    desc: "A downloadable planner designed to help new entrepreneurs map out and execute their launch strategy.",
    image: "/images/products/business-planner-digital.png",
  },
];

export default function ShopPage() {
  return (
    <main className="shop-page">
      <section className="shop-hero">
        <h1>Shop Dani Declares</h1>
        <p>From inspiring merch to business tools — everything here is designed to help you declare your worth.</p>
      </section>

      <section className="shop-feature-banner">
        <p>🎁 Featured: Father’s Day Collection & Empowerment Essentials</p>
      </section>

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
