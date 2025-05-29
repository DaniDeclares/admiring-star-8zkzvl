import React from "react";

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
