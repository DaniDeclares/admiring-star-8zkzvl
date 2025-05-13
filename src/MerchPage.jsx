import React from "react";
import { useCart } from "./context/CartContext";
import "./MerchPage.css";

export default function MerchPage() {
  const { cart, addItem, removeItem } = useCart();

  const products = [
    { id: 1, name: "Undated Weekly Planner", price: 25 },
    { id: 2, name: "Budget Notebook", price: 18 },
    { id: 3, name: "Ceramic Mug", price: 15 },
    // …your other merch…
  ];

  return (
    <div className="merch-page">
      <h1>Merch Shop</h1>
      <div className="products-grid">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <h2>{p.name}</h2>
            <p>${p.price}</p>
            <button onClick={() => addItem(p)}>Add to Cart</button>
          </div>
        ))}
      </div>

      <h2>Your Cart</h2>
      {cart.length ? (
        <ul className="cart-list">
          {cart.map((item) => (
            <li key={item.id}>
              {item.name} x{item.qty} — ${item.price * item.qty}{" "}
              <button onClick={() => removeItem(item.id)}>&times;</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Your cart is empty.</p>
      )}
      <button
        className="checkout-button"
        onClick={() => (window.location.href = "/cart")}
      >
        Go to Checkout
      </button>
    </div>
  );
}
