// src/pages/ShopPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { resolveImageFallback } from "../assets/images.js";
import { siteConfig } from "../data/siteConfig.js";
import { buildShopInquiryPath, buildShopInquiryState } from "../lib/shopInquiry.js";
import "./ShopPage.css";

const SHOP_IMAGE_CATEGORY = "products.shop";

const PRODUCTS = [
  {
    id: "cheaper-to-keep-dad-mug",
    name: "Cheaper to Keep Dad Mug",
    price: 14.99,
    desc: "Classic white ceramic mug. Bold 'It's Cheaper to Keep Dad — Estimated: 1983' graphic in deep green. Dishwasher & microwave safe. 11oz.",
    imageKey: "cheaperToKeepDadMug",
  },
  {
    id: "signed-sealed-dadlivered-glass-mug",
    name: "Signed. Sealed. Dad-livered. Glass Mug",
    price: 17.99,
    desc: "Crystal clear glass mug with 'Signed. Sealed. Dad-livered.' wraparound print. Sturdy and gift-ready for Dad.",
    imageKey: "signedSealedDadliveredGlassMug",
  },
  {
    id: "license-to-dad-mug",
    name: "License to Dad Mug",
    price: 14.99,
    desc: "Ceramic mug featuring gold 'License to Dad — Authorized to Dad Anywhere in the Continental US' design.",
    imageKey: "licenseToDadMug",
  },
  {
    id: "license-to-dad-beach-towel",
    name: "License to Dad Beach Towel",
    price: 34.99,
    desc: "Soft, oversized towel with gold shades and 'License to Dad — Authorized to Dad Anywhere in the Continental US.'",
    imageKey: "licenseToDadBeachTowel",
  },
  {
    id: "cheaper-to-keep-dad-beach-towel",
    name: "Cheaper to Keep Dad Beach Towel",
    price: 34.99,
    desc: "Plush beach towel with 'It's Cheaper to Keep Dad — Estimated: 1983' print in deep green.",
    imageKey: "cheaperToKeepDadBeachTowel",
  },
  {
    id: "grill-sergeant-beach-towel",
    name: "Grill Sergeant Beach Towel",
    price: 34.99,
    desc: "BBQ-approved! Soft white towel with green 'Grill Sergeant' print. Ideal for summer, picnics, pool, and grilling dads.",
    imageKey: "grillSergeantBeachTowel",
  },
  {
    id: "official-dad-documents-tote-bag",
    name: "Official Dad Documents Tote Bag",
    price: 19.99,
    desc: "Eco-friendly, sturdy tote bag. Printed with 'Official Dad Documents Only.' Perfect for work, groceries, or dad stuff.",
    imageKey: "officialDadDocumentsToteBag",
  },
  {
    id: "dad-documents-laptop-sleeve",
    name: "Dad Documents Laptop Sleeve",
    price: 24.99,
    desc: "Protective sleeve for laptops with a fun 'Dad Documents' design. Soft interior, tough exterior.",
    imageKey: "dadDocumentsLaptopSleeve",
  },
  {
    id: "declare-your-worth-tee",
    name: "Inspirational T-shirt: Declare Your Worth",
    price: 24.99,
    desc: "'Declare Your Worth' empowerment tee. Motivational print on breathable cotton, for confident everyday style.",
    imageKey: "declareYourWorthTee",
  },
  {
    id: "heartfelt-dad-unisex-tee",
    name: "Heartfelt Dad Unisex T-Shirt",
    price: 24.99,
    desc: "Ultra-soft, classic fit tee with 'Heartfelt Dad' graphic. Great for Father's Day or everyday family love.",
    imageKey: "heartfeltDadUnisexTee",
  },
  {
    id: "dad-documents-laptop-sleeve-alt",
    name: "Dad Documents Laptop Sleeve (Alt)",
    price: 24.99,
    desc: "Second style for Dad Documents laptop sleeve, same soft interior and tough exterior.",
    imageKey: "dadDocumentsLaptopSleeveAlt",
  },
  {
    id: "unisex-garment-dyed-tshirt",
    name: "Unisex Garment-Dyed T-shirt",
    price: 22.99,
    desc: "Premium garment-dyed tee, soft-washed and comfortable. Minimal Dani Declares logo on the chest.",
    imageKey: "unisexGarmentDyedTshirt",
  },
  {
    id: "dads-beach-towel-license-to-dad",
    name: "Dad's Beach Towel (License to Dad)",
    price: 34.99,
    desc: "Show off Dad's credentials poolside! White towel with 'License to Dad' and sunglasses print.",
    imageKey: "dadsBeachTowelLicenseToDad",
  },
  {
    id: "declare-your-worth-ebook",
    name: "Declare Your Worth – eBook",
    price: 9.99,
    desc: "Digital download of our empowerment guide for entrepreneurs and creatives. PDF format, instant access.",
    imageKey: "declareYourWorthEbook",
  },
  {
    id: "business-planner-digital",
    name: "Small Business Launch Planner (Digital)",
    price: 12.99,
    desc: "A downloadable planner designed to help new entrepreneurs map out and execute their launch strategy.",
    imageKey: "businessPlannerDigital",
  },
];

export default function ShopPage() {
  const navigate = useNavigate();
  const publicPhone = siteConfig.phoneNumbers.public;

  const routeProductInquiry = (productName) => {
    navigate(buildShopInquiryPath(productName), {
      state: buildShopInquiryState(productName),
    });
  };

  return (
    <main className="shop-page">
      <Helmet>
        <title>Shop • Dani Declares</title>
        <meta
          name="description"
          content="Shop inspirational merch, entrepreneur tools, digital downloads, and Father's Day gifts from Dani Declares. Fast shipping, instant downloads, and unique gifts for those declaring their worth."
        />
      </Helmet>

      <section className="shop-hero">
        <h1>Shop Dani Declares</h1>
        <p>
          Merch, digital downloads, business tools, and gifts that help you
          Declare Your Worth—one milestone at a time.
        </p>
      </section>

      <section className="shop-feature-banner">
        <p>🎁 Featured: Father’s Day Collection + Empowerment Essentials</p>
      </section>

      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={resolveImageFallback(SHOP_IMAGE_CATEGORY, product.imageKey)}
              alt={product.name}
              loading="lazy"
              decoding="async"
            />
            <h2>{product.name}</h2>
            <p>{product.desc}</p>
            <div className="price">${product.price.toFixed(2)}</div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => routeProductInquiry(product.name)}
            >
              Request Custom Quote
            </button>
          </div>
        ))}
      </div>

      <section className="contact-info">
        <h3>Need Help With Your Order?</h3>
        <p>
          Email{" "}
          <a href={`mailto:${siteConfig.emails.admin}`}>
            {siteConfig.emails.admin}
          </a>{" "}
          or text us at{" "}
          <a href={`tel:${publicPhone.tel}`}>
            {publicPhone.display}
          </a>
          .
        </p>
      </section>
    </main>
  );
}
