import React from "react";
<<<<<<< HEAD
import "./ShopPage.css";

// Product list for Dani Declares — update image filenames if needed!
const PRODUCTS = [
  {
    id: "cheaper-to-keep-dad-mug",
    name: "Cheaper to Keep Dad Mug",
    price: 14.99,
    desc: "Classic white ceramic mug. Bold 'It's Cheaper to Keep Dad — Estimated: 1983' graphic in deep green. Dishwasher & microwave safe. 11oz.",
    image: "/images/products/cheaper-to-keep-dad-mug.jpg", // Replace with correct filename
  },
  {
    id: "signed-sealed-dadlivered-glass-mug",
    name: "Signed. Sealed. Dad-livered. Glass Mug",
    price: 17.99,
    desc: "Crystal clear glass mug with 'Signed. Sealed. Dad-livered.' wraparound print. Sturdy and gift-ready for Dad.",
    image: "/images/products/signed-sealed-dadlivered-glass-mug.jpg",
  },
  {
    id: "license-to-dad-mug",
    name: "License to Dad Mug",
    price: 14.99,
    desc: "Ceramic mug featuring gold 'License to Dad — Authorized to Dad Anywhere in the Continental US' design.",
    image: "/images/products/license-to-dad-mug.jpg",
  },
  {
    id: "license-to-dad-beach-towel",
    name: "License to Dad Beach Towel",
    price: 34.99,
    desc: "Soft, oversized towel with gold shades and 'License to Dad — Authorized to Dad Anywhere in the Continental US.'",
    image: "/images/products/license-to-dad-beach-towel.jpg",
  },
  {
    id: "cheaper-to-keep-dad-beach-towel",
    name: "Cheaper to Keep Dad Beach Towel",
    price: 34.99,
    desc: "Plush beach towel with 'It's Cheaper to Keep Dad — Estimated: 1983' print in deep green.",
    image: "/images/products/cheaper-to-keep-dad-beach-towel.jpg",
  },
  {
    id: "official-dad-documents-tote-bag",
    name: "Official Dad Documents Tote Bag",
    price: 19.99,
    desc: "Eco-friendly, sturdy tote bag. Printed with 'Official Dad Documents Only.' Perfect for work, groceries, or dad stuff.",
    image: "/images/products/official-dad-documents-tote-bag.jpg",
  },
  {
    id: "dad-documents-laptop-sleeve",
    name: "Dad Documents Laptop Sleeve",
    price: 24.99,
    desc: "Protective sleeve for laptops with a fun 'Dad Documents' design. Soft interior, tough exterior.",
    image: "/images/products/dad-documents-laptop-sleeve.jpg",
  },
  {
    id: "grill-sergeant-beach-towel",
    name: "Grill Sergeant Beach Towel",
    price: 34.99,
    desc: "BBQ-approved! Soft white towel with green 'Grill Sergeant' print. Ideal for summer, picnics, pool, and grilling dads.",
    image: "/images/products/grill-sergeant-beach-towel.jpg",
  },
  {
    id: "dads-beach-towel-license-to-dad",
    name: "Dad's Beach Towel (License to Dad)",
    price: 34.99,
    desc: "Show off Dad's credentials poolside! White towel with 'License to Dad' and sunglasses print.",
    image: "/images/products/dads-beach-towel-license-to-dad.jpg",
  },
  {
    id: "desk-mat-coach-counselor-officiant-dad",
    name: "Desk Mat for Coach Counselor Officiant Dad",
    price: 29.99,
    desc: "Large, smooth desk mat with 'Coach. Counselor. Officiant. Dad.' design. Inspiring office accessory.",
    image: "/images/products/desk-mat-coach-counselor-officiant-dad.jpg",
  },
  {
    id: "heartfelt-dad-unisex-tee",
    name: "Heartfelt Dad Unisex T-Shirt",
    price: 24.99,
    desc: "Ultra-soft, classic fit tee with 'Heartfelt Dad' graphic. Great for Father's Day or everyday family love.",
    image: "/images/products/heartfelt-dad-unisex-tee.jpg",
  },
  {
    id: "declare-your-worth-tee",
    name: "Inspirational T-shirt: Declare Your Worth",
    price: 24.99,
    desc: "'Declare Your Worth' empowerment tee. Motivational print on breathable cotton, for confident everyday style.",
    image: "/images/products/declare-your-worth-tee.jpg",
  },
  {
    id: "unisex-garment-dyed-tshirt",
    name: "Unisex Garment-Dyed T-shirt",
    price: 22.99,
    desc: "Premium garment-dyed tee, soft-washed and comfortable. Minimal Dani Declares logo on the chest.",
    image: "/images/products/unisex-garment-dyed-tshirt.jpg",
  },
=======

// styles
import "./ShopPage.css";

// Product data with Snipcart integration
const PRODUCTS = [
  {
    id: "1970d7cc838",
    name: "License to Dad Mug",
    price: 14.99,
    desc: "Durable ceramic mug with 'License to Dad' design. Dishwasher & microwave safe. 11oz.",
    image: "/images/products/1970d7cc838 (3).jpg",
  },
  {
    id: "1970d7cc838-white",
    name: "Witnessed By Dad Tee (White)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on white cotton.",
    image: "/images/products/1970d7cc838 (5).jpg",
  },
  {
    id: "1970d7cc838-maroon",
    name: "Witnessed By Dad Tee (Maroon)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on maroon.",
    image: "/images/products/1970d7cc838 (2).jpg",
  },
  {
    id: "1970d7cc838-red",
    name: "Witnessed By Dad Tee (Red)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on red.",
    image: "/images/products/1970d7cc838 (7).jpg",
  },
  {
    id: "1970d7cc838-darkgray",
    name: "Witnessed By Dad Tee (Dark Gray)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on dark gray.",
    image: "/images/products/1970d7cc838 (9).jpg",
  },
  {
    id: "1970d7cc838-gray",
    name: "Witnessed By Dad Tee (Gray)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on gray.",
    image: "/images/products/1970d7cc838 (6).jpg",
  },
  {
    id: "1970d7cc838-lightgray",
    name: "Witnessed By Dad Tee (Light Gray)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on light gray.",
    image: "/images/products/1970d7cc838 (4).jpg",
  },
  {
    id: "1970d7cc838-sand",
    name: "Witnessed By Dad Tee (Sand)",
    price: 19.99,
    desc: "Gildan 5000 tee. 'Witnessed By Dad' design on sand.",
    image: "/images/products/1970d7cc838 (8).jpg",
  },
  {
    id: "1970d7cc838-sleeve",
    name: "Official Dad Documents Only Laptop Sleeve",
    price: 24.99,
    desc: "Protect your laptop in style. Soft interior, durable exterior.",
    image: "/images/products/1970d7cc838 (1).jpg",
  },
  {
    id: "1970d7cc838-tote",
    name: "Official Dad Documents Only Tote Bag",
    price: 17.99,
    desc: "Sturdy cotton tote bag for all your dad documents.",
    image: "/images/products/1970d7cc838 (10).jpg",
  }
>>>>>>> 64b40dc7b9889077ee874c87a365fe2330bda43f
];

export default function ShopPage() {
  return (
    <main className="shop-page">
      <h1>Shop Dani Declares</h1>
      <div className="product-grid">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
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
